export interface FE_ScalarAccountResponse {
    user_id: string;
}

export interface FE_ScalarRegisterResponse {
    scalar_token: string;
}

export interface FE_ScalarOpenIdRequestBody {
    access_token: string;
    expires_in: number;
    matrix_server_name: string;
    token_type: string;
}