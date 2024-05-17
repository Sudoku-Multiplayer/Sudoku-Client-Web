import { VoteStatus } from "../enums/vote-status";
import { Player } from "./player.model";

export class VoteRecord {

    constructor(public voter: Player, public voteStatus: VoteStatus) {

    }

}