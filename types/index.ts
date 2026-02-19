export interface User {
    id: string;
    email: string;
    fullName: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: { code: string; message: string };
}
