import { FE_Bridge, FE_Widget } from "./integration";

export interface FE_IntegrationsResponse {
    widgets: FE_Widget[];
    bridges: FE_Bridge<any>[];
}