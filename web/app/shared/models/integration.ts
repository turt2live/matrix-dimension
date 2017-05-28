export interface Integration {
    type: string;
    integrationType: string;
    userId: string;
    name: string;
    avatar: string;
    about: string; // nullable
    isEnabled: boolean;
    isBroken: boolean;
}
