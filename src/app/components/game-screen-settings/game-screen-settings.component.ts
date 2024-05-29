import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { GameScreenSettings } from '../../models/game-screen-settings.model';
import { GameStateService } from '../../services/game-state.service';

@Component({
  selector: 'app-game-screen-settings',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCheckboxModule,
    MatButtonModule,
    MatFormFieldModule
  ],
  templateUrl: './game-screen-settings.component.html',
  styleUrl: './game-screen-settings.component.css'
})
export class GameScreenSettingsComponent implements OnInit {

  @Output() settingsSubmited = new EventEmitter<any>();

  gameStateService: GameStateService = inject(GameStateService);

  gameScreenSettingsForm!: FormGroup;

  ngOnInit(): void {

    const gameScreenSettings: GameScreenSettings = this.gameStateService.getGameScreenSettings();

    this.gameScreenSettingsForm = new FormGroup({
      showBoardUpdates: new FormControl(gameScreenSettings.showBoardUpdates),
      autoScrollBoardUpdates: new FormControl(gameScreenSettings.autoScrollBoardUpdates),
      showGameChat: new FormControl(gameScreenSettings.showGameChat),
      autoScrollGameChat: new FormControl(gameScreenSettings.autoScrollGameChat),
      rememberSettings: new FormControl(false)
    });

  }

  submitForm() {
    const formValue = this.gameScreenSettingsForm.value;

    const gameScreenSettings: GameScreenSettings = new GameScreenSettings(
      formValue.showBoardUpdates,
      formValue.autoScrollBoardUpdates,
      formValue.showGameChat,
      formValue.autoScrollGameChat
    );

    if (formValue.rememberSettings) {
      this.gameStateService.saveGameScreenSettings(gameScreenSettings, true);
    }

    this.settingsSubmited.emit(gameScreenSettings);
  }

}
