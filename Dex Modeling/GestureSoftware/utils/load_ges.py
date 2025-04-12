import json
import os

def load_gestures(gestures_file):
    if os.path.exists(gestures_file):
        with open(gestures_file, 'r') as f:
            return json.load(f)
    print(f"Warning: Gestures file {gestures_file} not found")
    return {"static": {}, "dynamic": {}}