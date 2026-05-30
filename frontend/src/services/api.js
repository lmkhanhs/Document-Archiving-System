import axios from "axios";

export const API_BASE_URL = "http://localhost:8080/api/v1";
export const AI_URL = "http://localhost:8000"; // kept for reference, no longer called directly
export const API_ORIGIN = new URL(API_BASE_URL).origin;
export const WS_BASE_URL = API_ORIGIN.replace("http://", "ws://").replace("https://", "wss://");

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