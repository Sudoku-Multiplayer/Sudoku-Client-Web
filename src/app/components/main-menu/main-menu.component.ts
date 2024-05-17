import { Component, OnInit, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { Router } from '@angular/router';
import { MultiplayerScreenComponent } from '../multiplayer-screen/multiplayer-screen.component';

@Component({
  selector: 'app-main-menu',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatDividerModule, MultiplayerScreenComponent],
  templateUrl: './main-menu.component.html',
  styleUrl: './main-menu.component.css'
})
export class MainMenuComponent {

  private router: Router = inject(Router);

  constructor() {

  }

  singlePlayerGame() {
    this.router.navigate(['options']);
  }

  multiPlayerGame() {
    this.router.navigate(['multiplayer-screen']);
  }

  settings() {
    this.router.navigate(['settings']);
  }

}
