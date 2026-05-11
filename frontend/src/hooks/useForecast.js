import { useQuery } from "@tanstack/react-query";
import { getForecastResults } from "../api/forecastApi";

export const useForecastResults = (predictionId) => {
  return useQuery({
    queryKey: ["forecast-results", predictionId],
    queryFn: () => getForecastResults(predictionId),
    enabled: Boolean(predictionId)
  });
};