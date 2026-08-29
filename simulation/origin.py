import json
import numpy as np

# Load backward simulation
with open("../output/backward_trajectory.json", "r") as f:
    data = json.load(f)

lat = np.array(data["latitude"])
lon = np.array(data["longitude"])

# Last point = estimated position furthest backward in time
origin_lat = float(np.median(lat[:, -1]))
origin_lon = float(np.median(lon[:, -1]))

origin = {
    "spill_id": "DEMO001",
    "probable_origin": {
        "lat": origin_lat,
        "lon": origin_lon
    },
    "method": "Backward OpenDrift trajectory median",
    "particles_used": len(lat)
}

with open("../output/origin.json", "w") as f:
    json.dump(origin, f, indent=2)

print("==============================")
print("PROBABLE ORIGIN CALCULATED")
print("Latitude :", origin_lat)
print("Longitude:", origin_lon)
print("Particles:", len(lat))
print("Saved: origin.json")
print("==============================")