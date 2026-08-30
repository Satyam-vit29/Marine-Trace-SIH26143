from datetime import datetime, timedelta
from opendrift.models.openoil import OpenOil
import numpy as np
import json
import os

o = OpenOil(loglevel=20)

# Demo environmental conditions
o.set_config("environment:constant:x_sea_water_velocity", 0.2)
o.set_config("environment:constant:y_sea_water_velocity", 0.05)
o.set_config("environment:constant:x_wind", 3.0)
o.set_config("environment:constant:y_wind", 1.0)

# Detected spill
spill_lat = 18.5
spill_lon = 70.0
spill_time = datetime(2026, 8, 28, 18, 0, 0)

# Seed particles at detected spill
np.random.seed(42)

number_of_particles = 300

lon = spill_lon + np.random.normal(0, 0.005, number_of_particles)
lat = spill_lat + np.random.normal(0, 0.002, number_of_particles)

o.seed_elements(
    lon=lon,
    lat=lat,
    time=spill_time
)

# BACKWARD SIMULATION
o.run(
    duration=timedelta(hours=12),
    time_step=-600
)

# Save result
lat_data = o.result["lat"].values.tolist()
lon_data = o.result["lon"].values.tolist()

times = [str(t) for t in o.get_time_array()]

data = {
    "mode": "backward",
    "spill_location": {
        "lat": spill_lat,
        "lon": spill_lon
    },
    "spill_time": str(spill_time),
    "times": times,
    "latitude": lat_data,
    "longitude": lon_data
}

os.makedirs("../output", exist_ok=True)

with open("../output/backward_trajectory.json", "w") as f:
    json.dump(data, f, indent=2)

print("==============================")
print("BACKWARD SIMULATION COMPLETE")
print("Particles:", number_of_particles)
print("Duration: 12 hours")
print("Saved: backward_trajectory.json")
print("==============================")

o.plot()