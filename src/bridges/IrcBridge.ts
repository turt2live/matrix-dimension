import BridgeRecord from "../db/models/BridgeRecord";
import { IrcBridgeConfiguration } from "../integrations/Bridge";

export class IrcBridge {
    constructor(private bridgeRecord: BridgeRecord) {
    }

    public async hasNetworks(): Promise<boolean> {
        return !!this.bridgeRecord;
    }

    public async getRoomConfiguration(requestingUserId: string, inRoomId: string): Promise<IrcBridgeConfiguration> {
        return <any>{requestingUserId, inRoomId};
    }

    public async setRoomConfiguration(requestingUserId: string, inRoomId: string, newConfig: IrcBridgeConfiguration): Promise<any> {
        return <any>{requestingUserId, inRoomId, newConfig};
    }
}