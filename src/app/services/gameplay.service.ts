import { Injectable, inject } from '@angular/core';
import { IMessage } from '@stomp/rx-stomp';
import { Observable, ObservableInput, catchError, map, throwError } from 'rxjs';
import { BoardUpdate } from '../models/board-update.model';
import { ServerConfig } from '../configs/server.config';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Player } from '../models/player.model';
import { WebSocketService } from './web-socket.service';
import { GameChatMessage } from '../models/game-chat-message.model';

@Injectable({
  providedIn: 'root'
})
export class GameplayService {

  httpClient: HttpClient = inject(HttpClient);
  serverConfig: ServerConfig = inject(ServerConfig);
  websocketService: WebSocketService = inject(WebSocketService);

  watchPlayerJoined(gameId: string): Observable<Player> {
    const destination = this.serverConfig.GAMESESSION_BROKER_PATH + "/" + gameId + "/player-joined";
    return this.websocketService.watch(destination)
      .pipe(map((message: IMessage) => {
        const joinedPlayer: Player = JSON.parse(message.body);
        return joinedPlayer;
      })
      );
  }

  watchPlayerLeft(gameId: string): Observable<Player> {
    const destination = this.serverConfig.GAMESESSION_BROKER_PATH + "/" + gameId + "/player-left";
    return this.websocketService.watch(destination)
      .pipe(map((message: IMessage) => {
        const leftPlayer: Player = JSON.parse(message.body);
        return leftPlayer;
      })
      );
  }

  fetchJoinedPlayers(gameId: string): Observable<Player[]> {
    const url = this.serverConfig.GAME_SERVER_URL + "/game/joined-players";
    const params = new HttpParams()
      .set('gameId', gameId);

    return this.httpClient.get<Player[]>(url, { params })
      .pipe(catchError(this.handleError));
  }

  watchBoardUpdates(gameId: string): Observable<BoardUpdate> {
    const destination = this.serverConfig.GAMESESSION_BROKER_PATH + "/" + gameId + "/board-update";
    return this.websocketService.watch(destination)
      .pipe(map((message: IMessage) => {
        const boardUpdate: BoardUpdate = JSON.parse(message.body);
        return boardUpdate;
      })
      );
  }

  sendBoardUpdates(gameId: string, boardUpdate: BoardUpdate): void {
    const destination = `/game/${gameId}/update-board`;
    this.websocketService.publish(
      {
        destination: destination,
        body: JSON.stringify(boardUpdate)
      });
  }

  fetchBoardUpdates(gameId: string): Observable<BoardUpdate[]> {
    const url = this.serverConfig.GAME_SERVER_URL + this.serverConfig.BOARDUPDATE_PATH;
    const params = new HttpParams()
      .set('gameId', gameId);

    return this.httpClient.get<BoardUpdate[]>(url, { params })
      .pipe(catchError(this.handleError));
  }

  watchGameChatMessage(gameId: string): Observable<GameChatMessage> {
    const destination = this.serverConfig.GAMESESSION_BROKER_PATH + "/" + gameId + "/chat-message";
    return this.websocketService.watch(destination).pipe(
      map((message: IMessage) => {
        const gameChatMessage: GameChatMessage = JSON.parse(message.body);
        return gameChatMessage;
      })
    );
  }

  sendGameChatMessage(gameId: string, gameChatMessage: GameChatMessage): void {
    const destination = `/game/${gameId}/chat-message`;
    this.websocketService.publish(
      {
        destination: destination,
        body: JSON.stringify(gameChatMessage)
      });
  }

  fetchGameChat(gameId: string): Observable<GameChatMessage[]> {
    const url = this.serverConfig.GAMECHAT_SERVER_URL + this.serverConfig.CHAT_PATH;
    const params = new HttpParams()
      .set('gameId', gameId);

    return this.httpClient.get<GameChatMessage[]>(url, { params })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): ObservableInput<any> {
    let errorMessage: string;
    if (error.status === 0) {
      errorMessage = 'Unable to connect to server. Please try again later.';
      console.error(errorMessage, error.error);
    }
    else if (error.status === 500) {
      errorMessage = "Internal Server Error: " + error.message;
      console.error(errorMessage);
    }
    else {
      errorMessage = error.error;
      console.error("Backend returned code " + error.status + ", error message: " + error.message);
      console.log(error);
    }

    return throwError(() => new Error(errorMessage));
  }

}