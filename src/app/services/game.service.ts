import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, ObservableInput, throwError } from 'rxjs';
import { GameOptions } from '../models/game-options.model';
import { SudokuGame } from '../models/sudoku-game.model';
import { CreateGameRequest } from '../models/create-game-request.model';
import { CreateGameResponse } from '../interfaces/create-game-response';
import { JoinGameResponse } from '../models/join-game-response.model';
import { Player } from '../models/player.model';
import { ServerConfig } from '../configs/server.config';
import { GameBoard } from '../models/game-board.model';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  serverConfig: ServerConfig = inject(ServerConfig);
  httpClient: HttpClient = inject(HttpClient);

  constructor() { }

  fetchSudokuBoard(gameOptions: GameOptions): Observable<GameBoard> {
    let url: string = this.serverConfig.SUDOKU_SERVER_URL + "/generate-board-solution-by-level";

    const params = new HttpParams()
      .set('boardSize', gameOptions.boardSize.toString())
      .set('level', gameOptions.level);

    return this.httpClient.get<GameBoard>(url, { params })
      .pipe(catchError(this.handleError));
  }

  fetchActiveGames(): Observable<SudokuGame[]> {
    let url: string = this.serverConfig.GAME_SERVER_URL + "/games";

    return this.httpClient.get<SudokuGame[]>(url)
      .pipe(catchError(this.handleError));
  }

  hostGame(createGameRequest: CreateGameRequest): Observable<CreateGameResponse> {
    let url: string = this.serverConfig.GAME_SERVER_URL + "/create-game";

    return this.httpClient.post<CreateGameResponse>(url, createGameRequest)
      .pipe(catchError(this.handleError));
  }

  joinGame(gameId: string, player: Player): Observable<JoinGameResponse> {
    let url: string = this.serverConfig.GAME_SERVER_URL + "/join-game";
    const params = new HttpParams()
      .set('gameId', gameId);

    return this.httpClient.post<JoinGameResponse>(url, player, { params })
      .pipe(catchError(this.handleError));
  }

  leaveGame(gameId: string, player: Player): Observable<void> {
    let url: string = this.serverConfig.GAME_SERVER_URL + "/leave-game";
    const params = new HttpParams()
      .set('gameId', gameId);

    return this.httpClient.post<void>(url, player, { params })
      .pipe(catchError(this.handleError));
  }

  fetchOnlinePlayerCount(): Observable<number> {
    const url = this.serverConfig.SUDOKU_SERVER_URL + "/online-player-count";

    return this.httpClient.get<number>(url)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): ObservableInput<any> {
    let errorMessage: string;
    if (error.status === 0) {
      errorMessage = 'Unable to connect to server. Please try again later.';
      console.error(errorMessage, error.error);
    }
    else if (error.status === 500) {
      errorMessage = "Internal Server Error: " + error.error;
      console.error(errorMessage);
    }
    else {
      errorMessage = error.error;
      console.error("Backend returned code " + error.status + ", error message: " + error.error);
      console.log(error);
    }

    return throwError(() => new Error(errorMessage));
  }

}
