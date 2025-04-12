import cv2
import time
import numpy as np
from utils.landmark_ges import LandmarkProcessor
from utils.recorder_ges import GestureRecorderHelper
from utils.rest_ges import RestGestureHandler

class GestureRecorder:
    def __init__(self, gestures_file="gestures.json"):
        # Initialize the landmark processor
        self.landmark_processor = LandmarkProcessor()
        
        # Initialize the gesture recorder helper
        self.recorder_helper = GestureRecorderHelper(gestures_file)
        
        # Hand at rest detection
        self.rest_handler = RestGestureHandler()
        self.rest_detection_enabled = True
        
        # Check if CUDA is available
        self.use_gpu = cv2.cuda.getCudaEnabledDeviceCount() > 0
        if self.use_gpu:
            print("CUDA-enabled GPU detected. Using GPU acceleration for gesture recording.")
        
    def process_frame(self, frame):
        # Process frame with MediaPipe
        frame, landmark_data, multi_hand_landmarks = self.landmark_processor.process_frame(frame)
        
        # Check if preparation period has ended and recording should start
        self.recorder_helper.check_preparation_status()
        
        is_resting = False
        if multi_hand_landmarks and landmark_data:
            # Check if hand is at rest
            if self.rest_detection_enabled:
                is_resting = self.rest_handler.is_hand_at_rest(
                    landmark_data, None, float('inf'), 0.2, None, 0, 2)
                
                # Display rest state if detected
                if is_resting:
                    cv2.putText(frame, "Hand at rest", (10, 30), 
                               cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 165, 255), 2)
            
            # Only record frames if hand is not at rest and we are recording
            if self.recorder_helper.is_recording and not is_resting:
                self.recorder_helper.add_frame(landmark_data)
        
        return frame
    
    def start_recording(self, name, gesture_type):
        return self.recorder_helper.start_recording(name, gesture_type)
    
    def stop_recording(self):
        return self.recorder_helper.stop_recording()
    
    def toggle_rest_detection(self):
        """Toggle hand-at-rest detection on/off"""
        self.rest_detection_enabled = not self.rest_detection_enabled
        if not self.rest_detection_enabled:
            self.rest_handler.hand_at_rest = False
        return self.rest_detection_enabled
    
    def run(self):
        cap = cv2.VideoCapture(0)
        
        # Set camera properties for better performance with GPU
        if self.use_gpu:
            cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
            cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
            cap.set(cv2.CAP_PROP_FPS, 60)  # Higher FPS when using GPU
        
        print("Controls:")
        print("  - Press 's' to start recording a static gesture")
        print("  - Press 'd' to start recording a dynamic gesture (includes 2-second preparation period)")
        print("  - Press 'r' to stop recording")
        print("  - Press 'h' to toggle hand-at-rest detection")
        print("  - Press ESC to exit")
        
        # Track FPS for performance monitoring
        fps_start_time = time.time()
        fps_frame_count = 0
        fps = 0
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                print("Failed to grab frame")
                break
            
            # Flip frame horizontally for more intuitive interaction
            if self.use_gpu:
                gpu_frame = cv2.cuda_GpuMat()
                gpu_frame.upload(frame)
                gpu_frame = cv2.cuda.flip(gpu_frame, 1)
                frame = gpu_frame.download()
            else:
                frame = cv2.flip(frame, 1)
                
            frame = self.process_frame(frame)
            
            # Calculate FPS
            fps_frame_count += 1
            if fps_frame_count >= 10:  # Update FPS every 10 frames
                fps = fps_frame_count / (time.time() - fps_start_time)
                fps_start_time = time.time()
                fps_frame_count = 0
            
            # Display FPS
            cv2.putText(frame, f"FPS: {int(fps)}", (frame.shape[1] - 120, 30), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            
            # Display recording or preparation status
            if self.recorder_helper.is_preparing:
                remaining = self.recorder_helper.get_preparation_remaining()
                
                # Make countdown more visible
                status = f"GET READY! Recording starts in: {remaining:.1f}s"
                cv2.putText(frame, status, (10, 30), 
                            cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 165, 255), 2)
                
                # Add a visual countdown indicator
                center_x, center_y = frame.shape[1] // 2, frame.shape[0] // 2
                radius = min(frame.shape[0], frame.shape[1]) // 4
                
                # Draw countdown circle
                progress = 1.0 - (remaining / self.recorder_helper.preparation_duration)
                angle = int(360 * progress)
                
                # Draw full circle in gray
                cv2.circle(frame, (center_x, center_y), radius, (100, 100, 100), 15)
                
                # Draw progress arc in yellow
                if angle > 0:
                    start_angle = -90  # Start from top
                    for i in range(start_angle, start_angle + angle, 5):
                        x = int(center_x + radius * np.cos(i * np.pi / 180))
                        y = int(center_y + radius * np.sin(i * np.pi / 180))
                        cv2.circle(frame, (x, y), 7, (0, 255, 255), -1)
                
                # Show countdown number in center
                font_scale = 5.0
                text_size = cv2.getTextSize(f"{int(remaining)+1}", cv2.FONT_HERSHEY_SIMPLEX, font_scale, 10)[0]
                text_x = center_x - text_size[0] // 2
                text_y = center_y + text_size[1] // 2
                cv2.putText(frame, f"{int(remaining)+1}", (text_x, text_y), 
                            cv2.FONT_HERSHEY_SIMPLEX, font_scale, (255, 255, 255), 10)
                
                # Instructions
                instruction = "Position your hand for the gesture"
                cv2.putText(frame, instruction, (10, 70), 
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
                
            elif self.recorder_helper.is_recording:
                status = f"Recording {self.recorder_helper.current_gesture_type} gesture: {self.recorder_helper.current_gesture_name}"
                cv2.putText(frame, status, (10, 30), 
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
                
                duration = time.time() - self.recorder_helper.recording_start_time
                cv2.putText(frame, f"Duration: {duration:.2f}s", (10, 60),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
            elif not self.rest_handler.hand_at_rest:  # Only show recording prompt if hand is not at rest
                cv2.putText(frame, "Press 's' for static or 'd' for dynamic gesture recording", 
                            (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            
            # Display recorded gestures
            y_pos = 90
            cv2.putText(frame, "Recorded Gestures:", (10, y_pos), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1)
            y_pos += 25
            
            for gesture_type in ["static", "dynamic"]:
                for name in self.recorder_helper.gestures[gesture_type].keys():
                    cv2.putText(frame, f"{gesture_type}: {name}", (20, y_pos), 
                                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1)
                    y_pos += 25
            
            # Display hand-at-rest status
            rest_status = "ON" if self.rest_detection_enabled else "OFF"
            cv2.putText(frame, f"Hand-at-rest detection: {rest_status}", (10, frame.shape[0] - 10), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1)
            
            # GPU acceleration note
            if self.use_gpu:
                cv2.putText(frame, "GPU Accelerated", (frame.shape[1] - 170, frame.shape[0] - 10), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 1)
            
            cv2.imshow('Gesture Recorder', frame)
            
            key = cv2.waitKey(1) & 0xFF
            
            if key == 27:  # ESC key
                break
            elif key == ord('s') and not self.recorder_helper.is_recording and not self.rest_handler.hand_at_rest:
                name = input("Enter name for static gesture: ")
                self.start_recording(name, "static")
            elif key == ord('d') and not self.recorder_helper.is_recording and not self.rest_handler.hand_at_rest:
                name = input("Enter name for dynamic gesture: ")
                self.start_recording(name, "dynamic")
            elif key == ord('r') and (self.recorder_helper.is_recording or self.recorder_helper.is_preparing):
                self.stop_recording()
            elif key == ord('h'):
                # Toggle hand-at-rest detection
                enabled = self.toggle_rest_detection()
                print(f"Hand-at-rest detection {'enabled' if enabled else 'disabled'}")
        
        cap.release()
        cv2.destroyAllWindows()
        self.landmark_processor.close()

if __name__ == "__main__":
    print("Controls:")
    print("  - Press 's' to start recording a static gesture")
    print("  - Press 'd' to start recording a dynamic gesture")
    print("  - Press 'r' to stop recording")
    print("  - Press ESC to exit")
    
    recorder = GestureRecorder()
    recorder.run()