from flask import Flask, jsonify, render_template
from datetime import datetime
import math

app = Flask(__name__)

# Route endpoints provided by the student (Ballari, Karnataka).
# Point 1: bus stop near Srinivas Apartment, Kappagal Road, 9th Cross.
# Point 2: RYMEC college. Intermediate streets/stops can be added after verification.
STOPS = [
    {"name": "Bus Stop - Srinivas Apartment, Kappagal Road 9th Cross", "lat": 15.161849, "lng": 76.936448},
    {"name": "RYMEC College", "lat": 15.157586, "lng": 76.890161},
]

def interpolate(a, b, t):
    return {"lat": a["lat"] + (b["lat"] - a["lat"]) * t,
            "lng": a["lng"] + (b["lng"] - a["lng"]) * t}

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/api/bus")
def bus_data():
    # Simulated movement that loops through the route. No real GPS device is used.
    now = datetime.now()
    phase = (now.timestamp() / 25.0) % (len(STOPS) - 1)
    segment = int(phase)
    t = phase - segment
    pos = interpolate(STOPS[segment], STOPS[segment + 1], t)
    next_stop = STOPS[min(segment + 1, len(STOPS) - 1)]

    # Straight-line distance estimate; simple demo ETA at an assumed average speed.
    radius = 6371.0
    lat1, lat2 = math.radians(pos["lat"]), math.radians(next_stop["lat"])
    dlat = lat2 - lat1
    dlng = math.radians(next_stop["lng"] - pos["lng"])
    h = math.sin(dlat/2)**2 + math.cos(lat1)*math.cos(lat2)*math.sin(dlng/2)**2
    distance_km = 2 * radius * math.asin(min(1, math.sqrt(h)))
    eta_minutes = round((distance_km / 20.0) * 60)

    return jsonify({
        "bus_id": "BUS-01",
        "status": "Running (simulated)",
        "lat": pos["lat"],
        "lng": pos["lng"],
        "next_stop": next_stop["name"],
        "distance_km": round(distance_km, 2),
        "eta_minutes": eta_minutes,
        "updated_at": now.strftime("%H:%M:%S"),
        "simulation": True
    })

@app.route("/api/stops")
def stops_data():
    return jsonify(STOPS)

if __name__ == "__main__":
    app.run(debug=True)
