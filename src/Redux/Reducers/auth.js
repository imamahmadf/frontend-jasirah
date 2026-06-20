import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const userFromStorage = JSON.parse(localStorage.getItem("user")) || null;
const tokenFromStorage = localStorage.getItem("token") || null;
const roleFromStorage = JSON.parse(localStorage.getItem("role")) || null; // Ambil role dari localStorage

const initialState = {
  user: userFromStorage,
  token: localStorage.getItem("token") || null,
  role: roleFromStorage,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      if (action.payload.user) {
        state.user = action.payload.user;
      }
      state.token = action.payload.token;
      if (action.payload.role) {
        state.role = action.payload.role;
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;

// Fungsi login
export const login = (namaPengguna, password) => async (dispatch) => {
  try {
    const { data } = await axios.post(
      `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/user/login`,
      { namaPengguna, password }
    );
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user)); // Simpan user
    localStorage.setItem("role", JSON.stringify(data.role)); // Simpan user
    dispatch(
      loginSuccess({ user: data.user, token: data.token, role: data.role })
    );
    console.log(data, "data dri API");
  } catch (error) {
    console.error("Login failed", error);
    // Lempar error agar bisa ditangkap di komponen
    throw error;
  }
};
export const selectRole = (state) => state.auth.role;
export const userRedux = (state) => state.auth.user;
// Fungsi register
export const register =
  (nama, CleanNamaPengguna, password, role, unitKerjaId, pegawaiId) =>
  async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/user/register`,
        {
          nama,
          password: CleanNamaPengguna,
          namaPengguna: password,
          role,
          unitKerjaId,
          pegawaiId,
        }
      );
      console.log("Register berhasil");
    } catch (error) {
      console.error("Register gagal", error);
    }
  };

// Fungsi Logout
export const performLogout = () => (dispatch) => {
  localStorage.removeItem("token");
  localStorage.removeItem("user"); // Hapus user dari localStorage
  dispatch(logout());
  window.location.href = "/login";
};

export default authSlice.reducer;
console.log("aaa");
export const selectIsAuthenticated = (state) => !!state.auth.token;

// Tambahkan selector untuk mengambil data user
export const selectUser = (state) => state.auth.user; // Pastikan ini sesuai dengan struktur state Anda

const AUTH_SKIP_REFRESH_PATHS = ["/user/login", "/user/register", "/user/refresh"];

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthRequest = AUTH_SKIP_REFRESH_PATHS.some((path) =>
      originalRequest?.url?.includes(path)
    );

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthRequest
    ) {
      originalRequest._retry = true;
      try {
        const res = await axios.post(
          `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/user/refresh`,
          {},
          { withCredentials: true }
        );
        localStorage.setItem("token", res.data.accessToken);
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${res.data.accessToken}`;
        originalRequest.headers[
          "Authorization"
        ] = `Bearer ${res.data.accessToken}`;
        return axios(originalRequest);
      } catch (err) {
        console.error("Refresh token gagal, logout...");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);
