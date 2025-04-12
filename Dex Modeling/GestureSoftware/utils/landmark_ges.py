import numpy as np
import cv2
import mediapipe as mp

class LandmarkProcessor:
    def __init__(self, static_image_mode=False, max_num_hands=1, min_detection_confidence=0.7, min_tracking_confidence=0.7):
        self.mp_hands = mp.solutions.hands
        self.hands = self.mp_hands.Hands(
            static_image_mode=static_image_mode,
            max_num_hands=max_num_hands,
            min_detection_confidence=min_detection_confidence,
            min_tracking_confidence=min_tracking_confidence
        )
        self.mp_drawing = mp.solutions.drawing_utils
        
        # Check if CUDA is available
        self.use_gpu = cv2.cuda.getCudaEnabledDeviceCount() > 0
        if self.use_gpu:
            print("CUDA-enabled GPU detected. Using GPU acceleration for OpenCV operations.")
        else:
            print("No CUDA-enabled GPU detected. Using CPU for OpenCV operations.")
        
    def process_frame(self, frame, draw_landmarks=True):
        """Process frame and return hand landmarks if detected"""
        # Use GPU for color conversion if available
        if self.use_gpu:
            # Upload frame to GPU
            gpu_frame = cv2.cuda_GpuMat()
            gpu_frame.upload(frame)
            
            # Convert BGR to RGB on GPU
            gpu_rgb_frame = cv2.cuda.cvtColor(gpu_frame, cv2.COLOR_BGR2RGB)
            
            # Download the result back to CPU for MediaPipe processing
            rgb_frame = gpu_rgb_frame.download()
        else:
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            
        results = self.hands.process(rgb_frame)
        
        landmark_data = None
        
        if results.multi_hand_landmarks:
            for hand_landmarks in results.multi_hand_landmarks:
                if draw_landmarks:
                    self.mp_drawing.draw_landmarks(
                        frame, 
                        hand_landmarks, 
                        self.mp_hands.HAND_CONNECTIONS
                    )
                
                landmark_data = self.normalize_landmarks(hand_landmarks.landmark, frame.shape)
                
        return frame, landmark_data, results.multi_hand_landmarks
    
    def normalize_landmarks(self, landmarks, frame_shape):
        """Normalize hand landmarks for scale/translation invariance"""
        points = []
        for landmark in landmarks:
            points.append([landmark.x, landmark.y, landmark.z])
        
        points = np.array(points)
        center = points[0]  # Use wrist as center
        distances = np.linalg.norm(points - center, axis=1)
        scale = np.max(distances)
        normalized_points = (points - center) / (scale + 1e-8)
        
        return normalized_points.tolist()
        
    def close(self):
        """Release MediaPipe resources"""
        self.hands.close()