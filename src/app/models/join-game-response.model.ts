import { GameStatus } from "../enums/game-status";
import { SudokuGame } from "./sudoku-game.model";

export class JoinGameResponse {

    constructor(public gameStatus: GameStatus, public statusMessage: string, public game: SudokuGame) {

    }
}