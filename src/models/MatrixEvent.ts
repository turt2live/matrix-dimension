export interface SimplifiedMatrixEvent {
    age: number;
    content: any;
    event_id: string;
    origin_server_ts: number;
    room_id: string;
    sender: string;
    type: string;
    unsigned: any;

    // Other keys would be stuff related to the actual event, like membership and state_key
}