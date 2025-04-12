import json
import os
import time
from datetime import datetime

class GestureRecorderHelper:
    def __init__(self, gestures_file="gestures.json"):
        self.gestures_file = gestures_file
        self.gestures = self.load_gestures()
        self.is_recording = False
        self.is_preparing = False
        self.preparation_start_time = 0
        self.preparation_duration = 2.0  # 2 second preparation period
        self.current_gesture_name = ""
        self.current_gesture_type = ""
        self.recording_frames = []
        self.recording_start_time = 0
    
    def load_gestures(self):
        if os.path.exists(self.gestures_file):
            with open(self.gestures_file, 'r') as f:
                return json.load(f)
        return {"static": {}, "dynamic": {}}
    
    def save_gestures(self):
        # Create a backup of the gestures file
        if os.path.exists(self.gestures_file):
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_file = f"gestures_backup_{timestamp}.json"
            with open(self.gestures_file, 'r') as src:
                with open(backup_file, 'w') as dst:
                    dst.write(src.read())
            print(f"Backup created: {backup_file}")
            
        # Save the updated gestures
        with open(self.gestures_file, 'w') as f:
            json.dump(self.gestures, f, indent=4)
        print(f"Gestures saved to {self.gestures_file}")
    
    def start_recording(self, name, gesture_type):
        """Start recording a new gesture"""
        if name and gesture_type in ["static", "dynamic"]:
            self.current_gesture_name = name
            self.current_gesture_type = gesture_type
            self.recording_frames = []
            
            # For dynamic gestures, start with preparation period
            if gesture_type == "dynamic":
                self.is_preparing = True
                self.preparation_start_time = time.time()
                self.is_recording = False
                print(f"Preparing to record dynamic gesture: {name} (get ready...)")
                return True
            else:
                # For static gestures, start recording immediately
                self.is_recording = True
                self.is_preparing = False
                self.recording_start_time = time.time()
                print(f"Started recording {gesture_type} gesture: {name}")
                return True
        else:
            print("Invalid gesture name or type")
            return False
    
    def check_preparation_status(self):
        """Check if preparation period has ended and recording should start"""
        if not self.is_preparing:
            return False
            
        elapsed = time.time() - self.preparation_start_time
        remaining = max(0, self.preparation_duration - elapsed)
        
        if remaining <= 0:
            # Preparation period ended, start actual recording
            self.is_preparing = False
            self.is_recording = True
            self.recording_start_time = time.time()
            print(f"Started recording {self.current_gesture_type} gesture: {self.current_gesture_name}")
            return True
            
        return False
    
    def get_preparation_remaining(self):
        """Get remaining preparation time in seconds"""
        if not self.is_preparing:
            return 0
            
        elapsed = time.time() - self.preparation_start_time
        return max(0, self.preparation_duration - elapsed)
    
    def add_frame(self, landmarks, timestamp=None):
        """Add a frame to the current recording session"""
        if not self.is_recording or landmarks is None:
            return
            
        if timestamp is None:
            timestamp = time.time()
            
        processed_data = {
            "timestamp": timestamp - self.recording_start_time,
            "landmarks": landmarks
        }
        self.recording_frames.append(processed_data)
    
    def stop_recording(self):
        """Stop recording and save the gesture"""
        if not self.is_recording and not self.is_preparing:
            return False
            
        self.is_recording = False
        self.is_preparing = False
        
        # Create a unique name if this gesture name already exists
        original_name = self.current_gesture_name
        unique_name = self._get_unique_gesture_name(self.current_gesture_type, original_name)
        self.current_gesture_name = unique_name
        
        if self.current_gesture_type == "static" and self.recording_frames:
            # For static gestures, we average all frames to get a single pose
            all_landmarks = [frame["landmarks"] for frame in self.recording_frames]
            avg_landmarks = sum(map(lambda x: array(x), all_landmarks)) / len(all_landmarks)
            self.gestures["static"][self.current_gesture_name] = avg_landmarks.tolist()
            
        elif self.current_gesture_type == "dynamic" and self.recording_frames:
            # For dynamic gestures, we store the entire sequence
            self.gestures["dynamic"][self.current_gesture_name] = [
                {"timestamp": frame["timestamp"], "landmarks": frame["landmarks"]} 
                for frame in self.recording_frames
            ]
        
        self.save_gestures()
        
        if unique_name != original_name:
            print(f"Finished recording gesture: {original_name} (saved as {unique_name})")
        else:
            print(f"Finished recording gesture: {unique_name}")
        
        gesture_type = self.current_gesture_type
        gesture_name = self.current_gesture_name
        
        self.current_gesture_name = ""
        self.current_gesture_type = ""
        self.recording_frames = []
        
        return (gesture_type, gesture_name)
        
    def _get_unique_gesture_name(self, gesture_type, base_name):
        """Generate a unique name for a gesture by appending an index if needed"""
        # Check if the base name already exists
        if base_name not in self.gestures[gesture_type]:
            return base_name
            
        # Find all existing variations of this name (name_1, name_2, etc.)
        existing_names = []
        for name in self.gestures[gesture_type].keys():
            # Check if this name is the base name or a variation of it
            if name == base_name or (name.startswith(f"{base_name}_") and name[len(base_name)+1:].isdigit()):
                existing_names.append(name)
        
        # Extract indices from existing variations
        indices = [0]  # Start with 0 for the base name
        for name in existing_names:
            if name == base_name:
                continue
                
            try:
                index = int(name.split('_')[-1])
                indices.append(index)
            except ValueError:
                continue
        
        # Find the next available index
        next_index = max(indices) + 1
        return f"{base_name}_{next_index}"

from numpy import array, mean