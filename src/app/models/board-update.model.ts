import { Player } from "./player.model";

export class BoardUpdate {
    constructor(public value: number, public row: number, public column: number, public player?: Player) {

    }
}