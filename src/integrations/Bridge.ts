import { Integration } from "./Integration";
import BridgeRecord from "../db/models/BridgeRecord";

export class Bridge extends Integration {
    constructor(bridge: BridgeRecord, public config: any) {
        super(bridge);
        this.category = "bridge";
        this.requirements = [{
            condition: "publicRoom",
            expectedValue: true,
            argument: null, // not used
        }];

        // We'll just say we aren't
        this.isEncryptionSupported = false;
    }
}

export interface IrcBridgeConfiguration {
    availableNetworks: {
        [networkId: string]: {
            name: string;
            bridgeUserId: string;
        };
    };
    links: {
        [networkId: string]: {
            channelName: string;
            addedByUserId: string;
        }[];
    };
}