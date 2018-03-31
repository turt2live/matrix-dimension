import { Integration } from "./Integration";
import BridgeRecord from "../db/models/BridgeRecord";
import { AvailableNetworks, LinkedChannels } from "../bridges/IrcBridge";

export class Bridge extends Integration {
    constructor(bridge: BridgeRecord, public config: any) {
        super(bridge);
        this.category = "bridge";
        this.requirements = [{
            condition: "publicRoom",
            expectedValue: true,
            argument: null, // not used
        }];

        // We'll just say we don't support encryption
        this.isEncryptionSupported = false;
    }
}

export interface IrcBridgeConfiguration {
    availableNetworks: AvailableNetworks;
    links: LinkedChannels;
}