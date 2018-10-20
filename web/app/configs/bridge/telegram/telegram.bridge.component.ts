import { Component } from "@angular/core";
import { BridgeComponent } from "../bridge.component";
import { TelegramApiService } from "../../../shared/services/integrations/telegram-api.service";
import { FE_PortalInfo } from "../../../shared/models/telegram";
import { Modal, overlayConfigFactory } from "ngx-modialog";
import { AskUnbridgeDialogContext, TelegramAskUnbridgeComponent } from "./ask-unbridge/ask-unbridge.component";
import {
    CannotUnbridgeDialogContext,
    TelegramCannotUnbridgeComponent
} from "./cannot-unbridge/cannot-unbridge.component";

interface TelegramConfig {
    puppet: {
        advertise: boolean;
        linked: boolean;
        telegram: {
            username: string;
            firstName: string;
            lastName: string;
            phone: number;
            isBot: boolean;
            permissions: string[];
            availableChats: {
                id: number;
                title: string;
            }[];
        };
    };
    portalInfo: FE_PortalInfo;
    botUsername: string;
    linked: number[];
}

@Component({
    templateUrl: "telegram.bridge.component.html",
    styleUrls: ["telegram.bridge.component.scss"],
})
export class TelegramBridgeConfigComponent extends BridgeComponent<TelegramConfig> {

    public isUpdating: boolean;

    constructor(private telegram: TelegramApiService, private modal: Modal) {
        super("telegram");
    }

    public get isBridged(): boolean {
        return this.bridge.config.linked.length > 0;
    }

    public get canUnbridge(): boolean {
        return this.bridge.config.portalInfo ? this.bridge.config.portalInfo.canUnbridge : false;
    }

    public get botUsername(): string {
        return this.bridge.config.botUsername;
    }

    public get chatName(): string {
        return this.bridge.config.portalInfo ? this.bridge.config.portalInfo.chatName : null;
    }

    public get chatId(): number {
        return this.bridge.config.portalInfo ? this.bridge.config.portalInfo.chatId : 0;
    }

    public set chatId(n: number) {
        if (!this.bridge.config.portalInfo) this.bridge.config.portalInfo = {
            chatId: n,
            chatName: null,
            canUnbridge: false,
            bridged: false,
            roomId: this.roomId,
        };
        else this.bridge.config.portalInfo.chatId = n;
    }

    public bridgeRoom(): void {
        this.telegram.getPortalInfo(this.bridge.config.portalInfo.chatId, this.roomId).then(async (chatInfo) => {
            let forceUnbridge = false;
            if (chatInfo.bridged && chatInfo.canUnbridge) {
                const response = await this.modal.open(TelegramAskUnbridgeComponent, overlayConfigFactory({
                    isBlocking: true,
                    size: 'lg',
                }, AskUnbridgeDialogContext)).result;

                if (response.unbridge) {
                    forceUnbridge = true;
                } else {
                    return {aborted: true};
                }
            } else if (chatInfo.bridged) {
                this.modal.open(TelegramCannotUnbridgeComponent, overlayConfigFactory({
                    isBlocking: true,
                    size: 'lg',
                }, CannotUnbridgeDialogContext));
                return {aborted: true};
            }

            return this.telegram.bridgeRoom(this.roomId, this.bridge.config.portalInfo.chatId, forceUnbridge);
        }).then((portalInfo: FE_PortalInfo) => {
            if ((<any>portalInfo).aborted) return;

            this.bridge.config.portalInfo = portalInfo;
            this.bridge.config.linked = [portalInfo.chatId];
            this.isUpdating = false;
            this.toaster.pop("success", "Bridge updated");
        }).catch(error => {
            this.isUpdating = false;
            console.error(error);

            const body = error.json ? error.json() : null;
            let message = "Error bridging room";
            if (body) {
                if (body["dim_errcode"] === "CHAT_ALREADY_BRIDGED") message = "That Telegram chat is already bridged to another room";
                if (body["dim_errcode"] === "ROOM_ALREADY_BRIDGED") message = "This room is already bridged to a Telegram chat";
                if (body["dim_errcode"] === "BOT_NOT_IN_CHAT") message = "The Telegram bot has not been invited to the chat";
                if (body["dim_errcode"] === "NOT_ENOUGH_PERMISSIONS") message = "You do not have permission to bridge that chat";
            }
            this.toaster.pop("error", message);
        });
    }

    public unbridgeRoom(): void {
        this.isUpdating = true;
        this.telegram.unbridgeRoom(this.roomId).then(portalInfo => {
            this.bridge.config.portalInfo = portalInfo;
            this.bridge.config.linked = [];
            this.isUpdating = false;
            this.toaster.pop("success", "Bridge removed");
        }).catch(error => {
            this.isUpdating = false;
            console.error(error);

            const body = error.json ? error.json() : null;
            let message = "Error removing bridge";
            if (body) {
                if (body["dim_errcode"] === "BOT_NOT_IN_CHAT") message = "The Telegram bot has not been invited to the chat";
                if (body["dim_errcode"] === "NOT_ENOUGH_PERMISSIONS") message = "You do not have permission to unbridge that chat";
            }
            this.toaster.pop("error", message);
        });
    }
}