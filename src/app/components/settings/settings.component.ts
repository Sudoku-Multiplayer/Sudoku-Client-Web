import { Component, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { GameStateService } from '../../services/game-state.service';
import { Player } from '../../models/player.model';
import { PlayerType } from '../../enums/player-type';
import { UiUtilService } from '../../services/ui-util.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { PlayerData } from '../../models/player-data.model';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit {

  gameStateService = inject(GameStateService);
  uiUtilService: UiUtilService = inject(UiUtilService);
  authService: AuthService = inject(AuthService);
  router: Router = inject(Router);

  settingsForm!: FormGroup;

  ngOnInit(): void {
    this.settingsForm = new FormGroup({
      playerName: new FormControl(this.currentPlayerName(), Validators.required),
    });
  }

  saveSettings() {
    let settingsFormValue = this.settingsForm.value;

    const currentPlayer = this.gameStateService.getCurrentPlayer()!;

    if (currentPlayer.playerType === PlayerType.REGULAR) {
      const playerData: PlayerData = new PlayerData(currentPlayer.id, settingsFormValue.playerName);
      this.authService.updatePlayerData(playerData)
        .subscribe({
          next: (updatedPlayerData: PlayerData) => {
            const player: Player = new Player(
              updatedPlayerData.playerName!,
              updatedPlayerData.id!,
              PlayerType.REGULAR);

            if (this.gameStateService.isPlayerLocallySaved()) {
              this.gameStateService.savePlayer(player, true);
            }
            else {
              this.gameStateService.savePlayer(player, false);
            }
            this.uiUtilService.showSnackBar("Player data updated successfully.", "Ok", 5);
          },
          error: (err) => {
            this.uiUtilService.showSnackBar(err, "Ok", 8);
          }
        });
    }
    else {
      currentPlayer.name = settingsFormValue.playerName;
      this.gameStateService.savePlayer(currentPlayer, false);
      this.uiUtilService.showSnackBar("Settings saved.", "Ok", 5);
    }
  }

  currentPlayerName(): string {
    let player = this.gameStateService.getCurrentPlayer();

    if (player) {
      return player.name;
    }

    return '';
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['login']);
  }

}
