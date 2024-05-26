import { Injectable, inject } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AboutDialogComponent } from "../components/ui/about-dialog/about-dialog.component";

@Injectable({
    providedIn: 'root'
})
export class UiUtilService {

    dialog: MatDialog = inject(MatDialog);

    constructor(private _snackBar: MatSnackBar) {

    }

    showSnackBar(message: string, ok: string, durationSec: number) {
        this._snackBar.open(message, ok, {
            duration: durationSec * 1000
        });
    }

    showAboutDialog() {
        this.dialog.open(AboutDialogComponent);
    }

}