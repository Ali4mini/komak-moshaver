import axios from "axios";

const apiUrl = import.meta.env.VITE_API ?? "/api/";
const mediaUrl = import.meta.env.VITE_MEDIA ?? "/media/";


console.log("url:", apiUrl)
let accessToken = localStorage.getItem("access_token");

const api = axios.create({
  baseURL: apiUrl,
  headers: {
    "Authorization": `Bearer ${accessToken}`,
    "Content-type": "application/json",
  },
});

const media = axios.create({
  baseURL: mediaUrl,
  headers: {
    "Authorization": `Bearer ${accessToken}`,
    "Content-type": "application/json",
  },
});

const retryRequest = (config, maxRetries = 3, retries = 0) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      config.headers.Authorization = `Bearer ${accessToken}`;

      axios(config)
        .then(response => {
          resolve(response);
        })
        .catch(error => {
          // Check if we've exceeded the max retries and if the error is a 401 Unauthorized
          if (retries < maxRetries && error.response?.status === 401) {
            // Attempt to refresh the token
            refreshToken()
              .then(() => {
                // Update the Authorization header with the new token
                config.headers["Authorization"] = `Bearer ${accessToken}`;
                // Recursively call retryRequest with incremented retries
                retryRequest(config, maxRetries, retries + 1);
              })
              .catch(refreshError => {
                // Reject the promise if token refresh fails
                reject(refreshError);
              });
          } else {
            // Reject the promise if we've exhausted all retries or it's not a 401 error
            reject(error);
          }
        });
    }, retries * 1000); // Delay increases with each retry attempt
  });
};

const refreshToken = () => {
  return api.post(`${apiUrl}token/refresh/`, {
    refresh: localStorage.getItem("refresh_token"),
  });
};

// Add request interceptor to set Authorization header for all requests
api.interceptors.request.use(
  config => {
    config.headers["Authorization"] = `Bearer ${accessToken}`;
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Update response interceptor to use retryRequest when token expires
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      try {
        // Attempt to refresh the token
        const refreshedToken = await refreshToken();
        accessToken = refreshedToken.data.access;
        localStorage.setItem("access_token", accessToken);

        // Retry the original request with the new token
        return retryRequest(error.config);
      } catch (refreshError) {
        console.error("Failed to refresh JWT:", refreshError);
        if (refreshError.response?.status === 401) {
          console.log("Refresh token was expired");
          history.push('/agents/login');
        }
        throw refreshError;
      }
    }
    return Promise.reject(error);
  }
);

export { api, media };
