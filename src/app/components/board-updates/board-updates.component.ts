import { AfterViewChecked, AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild, inject } from '@angular/core';
import { BoardUpdate } from '../../models/board-update.model';
import { GameStateService } from '../../services/game-state.service';
import { Player } from '../../models/player.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-board-updates',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './board-updates.component.html',
  styleUrl: './board-updates.component.css'
})
export class BoardUpdatesComponent implements OnInit {

  @Input() boardUpdates: BoardUpdate[] = [];

  gameStateService: GameStateService = inject(GameStateService);

  currentPlayer: Player | null = this.gameStateService.getCurrentPlayer();

  @ViewChild("endOfBoardUpdates") endOfBoardUpdates!: ElementRef;

  ngOnInit(): void {
    this.scrollToLastBoardUpdate();
  }

  scrollToLastBoardUpdate() {
    setTimeout(() => {
      if (this.endOfBoardUpdates) {
        this.endOfBoardUpdates.nativeElement.scrollIntoView({ behavior: "smooth" });
      }
    }, 1000);
  }

}
