import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DomSanitizer } from '@angular/platform-browser';
import { CanvasSettingsDialogComponent } from '../canvas-settings-dialog/canvas-settings-dialog.component';
import { ThicknessButtonComponent } from '../thickness-button/thickness-button.component';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [MatIconModule, MatButtonModule, MatTooltipModule, CommonModule, ThicknessButtonComponent],
    templateUrl: './sidebar.component.html',
    styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
    readonly dialog = inject(MatDialog);

    @Input() zoomValue: string = '100%';

    @Output() zoomOutClicked = new EventEmitter<void>();
    @Output() zoomInClicked = new EventEmitter<void>();
    @Output() zoomResetClicked = new EventEmitter<void>();

    @Output() thicknessSelected = new EventEmitter<number>();
    @Output() colorSelected = new EventEmitter<string>();
    @Output() fillColorSelected = new EventEmitter<string>();

    iconNames: string[] = ['pen-size-1', 'pen-size-2', 'pen-size-3', 'pen-size-4', 'pen-size-5'];

    thicknesses: number[] = [1, 3, 7, 10, 20];
    colors: string[] = [
        '#000000',
        '#FF0000',
        '#00FF00',
        '#008000',
        '#0000FF',
        '#FBF72E',
        '#FF00FF',
        '#00FFFF',
        '#808080',
        '#FFFFFF',
    ];

    colorsNames: string[] = [
        'Black',
        'Red',
        'Green',
        'Dark Green',
        'Blue',
        'Yellow',
        'Magenta',
        'Cyan',
        'Gray',
        'White',
    ];

    fillColors: string[] = ['#FFFFFF', '#FBF72E', '#FF0000', '#0000FF', '#000000'];

    fillColorsNames: string[] = ['White', 'Yellow', 'Red', 'Blue', 'Black'];

    selectedThicknessIndex: number = 1;
    selectedColorIndex: number = 0;
    selectedFillColorIndex: number = 0;

    onThicknessChange(thicknessIndex: number) {
        this.selectedThicknessIndex = thicknessIndex;
        this.thicknessSelected.emit(this.thicknesses[thicknessIndex]);
    }

    onColorChange(colorIndex: number) {
        this.selectedColorIndex = colorIndex;
        this.colorSelected.emit(this.colors[colorIndex]);
    }

    onFillColorChange(colorIndex: number) {
        this.selectedFillColorIndex = colorIndex;
        this.fillColorSelected.emit(this.fillColors[colorIndex]);
    }

    handleZoomOutClick() {
        this.zoomOutClicked.emit();
    }

    handleZoomInClick() {
        this.zoomInClicked.emit();
    }

    handleZoomResetClick() {
        this.zoomResetClicked.emit();
    }

    handleCanvasSettingsDialog(event: MouseEvent) {
        event.stopPropagation();

        const dialogRef = this.dialog.open(CanvasSettingsDialogComponent, {
            data: {},
        });

        dialogRef.afterClosed().subscribe((result) => {
            console.log('The dialog was closed:', result);
            if (result !== undefined) {
            }
        });
    }
}
