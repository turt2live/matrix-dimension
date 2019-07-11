export interface ScalarRegisterResponse {
    scalar_token: string;
}

export interface ScalarAccountResponse {
    user_id: string;
    // credit: number; // present on scalar-web
}

export interface ScalarLogoutResponse {
    // Nothing of interest
}