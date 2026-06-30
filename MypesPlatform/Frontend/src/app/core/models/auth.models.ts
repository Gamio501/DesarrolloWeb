// Mapea LoginRequest.java del backend
export interface LoginRequest {
  username: string;
  password: string;
}

// Mapea RegisterRequest.java del backend
export interface RegisterRequest {
  username: string;
  password: string;
  rol: string; // "ADMIN" o "CLIENTE"
}

// Mapea AuthResponse.java del backend (solo retorna token JWT)
export interface AuthResponse {
  token: string;
}

// Mapea RegisterResponse.java del backend
export interface RegisterResponse {
  message: string;
}
