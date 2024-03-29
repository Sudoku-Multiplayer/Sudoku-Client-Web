import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, inject } from '@angular/core';
import { GameService } from '../../services/game.service';
import { MatGridListModule } from '@angular/material/grid-list';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { UtilService } from '../../services/util.service';
import { GameStateService } from '../../services/game-state.service';
import { BoardUpdate } from '../../models/board-update.model';

@Component({
  selector: 'app-game-board',
  standalone: true,
  imports: [MatGridListModule, CommonModule, FormsModule, MatProgressSpinnerModule],
  templateUrl: './game-board.component.html',
  styleUrl: './game-board.component.css'
})
export class GameBoardComponent implements OnInit, OnDestroy {

  @Input() initialBoard: number[][] = [];
  @Input() currentBoard: number[][] = [];
  @Input() solution: number[][] = [];
  @Output() boardUpdateEvent: EventEmitter<BoardUpdate> = new EventEmitter<BoardUpdate>();

  gameService: GameService = inject(GameService);
  gameStateService: GameStateService = inject(GameStateService);
  utilService: UtilService = inject(UtilService);

  boardSize!: number;

  constructor() {
  }

  ngOnInit() {
    this.boardSize = this.currentBoard.length;
  }

  ngOnDestroy(): void {
    this.gameStateService.removeGameOptions();
  }

  tileKeyDown(event: KeyboardEvent, i: number, j: number) {
    const currentValue = (event.target as HTMLInputElement).value;

    if (!['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(event.code)) {

      // digit from 0 to 9 pressed.
      if (!isNaN(Number(event.key))) {

        let expectedTileNumber = Number(currentValue + event.key);
        //number out of range.
        if (expectedTileNumber > this.boardSize || expectedTileNumber == 0) {
          event.preventDefault();
        }
        else {
          this.currentBoard[i][j] = expectedTileNumber;
          event.preventDefault();

          this.boardUpdateEvent.emit(new BoardUpdate(expectedTileNumber, i, j));
        }
      }
      else {
        event.preventDefault();
      }
    }
  }

}


