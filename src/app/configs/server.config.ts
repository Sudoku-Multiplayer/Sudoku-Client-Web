import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class ServerConfig {

    readonly BASE_SERVER_URL: string = "https://sudoku-server-0d54.onrender.com";

    readonly BASE_WEBSOCKET_URL: string = 'wss://sudoku-server-0d54.onrender.com/ws';

    readonly SUDOKU_SERVER_URL: String = this.BASE_SERVER_URL + "/sudoku-server";

    readonly GAMECHAT_SERVER_URL: String = this.BASE_SERVER_URL + "/chat-server";

    readonly GAME_SERVER_URL: String = this.BASE_SERVER_URL + "/game-server";

    readonly PLAYER_SERVER_URL: String = this.BASE_SERVER_URL + "/player-server";

    readonly CHAT_PATH: string = "/game/chat";

    readonly BOARDUPDATE_PATH: string = "/game/board-updates";

    readonly GAMESESSION_BROKER_PATH: string = "/game-session";

    readonly GAME_APPLICATION_DESTINATION_PREFIX: string = "/game";
}