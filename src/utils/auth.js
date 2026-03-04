export const login = (token, role, userId, email) => {
  localStorage.setItem("token", token);
  localStorage.setItem("role", role);
  localStorage.setItem("userId", userId);
  localStorage.setItem("email", email);
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("userId");
};

export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};

export const getToken = () => {
  return localStorage.getItem("token");
};

export const getRole = () => {
  return localStorage.getItem("role");
};

export const getUserId = () => {
  return localStorage.getItem("userId");
};

export const getEmail = () => {
  return localStorage.getItem("email");
};

export const getStudent = () => {
  return JSON.parse(localStorage.getItem("student"));
}


