import { JoinStatus } from "../enums/join-status";
import { GameSession } from "./game-session.model";

export class JoinGameResponse {

    constructor(
        public joinStatus: JoinStatus,
        public statusMessage: string,
        public gameSession: GameSession
    ) {

    }
}