import { DialogModule } from '@angular/cdk/dialog';
import { Component, inject, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
    MAT_DIALOG_DATA,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogRef,
    MatDialogTitle,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
@Component({
    selector: 'app-canvas-edit-dialog',
    standalone: true,
    imports: [
        MatFormFieldModule,
        FormsModule,
        MatButtonModule,
        MatDialogTitle,
        MatDialogContent,
        MatDialogActions,
        MatDialogClose,
        MatInputModule,
    ],
    templateUrl: './canvas-edit-dialog.component.html',
    styleUrl: './canvas-edit-dialog.component.scss',
})
export class CanvasEditDialogComponent {
    readonly dialogRef = inject(MatDialogRef<CanvasEditDialogComponent>);
    readonly data = inject(MAT_DIALOG_DATA);
    readonly title = model(this.data.title);

    onNoClick(): void {
        this.dialogRef.close();
    }

    onYesClick(): void {
        this.data.title = this.title();

        this.dialogRef.close(this.data);
    }
}
