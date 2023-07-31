import Axios from "axios";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const api = Axios.create({
  baseURL: "http://0.0.0.0:8080/",
  headers: {'Authorization': `Bearer ${localStorage.getItem('access_token')}`}
});

api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response.status === 401) {
      const refreshToken = localStorage.getItem('refresh_token');

      try {
        const response = await axios.post('http://0.0.0.0:8080/token/refresh/', {
          "refresh": refreshToken,
        });
 
        console.log(response.data.access)
        localStorage.setItem('access_token', response.data.access);
        error.config.headers['Authorization'] = `Bearer ${response.data.token}`;
        console.log('changed the access token')

        return api(error.config);
      } catch (refreshError) {
        console.error('Failed to refresh JWT:', refreshError);
        if (refreshError.response.status === 401){
          console.log('refresh token was expired')
        }
        throw refreshError;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
