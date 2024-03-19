import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class ServerConfig {

    readonly BASE_SERVER_URL: string = "http://localhost:8080";

    readonly BASE_WEBSOCKET_URL: string = "ws://localhost:8080/ws";

    readonly SUDOKU_SERVER_URL: String = this.BASE_SERVER_URL + "/sudoku-server";

    readonly CHAT_PATH: string = "/game/chat";

    readonly BOARDUPDATE_PATH: string = "/game/board-updates";
}