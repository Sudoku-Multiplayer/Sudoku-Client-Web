import { GameSessionStatus } from "../enums/game-session-status";
import { BoardUpdate } from "./board-update.model";
import { GameChatMessage } from "./game-chat-message.model";
import { Player } from "./player.model";
import { SudokuGame } from "./sudoku-game.model";

export class GameSession {

    constructor(
        public sessionId: string,
        public game: SudokuGame,
        public timeLimit: number,
        public remainingTime: number,
        public gameSessionStatus: GameSessionStatus,
        public gameBoard: number[][],
        public gameChatMessages: GameChatMessage[],
        public boardUpdates: BoardUpdate[],
        public players: Player[]
    ) {

    }

}