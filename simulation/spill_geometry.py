"""
Spill Geometry Calculation Module for Marine Trace
Computes geodetic polygon geometry: Area (km2), Perimeter (km), Centroid, Bounding Box,
PCA principal inertia axes (Major/Minor axes length in km, Orientation angle in deg).
"""

import math
import numpy as np

def haversine_distance_km(lat1, lon1, lat2, lon2):
    R = 6371.0  # Earth mean radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2)
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

def compute_polygon_geometry(polygon_coords):
    """
    Computes exact spherical / geodetic geometric properties for a polygon:
    polygon_coords: list of [lat, lon] pairs (closed or open)
    """
    pts = np.array(polygon_coords)
    if not np.array_equal(pts[0], pts[-1]):
        pts = np.vstack([pts, pts[0]])
    
    n_pts = len(pts) - 1
    lats = pts[:-1, 0]
    lons = pts[:-1, 1]
    
    # 1. Centroid
    centroid_lat = float(np.mean(lats))
    centroid_lon = float(np.mean(lons))
    
    # 2. Bounding Box
    min_lat, max_lat = float(np.min(lats)), float(np.max(lats))
    min_lon, max_lon = float(np.min(lons)), float(np.max(lons))
    
    # 3. Perimeter (km)
    perimeter_km = 0.0
    for i in range(n_pts):
        perimeter_km += haversine_distance_km(pts[i, 0], pts[i, 1], pts[i+1, 0], pts[i+1, 1])
    
    # 4. Spherical / Projected Area (km2) using Shoelace on metric projection
    deg_lat_km = 111.132
    deg_lon_km = 111.320 * math.cos(math.radians(centroid_lat))
    
    x_km = (lons - centroid_lon) * deg_lon_km
    y_km = (lats - centroid_lat) * deg_lat_km
    
    # Shoelace formula in local km coordinates
    area_km2 = 0.5 * abs(np.dot(x_km, np.roll(y_km, 1)) - np.dot(y_km, np.roll(x_km, 1)))
    
    # 5. Principal Inertia Axes & Orientation via PCA / Covariance of vertices
    coords_km = np.column_stack([x_km, y_km])
    cov = np.cov(coords_km, rowvar=False)
    eigenvalues, eigenvectors = np.linalg.eigh(cov)
    
    # Sort descending
    order = eigenvalues.argsort()[::-1]
    eigenvalues = eigenvalues[order]
    eigenvectors = eigenvectors[:, order]
    
    # Standard deviation along principal axes (approx 2-sigma extent for semi-axes)
    major_std_km = math.sqrt(max(0.01, eigenvalues[0]))
    minor_std_km = math.sqrt(max(0.01, eigenvalues[1]))
    
    length_major_axis_km = float(round(4.0 * major_std_km, 2))  # ~95% extent
    width_minor_axis_km = float(round(4.0 * minor_std_km, 2))
    
    # Orientation of major axis relative to True North (0° = North, 90° = East)
    major_vec = eigenvectors[:, 0]  # [dx_km, dy_km] = [East, North]
    angle_rad = math.atan2(major_vec[0], major_vec[1])
    orientation_deg = float(round((math.degrees(angle_rad)) % 180.0, 1))
    
    # Compactness (Isoperimetric quotient: 4 * pi * Area / Perimeter^2)
    compactness = float(round(4 * math.pi * area_km2 / (perimeter_km ** 2), 3)) if perimeter_km > 0 else 1.0
    
    return {
        "centroid": {"lat": round(centroid_lat, 6), "lon": round(centroid_lon, 6)},
        "area_km2": round(area_km2, 2),
        "perimeter_km": round(perimeter_km, 2),
        "length_major_axis_km": length_major_axis_km,
        "width_minor_axis_km": width_minor_axis_km,
        "orientation_deg": orientation_deg,
        "compactness": compactness,
        "bounding_box": {
            "min_lat": round(min_lat, 6),
            "max_lat": round(max_lat, 6),
            "min_lon": round(min_lon, 6),
            "max_lon": round(max_lon, 6)
        },
        "polygon_outline": [[round(float(p[0]), 6), round(float(p[1]), 6)] for p in pts]
    }
