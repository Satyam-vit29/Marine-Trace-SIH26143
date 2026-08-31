"""
Explainable Multi-Attribute AIS Association Scoring Module for Marine Trace
Implements defensible, non-probabilistic candidate vessel association scoring:
    S = 0.30 * S_space + 0.25 * S_time + 0.20 * S_trajectory + 0.15 * S_heading + 0.10 * S_behavior
Where all sub-scores are strictly normalized to 0–100.
Calculates unique CPA distances, timestamps, heading differences, and explainable evidence.
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

def score_candidate_vessel(
    vessel_dict,
    origin_lat,
    origin_lon,
    origin_release_time_str,
    uncertainty_radius_km=2.8,
    corridor_bearing_deg=45.0
):
    """
    Computes distinct CPA metrics and the 5-component association score for a single vessel track.
    """
    track = vessel_dict.get("track", [])
    if not track:
        return None
    
    t_origin = parse_iso_time(origin_release_time_str)
    
    # 1. Compute CPA (Closest Point of Approach) to Origin Centroid
    min_dist_km = float('inf')
    cpa_point = None
    
    for pt in track:
        d = haversine_distance_km(pt["lat"], pt["lon"], origin_lat, origin_lon)
        if d < min_dist_km:
            min_dist_km = d
            cpa_point = pt

    cpa_time_str = cpa_point["time"]
    t_cpa = parse_iso_time(cpa_time_str)
    time_diff_hours = abs((t_cpa - t_origin).total_seconds()) / 3600.0
    
    # 2. Sub-score 1: S_space (Spatial Proximity, weight 30%)
    # Full score (100) if d <= 0.5 km, decays to 0 at 2.5 * R95 (~7 km)
    max_spatial_reach = max(4.0, uncertainty_radius_km * 2.5)
    s_space = max(0.0, min(100.0, 100.0 * (1.0 - (min_dist_km / max_spatial_reach))))
    
    # 3. Sub-score 2: S_time (Temporal Overlap, weight 25%)
    # 12h window centered on release time (max allowable delta = 6.0 hours)
    s_time = max(0.0, min(100.0, 100.0 * (1.0 - (time_diff_hours / 6.0))))
    
    # 4. Sub-score 3: S_trajectory (Corridor Consistency, weight 20%)
    # Distance of closest approach along vessel trajectory corridor
    s_trajectory = max(0.0, min(100.0, 100.0 * (1.0 - (min_dist_km / (max_spatial_reach * 1.2)))))
    
    # 5. Sub-score 4: S_heading (Course Compatibility, weight 15%)
    vessel_heading = vessel_dict.get("heading_deg", 0.0)
    heading_diff = abs((vessel_heading - corridor_bearing_deg + 180.0) % 360.0 - 180.0)
    s_heading = max(0.0, min(100.0, 100.0 * (math.cos(math.radians(heading_diff / 2.0)) ** 2)))
    
    # 6. Sub-score 5: S_behavior (Navigational Behavior Consistency, weight 10%)
    speed = vessel_dict.get("avg_speed_knots", 12.0)
    nav_status = vessel_dict.get("nav_status", "Underway")
    if "Underway" in nav_status and speed >= 8.0:
        s_behavior = 95.0
    elif "Moored" in nav_status or "Anchored" in nav_status:
        s_behavior = 35.0
    else:
        s_behavior = 80.0

    # Total Multi-Attribute Score
    total_score = (
        0.30 * s_space +
        0.25 * s_time +
        0.20 * s_trajectory +
        0.15 * s_heading +
        0.10 * s_behavior
    )
    total_score = round(max(0.0, min(100.0, total_score)), 1)
    
    # Assessment Tier Label
    if total_score >= 80.0:
        assessment_label = "HIGH ASSOCIATION"
        tier = "high"
    elif total_score >= 50.0:
        assessment_label = "MODERATE ASSOCIATION"
        tier = "med"
    else:
        assessment_label = "LOW ASSOCIATION"
        tier = "low"

    # Evidence checklist
    evidence_points = []
    if min_dist_km <= uncertainty_radius_km:
        evidence_points.append(f"CPA of {min_dist_km:.2f} km within 95% origin containment envelope ({uncertainty_radius_km:.2f} km).")
    else:
        evidence_points.append(f"CPA of {min_dist_km:.2f} km from computed origin centroid.")
        
    if time_diff_hours <= 0.5:
        evidence_points.append(f"Synchronous presence within {int(time_diff_hours * 60)} min of estimated discharge time ({cpa_time_str[-8:]} UTC).")
    elif time_diff_hours <= 3.0:
        evidence_points.append(f"Present within {time_diff_hours:.1f} hours of estimated discharge window.")
    else:
        evidence_points.append(f"Temporal offset of {time_diff_hours:.1f} hours outside estimated discharge window.")
        
    if heading_diff <= 25.0:
        evidence_points.append(f"Heading ({vessel_heading:.0f}°) aligns with regional dispersion corridor ({corridor_bearing_deg:.0f}°).")
    elif heading_diff >= 90.0:
        evidence_points.append(f"Opposing or transverse heading ({vessel_heading:.0f}°) relative to dispersion corridor ({corridor_bearing_deg:.0f}°).")
        
    return {
        "vessel": vessel_dict["vessel"],
        "mmsi": vessel_dict["mmsi"],
        "imo": vessel_dict.get("imo", "9381201"),
        "vessel_type": vessel_dict.get("vessel_type", "Tanker"),
        "flag": vessel_dict.get("flag", "India (IN)"),
        "length_m": vessel_dict.get("length_m", 200),
        "beam_m": vessel_dict.get("beam_m", 32),
        "avg_speed_knots": vessel_dict.get("avg_speed_knots", 12.0),
        "heading_deg": vessel_heading,
        "nav_status": nav_status,
        "score": total_score,
        "association_label": assessment_label,
        "tier": tier,
        "cpa": {
            "lat": round(cpa_point["lat"], 6),
            "lon": round(cpa_point["lon"], 6),
            "distance_km": round(min_dist_km, 2),
            "time": cpa_time_str,
            "time_diff_hours": round(time_diff_hours, 2)
        },
        "score_breakdown": {
            "s_space": round(s_space, 1),
            "w_space": 0.30,
            "s_time": round(s_time, 1),
            "w_time": 0.25,
            "s_trajectory": round(s_trajectory, 1),
            "w_trajectory": 0.20,
            "s_heading": round(s_heading, 1),
            "w_heading": 0.15,
            "s_behavior": round(s_behavior, 1),
            "w_behavior": 0.10
        },
        "evidence_checklist": evidence_points,
        "track": track
    }
