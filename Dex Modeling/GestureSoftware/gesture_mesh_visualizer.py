import cv2
import numpy as np
import time
from utils.landmark_ges import LandmarkProcessor

class HandMeshVisualizer:
    def __init__(self, mesh_color=(0, 255, 0), mesh_thickness=2, point_radius=4,
                 point_color=(0, 0, 255), background_color=(0, 0, 0),
                 window_width=640, window_height=480, show_landmarks=True):
        # Initialize the landmark processor from the existing module
        self.landmark_processor = LandmarkProcessor(
            static_image_mode=False,
            max_num_hands=1,
            min_detection_confidence=0.7,
            min_tracking_confidence=0.7
        )
        
        # Visualization parameters
        self.mesh_color = mesh_color
        self.mesh_thickness = mesh_thickness
        self.point_radius = point_radius
        self.point_color = point_color
        self.background_color = background_color
        self.window_width = window_width
        self.window_height = window_height
        self.show_landmarks = show_landmarks
        
        # Check if CUDA is available
        self.use_gpu = cv2.cuda.getCudaEnabledDeviceCount() > 0
        
        # Define hand connections for mesh creation
        # This uses the MediaPipe hand connections structure
        self.connections = [
            # Thumb
            (0, 1), (1, 2), (2, 3), (3, 4),
            # Index finger
            (0, 5), (5, 6), (6, 7), (7, 8),
            # Middle finger
            (0, 9), (9, 10), (10, 11), (11, 12),
            # Ring finger
            (0, 13), (13, 14), (14, 15), (15, 16),
            # Pinky
            (0, 17), (17, 18), (18, 19), (19, 20),
            # Palm connections
            (5, 9), (9, 13), (13, 17),
            # Additional connections for better mesh
            (5, 17), (0, 17)
        ]
        
        # Frame rate calculation
        self.prev_frame_time = 0
        self.new_frame_time = 0
        self.fps = 0
        
        # Hand positioning parameters - wrist at bottom
        self.hand_vertical_offset = 0.8  # Shift downward (0.5 is center, 1.0 would be bottom)
        self.hand_scale = 0.9  # Reduced from 1.5 to make hand smaller and fit in the screen
        # Add scale adjust capabilities via keyboard
        self.scale_increment = 0.1
    
    def create_mesh_visualization(self, frame, landmarks):
        """
        Create a mesh visualization frame based on hand landmarks
        """
        # Create a blank mesh frame
        if self.use_gpu:
            # Create on GPU
            gpu_mesh_frame = cv2.cuda_GpuMat(self.window_height, self.window_width, cv2.CV_8UC3)
            gpu_mesh_frame.setTo(self.background_color)
            mesh_frame = gpu_mesh_frame.download()
        else:
            mesh_frame = np.zeros((self.window_height, self.window_width, 3), dtype=np.uint8)
            mesh_frame[:] = self.background_color
        
        if landmarks is None:
            return mesh_frame
        
        # Convert normalized landmarks to pixel coordinates
        h, w, _ = frame.shape
        pixel_landmarks = []
        
        # First identify wrist position (landmark 0)
        wrist_x, wrist_y = 0, 0
        if len(landmarks) > 0:
            wrist_x = landmarks[0][0]
            wrist_y = landmarks[0][1]
        
        for landmark in landmarks:
            # Adjust scale and position for better visualization
            # Center horizontally, position wrist at bottom of screen
            # Scale up the hand for better visibility
            x = int(((landmark[0] - wrist_x) * self.hand_scale + wrist_x + 0.5) * self.window_width)
            
            # For y-coordinate: wrist at bottom, fingers pointing upward
            # The 0.7 multiplier reduces the vertical range to keep fingers in view
            y_scaled = (landmark[1] - wrist_y) * self.hand_scale * 0.7
            # Position the wrist near the bottom of the screen
            y = int((y_scaled + self.hand_vertical_offset) * self.window_height)
            
            pixel_landmarks.append((x, y))
        
        # Draw connections to create the mesh
        for connection in self.connections:
            start_idx = connection[0]
            end_idx = connection[1]
            
            if start_idx < len(pixel_landmarks) and end_idx < len(pixel_landmarks):
                start_point = pixel_landmarks[start_idx]
                end_point = pixel_landmarks[end_idx]
                cv2.line(mesh_frame, start_point, end_point, self.mesh_color, self.mesh_thickness)
        
        # Draw landmark points
        if self.show_landmarks:
            for point in pixel_landmarks:
                cv2.circle(mesh_frame, point, self.point_radius, self.point_color, -1)
        
        # Add FPS information
        self.new_frame_time = time.time()
        self.fps = 1/(self.new_frame_time - self.prev_frame_time + 0.001)
        self.prev_frame_time = self.new_frame_time
        fps_text = f"FPS: {int(self.fps)}"
        cv2.putText(mesh_frame, fps_text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX,
                   0.7, (255, 255, 255), 2)
        
        return mesh_frame
    
    def create_3d_mesh_visualization(self, frame, landmarks):
        """
        Create a 3D mesh visualization frame based on hand landmarks with depth perception
        """
        # Create a blank mesh frame
        if self.use_gpu:
            # Create on GPU
            gpu_mesh_frame = cv2.cuda_GpuMat(self.window_height, self.window_width, cv2.CV_8UC3)
            gpu_mesh_frame.setTo(self.background_color)
            mesh_frame = gpu_mesh_frame.download()
        else:
            mesh_frame = np.zeros((self.window_height, self.window_width, 3), dtype=np.uint8)
            mesh_frame[:] = self.background_color
        
        if landmarks is None:
            return mesh_frame
        
        # Convert normalized landmarks to pixel coordinates with depth coloring
        h, w, _ = frame.shape
        pixel_landmarks = []
        depth_values = []
        
        # First identify wrist position (landmark 0)
        wrist_x, wrist_y = 0, 0
        if len(landmarks) > 0:
            wrist_x = landmarks[0][0]
            wrist_y = landmarks[0][1]
        
        for landmark in landmarks:
            # Adjust scale and position for better visualization
            # Center horizontally, position wrist at bottom of screen
            # Scale up the hand for better visibility
            x = int(((landmark[0] - wrist_x) * self.hand_scale + wrist_x + 0.5) * self.window_width)
            
            # For y-coordinate: wrist at bottom, fingers pointing upward
            # The 0.7 multiplier reduces the vertical range to keep fingers in view
            y_scaled = (landmark[1] - wrist_y) * self.hand_scale * 0.7
            # Position the wrist near the bottom of the screen
            y = int((y_scaled + self.hand_vertical_offset) * self.window_height)
            
            # Store Z coordinate for depth visualization
            z = landmark[2]
            
            pixel_landmarks.append((x, y))
            depth_values.append(z)
        
        # Normalize depth values for coloring
        if depth_values:
            min_z = min(depth_values)
            max_z = max(depth_values)
            z_range = max_z - min_z
            
            if z_range < 0.001:  # Avoid division by zero
                z_range = 0.001
            
            # Draw connections with depth-based coloring
            for connection in self.connections:
                start_idx = connection[0]
                end_idx = connection[1]
                
                if start_idx < len(pixel_landmarks) and end_idx < len(pixel_landmarks):
                    start_point = pixel_landmarks[start_idx]
                    end_point = pixel_landmarks[end_idx]
                    
                    # Use depth to determine color (closer points are warmer colors)
                    z1 = depth_values[start_idx]
                    z2 = depth_values[end_idx]
                    avg_z = (z1 + z2) / 2
                    
                    # Normalize z value
                    norm_z = (avg_z - min_z) / z_range
                    
                    # Color gradient: red (close) to blue (far)
                    r = int(255 * (1 - norm_z))
                    g = int(100 * (1 - abs(2 * norm_z - 1)))
                    b = int(255 * norm_z)
                    
                    line_color = (b, g, r)  # BGR format
                    thickness = max(1, int(self.mesh_thickness * (1 - 0.5 * norm_z)))
                    
                    cv2.line(mesh_frame, start_point, end_point, line_color, thickness)
            
            # Draw landmark points with depth-based size
            if self.show_landmarks:
                for i, point in enumerate(pixel_landmarks):
                    # Normalize z value
                    norm_z = (depth_values[i] - min_z) / z_range
                    
                    # Color gradient: red (close) to blue (far)
                    r = int(255 * (1 - norm_z))
                    g = int(100 * (1 - abs(2 * norm_z - 1)))
                    b = int(255 * norm_z)
                    
                    point_color = (b, g, r)  # BGR format
                    radius = max(1, int(self.point_radius * (1 - 0.5 * norm_z)))
                    
                    cv2.circle(mesh_frame, point, radius, point_color, -1)
        
        # Add FPS information
        self.new_frame_time = time.time()
        self.fps = 1/(self.new_frame_time - self.prev_frame_time + 0.001)
        self.prev_frame_time = self.new_frame_time
        fps_text = f"FPS: {int(self.fps)}"
        cv2.putText(mesh_frame, fps_text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX,
                   0.7, (255, 255, 255), 2)
        
        return mesh_frame
    
    def process_frame(self, frame):
        """
        Process a video frame and return both the original frame and mesh visualization
        """
        # Process frame with MediaPipe
        processed_frame, landmark_data, multi_hand_landmarks = self.landmark_processor.process_frame(frame, draw_landmarks=True)
        
        # Create mesh visualization
        mesh_frame = self.create_mesh_visualization(frame, landmark_data)
        
        # Create 3D mesh visualization with depth
        mesh_frame_3d = self.create_3d_mesh_visualization(frame, landmark_data)
        
        return processed_frame, mesh_frame, mesh_frame_3d
    
    def run(self, camera_index=0, view_mode="split"):
        """
        Run the hand mesh visualizer
        
        view_mode options:
            - "split": Show original and mesh side by side
            - "original": Show only original frame
            - "mesh": Show only mesh visualization
            - "mesh3d": Show only 3D mesh visualization
            - "all": Show original, 2D mesh, and 3D mesh
        """
        cap = cv2.VideoCapture(camera_index)
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        
        # Try to set GPU-optimized properties if available
        if self.use_gpu:
            # Set higher FPS when using GPU
            cap.set(cv2.CAP_PROP_FPS, 60)  
            
        print("Controls:")
        print("  - Press '1' for split view (original + mesh)")
        print("  - Press '2' for original view only")
        print("  - Press '3' for mesh view only")
        print("  - Press '4' for 3D mesh view only")
        print("  - Press '5' for all views (original + 2D mesh + 3D mesh)")
        print("  - Press 'p' to toggle landmark points")
        print("  - Press '+' or '=' to increase hand scale")
        print("  - Press '-' or '_' to decrease hand scale")
        print("  - Press ESC to exit")
        
        current_view_mode = view_mode
        
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
            
            # Process the frame
            processed_frame, mesh_frame, mesh_frame_3d = self.process_frame(frame)
            
            # Prepare display based on view mode
            if current_view_mode == "split":
                # Create side-by-side view
                if self.use_gpu:
                    # Upload to GPU
                    gpu_processed = cv2.cuda_GpuMat()
                    gpu_mesh = cv2.cuda_GpuMat()
                    gpu_processed.upload(processed_frame)
                    gpu_mesh.upload(mesh_frame)
                    
                    # Create combined view on GPU
                    display_frame = np.hstack((processed_frame, mesh_frame))
                else:
                    display_frame = np.hstack((processed_frame, mesh_frame))
                cv2.imshow('Hand Mesh Visualizer - Split View', display_frame)
            
            elif current_view_mode == "original":
                cv2.imshow('Hand Mesh Visualizer - Original', processed_frame)
            
            elif current_view_mode == "mesh":
                cv2.imshow('Hand Mesh Visualizer - Mesh', mesh_frame)
            
            elif current_view_mode == "mesh3d":
                cv2.imshow('Hand Mesh Visualizer - 3D Mesh', mesh_frame_3d)
            
            elif current_view_mode == "all":
                # Create row of all three views
                if self.use_gpu:
                    # Just concatenate normally as the hstack operation is typically quick
                    display_frame = np.hstack((processed_frame, mesh_frame, mesh_frame_3d))
                else:
                    display_frame = np.hstack((processed_frame, mesh_frame, mesh_frame_3d))
                cv2.imshow('Hand Mesh Visualizer - All Views', display_frame)
            
            # Handle key events
            key = cv2.waitKey(1) & 0xFF
            
            if key == 27:  # ESC key
                break
            elif key == ord('1'):
                current_view_mode = "split"
                cv2.destroyAllWindows()
            elif key == ord('2'):
                current_view_mode = "original"
                cv2.destroyAllWindows()
            elif key == ord('3'):
                current_view_mode = "mesh"
                cv2.destroyAllWindows()
            elif key == ord('4'):
                current_view_mode = "mesh3d"
                cv2.destroyAllWindows()
            elif key == ord('5'):
                current_view_mode = "all"
                cv2.destroyAllWindows()
            elif key == ord('p'):
                self.show_landmarks = not self.show_landmarks
                print(f"Landmarks display: {'On' if self.show_landmarks else 'Off'}")
            # Add scale adjustment controls
            elif key == ord('+') or key == ord('='):  # Increase hand scale
                self.hand_scale += self.scale_increment
                print(f"Hand scale increased to: {self.hand_scale:.1f}")
            elif key == ord('-') or key == ord('_'):  # Decrease hand scale
                self.hand_scale = max(0.3, self.hand_scale - self.scale_increment)
                print(f"Hand scale decreased to: {self.hand_scale:.1f}")
        
        cap.release()
        cv2.destroyAllWindows()
        self.landmark_processor.close()

if __name__ == "__main__":
    # Create and run the hand mesh visualizer
    visualizer = HandMeshVisualizer(
        mesh_color=(0, 255, 0),     # Green mesh
        point_color=(0, 0, 255),    # Red points
        background_color=(0, 0, 0),  # Black background
        window_width=640,
        window_height=480,
        show_landmarks=True
    )
    
    # Start with split view by default
    visualizer.run(view_mode="split")