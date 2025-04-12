import cv2
import numpy as np
import json
import os
import time
import re
from utils.rest_ges import RestGestureHandler
from utils.static_ges import StaticGestureHandler
from utils.dynamic_ges import DynamicGestureHandler
from utils.action_ges import ActionHandler
from utils.stability_ges import StabilityTracker
from utils.landmark_ges import LandmarkProcessor
from utils.load_ges import load_gestures

class GestureRecognizer:
    def __init__(self, gestures_file="gestures.json"):
        # Load gestures from file
        self.gestures_file = gestures_file
        self.gestures = load_gestures(gestures_file)
        
        # Initialize the landmark processor
        self.landmark_processor = LandmarkProcessor(
            static_image_mode=False,
            max_num_hands=1,
            min_detection_confidence=0.6,
            min_tracking_confidence=0.6
        )
        
        # Initialize gesture handlers
        self.static_threshold = 0.2
        self.dynamic_threshold = 0.3
        self.dynamic_time_window = 1.5
        
        self.rest_handler = RestGestureHandler()
        self.static_handler = StaticGestureHandler(self.gestures, self.static_threshold)
        self.dynamic_handler = DynamicGestureHandler(self.gestures, self.dynamic_threshold, self.dynamic_time_window)
        
        # Initialize stability tracking
        self.stability_tracker = StabilityTracker()
        
        # Initialize action handler
        self.action_handler = ActionHandler()
        
        # Hand at rest detection
        self.rest_detection_enabled = True
        
        # Check if CUDA is available
        self.use_gpu = cv2.cuda.getCudaEnabledDeviceCount() > 0
        if self.use_gpu:
            print("CUDA-enabled GPU detected. Using GPU acceleration for gesture recognition.")
        
        # Setup FPS tracking
        self.prev_frame_time = 0
        self.fps = 0
    
    def process_frame(self, frame):
        # Process frame with MediaPipe
        frame, landmark_data, multi_hand_landmarks = self.landmark_processor.process_frame(frame)
        
        # Update FPS calculation
        current_time = time.time()
        self.fps = 1 / (current_time - self.prev_frame_time + 0.001)  # Add small value to prevent division by zero
        self.prev_frame_time = current_time
        
        # Display FPS
        cv2.putText(frame, f"FPS: {int(self.fps)}", (frame.shape[1] - 120, 30), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        
        # Always update confidence decay
        self.stability_tracker.decay_all_confidence_values()
        
        detected_gesture = None
        
        if multi_hand_landmarks and landmark_data:
            # Check if hand is at rest
            is_resting = False
            if self.rest_detection_enabled:
                is_resting = self.rest_handler.is_hand_at_rest(
                    landmark_data,
                    self.static_handler.recognize_static_gesture(landmark_data)[0],
                    self.static_handler.recognize_static_gesture(landmark_data)[1],
                    self.static_threshold,
                    self.stability_tracker.current_gesture,
                    self.stability_tracker.current_gesture_stability,
                    self.stability_tracker.stability_threshold
                )
                
                # Display rest state if detected
                if is_resting:
                    cv2.putText(frame, "Hand at rest", (10, 30), 
                               cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 165, 255), 2)
                    
                    # When hand is at rest, decrease stability of current gesture
                    self.stability_tracker.handle_rest_state(is_resting)
                    return frame
            
            # Only process gestures if hand is not at rest
            if not is_resting:
                # Detect static gestures
                static_gesture, static_score = self.static_handler.recognize_static_gesture(landmark_data)
                if static_gesture:
                    self.stability_tracker.update_confidence_history("static", static_gesture, static_score)
                
                # Detect dynamic gestures
                current_time = time.time()
                self.dynamic_handler.update_dynamic_buffer(landmark_data, current_time)
                dynamic_gesture, dynamic_score = self.dynamic_handler.recognize_dynamic_gesture()
                if dynamic_gesture:
                    self.stability_tracker.update_confidence_history("dynamic", dynamic_gesture, dynamic_score)
                
                # Get most confident static and dynamic gestures
                best_static_gesture, best_static_confidence, best_dynamic_gesture, best_dynamic_confidence = self.stability_tracker.find_best_gestures()
                
                # Make a decision about which gesture is most likely
                if best_static_gesture and best_dynamic_gesture:
                    adjusted_static_confidence = best_static_confidence * self.stability_tracker.static_bias
                    
                    # Bias based on the current stable gesture
                    if self.stability_tracker.current_gesture_type == "static" and self.stability_tracker.current_gesture_stability >= self.stability_tracker.stability_threshold:
                        adjusted_static_confidence *= 1.1
                    
                    if self.stability_tracker.current_gesture_type == "dynamic" and self.stability_tracker.current_gesture_stability >= self.stability_tracker.stability_threshold:
                        best_dynamic_confidence *= 1.1
                    
                    if adjusted_static_confidence > best_dynamic_confidence:
                        detected_gesture = ("static", best_static_gesture, 1.0 / best_static_confidence - 1)
                    else:
                        detected_gesture = ("dynamic", best_dynamic_gesture, 1.0 / best_dynamic_confidence - 1)
                    
                elif best_static_gesture:
                    detected_gesture = ("static", best_static_gesture, 1.0 / best_static_confidence - 1)
                elif best_dynamic_gesture:
                    detected_gesture = ("dynamic", best_dynamic_gesture, 1.0 / best_dynamic_confidence - 1)
        
        # Apply stability tracking
        stable_gesture = self.stability_tracker.update_stability(detected_gesture)
        
        # Display and trigger actions for stable gestures
        if stable_gesture:
            gesture_type, gesture_name, is_stable = stable_gesture
            
            if is_stable:
                self.action_handler.trigger_action(gesture_type, gesture_name)
            
            # Display with confidence and stability indicators
            stability_indicator = min(self.stability_tracker.current_gesture_stability / self.stability_tracker.stability_threshold, 1.0)
            confidence = self.stability_tracker.get_gesture_confidence(gesture_type, gesture_name)
            
            status = f"Detected: {gesture_type} - {gesture_name} "
            status += f"(conf: {confidence:.2f}, stab: {stability_indicator:.1f})"
            cv2.putText(frame, status, (10, 30), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        
        return frame
    
    def reset_rest_detection(self):
        self.rest_handler.reset_rest_detection()

    def toggle_rest_detection(self):
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
        print("  - Press 'r' to toggle hand-at-rest detection")
        print("  - Press 'c' to clear/reset hand-at-rest template")
        print("  - Press ESC to exit")
        
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
            
            y_pos = 60
            cv2.putText(frame, "Registered Gestures:", (10, y_pos), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1)
            y_pos += 25
            
            for gesture_type in ["static", "dynamic"]:
                for name in self.gestures[gesture_type].keys():
                    key = f"{gesture_type}:{name}"
                    if key in self.action_handler.action_registry:
                        cv2.putText(frame, f"{key}", (20, y_pos), 
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1)
                        y_pos += 25
            
            # Display hand-at-rest status
            rest_status = "ON" if self.rest_detection_enabled else "OFF"
            cv2.putText(frame, f"Hand-at-rest detection: {rest_status}", (10, frame.shape[0] - 10), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1)
            
            # Display GPU acceleration indicator
            if self.use_gpu:
                cv2.putText(frame, "GPU Accelerated", (frame.shape[1] - 170, frame.shape[0] - 10), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 1)
            
            cv2.imshow('Gesture Recognizer', frame)
            
            key = cv2.waitKey(1) & 0xFF
            
            if key == 27:  # ESC key
                break
            elif key == ord('r'):
                # Toggle hand-at-rest detection
                enabled = self.toggle_rest_detection()
                print(f"Hand-at-rest detection {'enabled' if enabled else 'disabled'}")
            elif key == ord('c'):
                # Reset hand-at-rest template
                self.reset_rest_detection()
                print("Hand-at-rest template reset")
        
        cap.release()
        cv2.destroyAllWindows()
        self.landmark_processor.close()

if __name__ == "__main__":
    recognizer = GestureRecognizer()
    recognizer.run()