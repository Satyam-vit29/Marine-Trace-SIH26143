import os
import numpy as np
from PIL import Image, ImageFilter

def generate_sentinel1_sar_image():
    # Dimensions for high-res SAR patch: 1200 x 900
    # Geographic bounds:
    # South: 18.35°N, North: 18.65°N
    # West: 69.80°E, East: 70.20°E
    width = 1200
    height = 900
    
    np.random.seed(42)
    
    # 1. Base Sea Clutter (Rayleigh / Gamma distributed SAR radar speckle)
    # Typical Sentinel-1 C-SAR ocean backscatter: mean DN around 120 (approx -12 dB)
    base_sea = np.random.gamma(shape=9.0, scale=12.0, size=(height, width)).astype(np.float32)
    
    # Add gentle ocean swell / wave modulation pattern (wavelength ~ 150m, aligned ~65 deg)
    y_coords, x_coords = np.mgrid[0:height, 0:width]
    wave_angle = np.radians(65)
    wave_pattern = np.sin((x_coords * np.cos(wave_angle) + y_coords * np.sin(wave_angle)) * (2 * np.pi / 28.0))
    base_sea += wave_pattern * 8.0
    
    # 2. Detected Oil Slick Anomaly (Capillary wave damping -> Dark low backscatter region)
    # Centered at (18.50°N, 70.00°E) -> Normalized coords: x=0.50, y=0.50
    center_x = width * 0.50
    center_y = height * 0.50
    
    # Major axis length ~ 6.22 km (in pixels ~ 260px), Minor axis ~ 2.12 km (~ 90px)
    # Orientation ~ 90.8 deg (nearly horizontal with slight tilt)
    theta = np.radians(91.0)
    
    # Compute transformed coordinates along slick principal axes
    dx = x_coords - center_x
    dy = y_coords - center_y
    
    x_rot = dx * np.cos(theta) + dy * np.sin(theta)
    y_rot = -dx * np.sin(theta) + dy * np.cos(theta)
    
    # Semi-major a = 140, semi-minor b = 48
    slick_dist = (x_rot / 140.0)**2 + (y_rot / 48.0)**2
    
    # Add natural fractal fractal feathering / plume elongation
    feathering = (
        0.18 * np.sin(x_rot * 0.08) + 
        0.12 * np.cos(y_rot * 0.12) +
        0.08 * np.sin((x_rot + y_rot) * 0.05)
    )
    slick_dist_feathered = slick_dist + feathering
    
    # Dark damping mask: inside slick, backscatter drops by 50-70% (-4.8 dB to -6 dB)
    # Sigmoid edge transition
    damping_factor = 1.0 / (1.0 + np.exp(-(slick_dist_feathered - 1.0) * 4.5))
    
    # Inside slick backscatter (dark ~ 45-60 DN) vs clean sea (~ 115-135 DN)
    sar_intensity = base_sea * (0.38 + 0.62 * damping_factor)
    
    # Add a thin tail feather plume extending back along drift origin (-dx, -dy)
    tail_dist = ((x_rot + 110) / 190.0)**2 + (y_rot / 24.0)**2
    tail_damping = 1.0 / (1.0 + np.exp(-(tail_dist - 1.0) * 3.5))
    sar_intensity = sar_intensity * (0.65 + 0.35 * tail_damping)
    
    # Clip and convert to uint8 grayscale image
    sar_clipped = np.clip(sar_intensity, 0, 255).astype(np.uint8)
    
    sar_img = Image.fromarray(sar_clipped)
    # Slight radar smoothing filter to match standard Sentinel-1 Level-1 GRD 10m product
    sar_img = sar_img.filter(ImageFilter.GaussianBlur(radius=0.7))
    
    # Save to website/public and output
    out_paths = [
        "../website/public/sentinel1_sar_scene.png",
        "../output/sentinel1_sar_scene.png"
    ]
    
    for p in out_paths:
        os.makedirs(os.path.dirname(p), exist_ok=True)
        sar_img.save(p, format="PNG")
        print(f"Saved Sentinel-1 SAR Image to {p}")

if __name__ == "__main__":
    generate_sentinel1_sar_image()
