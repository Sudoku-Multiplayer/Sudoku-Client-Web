import { Injectable } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";

@Injectable({
    providedIn: 'root'
})
export class UiUtilService {

    constructor(private _snackBar: MatSnackBar) {

    }

    showSnackBar(message: string, ok: string, durationSec: number) {
        this._snackBar.open(message, ok, {
            duration: durationSec * 1000
        });
    }

}