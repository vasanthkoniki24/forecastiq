import { useQuery } from "@tanstack/react-query";
import { getDatasets } from "../api/datasetApi";

export const useDatasets = () => {
  return useQuery({
    queryKey: ["datasets"],
    queryFn: getDatasets
  });
};