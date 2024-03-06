import { Level } from "../enums/level";
import { Player } from "./player.model";

export class CreateGameRequest {
    player: Player;
    gameName: string;
    boardSize: number;
    level: Level;
    playerLimit: number;

    constructor(player: Player, gameName: string, boardSize: number, level: Level, playerLimit: number) {
        this.player = player;
        this.gameName = gameName;
        this.boardSize = boardSize;
        this.level = level;
        this.playerLimit = playerLimit;
    }
}