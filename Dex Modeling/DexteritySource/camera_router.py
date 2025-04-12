import cv2
import asyncio
import mediapipe as mp
import time
import numpy as np
import math
from collections import deque, defaultdict
import matplotlib.pyplot as plt
import json
from datetime import datetime
from scipy.signal import find_peaks

def smooth_points(points, kernel_size=3):
    if len(points) < kernel_size:
        return points
    
    smoothed = []
    for i in range(len(points)):
        start = max(0, i - kernel_size // 2)
        end = min(len(points), i + kernel_size // 2 + 1)
        window = points[start:end]
        avg_x = sum(p[0] for p in window) / len(window)
        avg_y = sum(p[1] for p in window) / len(window)
        smoothed.append((int(avg_x), int(avg_y)))
    return smoothed

def kalman_filter(point, prev_point, velocity, dt=1.0/30.0):
    if prev_point is None:
        return point, (0, 0)

    pred_x = prev_point[0] + velocity[0] * dt
    pred_y = prev_point[1] + velocity[1] * dt

    k = 0.7
    new_x = pred_x + k * (point[0] - pred_x)
    new_y = pred_y + k * (point[1] - pred_y)
    
    vx = (new_x - prev_point[0]) / dt
    vy = (new_y - prev_point[1]) / dt
    
    return (int(new_x), int(new_y)), (vx, vy)

def detect_thumb_touch(hand_landmarks, threshold=0.05):
    thumb_tip = hand_landmarks.landmark[4]
    finger_tips = [8, 12, 16, 20]
    touches = {}

    for tip in finger_tips:
        finger_tip = hand_landmarks.landmark[tip]
        distance_3d = math.sqrt(
            (thumb_tip.x - finger_tip.x)**2 +
            (thumb_tip.y - finger_tip.y)**2 +
            (thumb_tip.z - finger_tip.z)**2
        )
        touches[tip] = (distance_3d < threshold)
    return touches

def enhance_image(frame):
    frame = cv2.GaussianBlur(frame, (5,5), 0)
    frame = cv2.resize(frame, (640, 480))
    
    lab = cv2.cvtColor(frame, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8,8))
    cl = clahe.apply(l)
    enhanced = cv2.merge((cl,a,b))
    
    return cv2.cvtColor(enhanced, cv2.COLOR_LAB2BGR)

def is_hand_pinched(hand_landmarks):
    threshold = 0.05
    thumb_tip = hand_landmarks.landmark[4]
    index_tip = hand_landmarks.landmark[8]
    distance = math.sqrt((thumb_tip.x - index_tip.x)**2 + (thumb_tip.y - index_tip.y)**2)
    return distance < threshold

def get_hand_side(hand_landmarks):
    # Determine if hand is left or right based on thumb position
    # If thumb is on the left side of the index finger, it's a right hand
    thumb_tip = hand_landmarks.landmark[4]
    index_base = hand_landmarks.landmark[5]
    return "Right" if thumb_tip.x < index_base.x else "Left"

class WaveDetector:
    def __init__(self, window_size=30, min_waves=3):
        self.wrist_positions = deque(maxlen=window_size)
        self.window_size = window_size
        self.min_waves = min_waves
        self.last_detection = None
        self.cooldown = 0.5  # seconds
        
    def add_position(self, x, y):
        self.wrist_positions.append((x, y))
        
    def detect_wave(self, current_time):
        if len(self.wrist_positions) < self.window_size:
            return False, 0.0
            
        if self.last_detection and (current_time - self.last_detection).total_seconds() < self.cooldown:
            return False, 0.0
            
        x_coords = np.array([pos[0] for pos in self.wrist_positions])
        
        x_normalized = (x_coords - np.mean(x_coords)) / np.std(x_coords)
        
        peaks, _ = find_peaks(x_normalized, distance=5)
        valleys, _ = find_peaks(-x_normalized, distance=5)
        
        if len(peaks) >= self.min_waves and len(valleys) >= self.min_waves:
            peak_values = x_normalized[peaks]
            valley_values = x_normalized[valleys]
            amplitude = np.mean(np.abs(peak_values)) + np.mean(np.abs(valley_values))
            
            time_points = np.linspace(0, 1, len(x_normalized))
            peak_times = time_points[peaks]
            frequency = len(peaks) / (time_points[-1] - time_points[0])
            confidence = min(1.0, (amplitude * frequency) / 4.0)
            
            if confidence > 0.6:
                self.last_detection = current_time
                return True, confidence
                
        return False, 0.0

class CameraRouter():
    def __init__(self, params: dict):
        self.params = params
        self.silent_logs = params.get('hush', False)
        self.Output = []
        self.touch_durations = defaultdict(lambda: {"start_time": None, "duration": 0})


    def track_touch_duration(self, handedness, finger_id, is_touching):
        current_time = datetime.now()

        # Key to identify each finger uniquely
        key = f"{handedness}_{finger_id}"

        if is_touching:
            if self.touch_durations[key]["start_time"] is None:
                self.touch_durations[key]["start_time"] = current_time
        else:
            if self.touch_durations[key]["start_time"] is not None:
                elapsed = (current_time - self.touch_durations[key]["start_time"]).total_seconds()
                self.touch_durations[key]["duration"] += elapsed
                self.touch_durations[key]["start_time"] = None

    async def run(self):
        mp_hands = mp.solutions.hands
        mp_pose = mp.solutions.pose  # Add pose detection
        
        hands = mp_hands.Hands(
            static_image_mode=False,
            max_num_hands=2,
            min_detection_confidence=0.7,
            min_tracking_confidence=0.5,
            model_complexity=1
        )
        
        pose = mp_pose.Pose(  # Initialize pose detection
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        
        mp_draw = mp.solutions.drawing_utils
        
        # Initialize trails for arms
        right_arm_trail = deque(maxlen=30)
        left_arm_trail = deque(maxlen=30)
        
        # Initialize trail storage
        trail_length = 30
        index_trail = deque(maxlen=trail_length)
        fps_values = deque(maxlen=100)

        # Add these variables after initializing index_trail
        prev_point = None
        velocity = (0, 0)

        # At the start of your script, initialize separate trails and tracking variables
        right_index_trail = deque(maxlen=30)
        left_index_trail = deque(maxlen=30)
        right_prev_point = None
        left_prev_point = None
        right_velocity = np.array([0.0, 0.0])
        left_velocity = np.array([0.0, 0.0])

        # At start of script, add:
        touch_events = []
        last_touch_state = {}  # To track state changes

        # Setup FPS plot
        plt.ion()
        fig, ax = plt.subplots()
        fps_line, = ax.plot([], [])
        ax.set_ylim(0, 100)
        ax.set_title('FPS Over Time')

        # Optimize camera settings
        cap = cv2.VideoCapture(0)
        cap.set(cv2.CAP_PROP_FPS, 60)  # Request 60fps if supported

        # FPS calculation variables
        prev_time = 0
        curr_time = 0

        # Define colors for each finger
        finger_colors = {
            4: (255, 0, 0),   # Thumb - Blue
            8: (0, 255, 0),   # Index - Green
            12: (0, 0, 255),  # Middle - Red
            16: (255, 255, 0),# Ring - Cyan
            20: (255, 0, 255) # Pinky - Magenta
        }

        finger_lookup = {
            4: "Thumb",
            8: "Index",
            12: "Middle",
            16: "Ring",
            20: "Pinky"
        }

        wave_detector = WaveDetector()

        hand_landmarks = None  # Ensure variable is declared before loop

        while cap.isOpened():
            success, frame = cap.read()
            if not success:
                break
            
            frame = cv2.flip(frame, 1)
            frame = enhance_image(frame)
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            
            # Process both hands and pose
            hand_results = hands.process(rgb_frame)
            pose_results = pose.process(rgb_frame)
            
            # Calculate and store FPS
            curr_time = time.time()
            fps = 1/(curr_time-prev_time) if (curr_time - prev_time) > 0 else 0
            prev_time = curr_time
            fps_values.append(fps)
            
            # Update FPS plot
            fps_line.set_data(range(len(fps_values)), fps_values)
            ax.set_xlim(0, len(fps_values))
            plt.draw()
            plt.pause(0.001)
            
            if hand_results.multi_hand_landmarks:
                for hand_idx, hand_landmarks in enumerate(hand_results.multi_hand_landmarks):
                    # Get handedness
                    handedness = hand_results.multi_handedness[hand_idx].classification[0].label
                    
                    # Draw hand mesh
                    mp_draw.draw_landmarks(
                        frame,
                        hand_landmarks,
                        mp_hands.HAND_CONNECTIONS,
                        mp_draw.DrawingSpec(color=(255,255,255), thickness=1, circle_radius=2),
                        mp_draw.DrawingSpec(color=(200,200,200), thickness=1)
                    )
                    
                    # Get index finger tip position
                    index_tip = hand_landmarks.landmark[8]
                    frame_height, frame_width = frame.shape[:2]
                    x = int(index_tip.x * frame_width)
                    y = int(index_tip.y * frame_height)
                    
                    if handedness == "Right":
                        # Apply Kalman filter for right hand
                        filtered_point, right_velocity = kalman_filter((x, y), right_prev_point, right_velocity)
                        right_prev_point = filtered_point
                        right_index_trail.append(filtered_point)
                        
                        # Draw right hand trail (in blue-green gradient)
                        points = np.array(smooth_points(list(right_index_trail), kernel_size=5), dtype=np.int32)
                        if len(points) > 1:
                            for i in range(1, len(points)):
                                thickness = int((i / len(points)) * 4) + 1
                                alpha = i / len(points)
                                color = (0, int(255 * alpha), int(255 * (1-alpha)))
                                cv2.line(frame, 
                                        tuple(points[i-1]), 
                                        tuple(points[i]), 
                                        color, 
                                        thickness,
                                        cv2.LINE_AA)
                    
                    elif handedness == "Left":
                        # Apply Kalman filter for left hand
                        filtered_point, left_velocity = kalman_filter((x, y), left_prev_point, left_velocity)
                        left_prev_point = filtered_point
                        left_index_trail.append(filtered_point)
                        
                        # Draw left hand trail (in red-yellow gradient)
                        points = np.array(smooth_points(list(left_index_trail), kernel_size=5), dtype=np.int32)
                        if len(points) > 1:
                            for i in range(1, len(points)):
                                thickness = int((i / len(points)) * 4) + 1
                                alpha = i / len(points)
                                color = (0, int(128 * alpha), int(255 * alpha))
                                cv2.line(frame, 
                                        tuple(points[i-1]), 
                                        tuple(points[i]), 
                                        color, 
                                        thickness,
                                        cv2.LINE_AA)
                    
                    # Detect thumb-to-finger contact
                    thumb_touches = detect_thumb_touch(hand_landmarks)
                    text_y = 90
                    # Track touch events
                    current_time = datetime.now().isoformat()
                    for tip_id, is_touching in thumb_touches.items():
                        event_key = f"{handedness}_{tip_id}"
                        was_touching = last_touch_state.get(event_key, False)

                        if is_touching and not was_touching:
                            touch_events.append({
                                'time': current_time,
                                'hand': handedness,
                                'finger': finger_lookup[tip_id],
                                'tip_id': tip_id
                            })
                        last_touch_state[event_key] = is_touching

                        self.track_touch_duration(handedness, tip_id, is_touching)

                        if is_touching:
                            duration = (datetime.now() - self.touch_durations[f"{handedness}_{tip_id}"]["start_time"]).total_seconds()
                            cv2.putText(
                                frame, 
                                f"{finger_lookup[tip_id]} touching for {duration:.2f}s",
                                (10, text_y),
                                cv2.FONT_HERSHEY_SIMPLEX, 
                                1, 
                                (0, 255, 0), 
                                2
                            )
                            text_y += 30
                        
                    # Display results
                    for tip_id, is_touching in thumb_touches.items():
                        if is_touching:
                            cv2.putText(
                                frame, 
                                f"{finger_lookup[tip_id]} finger touching thumb",
                                (10, text_y),
                                cv2.FONT_HERSHEY_SIMPLEX, 
                                1, 
                                (0, 255, 0), 
                                2
                            )
                            text_y += 30

                    # Draw colored landmarks on top
                    for idx, landmark in enumerate(hand_landmarks.landmark):
                        frame_height, frame_width = frame.shape[:2]
                        cx, cy = int(landmark.x * frame_width), int(landmark.y * frame_height)
                        if idx in finger_colors:
                            color = finger_colors[idx]
                        else:
                            color = (0, 255, 0)
                        cv2.circle(frame, (cx, cy), 2, color, -1)

            if pose_results.pose_landmarks:
                # Draw pose landmarks for upper body
                upper_body_landmarks = [
                    mp_pose.PoseLandmark.LEFT_SHOULDER,
                    mp_pose.PoseLandmark.RIGHT_SHOULDER,
                    mp_pose.PoseLandmark.LEFT_ELBOW,
                    mp_pose.PoseLandmark.RIGHT_ELBOW,
                    mp_pose.PoseLandmark.LEFT_WRIST,
                    mp_pose.PoseLandmark.RIGHT_WRIST
                ]
                frame_height, frame_width = frame.shape[:2]
                for landmark in upper_body_landmarks:
                    lm = pose_results.pose_landmarks.landmark[landmark]
                    cx, cy = int(lm.x * frame_width), int(lm.y * frame_height)
                    cv2.circle(frame, (cx, cy), 5, (0, 255, 255), -1)

                # Define pose connections
                pose_connections = [
                    (mp_pose.PoseLandmark.LEFT_SHOULDER, mp_pose.PoseLandmark.LEFT_ELBOW),
                    (mp_pose.PoseLandmark.LEFT_ELBOW, mp_pose.PoseLandmark.LEFT_WRIST),
                    (mp_pose.PoseLandmark.RIGHT_SHOULDER, mp_pose.PoseLandmark.RIGHT_ELBOW),
                    (mp_pose.PoseLandmark.RIGHT_ELBOW, mp_pose.PoseLandmark.RIGHT_WRIST),
                ]

                # Draw pose connections
                for connection in pose_connections:
                    start_landmark = connection[0]
                    end_landmark = connection[1]
                    
                    start = pose_results.pose_landmarks.landmark[start_landmark]
                    end = pose_results.pose_landmarks.landmark[end_landmark]
                    
                    start_xy = (int(start.x * frame_width), int(start.y * frame_height))
                    end_xy = (int(end.x * frame_width), int(end.y * frame_height))
                    
                    cv2.line(frame, start_xy, end_xy, (0, 255, 255), 2)

                # Connect pose wrist to hand wrist
                if hand_results.multi_hand_landmarks and pose_results.pose_landmarks:
                    left_wrist = pose_results.pose_landmarks.landmark[mp_pose.PoseLandmark.LEFT_WRIST]
                    right_wrist = pose_results.pose_landmarks.landmark[mp_pose.PoseLandmark.RIGHT_WRIST]
                    for hand_landmarks in hand_results.multi_hand_landmarks:
                        hand_side = get_hand_side(hand_landmarks)
                        hand_wrist = hand_landmarks.landmark[0]  # 0 is the wrist point
                        
                        if hand_side == "Right":
                            cv2.line(frame, 
                                    (int(hand_wrist.x * frame_width), int(hand_wrist.y * frame_height)),
                                    (int(left_wrist.x * frame_width), int(left_wrist.y * frame_height)),
                                    (0, 255, 0), 2)
                        elif hand_side == "Left":
                            cv2.line(frame, 
                                    (int(hand_wrist.x * frame_width), int(hand_wrist.y * frame_height)),
                                    (int(right_wrist.x * frame_width), int(right_wrist.y * frame_height)),
                                    (0, 255, 0), 2)

            if hand_landmarks:
                wrist_landmark = hand_landmarks.landmark[mp_hands.HandLandmark.WRIST]
                frame_height, frame_width = frame.shape[:2]
                wrist_x = wrist_landmark.x * frame_width
                wrist_y = wrist_landmark.y * frame_height
                
                wave_detector.add_position(wrist_x, wrist_y)
                is_waving, wave_confidence = wave_detector.detect_wave(datetime.now())
                
                if is_waving:
                    cv2.putText(
                        frame,
                        f"Wave detected! ({wave_confidence:.2f})",
                        (10, text_y),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        1,
                        (0, 255, 255),
                        2
                    )
                    text_y += 30

            cv2.putText(frame, f'FPS: {int(fps)}', (10,30), 
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (0,255,0), 2)
            cv2.imshow('Hand Tracking', frame)

            await asyncio.sleep(0)

            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

        if not self.silent_logs:
            with open('touch_events.json', 'w') as f:
                json.dump(touch_events, f, indent=2)

        cap.release()
        cv2.destroyAllWindows()
        plt.ioff()
        plt.close()
