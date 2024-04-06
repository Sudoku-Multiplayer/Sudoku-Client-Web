import { Level } from "../enums/level";

export class GameOptions {
    constructor(public playerName: string, public boardSize: number, public level: Level) {

    }
}
