import axios from "axios";

const API = axios.create({
  baseURL: "https://ruthanne-supratemporal-overcommonly.ngrok-free.dev",
  headers: { "ngrok-skip-browser-warning": "true" }
});

export default API;