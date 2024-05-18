import { Level } from "../enums/level";
import { Player } from "./player.model";
import { GameSessionStatus } from "../enums/game-session-status";

export class SudokuGame {
    hostPlayer: Player;
    boardSize: number;
    level: Level;
    playerCount: number;
    playerLimit: number;
    status: GameSessionStatus;
    gameId: string;
    gameName: string;
    initialBoard: number[][];
    currentBoard: number[][]
    solution: number[][];
    players: Player[];
    timeLimit: number;
    remainingTime: number;

    constructor(hostPlayer: Player,
        boardSize: number,
        level: Level,
        playerCount: number,
        playerLimit: number,
        status: GameSessionStatus,
        gameId: string,
        gameName: string,
        initialBoard: number[][],
        currentBoard: number[][],
        solution: number[][],
        players: Player[],
        timeLimit: number,
        remainingTime: number
    ) {
        this.hostPlayer = hostPlayer;
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
        this.players = players;
        this.timeLimit = timeLimit;
        this.remainingTime = remainingTime;
    }
}