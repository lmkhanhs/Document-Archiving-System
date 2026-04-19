import axios from "axios";

export const API_BASE_URL = "http://localhost:8080/api/v1";
export const API_ORIGIN = new URL(API_BASE_URL).origin;

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
})

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken")
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
        return config;
    },
    (error) => {
        return Promise.reject(error)
    }
)

export default api