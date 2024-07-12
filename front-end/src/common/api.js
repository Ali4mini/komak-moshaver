import axios from "axios";
// Removed useNavigate as it was not used

const apiUrl = import.meta.env.VITE_API;
console.log(apiUrl)
// const apiUrl = "http://192.168.43.49:8000/"
let accessToken = localStorage.getItem("access_token")
console.log(accessToken)
const api = axios.create({
  baseURL: apiUrl,
  headers: {
    "Authorization": `Bearer ${accessToken}`,
    "Content-type": "application/json",
  },
});

// function to handle request with updated token
const retryRequest = (originalRequest, maxAttempts = 3, attemptCount = 0) => {
	  const retryDelay = attemptCount * 1000; // Delay between retries in milliseconds
	  return new Promise((resolve, reject) => {
		      setTimeout(() => {
			            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
			            api(originalRequest).then(resolve, reject);
			          }, retryDelay);
		    }).catch(reject => {
			        if (attemptCount < maxAttempts - 1) {
					            resolve(retryRequest(originalRequest, maxAttempts, attemptCount + 1));
					    } else {
						          reject(new Error(`Max retry attempts reached for request ${originalRequest.url}`));
						        }
			      });
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
	  accessToken = response.data.access;
          return retryRequest(originalRequest);
        } catch (refreshError) {
          console.error("Failed to refresh JWT:", refreshError);
          if (refreshError.response.status === 401) {
            console.log("refresh token was expired");
            // You should guide user to login again, this could be as simple as redirecting to login page
            // window.location.href = '/login';
            // Or use history/navigate from your route library to navigate to login page
            history.push('/agents/login');

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
