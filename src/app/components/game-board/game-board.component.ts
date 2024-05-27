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
export class GameBoardComponent implements OnInit {

  @Input() initialBoard: number[][] = [];
  @Input() currentBoard: number[][] = [];
  @Input() solution: number[][] = [];
  @Input() showSolution: boolean = false;
  @Output() boardUpdateEvent: EventEmitter<BoardUpdate> = new EventEmitter<BoardUpdate>();

  gameService: GameService = inject(GameService);
  gameStateService: GameStateService = inject(GameStateService);
  utilService: UtilService = inject(UtilService);

  boardSize!: number;
  hoveredCell: { i: number; j: number; } | null = null;

  constructor() {
  }

  ngOnInit() {
    this.boardSize = this.currentBoard.length;
  }

  tileKeyDown(event: KeyboardEvent, i: number, j: number) {
    const currentValue = (event.target as HTMLInputElement).value;

    if (!['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(event.key)) {

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

  showOriginalCellValue(i: number, j: number): boolean {

    if (this.hoveredCell) {
      if (this.hoveredCell.i === i && this.hoveredCell.j === j) {
        return true;
      }
    }

    return false;
  }

  onCellHover(i: number, j: number, isHovered: boolean) {
    this.hoveredCell = isHovered ? { i, j } : null;
  }

}


