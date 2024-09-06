import { Component, inject } from '@angular/core';

import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-link-copied-snack-bar',
    standalone: true,
    imports: [],
    templateUrl: './link-copied-snack-bar.component.html',
    styleUrl: './link-copied-snack-bar.component.scss',
})
export class LinkCopiedSnackBarComponent {
    private _snackBar = inject(MatSnackBar);

    openSnackBar(message: string, action: string) {
        this._snackBar.open(message, action);
    }
}
