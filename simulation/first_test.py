from datetime import datetime, timedelta
from opendrift.models.openoil import OpenOil
import numpy as np
import json
import os

# Create OpenOil simulation
o = OpenOil(loglevel=20)

# Simple demo ocean current
o.set_config("environment:constant:x_sea_water_velocity", 0.2)
o.set_config("environment:constant:y_sea_water_velocity", 0.05)

# Simple demo wind
o.set_config("environment:constant:x_wind", 3.0)
o.set_config("environment:constant:y_wind", 1.0)

# -----------------------------
# CREATE DEMO OIL SPILL
# -----------------------------

np.random.seed(42)

number_of_particles = 300

center_lon = 70.0
center_lat = 18.5

lon = center_lon + np.random.normal(0, 0.015, number_of_particles)
lat = center_lat + np.random.normal(0, 0.005, number_of_particles)

# Seed 300 oil particles
o.seed_elements(
    lon=lon,
    lat=lat,
    time=datetime(2026, 8, 28, 12, 0, 0)
)

# -----------------------------
# RUN FORWARD SIMULATION
# -----------------------------

o.run(
    duration=timedelta(hours=24),
    time_step=600
)

# -----------------------------
# SAVE TRAJECTORY DATA
# -----------------------------

times = [str(t) for t in o.get_time_array()]

lat_data = o.result["lat"].values
lon_data = o.result["lon"].values

# Convert NumPy arrays to normal Python lists
lat_data = lat_data.tolist()
lon_data = lon_data.tolist()

data = {
    "spill_id": "DEMO001",
    "particle_count": number_of_particles,
    "start_location": {
        "lat": center_lat,
        "lon": center_lon
    },
    "times": times,
    "latitude": lat_data,
    "longitude": lon_data
}

# Make sure output folder exists
os.makedirs("../output", exist_ok=True)

# Save JSON
with open("../output/trajectory.json", "w") as f:
    json.dump(data, f, indent=2)

print("===================================")
print(" OpenOil simulation completed")
print(" Particles:", number_of_particles)
print(" Simulation: 24 hours")
print(" Trajectory JSON created")
print("===================================")

# Show simulation plot
o.plot()