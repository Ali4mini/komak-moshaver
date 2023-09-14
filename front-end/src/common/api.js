import axios from "axios";
// Removed useNavigate as it was not used

const apiUrl = import.meta.env.VITE_API;

const api = axios.create({
  baseURL: apiUrl,
  headers: {
    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    "Content-type": "application/json",
  },
});

// function to handle request with updated token
const retryRequest = (originalRequest, newToken) => {
  originalRequest.headers.Authorization = `Bearer ${newToken}`
  return api(originalRequest);
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response) {
      if (error.response.status === 401) {
        const refreshToken = localStorage.getItem("refresh_token");

        try {
          const response = await api.post(`${apiUrl}token/refresh/`, {
            refresh: refreshToken,
          });
          localStorage.setItem("access_token", response.data.access);
          return retryRequest(originalRequest, response.data.access);
        } catch (refreshError) {
          console.error("Failed to refresh JWT:", refreshError);
          if (refreshError.response.status === 401) {
            console.log("refresh token was expired");
              // You should guide user to login again, this could be as simple as redirecting to login page
            // window.location.href = '/login';
            // Or use history/navigate from your route library to navigate to login page
            history.push('/login');
            
          }
          throw refreshError;
        }
      } else {
        console.error('Error Status:', error.response.status);
      }
    } else {
      console.error('Error Message:', error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
