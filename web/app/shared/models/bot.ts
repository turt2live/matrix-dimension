export interface Bot {
    mxid: string;
    name: string;
    avatar: string;
    about: string; // nullable
    isEnabled: boolean;
    isBroken: boolean;
}
