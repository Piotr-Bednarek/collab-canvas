import { Component, inject, model } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
    MAT_DIALOG_DATA,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogRef,
    MatDialogTitle,
} from '@angular/material/dialog';

import { FormsModule } from '@angular/forms';
import { MatButtonToggleChange, MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';

@Component({
    selector: 'app-canvas-settings-dialog',
    standalone: true,
    imports: [
        MatDialogTitle,
        MatDialogContent,
        MatDialogActions,
        MatDialogClose,
        MatButtonModule,
        MatButtonToggleModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        FormsModule,
    ],
    templateUrl: './canvas-settings-dialog.component.html',
    styleUrl: './canvas-settings-dialog.component.scss',
})
export class CanvasSettingsDialogComponent {
    readonly dialogRef = inject(MatDialogRef<CanvasSettingsDialogComponent>);
    readonly data = inject(MAT_DIALOG_DATA);
    readonly zoomSensitivity = model(this.data.zoomSensitivity);
    readonly panSensitivity = model(this.data.panSensitivity);
    readonly backgroundStyle = model(this.data.backgroundStyle);
    readonly backgroundColor = model(this.data.backgroundColor);
    readonly patternColor = model(this.data.patternColor);
    readonly patternSize = model(this.data.patternSize);

    onNoClick(): void {
        this.dialogRef.close();
    }

    onYesClick(): void {
        this.dialogRef.close(this.data);
    }

    onPropertyChange($event: MatButtonToggleChange | MatSelectChange, property: string): void {
        this.data[property] = $event.value;
    }
}
