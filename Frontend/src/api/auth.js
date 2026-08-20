import api from "./client";

const TOKEN_KEY = "tf_token";

export async function signup(email, password) {
  const response = await api.post("/auth/signup", {
    email,
    password,
  });

  return response.data;
}

export async function login(email, password) {
  const response = await api.post("/auth/login", {
    email,
    password,
  });

  const data = response.data;

  if (data?.access_token) {
    localStorage.setItem(
      TOKEN_KEY,
      data.access_token
    );
  }

  return data;
}

export async function getMe() {
  const response = await api.get("/auth/me");

  return response.data;
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function isAuthenticated() {
  return Boolean(getToken());
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
}