import time
import re

class ActionHandler:
    def __init__(self, detection_cooldown=1.0):
        self.action_registry = {}
        self.last_detection_time = 0
        self.detection_cooldown = detection_cooldown
        self.register_default_actions()
    
    def register_action(self, gesture_type, gesture_name, action_function):
        key = f"{gesture_type}:{gesture_name}"
        self.action_registry[key] = action_function
        print(f"Registered action for {key}")
        
    def register_default_actions(self):
        self.register_action("static", "thumbs_up", self.action_thumbs_up)
        self.register_action("static", "peace", self.action_peace)
        self.register_action("static", "open_palm", self.action_open_palm)
        self.register_action("dynamic", "swipe_right", self.action_swipe_right)
        self.register_action("dynamic", "swipe_left", self.action_swipe_left)
        self.register_action("dynamic", "wave", self.action_wave)
    
    def action_thumbs_up(self):
        print("ACTION: Thumbs up detected - Confirming action")
    
    def action_peace(self):
        print("ACTION: Peace sign detected - Taking a screenshot")
    
    def action_open_palm(self):
        print("ACTION: Open palm detected - Stopping current process")
    
    def action_swipe_right(self):
        print("ACTION: Swipe right detected - Next item")
    
    def action_swipe_left(self):
        print("ACTION: Swipe left detected - Previous item")
    
    def action_wave(self):
        print("ACTION: Wave detected - Hello greeting")
    
    def trigger_action(self, gesture_type, gesture_name):
        key = f"{gesture_type}:{gesture_name}"
        
        current_time = time.time()
        if current_time - self.last_detection_time < self.detection_cooldown:
            return
        
        self.last_detection_time = current_time
        
        # First try exact match
        if key in self.action_registry:
            self.action_registry[key]()
            return
            
        # If not found, check if this is a numbered variation (name_1, name_2, etc.)
        # Extract the base name by removing the _N suffix
        base_name = self._get_base_gesture_name(gesture_name)
        if base_name != gesture_name:
            base_key = f"{gesture_type}:{base_name}"
            if base_key in self.action_registry:
                print(f"Using action for {base_key} (variant: {gesture_name})")
                self.action_registry[base_key]()
                return
        
        print(f"No action registered for gesture: {key}")
    
    def _get_base_gesture_name(self, gesture_name):
        """Extract the base name from a numbered gesture variant (e.g., 'swipe_right_1' -> 'swipe_right')"""
        # Check if the name ends with _N where N is a number
        match = re.match(r'^(.+)_\d+$', gesture_name)
        if match:
            return match.group(1)
        return gesture_name