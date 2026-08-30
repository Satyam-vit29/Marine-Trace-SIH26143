import json
import math
import os
import numpy as np

def generate_cases():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    public_dir = os.path.join(base_dir, 'website', 'public')
    data_dir = os.path.join(public_dir, 'data')
    
    case_a_dir = os.path.join(data_dir, 'case_a')
    case_b_dir = os.path.join(data_dir, 'case_b')
    os.makedirs(case_a_dir, exist_ok=True)
    os.makedirs(case_b_dir, exist_ok=True)

    print("Generating Case A (Bay of Bengal) & Case B (Arabian Sea) datasets...")

    # ----------------------------------------------------
    # Helper to generate Lagrangian particle trajectories
    # ----------------------------------------------------
    def create_particles(start_lat, start_lon, u_drift_ms, v_drift_ms, n_particles=300, n_steps=145, dt_seconds=600, reverse=False):
        # 1 deg lat ~ 111,000 m; 1 deg lon ~ 111,000 * cos(lat)
        deg_lat_m = 111000.0
        deg_lon_m = 111000.0 * math.cos(math.radians(start_lat))
        
        # Initial dispersion radius ~ 800m
        np.random.seed(42 if not reverse else 101)
        r_init = np.random.normal(0, 800, n_particles)
        theta_init = np.random.uniform(0, 2*math.pi, n_particles)
        
        init_dlat = (r_init * np.sin(theta_init)) / deg_lat_m
        init_dlon = (r_init * np.cos(theta_init)) / deg_lon_m
        
        lat_arr = np.zeros((n_particles, n_steps))
        lon_arr = np.zeros((n_particles, n_steps))
        
        for p in range(n_particles):
            lat_arr[p, 0] = start_lat + init_dlat[p]
            lon_arr[p, 0] = start_lon + init_dlon[p]
            
        direction_mult = -1.0 if reverse else 1.0
        
        for t in range(1, n_steps):
            # random walk diffusion
            diff_m = np.random.normal(0, 35, n_particles)
            diff_theta = np.random.uniform(0, 2*math.pi, n_particles)
            diff_dlat = (diff_m * np.sin(diff_theta)) / deg_lat_m
            diff_dlon = (diff_m * np.cos(diff_theta)) / deg_lon_m
            
            step_dlat = (direction_mult * v_drift_ms * dt_seconds) / deg_lat_m
            step_dlon = (direction_mult * u_drift_ms * dt_seconds) / deg_lon_m
            
            lat_arr[:, t] = lat_arr[:, t-1] + step_dlat + diff_dlat
            lon_arr[:, t] = lon_arr[:, t-1] + step_dlon + diff_dlon

        return {
            "start_location": {"lat": start_lat, "lon": start_lon},
            "particle_count": n_particles,
            "timesteps": n_steps,
            "step_duration_seconds": dt_seconds,
            "latitude": lat_arr.tolist(),
            "longitude": lon_arr.tolist()
        }

    # ====================================================
    # 1. CASE A — BAY OF BENGAL (East India Coast)
    # ====================================================
    # Spill at 16.50°N, 82.80°E
    # Current: 0.28 m/s @ 038° NE (u: +0.172, v: +0.221)
    # Wind: 4.12 m/s @ 042.5° NE (u10: +2.780, v10: +3.040)
    # V_drift: 0.40 m/s @ 040.8° NE (u_drift: +0.255, v_drift: +0.312)
    bob_lat = 16.5000
    bob_lon = 82.8000
    bob_u_drift = 0.255
    bob_v_drift = 0.312

    # Forward Forecast (+24h)
    bob_forward = create_particles(bob_lat, bob_lon, bob_u_drift, bob_v_drift, n_particles=300, n_steps=145, dt_seconds=600, reverse=False)
    with open(os.path.join(case_a_dir, 'trajectory.json'), 'w') as f:
        json.dump(bob_forward, f)

    # Backward Hindcast (-12h, 73 steps)
    bob_backward = create_particles(bob_lat, bob_lon, bob_u_drift, bob_v_drift, n_particles=300, n_steps=73, dt_seconds=600, reverse=True)
    with open(os.path.join(case_a_dir, 'backward_trajectory.json'), 'w') as f:
        json.dump(bob_backward, f)

    # Median origin
    bob_orig_lat = float(np.median(bob_backward["latitude"], axis=0)[-1])
    bob_orig_lon = float(np.median(bob_backward["longitude"], axis=0)[-1])

    bob_origin_data = {
        "spill_id": "DEMO-BOB-001",
        "case_id": "CASE_A",
        "region_name": "Bay of Bengal (Eastern Coastline)",
        "probable_origin": {
            "lat": bob_orig_lat,
            "lon": bob_orig_lon
        },
        "method": "Backward OpenDrift Lagrangian spatial median cluster",
        "particles_used": 300,
        "uncertainty_radius_km": 2.80,
        "estimated_release_time": "2026-08-28 02:30:00 UTC",
        "hindcast_duration_hours": 12.0
    }
    with open(os.path.join(case_a_dir, 'origin.json'), 'w') as f:
        json.dump(bob_origin_data, f, indent=2)

    # Environmental data for Bay of Bengal
    bob_env_data = {
        "incident_id": "DEMO-BOB-001",
        "case_id": "CASE_A",
        "region": "Bay of Bengal (Offshore Kakinada / Godavari)",
        "timestamp": "2026-08-28 14:30:00 UTC",
        "atmospheric_forcing": {
            "source": "Copernicus CDS ERA5 Hourly Single Levels",
            "grid_resolution": "0.25° x 0.25° Global Reanalysis",
            "speed_mean_ms": 4.12,
            "speed_knots": 8.01,
            "direction_deg": 42.5,
            "cardinal_direction": "NE",
            "u10_mean_ms": 2.78,
            "v10_mean_ms": 3.04
        },
        "hydrodynamic_forcing": {
            "source": "Copernicus Marine Service (CMEMS) Global Ocean Analysis",
            "grid_resolution": "0.083° x 0.083° (~9 km resolution)",
            "speed_mean_ms": 0.28,
            "speed_knots": 0.54,
            "direction_deg": 38.0,
            "cardinal_direction": "NE",
            "u_mean_ms": 0.172,
            "v_mean_ms": 0.221
        },
        "drift_coupling": {
            "formula": "V_drift = U_current + 0.03 * U_wind",
            "net_drift_speed_ms": 0.40,
            "net_drift_knots": 0.78,
            "net_drift_bearing_deg": 40.8,
            "net_cardinal": "NE"
        }
    }
    with open(os.path.join(case_a_dir, 'environmental_forcing.json'), 'w') as f:
        json.dump(bob_env_data, f, indent=2)

    # Satellite detection for Bay of Bengal
    bob_sat_data = {
        "incident_id": "DEMO-BOB-001",
        "case_id": "CASE_A",
        "satellite_metadata": {
            "satellite_sensor": "Sentinel-1A C-SAR",
            "acquisition_time": "2026-08-28 14:30:00 UTC",
            "polarization": "VV + VH (Dual-Pol)",
            "beam_mode": "IW Mode",
            "pixel_spacing": "10 m x 10 m",
            "incidence_angle_deg": 36.2,
            "orbit_pass": "Descending (Relative Orbit 098)",
            "backscatter_damping_db": -4.9,
            "detection_confidence": 0.95,
            "confidence_label": "HIGH CONFIDENCE (AUTOMATED SAR DETECTION)"
        },
        "sar_image_overlay": {
            "url": "/sentinel1_sar_scene.png",
            "bounds": [[16.35, 82.60], [16.65, 83.00]],
            "center": [16.50, 82.80],
            "description": "Demonstration Sentinel-1 C-SAR Grayscale Radar Scene",
            "format": "Grayscale Radar Backscatter (σ₀)"
        },
        "slick_characterization": {
            "centroid": {"lat": 16.5000, "lon": 82.8000},
            "area_km2": 12.45,
            "perimeter_km": 15.20,
            "length_major_axis_km": 6.80,
            "width_minor_axis_km": 2.35,
            "orientation_deg": 45.0,
            "estimated_age_hours": 6.5,
            "bounding_box": {
                "min_lat": 16.485,
                "max_lat": 16.515,
                "min_lon": 82.765,
                "max_lon": 82.835
            },
            "polygon_outline": [
                [16.525, 82.815],
                [16.518, 82.832],
                [16.495, 82.828],
                [16.475, 82.785],
                [16.482, 82.768],
                [16.505, 82.775],
                [16.525, 82.815]
            ]
        }
    }
    with open(os.path.join(case_a_dir, 'satellite_detection.json'), 'w') as f:
        json.dump(bob_sat_data, f, indent=2)

    # AIS candidate vessels for Case A (Bay of Bengal)
    # Specified list: MV Konkan Pride, MT Sagar Vihaan, MV Andaman Star, MT Coastal Endeavour, MV Bengal Navigator, MT Godavari Trader
    bob_ais_vessels = [
        {
            "vessel": "MV Konkan Pride",
            "mmsi": "419001234",
            "imo": "9381201",
            "score": 95.8,
            "distance_km": 1.12,
            "cpa": {"lat": 16.383, "lon": 82.620, "time": "2026-08-28 12:30:00"},
            "vessel_type": "Crude Oil Tanker",
            "flag": "India (IN)",
            "length_m": 274,
            "beam_m": 48,
            "avg_speed_knots": 12.6,
            "heading_deg": 42,
            "nav_status": "Underway using Engine",
            "criteria_breakdown": {
                "spatial_proximity_pass": True,
                "temporal_overlap_pass": True,
                "corridor_alignment_pass": True,
                "explanation": "Passed within 1.12 km of probable origin corridor at 2026-08-28 12:30:00 UTC. Trajectory heading aligns with Godavari coastal fairway."
            },
            "track": [
                {"lat": 16.20, "lon": 82.40, "time": "2026-08-28 02:30:00"},
                {"lat": 16.24, "lon": 82.44, "time": "2026-08-28 04:30:00"},
                {"lat": 16.28, "lon": 82.49, "time": "2026-08-28 06:30:00"},
                {"lat": 16.32, "lon": 82.54, "time": "2026-08-28 08:30:00"},
                {"lat": 16.35, "lon": 82.58, "time": "2026-08-28 10:30:00"},
                {"lat": 16.383, "lon": 82.620, "time": "2026-08-28 12:30:00"},
                {"lat": 16.42, "lon": 82.67, "time": "2026-08-28 14:30:00"}
            ]
        },
        {
            "vessel": "MT Sagar Vihaan",
            "mmsi": "419002345",
            "imo": "9412034",
            "score": 76.4,
            "distance_km": 5.90,
            "cpa": {"lat": 16.425, "lon": 82.645, "time": "2026-08-28 10:45:00"},
            "vessel_type": "Product Tanker",
            "flag": "India (IN)",
            "length_m": 183,
            "beam_m": 32,
            "avg_speed_knots": 11.2,
            "heading_deg": 46,
            "nav_status": "Underway using Engine",
            "criteria_breakdown": {
                "spatial_proximity_pass": True,
                "temporal_overlap_pass": True,
                "corridor_alignment_pass": True,
                "explanation": "Traversed within 5.90 km of the hindcast origin during early morning temporal window."
            },
            "track": [
                {"lat": 16.25, "lon": 82.42, "time": "2026-08-28 02:30:00"},
                {"lat": 16.31, "lon": 82.50, "time": "2026-08-28 05:30:00"},
                {"lat": 16.37, "lon": 82.58, "time": "2026-08-28 08:30:00"},
                {"lat": 16.425, "lon": 82.645, "time": "2026-08-28 10:45:00"},
                {"lat": 16.48, "lon": 82.72, "time": "2026-08-28 14:30:00"}
            ]
        },
        {
            "vessel": "MV Andaman Star",
            "mmsi": "419003456",
            "imo": "9298712",
            "score": 54.2,
            "distance_km": 11.45,
            "cpa": {"lat": 16.460, "lon": 82.685, "time": "2026-08-28 08:15:00"},
            "vessel_type": "Bulk Carrier",
            "flag": "Singapore (SG)",
            "length_m": 225,
            "beam_m": 32,
            "avg_speed_knots": 13.1,
            "heading_deg": 38,
            "nav_status": "Underway using Engine",
            "criteria_breakdown": {
                "spatial_proximity_pass": True,
                "temporal_overlap_pass": True,
                "corridor_alignment_pass": False,
                "explanation": "Crossed outer perimeter of the 12h spatial bounding box (11.45 km CPA)."
            },
            "track": [
                {"lat": 16.30, "lon": 82.48, "time": "2026-08-28 02:30:00"},
                {"lat": 16.38, "lon": 82.58, "time": "2026-08-28 05:30:00"},
                {"lat": 16.460, "lon": 82.685, "time": "2026-08-28 08:15:00"},
                {"lat": 16.54, "lon": 82.79, "time": "2026-08-28 12:00:00"}
            ]
        },
        {
            "vessel": "MT Coastal Endeavour",
            "mmsi": "419004567",
            "imo": "9510045",
            "score": 38.7,
            "distance_km": 15.32,
            "cpa": {"lat": 16.485, "lon": 82.715, "time": "2026-08-28 06:00:00"},
            "vessel_type": "Chemical Tanker",
            "flag": "Marshall Islands (MH)",
            "length_m": 144,
            "beam_m": 23,
            "avg_speed_knots": 10.5,
            "heading_deg": 44,
            "nav_status": "Underway using Engine",
            "criteria_breakdown": {
                "spatial_proximity_pass": False,
                "temporal_overlap_pass": True,
                "corridor_alignment_pass": False,
                "explanation": "Peripheral transit with CPA exceeding 15 km from computed plume origin."
            },
            "track": [
                {"lat": 16.35, "lon": 82.55, "time": "2026-08-28 02:30:00"},
                {"lat": 16.485, "lon": 82.715, "time": "2026-08-28 06:00:00"},
                {"lat": 16.58, "lon": 82.84, "time": "2026-08-28 11:30:00"}
            ]
        },
        {
            "vessel": "MV Bengal Navigator",
            "mmsi": "419005678",
            "imo": "9623190",
            "score": 24.1,
            "distance_km": 18.98,
            "cpa": {"lat": 16.510, "lon": 82.745, "time": "2026-08-28 04:30:00"},
            "vessel_type": "Container Ship",
            "flag": "Panama (PA)",
            "length_m": 260,
            "beam_m": 32,
            "avg_speed_knots": 16.4,
            "heading_deg": 40,
            "nav_status": "Underway using Engine",
            "criteria_breakdown": {
                "spatial_proximity_pass": False,
                "temporal_overlap_pass": False,
                "corridor_alignment_pass": False,
                "explanation": "Fast deep-water offshore container transit with low origin proximity."
            },
            "track": [
                {"lat": 16.38, "lon": 82.58, "time": "2026-08-28 02:30:00"},
                {"lat": 16.510, "lon": 82.745, "time": "2026-08-28 04:30:00"},
                {"lat": 16.65, "lon": 82.92, "time": "2026-08-28 08:30:00"}
            ]
        },
        {
            "vessel": "MT Godavari Trader",
            "mmsi": "419006789",
            "imo": "9187340",
            "score": 12.5,
            "distance_km": 21.88,
            "cpa": {"lat": 16.530, "lon": 82.770, "time": "2026-08-28 03:00:00"},
            "vessel_type": "General Cargo",
            "flag": "Liberia (LR)",
            "length_m": 120,
            "beam_m": 18,
            "avg_speed_knots": 9.8,
            "heading_deg": 50,
            "nav_status": "Underway using Engine",
            "criteria_breakdown": {
                "spatial_proximity_pass": False,
                "temporal_overlap_pass": False,
                "corridor_alignment_pass": False,
                "explanation": "Distal boundary cargo transit with minimal correlation."
            },
            "track": [
                {"lat": 16.42, "lon": 82.63, "time": "2026-08-28 02:30:00"},
                {"lat": 16.530, "lon": 82.770, "time": "2026-08-28 03:00:00"},
                {"lat": 16.68, "lon": 82.96, "time": "2026-08-28 07:30:00"}
            ]
        }
    ]

    bob_ais_data = {
        "incident_id": "DEMO-BOB-001",
        "case_id": "CASE_A",
        "region": "Bay of Bengal",
        "filter_funnel": {
            "total_regional_transponders_logged": 142,
            "after_spatial_bounding_box_filter": 28,
            "after_temporal_hindcast_window_filter": 9,
            "high_relevance_candidates_scored": 6
        },
        "origin": {
            "lat": bob_orig_lat,
            "lon": bob_orig_lon
        },
        "vessels": bob_ais_vessels
    }
    with open(os.path.join(case_a_dir, 'ais_web.json'), 'w') as f:
        json.dump(bob_ais_data, f, indent=2)

    # ====================================================
    # 2. CASE B — ARABIAN SEA (West India Coast)
    # ====================================================
    # Spill at 18.50°N, 70.00°E
    # Current: 0.21 m/s @ 076.1° ENE (u: +0.208, v: +0.051)
    # Wind: 3.29 m/s @ 071.8° ENE (u10: +3.120, v10: +1.028)
    # V_drift: 0.31 m/s @ 074.7° ENE (u_drift: +0.301, v_drift: +0.082)
    as_lat = 18.5000
    as_lon = 70.0000
    as_u_drift = 0.301
    as_v_drift = 0.082

    # Forward Forecast (+24h)
    as_forward = create_particles(as_lat, as_lon, as_u_drift, as_v_drift, n_particles=300, n_steps=145, dt_seconds=600, reverse=False)
    with open(os.path.join(case_b_dir, 'trajectory.json'), 'w') as f:
        json.dump(as_forward, f)

    # Backward Hindcast (-12h, 73 steps)
    as_backward = create_particles(as_lat, as_lon, as_u_drift, as_v_drift, n_particles=300, n_steps=73, dt_seconds=600, reverse=True)
    with open(os.path.join(case_b_dir, 'backward_trajectory.json'), 'w') as f:
        json.dump(as_backward, f)

    # Median origin
    as_orig_lat = float(np.median(as_backward["latitude"], axis=0)[-1])
    as_orig_lon = float(np.median(as_backward["longitude"], axis=0)[-1])

    as_origin_data = {
        "spill_id": "DEMO-AS-002",
        "case_id": "CASE_B",
        "region_name": "Arabian Sea (Western Coastline)",
        "probable_origin": {
            "lat": as_orig_lat,
            "lon": as_orig_lon
        },
        "method": "Backward OpenDrift Lagrangian spatial median cluster",
        "particles_used": 300,
        "uncertainty_radius_km": 2.80,
        "estimated_release_time": "2026-08-28 06:00:00 UTC",
        "hindcast_duration_hours": 12.0
    }
    with open(os.path.join(case_b_dir, 'origin.json'), 'w') as f:
        json.dump(as_origin_data, f, indent=2)

    # Environmental data for Arabian Sea
    as_env_data = {
        "incident_id": "DEMO-AS-002",
        "case_id": "CASE_B",
        "region": "Arabian Sea (Offshore Mumbai / Konkan)",
        "timestamp": "2026-08-28 18:00:00 UTC",
        "atmospheric_forcing": {
            "source": "Copernicus CDS ERA5 Hourly Single Levels",
            "grid_resolution": "0.25° x 0.25° Global Reanalysis",
            "speed_mean_ms": 3.29,
            "speed_knots": 6.40,
            "direction_deg": 71.8,
            "cardinal_direction": "ENE",
            "u10_mean_ms": 3.12,
            "v10_mean_ms": 1.03
        },
        "hydrodynamic_forcing": {
            "source": "Copernicus Marine Service (CMEMS) Global Ocean Analysis",
            "grid_resolution": "0.083° x 0.083° (~9 km resolution)",
            "speed_mean_ms": 0.21,
            "speed_knots": 0.41,
            "direction_deg": 76.1,
            "cardinal_direction": "ENE",
            "u_mean_ms": 0.208,
            "v_mean_ms": 0.051
        },
        "drift_coupling": {
            "formula": "V_drift = U_current + 0.03 * U_wind",
            "net_drift_speed_ms": 0.31,
            "net_drift_knots": 0.60,
            "net_drift_bearing_deg": 74.7,
            "net_cardinal": "ENE"
        }
    }
    with open(os.path.join(case_b_dir, 'environmental_forcing.json'), 'w') as f:
        json.dump(as_env_data, f, indent=2)

    # Satellite detection for Arabian Sea
    as_sat_data = {
        "incident_id": "DEMO-AS-002",
        "case_id": "CASE_B",
        "satellite_metadata": {
            "satellite_sensor": "Sentinel-1A C-SAR",
            "acquisition_time": "2026-08-28 18:00:00 UTC",
            "polarization": "VV + VH (Dual-Pol)",
            "beam_mode": "IW Mode",
            "pixel_spacing": "10 m x 10 m",
            "incidence_angle_deg": 34.6,
            "orbit_pass": "Descending (Relative Orbit 142)",
            "backscatter_damping_db": -4.8,
            "detection_confidence": 0.94,
            "confidence_label": "HIGH CONFIDENCE (AUTOMATED SAR DETECTION)"
        },
        "sar_image_overlay": {
            "url": "/sentinel1_sar_scene.png",
            "bounds": [[18.35, 69.80], [18.65, 70.20]],
            "center": [18.50, 70.00],
            "description": "Demonstration Sentinel-1 C-SAR Grayscale Radar Scene",
            "format": "Grayscale Radar Backscatter (σ₀)"
        },
        "slick_characterization": {
            "centroid": {"lat": 18.499893, "lon": 69.999917},
            "area_km2": 10.38,
            "perimeter_km": 13.91,
            "length_major_axis_km": 6.22,
            "width_minor_axis_km": 2.12,
            "orientation_deg": 90.8,
            "estimated_age_hours": 6.0,
            "bounding_box": {
                "min_lat": 18.487,
                "max_lat": 18.515,
                "min_lon": 69.951,
                "max_lon": 70.058
            },
            "polygon_outline": [
                [18.524, 69.999],
                [18.520, 70.035],
                [18.498, 70.045],
                [18.476, 70.010],
                [18.480, 69.965],
                [18.505, 69.960],
                [18.524, 69.999]
            ]
        }
    }
    with open(os.path.join(case_b_dir, 'satellite_detection.json'), 'w') as f:
        json.dump(as_sat_data, f, indent=2)

    # AIS candidate vessels for Case B (Arabian Sea)
    # Specified list: MT Ratnagiri Voyager, MV Konkan Sentinel, MT Gujarat Mariner, MV Arabian Crest, MT Saurashtra Pearl, MV Deccan Voyager
    as_ais_vessels = [
        {
            "vessel": "MT Ratnagiri Voyager",
            "mmsi": "419011122",
            "imo": "9345678",
            "score": 95.3,
            "distance_km": 1.18,
            "cpa": {"lat": 18.468, "lon": 69.870, "time": "2026-08-28 16:00:00"},
            "vessel_type": "Crude Oil Tanker",
            "flag": "India (IN)",
            "length_m": 274,
            "beam_m": 48,
            "avg_speed_knots": 12.4,
            "heading_deg": 48,
            "nav_status": "Underway using Engine",
            "criteria_breakdown": {
                "spatial_proximity_pass": True,
                "temporal_overlap_pass": True,
                "corridor_alignment_pass": True,
                "explanation": "Passed within 1.18 km of probable origin at 2026-08-28 16:00:00 UTC. Heading aligns with backward dispersion plume corridor."
            },
            "track": [
                {"lat": 18.36, "lon": 69.72, "time": "2026-08-28 06:00:00"},
                {"lat": 18.39, "lon": 69.76, "time": "2026-08-28 09:00:00"},
                {"lat": 18.42, "lon": 69.81, "time": "2026-08-28 12:00:00"},
                {"lat": 18.468, "lon": 69.870, "time": "2026-08-28 16:00:00"},
                {"lat": 18.49, "lon": 69.90, "time": "2026-08-28 18:00:00"}
            ]
        },
        {
            "vessel": "MV Konkan Sentinel",
            "mmsi": "419012233",
            "imo": "9456789",
            "score": 72.4,
            "distance_km": 6.90,
            "cpa": {"lat": 18.442, "lon": 69.810, "time": "2026-08-28 14:30:00"},
            "vessel_type": "Product Tanker",
            "flag": "India (IN)",
            "length_m": 180,
            "beam_m": 32,
            "avg_speed_knots": 11.8,
            "heading_deg": 45,
            "nav_status": "Underway using Engine",
            "criteria_breakdown": {
                "spatial_proximity_pass": True,
                "temporal_overlap_pass": True,
                "corridor_alignment_pass": True,
                "explanation": "Traversed within 6.90 km of origin with matching temporal window."
            },
            "track": [
                {"lat": 18.30, "lon": 69.60, "time": "2026-08-28 06:00:00"},
                {"lat": 18.37, "lon": 69.70, "time": "2026-08-28 10:00:00"},
                {"lat": 18.442, "lon": 69.810, "time": "2026-08-28 14:30:00"},
                {"lat": 18.50, "lon": 69.90, "time": "2026-08-28 18:00:00"}
            ]
        },
        {
            "vessel": "MT Gujarat Mariner",
            "mmsi": "419013344",
            "imo": "9234567",
            "score": 48.2,
            "distance_km": 12.95,
            "cpa": {"lat": 18.410, "lon": 69.760, "time": "2026-08-28 12:00:00"},
            "vessel_type": "Chemical Tanker",
            "flag": "Singapore (SG)",
            "length_m": 160,
            "beam_m": 26,
            "avg_speed_knots": 13.5,
            "heading_deg": 52,
            "nav_status": "Underway using Engine",
            "criteria_breakdown": {
                "spatial_proximity_pass": True,
                "temporal_overlap_pass": True,
                "corridor_alignment_pass": False,
                "explanation": "Moderate distance to origin; parallel transit along outer corridor."
            },
            "track": [
                {"lat": 18.25, "lon": 69.52, "time": "2026-08-28 06:00:00"},
                {"lat": 18.410, "lon": 69.760, "time": "2026-08-28 12:00:00"},
                {"lat": 18.52, "lon": 69.92, "time": "2026-08-28 16:30:00"}
            ]
        },
        {
            "vessel": "MV Arabian Crest",
            "mmsi": "419014455",
            "imo": "9567890",
            "score": 32.8,
            "distance_km": 16.80,
            "cpa": {"lat": 18.380, "lon": 69.710, "time": "2026-08-28 09:30:00"},
            "vessel_type": "Bulk Carrier",
            "flag": "Marshall Islands (MH)",
            "length_m": 225,
            "beam_m": 32,
            "avg_speed_knots": 12.0,
            "heading_deg": 40,
            "nav_status": "Underway using Engine",
            "criteria_breakdown": {
                "spatial_proximity_pass": False,
                "temporal_overlap_pass": True,
                "corridor_alignment_pass": False,
                "explanation": "Outer boundary crossing; limited temporal convergence."
            },
            "track": [
                {"lat": 18.30, "lon": 69.58, "time": "2026-08-28 06:00:00"},
                {"lat": 18.380, "lon": 69.710, "time": "2026-08-28 09:30:00"},
                {"lat": 18.54, "lon": 69.95, "time": "2026-08-28 15:00:00"}
            ]
        },
        {
            "vessel": "MT Saurashtra Pearl",
            "mmsi": "419015566",
            "imo": "9678901",
            "score": 21.5,
            "distance_km": 19.62,
            "cpa": {"lat": 18.350, "lon": 69.660, "time": "2026-08-28 07:45:00"},
            "vessel_type": "Container Ship",
            "flag": "Panama (PA)",
            "length_m": 294,
            "beam_m": 32,
            "avg_speed_knots": 17.2,
            "heading_deg": 42,
            "nav_status": "Underway using Engine",
            "criteria_breakdown": {
                "spatial_proximity_pass": False,
                "temporal_overlap_pass": False,
                "corridor_alignment_pass": False,
                "explanation": "High-speed container transit on western traffic separation scheme."
            },
            "track": [
                {"lat": 18.28, "lon": 69.55, "time": "2026-08-28 06:00:00"},
                {"lat": 18.350, "lon": 69.660, "time": "2026-08-28 07:45:00"},
                {"lat": 18.58, "lon": 70.02, "time": "2026-08-28 12:30:00"}
            ]
        },
        {
            "vessel": "MV Deccan Voyager",
            "mmsi": "419016677",
            "imo": "9123456",
            "score": 11.0,
            "distance_km": 22.25,
            "cpa": {"lat": 18.330, "lon": 69.630, "time": "2026-08-28 06:15:00"},
            "vessel_type": "General Cargo",
            "flag": "Liberia (LR)",
            "length_m": 118,
            "beam_m": 18,
            "avg_speed_knots": 9.5,
            "heading_deg": 55,
            "nav_status": "Underway using Engine",
            "criteria_breakdown": {
                "spatial_proximity_pass": False,
                "temporal_overlap_pass": False,
                "corridor_alignment_pass": False,
                "explanation": "Distal peripheral track; minimal association with computed origin."
            },
            "track": [
                {"lat": 18.330, "lon": 69.630, "time": "2026-08-28 06:15:00"},
                {"lat": 18.45, "lon": 69.80, "time": "2026-08-28 11:00:00"},
                {"lat": 18.55, "lon": 69.95, "time": "2026-08-28 16:00:00"}
            ]
        }
    ]

    as_ais_data = {
        "incident_id": "DEMO-AS-002",
        "case_id": "CASE_B",
        "region": "Arabian Sea",
        "filter_funnel": {
            "total_regional_transponders_logged": 127,
            "after_spatial_bounding_box_filter": 23,
            "after_temporal_hindcast_window_filter": 8,
            "high_relevance_candidates_scored": 6
        },
        "origin": {
            "lat": as_orig_lat,
            "lon": as_orig_lon
        },
        "vessels": as_ais_vessels
    }
    with open(os.path.join(case_b_dir, 'ais_web.json'), 'w') as f:
        json.dump(as_ais_data, f, indent=2)

    print("Case A & Case B datasets generated successfully in website/public/data/")

if __name__ == '__main__':
    generate_cases()
