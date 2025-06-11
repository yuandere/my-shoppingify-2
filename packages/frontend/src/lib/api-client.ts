console.log("[api-client.ts] Module loaded");
import axios from "axios";
import { toast } from "sonner";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
});

apiClient.interceptors.response.use(
  (response) => response, // Pass through successful responses
  (error) => {
    const { response } = error;
    if (response) {
      switch (response.status) {
        case 401:
          console.error("Unauthorized access - redirecting to login.");
          window.location.href = "/login";
          break;
        case 429:
          console.warn("Too many requests. Please try again later.");
          toast.warning("Too many requests. Please try again later.");
          break;
        default:
          console.error(`HTTP error ${response.status}: ${response.data}`);
          toast.error(`HTTP error ${response.status}: ${response.data}`);
      }
    } else if (error.request) {
      console.error("Network error or no response from server:", error.request);
      toast.warning("Network error. Please check your connection.");
    } else {
      console.error("Error setting up request:", error.message);
      toast.error("Error setting up request: " + error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
