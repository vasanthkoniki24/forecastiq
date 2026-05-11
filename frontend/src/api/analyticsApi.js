import api from "./axios";

export const getAnalyticsSummary = async () => {
  const response = await api.get("/api/analytics/summary");
  return response.data;
};

export const getMonthlySales = async () => {
  const response = await api.get("/api/analytics/monthly-sales");
  return response.data;
};

export const getTopProducts = async () => {
  const response = await api.get("/api/analytics/top-products");
  return response.data;
};

export const getAccuracyMetrics = async () => {
  const response = await api.get("/api/analytics/accuracy");
  return response.data;
};