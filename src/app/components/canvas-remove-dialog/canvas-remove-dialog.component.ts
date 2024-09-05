import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogRef,
    MatDialogTitle,
} from '@angular/material/dialog';

@Component({
    selector: 'app-canvas-remove-dialog',
    standalone: true,
    imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, MatButtonModule],
    templateUrl: './canvas-remove-dialog.component.html',
    styleUrl: './canvas-remove-dialog.component.scss',
})
export class CanvasRemoveDialogComponent {
    readonly dialogRef = inject(MatDialogRef<CanvasRemoveDialogComponent>);

    onNoClick(): void {
        this.dialogRef.close();
    }

    onYesClick(): void {
        this.dialogRef.close('delete');
    }
}
