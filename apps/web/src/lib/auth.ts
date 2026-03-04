const TOKEN_KEY = "auth_token";
const USERNAME_KEY = "auth_username";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function getUsername(): string | null {
  return localStorage.getItem(USERNAME_KEY);
}

export function setUsername(username: string): void {
  localStorage.setItem(USERNAME_KEY, username);
}

export function removeUsername(): void {
  localStorage.removeItem(USERNAME_KEY);
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

export function logout(): void {
  removeToken();
  removeUsername();
}
