import { Player } from "./player.model";

export class GameChatMessage {
    constructor(public player: Player, public message: string) {

    }
}