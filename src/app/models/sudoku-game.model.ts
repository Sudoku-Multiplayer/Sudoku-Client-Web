import { Level } from "../enums/level";
import { GameStatus } from "../enums/game-status";

export class SudokuGame {
    hostName: string;
    boardSize: number;
    level: Level;
    playerCount: number;
    playerLimit: number;
    status: GameStatus;
    gameId: string;
    gameName: string;
    initialBoard: number[][];
    currentBoard: number[][]
    solution: number[][];

    constructor(hostName: string, boardSize: number, level: Level, playerCount: number, playerLimit: number, status: GameStatus, gameId: string, gameName: string, initialBoard: number[][], currentBoard: number[][], solution: number[][]) {
        this.hostName = hostName;
        this.boardSize = boardSize;
        this.level = level;
        this.playerCount = playerCount;
        this.playerLimit = playerLimit;
        this.status = status;
        this.gameId = gameId;
        this.gameName = gameName;
        this.initialBoard = initialBoard;
        this.currentBoard = currentBoard;
        this.solution = solution;
    }
}