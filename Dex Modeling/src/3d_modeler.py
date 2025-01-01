import cv2
import numpy as np
import open3d as o3d

# Capture two frames from the default camera
cap = cv2.VideoCapture(0)
ret1, frame1 = cap.read()
ret2, frame2 = cap.read()
cap.release()

if not ret1 or not ret2:
    raise RuntimeError("Failed to capture images")

# Convert to grayscale
gray1 = cv2.cvtColor(frame1, cv2.COLOR_BGR2GRAY)
gray2 = cv2.cvtColor(frame2, cv2.COLOR_BGR2GRAY)

# Compute disparity map
stereo = cv2.StereoBM_create(numDisparities=16, blockSize=15)
disparity = stereo.compute(gray1, gray2)

# Normalize the disparity map for visualization
disparity_normalized = cv2.normalize(disparity, None, alpha=0, beta=255, norm_type=cv2.NORM_MINMAX)
disparity_normalized = np.uint8(disparity_normalized)

# Create Open3D images
color_o3d = o3d.geometry.Image(cv2.cvtColor(frame1, cv2.COLOR_BGR2RGB))
depth_o3d = o3d.geometry.Image(disparity_normalized)

# Construct an RGBD image (using arbitrary scale factors)
rgbd = o3d.geometry.RGBDImage.create_from_color_and_depth(
    color_o3d, depth_o3d, depth_scale=255.0, convert_rgb_to_intensity=False
)

# Set dummy camera intrinsics
height, width = gray1.shape
fx = fy = 500.0
cx, cy = width / 2.0, height / 2.0
intrinsics = o3d.camera.PinholeCameraIntrinsic(width, height, fx, fy, cx, cy)

# Create point cloud
pcd = o3d.geometry.PointCloud.create_from_rgbd_image(rgbd, intrinsics)

# Adjust orientation by rotating the point cloud so Y is up
rotation_matrix = pcd.get_rotation_matrix_from_xyz((-np.pi / 2, 0, 0))
pcd.rotate(rotation_matrix, center=(0, 0, 0))

# Visualize the result
vis = o3d.visualization.VisualizerWithKeyCallback()
vis.create_window()
vis.add_geometry(pcd)

step = 0.1  # Rotation step per key press

def rotate_pitch_up(vis):
    rot = pcd.get_rotation_matrix_from_xyz((-step, 0, 0))
    pcd.rotate(rot, center=(0, 0, 0))
    vis.update_geometry(pcd)
    return False

def rotate_pitch_down(vis):
    rot = pcd.get_rotation_matrix_from_xyz((step, 0, 0))
    pcd.rotate(rot, center=(0, 0, 0))
    vis.update_geometry(pcd)
    return False

def rotate_yaw_left(vis):
    rot = pcd.get_rotation_matrix_from_xyz((0, -step, 0))
    pcd.rotate(rot, center=(0, 0, 0))
    vis.update_geometry(pcd)
    return False

def rotate_yaw_right(vis):
    rot = pcd.get_rotation_matrix_from_xyz((0, step, 0))
    pcd.rotate(rot, center=(0, 0, 0))
    vis.update_geometry(pcd)
    return False

def rotate_roll_left(vis):
    rot = pcd.get_rotation_matrix_from_xyz((0, 0, -step))
    pcd.rotate(rot, center=(0, 0, 0))
    vis.update_geometry(pcd)
    return False

def rotate_roll_right(vis):
    rot = pcd.get_rotation_matrix_from_xyz((0, 0, step))
    pcd.rotate(rot, center=(0, 0, 0))
    vis.update_geometry(pcd)
    return False

def exit_visualization(vis):
    vis.destroy_window()
    return False

vis.register_key_callback(ord('W'), rotate_pitch_up)
vis.register_key_callback(ord('S'), rotate_pitch_down)
vis.register_key_callback(ord('A'), rotate_yaw_left)
vis.register_key_callback(ord('D'), rotate_yaw_right)
vis.register_key_callback(ord('Q'), rotate_roll_left)
vis.register_key_callback(ord('E'), rotate_roll_right)
vis.register_key_callback(256, exit_visualization)  #ESC

while vis.poll_events():
    vis.update_renderer()