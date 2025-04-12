import numpy as np

class RestGestureHandler:
    def __init__(self, rest_threshold=0.15, rest_feature_variance_threshold=0.002, rest_history_size=10, min_rest_consistency=7):
        self.rest_threshold = rest_threshold
        self.rest_feature_variance_threshold = rest_feature_variance_threshold
        self.rest_history_size = rest_history_size
        self.min_rest_consistency = min_rest_consistency
        self.hand_at_rest = False
        self.rest_history = []
        self.rest_position_template = None

    def is_hand_at_rest(self, landmarks, static_gesture, static_score, static_threshold, current_gesture, current_gesture_stability, stability_threshold):
        if static_gesture and static_score < static_threshold * 0.8:
            return False

        if self.rest_position_template is None and len(self.rest_history) > self.min_rest_consistency:
            self.rest_position_template = np.mean([np.array(hist_landmarks) for hist_landmarks in self.rest_history], axis=0).tolist()
            return False

        points = np.array(landmarks)
        fingers_extended = self._calculate_finger_extension(points)

        if len(self.rest_history) > 5:
            variance = self._calculate_landmark_variance()
            is_stable = variance < self.rest_feature_variance_threshold
        else:
            is_stable = True

        template_match = False
        if self.rest_position_template is not None:
            similarity = self.calculate_similarity(landmarks, self.rest_position_template)
            template_match = similarity < self.rest_threshold

        num_extended = sum(fingers_extended)
        distinct_gesture_shape = num_extended in [1, 2, 5]

        if points.shape[0] >= 21:
            thumb_tip = points[4]
            index_tip = points[8]
            distance = np.linalg.norm(thumb_tip - index_tip)
            if distance < 0.1:
                distinct_gesture_shape = True

        self.rest_history.append(landmarks)
        if len(self.rest_history) > self.rest_history_size:
            self.rest_history.pop(0)

        if distinct_gesture_shape:
            rest_probability = 0.1
        elif template_match:
            rest_probability = 0.6
        else:
            finger_rest_evidence = 0.5
            if num_extended in [3, 4]:
                finger_rest_evidence = 0.7
            elif num_extended == 0:
                finger_rest_evidence = 0.9

            rest_probability = (0.5 * finger_rest_evidence + 0.5 * is_stable)

        if current_gesture is not None and current_gesture_stability >= stability_threshold * 0.7:
            rest_probability *= 0.7

        if self.hand_at_rest:
            self.hand_at_rest = rest_probability > 0.4
        else:
            self.hand_at_rest = rest_probability > 0.7

        return self.hand_at_rest

    def reset_rest_detection(self):
        self.hand_at_rest = False
        self.rest_history = []
        self.rest_position_template = None

    def _calculate_finger_extension(self, points):
        wrist = points[0]
        tip_indices = [4, 8, 12, 16, 20]
        base_indices = [2, 5, 9, 13, 17]
        fingers_extended = []

        for i in range(5):
            tip_to_wrist = np.linalg.norm(points[tip_indices[i]] - wrist)
            base_to_wrist = np.linalg.norm(points[base_indices[i]] - wrist)
            extended_threshold = 1.5 if i == 0 else 1.7
            fingers_extended.append(tip_to_wrist > base_to_wrist * extended_threshold)

        return fingers_extended

    def _calculate_landmark_variance(self):
        if len(self.rest_history) < 2:
            return 0

        arrays = [np.array(landmarks) for landmarks in self.rest_history]
        variances = []

        for i in range(1, len(arrays)):
            frame_variance = np.mean(np.sum((arrays[i] - arrays[i-1]) ** 2, axis=1))
            variances.append(frame_variance)

        return np.mean(variances)
        
    def calculate_similarity(self, landmarks1, landmarks2):
        """Calculate similarity between two sets of landmarks"""
        array1 = np.array(landmarks1)
        array2 = np.array(landmarks2)
        mse = np.mean(np.sum((array1 - array2) ** 2, axis=1))
        return mse