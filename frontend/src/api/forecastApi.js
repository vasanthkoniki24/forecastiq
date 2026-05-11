import api from "./axios";

export const trainForecast = async (payload) => {
  const response = await api.post("/api/forecasts/train", payload);
  return response.data;
};

export const predictForecast = async (payload) => {
  const response = await api.post("/api/forecasts/predict", payload);
  return response.data;
};

export const getForecastResults = async (predictionId) => {
  const response = await api.get(`/api/forecasts/${predictionId}/results`);
  return response.data;
};

export const createTrainingEventSource = (jobId, token) => {
  const baseUrl = import.meta.env.VITE_API_URL;
  return new EventSource(
    `${baseUrl}/api/forecasts/${jobId}/stream?token=${encodeURIComponent(token)}`
  );
};