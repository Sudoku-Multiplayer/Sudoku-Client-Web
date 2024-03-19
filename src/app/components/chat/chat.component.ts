import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { GameChatMessage } from '../../models/game-chat-message.model';
import { Player } from '../../models/player.model';
import { GameStateService } from '../../services/game-state.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatListModule, MatCardModule, CommonModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent {

  @Input() gameChat!: GameChatMessage[];
  @Output() messageEvent = new EventEmitter<string>();

  gameStateService: GameStateService = inject(GameStateService);

  currentPlayer: Player | null = this.gameStateService.getCurrentPlayer();

  @ViewChild("endOfMessages") endOfMessages!: ElementRef;

  emitMessage(messageInputElement: HTMLInputElement) {
    this.messageEvent.emit(messageInputElement.value);
    messageInputElement.value = '';
  }

  scrollToLastMessage() {
    setTimeout(() => {
      if (this.endOfMessages) {
        this.endOfMessages.nativeElement.scrollIntoView({ behavior: "smooth" });
      }
    }, 300);
  }

}
