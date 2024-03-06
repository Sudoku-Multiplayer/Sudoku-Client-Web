import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, ObservableInput, throwError } from 'rxjs';
import { GameOptions } from '../models/game-options.model';
import { SudokuGame } from '../models/sudoku-game.model';
import { CreateGameRequest } from '../models/create-game-request.model';
import { CreateGameResponse } from '../interfaces/create-game-response';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  readonly BASE_URL: string = "http://localhost:8080";
  readonly SUDOKU_SERVER_URL: String = this.BASE_URL + "/sudoku-server";

  httpClient: HttpClient = inject(HttpClient);

  constructor() { }
  
  fetchSudokuBoard(gameOptions: GameOptions): Observable<number[][]> {
    let url: string = this.SUDOKU_SERVER_URL + "/generate-board-by-level";

    const params = new HttpParams()
      .set('boardSize', gameOptions.boardSize.toString())
      .set('level', gameOptions.level);

    return this.httpClient.get<number[][]>(url, { params }).pipe(catchError(this.handleError));
  }

  fetchActiveGames(): Observable<SudokuGame[]>{
    let url: string = this.SUDOKU_SERVER_URL + "/games";

    return this.httpClient.get<SudokuGame[]>(url).pipe(catchError(this.handleError));
  }

  hostGame(createGameRequest: CreateGameRequest): Observable<CreateGameResponse>{
    let url: string = this.SUDOKU_SERVER_URL + "/create-game";

    return this.httpClient.post<CreateGameResponse>(url, createGameRequest).pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): ObservableInput<any> {
    let errorMessage: string;
    if (error.status === 0) {
      errorMessage = 'Unable to connect to server. Please try again later.';
      console.error(errorMessage, error.error);
    } 
    else if(error.status === 500){
      errorMessage = "Internal Server Error: " +  error.error;
      console.error(errorMessage);
    }
    else {
      errorMessage = error.error;
      console.error("Backend returned code " +  error.status + ", error message: " +  error.error);
      console.log(error);
    }
    
    return throwError(() => new Error(errorMessage));
  }

}
