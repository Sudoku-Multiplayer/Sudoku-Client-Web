import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import {
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
} from '@angular/material/dialog';

@Component({
  selector: 'app-about-dialog',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
  ],
  templateUrl: './about-dialog.component.html',
  styleUrl: './about-dialog.component.css'
})
export class AboutDialogComponent {

}
