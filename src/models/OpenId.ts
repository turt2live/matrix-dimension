export interface OpenId {
    access_token: string;
    matrix_server_name: string;
    expires_in: number;
    token_type: 'Bearer';
}