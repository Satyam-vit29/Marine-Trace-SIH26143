import pandas as pd
import json
import os
from math import radians, sin, cos, sqrt, atan2

# --------------------------------
# PROBABLE ORIGIN
# --------------------------------

ORIGIN_LAT = 18.4686
ORIGIN_LON = 69.8812

SPILL_TIME = pd.Timestamp("2026-08-28 18:00:00")

# --------------------------------
# DEMO VESSELS
# --------------------------------

vessels = [
    {
        "name": "Vessel Alpha",
        "mmsi": "123456789",
        "start_lat": 18.36,
        "start_lon": 69.72,
        "end_lat": 18.49,
        "end_lon": 69.90,
    },
    {
        "name": "Vessel Bravo",
        "mmsi": "234567890",
        "start_lat": 18.30,
        "start_lon": 69.70,
        "end_lat": 18.43,
        "end_lon": 69.83,
    },
    {
        "name": "Vessel Charlie",
        "mmsi": "345678901",
        "start_lat": 18.20,
        "start_lon": 69.60,
        "end_lat": 18.35,
        "end_lon": 69.72,
    },
    {
        "name": "Vessel Delta",
        "mmsi": "456789012",
        "start_lat": 18.70,
        "start_lon": 69.55,
        "end_lat": 18.75,
        "end_lon": 69.60,
    },
    {
        "name": "Vessel Echo",
        "mmsi": "567890123",
        "start_lat": 18.10,
        "start_lon": 70.20,
        "end_lat": 18.15,
        "end_lon": 70.25,
    },
]

rows = []

# --------------------------------
# CREATE TRAJECTORIES
# --------------------------------

for vessel in vessels:

    steps = 13

    for i in range(steps):

        ratio = i / (steps - 1)

        lat = (
            vessel["start_lat"]
            + ratio
            * (
                vessel["end_lat"]
                - vessel["start_lat"]
            )
        )

        lon = (
            vessel["start_lon"]
            + ratio
            * (
                vessel["end_lon"]
                - vessel["start_lon"]
            )
        )

        timestamp = (
            SPILL_TIME
            - pd.Timedelta(hours=12)
            + pd.Timedelta(hours=i)
        )

        rows.append([
            vessel["mmsi"],
            vessel["name"],
            timestamp,
            lat,
            lon,
        ])

ais = pd.DataFrame(
    rows,
    columns=[
        "MMSI",
        "Vessel",
        "Timestamp",
        "Latitude",
        "Longitude",
    ],
)

# --------------------------------
# DISTANCE FUNCTION
# --------------------------------

def distance_km(lat1, lon1, lat2, lon2):

    R = 6371

    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)

    a = (
        sin(dlat / 2) ** 2
        + cos(radians(lat1))
        * cos(radians(lat2))
        * sin(dlon / 2) ** 2
    )

    return R * 2 * atan2(
        sqrt(a),
        sqrt(1 - a),
    )

# --------------------------------
# SCORE VESSELS
# --------------------------------

results = []

for vessel in vessels:

    track = ais[
        ais["Vessel"] == vessel["name"]
    ]

    min_distance = min(
        distance_km(
            row.Latitude,
            row.Longitude,
            ORIGIN_LAT,
            ORIGIN_LON,
        )
        for row in track.itertuples()
    )

    # Simple explainable prototype score
    score = max(
        0,
        100 - min_distance * 4
    )

    results.append({
        "vessel": vessel["name"],
        "mmsi": vessel["mmsi"],
        "minimum_distance_km": round(
            min_distance,
            2
        ),
        "association_score": round(
            score,
            1
        ),
    })

results.sort(
    key=lambda x: x["association_score"],
    reverse=True,
)

# --------------------------------
# SAVE
# --------------------------------

os.makedirs("../output", exist_ok=True)

ais.to_csv(
    "../output/ais_demo.csv",
    index=False,
)

with open(
    "../output/vessel_scores.json",
    "w"
) as f:

    json.dump(
        results,
        f,
        indent=2
    )

print("==========================")
print("AIS ANALYSIS COMPLETE")
print("==========================")

for vessel in results:

    print(
        vessel["vessel"],
        "→",
        vessel["association_score"],
        "%",
        "| Distance:",
        vessel["minimum_distance_km"],
        "km"
    )