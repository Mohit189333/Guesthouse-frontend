export const getToken = () => localStorage.getItem("jwtToken");

export const getUserRole = () => {
  const token = getToken();
  if (!token) return null;

  // Decode JWT (simplified, consider using a library like jwt-decode)
  const payload = JSON.parse(atob(token.split(".")[1]));
  return payload.roles; // ['USER'] or ['ADMIN']
};

export const isLoggedIn = () => !!getToken();

export const logout = () => {
  localStorage.removeItem("jwtToken");
};