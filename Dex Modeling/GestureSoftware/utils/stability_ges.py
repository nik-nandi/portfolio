import numpy as np

class StabilityTracker:
    def __init__(self, history_max_size=5, min_detection_consistency=3, stability_threshold=2, confidence_decay=0.8, static_bias=1.1):
        # Gesture stability tracking
        self.stability_threshold = stability_threshold
        self.gesture_history = []  
        self.history_max_size = history_max_size
        self.min_detection_consistency = min_detection_consistency
        
        # Store recent gesture confidence scores
        self.static_confidence_history = {}
        self.dynamic_confidence_history = {}
        self.confidence_decay = confidence_decay
        
        # Type bias (higher means prefer static gestures)
        self.static_bias = static_bias
        
        # Track the currently active gesture for stability
        self.current_gesture = None
        self.current_gesture_type = None
        self.current_gesture_stability = 0
    
    def update_confidence_history(self, gesture_type, gesture_name, score):
        """Update confidence history for a particular gesture type and name"""
        history_dict = self.static_confidence_history if gesture_type == "static" else self.dynamic_confidence_history
        
        if gesture_name not in history_dict:
            history_dict[gesture_name] = 0
            
        # Decay old confidence and add new confidence (lower score is better)
        confidence_value = 1.0 / (1.0 + score)  # Convert score to confidence value (0-1)
        history_dict[gesture_name] = (history_dict[gesture_name] * self.confidence_decay) + confidence_value
        
        # Apply decay to all other gestures in this type
        for name in history_dict:
            if name != gesture_name:
                history_dict[name] *= self.confidence_decay
    
    def get_gesture_confidence(self, gesture_type, gesture_name):
        """Get the current confidence value for a gesture"""
        history_dict = self.static_confidence_history if gesture_type == "static" else self.dynamic_confidence_history
        return history_dict.get(gesture_name, 0)
    
    def update_gesture_history(self, gesture_type, gesture_name):
        """Update the history of recent gesture detections"""
        # Add new detection to history
        self.gesture_history.append((gesture_type, gesture_name))
        
        # Keep only recent history
        if len(self.gesture_history) > self.history_max_size:
            self.gesture_history.pop(0)
            
    def is_gesture_consistent(self, gesture_type, gesture_name):
        """Check if this gesture has been consistently detected recently"""
        if not self.gesture_history:
            return False
            
        # Count occurrences in history
        count = self.gesture_history.count((gesture_type, gesture_name))
        return count >= self.min_detection_consistency
    
    def decay_all_confidence_values(self):
        """Apply decay to all confidence values"""
        for history_dict in [self.static_confidence_history, self.dynamic_confidence_history]:
            for name in history_dict:
                history_dict[name] *= self.confidence_decay
    
    def find_best_gestures(self):
        """Find the most confident gestures of each type"""
        best_static_gesture = None
        best_static_confidence = 0
        best_dynamic_gesture = None  
        best_dynamic_confidence = 0
        
        for name, confidence in self.static_confidence_history.items():
            if confidence > best_static_confidence:
                best_static_confidence = confidence
                best_static_gesture = name
        
        for name, confidence in self.dynamic_confidence_history.items():
            if confidence > best_dynamic_confidence:
                best_dynamic_confidence = confidence
                best_dynamic_gesture = name
                
        return (best_static_gesture, best_static_confidence, best_dynamic_gesture, best_dynamic_confidence)
    
    def update_stability(self, detected_gesture_tuple):
        """Update gesture stability based on detected gesture"""
        if not detected_gesture_tuple:
            # No gesture detected, decay stability
            if self.current_gesture_stability > 0:
                self.current_gesture_stability -= 0.2
            
            if self.current_gesture_stability <= 0:
                self.current_gesture = None
                self.current_gesture_type = None
                self.current_gesture_stability = 0
            return None
            
        gesture_type, gesture_name, score = detected_gesture_tuple
        
        # Update gesture history for consistency checking
        self.update_gesture_history(gesture_type, gesture_name)
        
        # Check if this is the same gesture as currently active
        if (gesture_type, gesture_name) == (self.current_gesture_type, self.current_gesture):
            self.current_gesture_stability += 1
        else:
            # See if the new gesture is consistent in recent history
            if self.is_gesture_consistent(gesture_type, gesture_name):
                # Replace current gesture with consistent new gesture
                self.current_gesture_type = gesture_type
                self.current_gesture = gesture_name
                self.current_gesture_stability = self.min_detection_consistency
            else:
                # Not consistent enough to replace current stable gesture
                if self.current_gesture_stability >= self.stability_threshold:
                    # Keep current stable gesture instead
                    gesture_type = self.current_gesture_type
                    gesture_name = self.current_gesture
                else:
                    # Set as potentially new gesture with low stability
                    self.current_gesture_type = gesture_type
                    self.current_gesture = gesture_name
                    self.current_gesture_stability = 1
        
        # Return the current stable gesture information
        return (gesture_type, gesture_name, self.current_gesture_stability >= self.stability_threshold)
        
    def handle_rest_state(self, is_at_rest):
        """Update stability when hand is at rest"""
        if is_at_rest and self.current_gesture_stability > 0:
            self.current_gesture_stability -= 0.4  # Faster decay when at rest
            
        if self.current_gesture_stability <= 0:
            self.current_gesture = None
            self.current_gesture_type = None
            self.current_gesture_stability = 0