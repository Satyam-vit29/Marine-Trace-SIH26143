import pandas as pd
import json

# Load AIS data
ais = pd.read_csv("../output/ais_demo.csv")

# Load vessel scores
with open("../output/vessel_scores.json", "r") as f:
    scores = json.load(f)

vessels = []

for score in scores:

    name = score["vessel"]

    track = ais[ais["Vessel"] == name]

    points = []

    for row in track.itertuples():

        points.append({
            "lat": float(row.Latitude),
            "lon": float(row.Longitude),
            "time": str(row.Timestamp)
        })

    vessels.append({
        "vessel": name,
        "mmsi": score["mmsi"],
        "score": score["association_score"],
        "distance_km": score["minimum_distance_km"],
        "track": points
    })

data = {
    "origin": {
        "lat": 18.4686,
        "lon": 69.8812
    },
    "vessels": vessels
}

with open("../output/ais_web.json", "w") as f:
    json.dump(data, f, indent=2)

print("==============================")
print("AIS WEB DATA CREATED")
print("==============================")
print("Vessels:", len(vessels))
print("Saved: ais_web.json")