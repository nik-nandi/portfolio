import numpy as np
import time

class DynamicGestureHandler:
    def __init__(self, gestures, dynamic_threshold=0.3, dynamic_time_window=1.5):
        self.gestures = gestures
        self.dynamic_threshold = dynamic_threshold
        self.dynamic_time_window = dynamic_time_window
        self.dynamic_frames = []

    def update_dynamic_buffer(self, landmarks, timestamp):
        self.dynamic_frames.append({
            "timestamp": timestamp,
            "landmarks": landmarks
        })

        current_time = time.time()
        self.dynamic_frames = [
            frame for frame in self.dynamic_frames
            if current_time - frame["timestamp"] <= self.dynamic_time_window
        ]

    def recognize_dynamic_gesture(self):
        if len(self.dynamic_frames) < 5:
            return None, float('inf')

        best_match = None
        best_score = float('inf')

        for name, gesture_sequence in self.gestures["dynamic"].items():
            if len(gesture_sequence) < 3:
                continue

            buffer_length = len(self.dynamic_frames)
            indices = np.linspace(0, buffer_length-1, len(gesture_sequence), dtype=int)
            sampled_frames = [self.dynamic_frames[i] for i in indices]

            # Calculate motion amount to help distinguish dynamic gestures from static ones
            start_pos = np.array(sampled_frames[0]["landmarks"])
            end_pos = np.array(sampled_frames[-1]["landmarks"])
            motion_amount = np.mean(np.sum((end_pos - start_pos) ** 2, axis=1))

            # Calculate path similarity
            total_similarity = 0
            for i, frame in enumerate(sampled_frames):
                sample_landmarks = frame["landmarks"]
                gesture_landmarks = gesture_sequence[i]["landmarks"]
                similarity = self.calculate_similarity(sample_landmarks, gesture_landmarks)
                total_similarity += similarity

            average_similarity = total_similarity / len(gesture_sequence)

            # Adjust score based on motion amount - more motion is better for dynamic gestures
            motion_weight = 0.3
            adjusted_score = average_similarity * (1.0 - motion_weight * min(1.0, motion_amount))

            if adjusted_score < best_score:
                best_score = adjusted_score
                best_match = name

        # Use dynamic threshold specifically for dynamic gestures
        if best_score < self.dynamic_threshold:
            return best_match, best_score
        return None, best_score

    def calculate_similarity(self, landmarks1, landmarks2):
        array1 = np.array(landmarks1)
        array2 = np.array(landmarks2)
        mse = np.mean(np.sum((array1 - array2) ** 2, axis=1))
        return mse