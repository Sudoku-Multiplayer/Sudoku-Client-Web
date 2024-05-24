import { inject } from "@angular/core";
import { WebSocketService } from "../services/web-socket.service";
import { GameStateService } from "../services/game-state.service";
import { ServerConfig } from "./server.config";

export function webSocketServiceFactory() {
    const webSocketService: WebSocketService = new WebSocketService();
    const gameStateService: GameStateService = inject(GameStateService);
    const serverConfig: ServerConfig = inject(ServerConfig);

    webSocketService.configure({
        brokerURL: serverConfig.BASE_WEBSOCKET_URL,

        connectHeaders: {
            "player": JSON.stringify(gameStateService.getCurrentPlayer()),
        },

        heartbeatIncoming: 0,
        heartbeatOutgoing: 20000,

        reconnectDelay: 2000,
    });

    webSocketService.activate();

    return webSocketService;
}