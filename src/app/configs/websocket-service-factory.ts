import { inject } from "@angular/core";
import { WebSocketService } from "../services/web-socket.service";
import { GameStateService } from "../services/game-state.service";

export function webSocketServiceFactory() {
    const webSocketService: WebSocketService = new WebSocketService();
    const gameStateService: GameStateService = inject(GameStateService);

    webSocketService.configure({
        brokerURL: 'ws://localhost:8080/ws',

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