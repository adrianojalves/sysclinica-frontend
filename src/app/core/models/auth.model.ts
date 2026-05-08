/* Authentication Response from Spring Boot Backend */
export interface AuthResponse {
    accessToken: string;
    username?: string;
    roles?: string[];
}

/* Login Request Payload */
export interface LoginRequest {
    login: string;
    password: string;
}