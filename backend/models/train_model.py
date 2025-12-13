"""
AI-Driven Natural Disaster Risk Analysis
Message-Based Training using K-Means Clustering
Author: Your Name
"""

import requests
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

# -----------------------------
# CONFIGURATION
# -----------------------------

API_KEY = "933bc4201cb857eb6f56469e34f9b133"   # 🔑 Add your API key here
K_CLUSTERS = 4

# -----------------------------
# WEATHER DATA COLLECTION
# -----------------------------

def get_weather(city):
    """
    Fetch real-time weather data from OpenWeather API
    """
    url = (
        f"https://api.openweathermap.org/data/2.5/weather"
        f"?q={city}&appid={API_KEY}&units=metric"
    )

    response = requests.get(url)
    data = response.json()

    if response.status_code != 200:
        raise Exception(f"Error fetching weather for {city}")

    return {
        "temperature": data["main"]["temp"],
        "humidity": data["main"]["humidity"],
        "rainfall": data.get("rain", {}).get("1h", 0),
        "wind_speed": data["wind"]["speed"],
        "pressure": data["main"]["pressure"]
    }

# -----------------------------
# AI MODEL (K-MEANS)
# -----------------------------

class DisasterRiskModel:
    def __init__(self, k=4):
        self.scaler = StandardScaler()
        self.model = KMeans(n_clusters=k, random_state=42)
        self.trained = False

    def train(self, dataset):
        """
        Train K-Means model
        """
        scaled_data = self.scaler.fit_transform(dataset)
        self.model.fit(scaled_data)
        self.trained = True

    def predict(self, features):
        """
        Predict cluster for new weather data
        """
        scaled = self.scaler.transform([features])
        return self.model.predict(scaled)[0]

# -----------------------------
# RISK INTERPRETATION
# -----------------------------

def map_cluster_to_risk(cluster):
    """
    Interpret cluster into disaster risk
    """
    risk_map = {
        0: "LOW RISK",
        1: "HEATWAVE / FIRE RISK",
        2: "FLOOD RISK",
        3: "CYCLONE / STORM RISK"
    }
    return risk_map.get(cluster, "UNKNOWN RISK")

# -----------------------------
# MESSAGE-BASED TRAINING FLOW
# -----------------------------

def train_ai_from_cities(cities):
    """
    Simulates message-based training using weather data
    """
    weather_samples = []

    for city in cities:
        print(f"Collecting data for {city}...")
        weather = get_weather(city)
        weather_samples.append(weather)

    df = pd.DataFrame(weather_samples)
    return df

# -----------------------------
# MAIN EXECUTION
# -----------------------------

if __name__ == "__main__":

    # Training cities (historical learning)
    training_cities = [
        "Mumbai",
        "Delhi",
        "Chennai",
        "Kolkata",
        "Visakhapatnam",
        "Bangalore",
        "Hyderabad"
    ]

    print("\n🔹 Training AI Model using Weather Data...\n")

    dataset = train_ai_from_cities(training_cities)

    model = DisasterRiskModel(k=K_CLUSTERS)
    model.train(dataset)

    print("✅ Model Training Completed\n")

    # -----------------------------
    # USER SEARCH / REAL-TIME PREDICTION
    # -----------------------------

    search_city = input("Enter city name to analyze risk: ")

    user_weather = get_weather(search_city)

    feature_vector = list(user_weather.values())
    cluster_id = model.predict(feature_vector)
    risk = map_cluster_to_risk(cluster_id)

    # -----------------------------
    # OUTPUT
    # -----------------------------

    print("\n📊 AI Risk Analysis Result")
    print("----------------------------")
    print(f"City: {search_city}")
    print(f"Weather Data: {user_weather}")
    print(f"Cluster ID: {cluster_id}")
    print(f"Predicted Risk Level: {risk}")
