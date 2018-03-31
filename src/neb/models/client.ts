export interface Client {
    UserID: string;
    HomeserverURL: string;
    AccessToken: string;
    Sync: boolean;
    AutoJoinRooms?: boolean;
    DisplayName?: string;
}

export interface ConfigureClientResponse {
    OldClient?: Client;
    NewClient: Client;
}