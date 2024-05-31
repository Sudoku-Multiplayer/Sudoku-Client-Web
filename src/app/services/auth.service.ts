import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { ServerConfig } from '../configs/server.config';
import { Observable, ObservableInput, catchError, throwError } from 'rxjs';
import { Player } from '../models/player.model';
import { UiUtilService } from './ui-util.service';
import { PlayerData } from '../models/player-data.model';
import { LoginRequest } from '../models/login-request.model';
import { GameStateService } from './game-state.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  serverConfig: ServerConfig = inject(ServerConfig);
  httpClient: HttpClient = inject(HttpClient);
  uiUtilService: UiUtilService = inject(UiUtilService);
  gameStateService: GameStateService = inject(GameStateService);

  private isLogged: boolean = false;

  constructor() { }

  isLoggedIn(): boolean {
    if (this.isLogged) {
      return true;
    }

    if (this.gameStateService.getCurrentPlayer()) {
      this.isLogged = true;
      return true;
    }

    return false;
  }

  login(loginRequest: LoginRequest): Observable<Player> {
    let url: string = this.serverConfig.PLAYER_SERVER_URL + "/login";

    return this.httpClient.post<Player>(url, loginRequest)
      .pipe(catchError(this.handleError));
  }

  signup(playerData: PlayerData): Observable<PlayerData> {
    let url: string = this.serverConfig.PLAYER_SERVER_URL + "/signup";

    return this.httpClient.post<PlayerData>(url, playerData)
      .pipe(catchError(this.handleError));
  }

  fetchPlayerData(playerId: number): Observable<PlayerData> {
    let url: string = this.serverConfig.PLAYER_SERVER_URL + "/player";

    const params = new HttpParams()
      .set('id', playerId);

    return this.httpClient.get<PlayerData>(url, { params })
      .pipe(catchError(this.handleError));

  }

  updatePlayerData(playerData: PlayerData): Observable<PlayerData> {
    let url: string = this.serverConfig.PLAYER_SERVER_URL + "/player";

    return this.httpClient.put<Player>(url, playerData)
      .pipe(catchError(this.handleError));
  }

  loginGuestPlayer(playerName: string): Observable<Player> {
    const url = this.serverConfig.PLAYER_SERVER_URL + "/login-guest-player";

    const params = new HttpParams()
      .set("playerName", playerName);

    return this.httpClient.get<Player>(url, { params })
      .pipe(catchError(this.handleError));
  }

  logout() {
    this.isLogged = false;
    this.gameStateService.removeCurrentPlayer();
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
