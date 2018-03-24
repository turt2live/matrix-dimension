export interface Service {
    ID: string;
    UserID: string;
    Type: string;
    Config: any;
}

export interface ConfigureServiceResponse {
    ID: string;
    Type: string;
    OldConfig?: any;
    NewConfig: any;
}