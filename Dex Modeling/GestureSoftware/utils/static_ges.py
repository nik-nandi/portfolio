import numpy as np

class StaticGestureHandler:
    def __init__(self, gestures, static_threshold=0.2):
        self.gestures = gestures
        self.static_threshold = static_threshold

    def calculate_similarity(self, landmarks1, landmarks2):
        array1 = np.array(landmarks1)
        array2 = np.array(landmarks2)
        mse = np.mean(np.sum((array1 - array2) ** 2, axis=1))
        return mse

    def recognize_static_gesture(self, landmarks):
        best_match = None
        best_score = float('inf')

        for name, gesture_landmarks in self.gestures["static"].items():
            similarity = self.calculate_similarity(landmarks, gesture_landmarks)

            if similarity < best_score:
                best_score = similarity
                best_match = name

        if best_score < self.static_threshold:
            return best_match, best_score
        return None, best_score