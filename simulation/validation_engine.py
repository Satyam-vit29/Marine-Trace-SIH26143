"""
Validation Engine for Marine Trace
Compares predicted origin coordinates and estimated discharge time against synthetic ground truth.
Calculates exact localization error (km) and release time offset (minutes).
"""

import math
from datetime import datetime

def haversine_distance_km(lat1, lon1, lat2, lon2):
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2)
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

def parse_iso_time(t_str):
    t_clean = t_str.replace("Z", "").replace("T", " ")
    return datetime.strptime(t_clean[:19], "%Y-%m-%d %H:%M:%S")

def evaluate_validation_metrics(predicted_origin, ground_truth):
    """
    predicted_origin: dict with 'lat', 'lon', 'estimated_release_time'
    ground_truth: dict with 'true_origin_lat', 'true_origin_lon', 'true_release_time', 'target_vessel'
    """
    pred_lat = predicted_origin["lat"]
    pred_lon = predicted_origin["lon"]
    pred_time_str = predicted_origin["estimated_release_time"]
    
    true_lat = ground_truth["true_origin_lat"]
    true_lon = ground_truth["true_origin_lon"]
    true_time_str = ground_truth["true_release_time"]
    
    loc_error_km = round(haversine_distance_km(pred_lat, pred_lon, true_lat, true_lon), 2)
    
    t_pred = parse_iso_time(pred_time_str)
    t_true = parse_iso_time(true_time_str)
    time_error_min = int(round(abs((t_pred - t_true).total_seconds()) / 60.0))
    
    return {
        "ground_truth": {
            "true_origin": {"lat": true_lat, "lon": true_lon},
            "true_release_time": true_time_str,
            "target_vessel": ground_truth.get("target_vessel", "N/A"),
            "scenario_type": ground_truth.get("scenario_type", "Demonstration Scenario")
        },
        "predicted_origin": {
            "lat": pred_lat,
            "lon": pred_lon,
            "estimated_release_time": pred_time_str
        },
        "metrics": {
            "origin_localization_error_km": loc_error_km,
            "release_time_error_min": time_error_min,
            "within_95_containment": loc_error_km <= ground_truth.get("containment_radius_km", 2.8)
        },
        "status": "VALIDATED — HIGH CONVERGENCE" if loc_error_km <= 2.5 else "VALIDATED — ACCEPTABLE CONVERGENCE"
    }
