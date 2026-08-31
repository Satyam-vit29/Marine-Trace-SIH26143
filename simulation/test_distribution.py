"""
Test Synthetic AIS Generator with Realistic Score Distribution
"""
import math
import numpy as np
from datetime import datetime, timedelta
from ais_scoring import score_candidate_vessel, haversine_distance_km

def generate_vessel_track(
    origin_lat,
    origin_lon,
    origin_time_str,
    corridor_bearing_deg,
    cross_track_km,
    time_offset_hours,
    heading_deg,
    speed_knots,
    vessel_meta,
    n_points=5,
    span_hours=4.0
):
    """
    Generates a realistic linear-transit AIS track for a vessel passing near an origin.
    """
    t_origin = datetime.strptime(origin_time_str.replace("Z", "")[:19], "%Y-%m-%d %H:%M:%S")
    t_cpa = t_origin + timedelta(hours=time_offset_hours)
    
    # Unit vectors for metric projection
    deg_lat_km = 111.132
    deg_lon_km = 111.320 * math.cos(math.radians(origin_lat))
    
    # Corridor cross-track angle (perpendicular to corridor)
    cross_angle_rad = math.radians((corridor_bearing_deg + 90.0) % 360.0)
    cpa_lat = origin_lat + (cross_track_km * math.cos(cross_angle_rad)) / deg_lat_km
    cpa_lon = origin_lon + (cross_track_km * math.sin(cross_angle_rad)) / deg_lon_km
    
    # Velocity vector
    speed_kmh = speed_knots * 1.852
    head_rad = math.radians(heading_deg)
    v_north_kmh = speed_kmh * math.cos(head_rad)
    v_east_kmh = speed_kmh * math.sin(head_rad)
    
    # Generate waypoints spanning before and after CPA
    half_span = span_hours / 2.0
    dt_points = np.linspace(-half_span, half_span, n_points)
    
    track = []
    for dt_h in dt_points:
        pt_time = t_cpa + timedelta(hours=float(dt_h))
        pt_lat = cpa_lat + (dt_h * v_north_kmh) / deg_lat_km
        pt_lon = cpa_lon + (dt_h * v_east_kmh) / deg_lon_km
        track.append({
            "lat": round(float(pt_lat), 5),
            "lon": round(float(pt_lon), 5),
            "time": pt_time.strftime("%Y-%m-%d %H:%M:%S")
        })
        
    vessel_dict = dict(vessel_meta)
    vessel_dict["heading_deg"] = round(heading_deg, 1)
    vessel_dict["avg_speed_knots"] = round(speed_knots, 1)
    vessel_dict["track"] = track
    return vessel_dict

def test_distribution(seed=42):
    np.random.seed(seed)
    origin_lat, origin_lon = 16.3786, 82.6972
    origin_time = "2026-08-28 02:30:00"
    corridor = 41.0
    uncertainty_r = 2.8
    
    vessels_configs = [
        # Archetype A: Close + Good Timing + Aligned
        {
            "meta": {"vessel": "MV Konkan Pride", "mmsi": "419001234", "imo": "9381201", "vessel_type": "Crude Oil Tanker", "flag": "India (IN)", "nav_status": "Underway using Engine"},
            "cross_km": float(np.random.normal(0.2, 0.1)),
            "time_offset_h": float(np.random.normal(0.05, 0.05)),
            "heading": corridor + float(np.random.normal(1.0, 2.0)),
            "speed": float(np.random.uniform(12.0, 14.5))
        },
        # Archetype B: Moderately Close + Reasonable Timing
        {
            "meta": {"vessel": "MT Sagar Vihaan", "mmsi": "419002345", "imo": "9412034", "vessel_type": "Product Tanker", "flag": "India (IN)", "nav_status": "Underway using Engine"},
            "cross_km": float(np.random.normal(1.8, 0.3)),
            "time_offset_h": float(np.random.normal(1.2, 0.3)),
            "heading": corridor + float(np.random.normal(6.0, 4.0)),
            "speed": float(np.random.uniform(11.0, 13.0))
        },
        # Archetype C: Moderate Proximity + Weaker Trajectory
        {
            "meta": {"vessel": "MV Andaman Star", "mmsi": "419003456", "imo": "9298712", "vessel_type": "Bulk Carrier", "flag": "Singapore (SG)", "nav_status": "Underway using Engine"},
            "cross_km": float(np.random.normal(3.5, 0.5)),
            "time_offset_h": float(np.random.normal(2.5, 0.4)),
            "heading": corridor + float(np.random.normal(-15.0, 5.0)),
            "speed": float(np.random.uniform(12.5, 14.0))
        },
        # Archetype D: Farther + Poor Timing
        {
            "meta": {"vessel": "MT Coastal Endeavour", "mmsi": "419004567", "imo": "9510045", "vessel_type": "Chemical Tanker", "flag": "Marshall Islands (MH)", "nav_status": "Underway using Engine"},
            "cross_km": float(np.random.normal(5.8, 0.6)),
            "time_offset_h": float(np.random.normal(4.2, 0.5)),
            "heading": corridor + float(np.random.normal(25.0, 8.0)),
            "speed": float(np.random.uniform(9.5, 11.5))
        },
        # Archetype E: Farther + Incompatible Trajectory
        {
            "meta": {"vessel": "MV Bengal Navigator", "mmsi": "419005678", "imo": "9623190", "vessel_type": "Container Ship", "flag": "Panama (PA)", "nav_status": "Underway using Engine"},
            "cross_km": float(np.random.normal(8.5, 0.8)),
            "time_offset_h": float(np.random.normal(5.5, 0.6)),
            "heading": corridor + float(np.random.normal(70.0, 10.0)),
            "speed": float(np.random.uniform(15.0, 18.0))
        },
        # Archetype F: Irrelevant Route
        {
            "meta": {"vessel": "MT Godavari Trader", "mmsi": "419006789", "imo": "9187340", "vessel_type": "General Cargo", "flag": "Liberia (LR)", "nav_status": "Underway using Engine"},
            "cross_km": float(np.random.normal(12.5, 1.2)),
            "time_offset_h": float(np.random.normal(7.0, 0.8)),
            "heading": (corridor + 180.0) % 360.0 + float(np.random.normal(0, 15.0)),
            "speed": float(np.random.uniform(8.5, 10.5))
        }
    ]
    
    scored = []
    for cfg in vessels_configs:
        v_dict = generate_vessel_track(
            origin_lat, origin_lon, origin_time, corridor,
            cfg["cross_km"], cfg["time_offset_h"], cfg["heading"], cfg["speed"],
            cfg["meta"]
        )
        res = score_candidate_vessel(
            v_dict, origin_lat, origin_lon, origin_time, uncertainty_r, corridor
        )
        scored.append(res)
        
    scored.sort(key=lambda x: x["score"], reverse=True)
    print(f"--- RUN RESULTS (Seed={seed}) ---")
    for v in scored:
        print(f"  {v['score']:5.1f} / 100 [{v['association_label']:20s}] | CPA: {v['cpa']['distance_km']:5.2f} km | Offset: {v['cpa']['time_diff_hours']:4.1f}h | Heading: {v['heading_deg']:5.1f}° | Vessel: {v['vessel']}")

if __name__ == '__main__':
    for s in [42, 101, 777]:
        test_distribution(s)
