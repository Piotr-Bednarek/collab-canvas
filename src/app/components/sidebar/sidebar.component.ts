import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DomSanitizer } from '@angular/platform-browser';
import { ColorButtonComponent } from '../color-button/color-button.component';
import { ThicknessButtonComponent } from '../thickness-button/thickness-button.component';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [
        MatIconModule,
        MatButtonModule,
        MatTooltipModule,
        CommonModule,
        ColorButtonComponent,
        ThicknessButtonComponent,
    ],
    templateUrl: './sidebar.component.html',
    styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
    @Input() zoomValue: string = '100%';

    @Output() zoomOutClicked = new EventEmitter<void>();
    @Output() zoomInClicked = new EventEmitter<void>();
    @Output() zoomResetClicked = new EventEmitter<void>();

    @Output() thicknessSelected = new EventEmitter<number>();
    @Output() colorSelected = new EventEmitter<string>();

    iconNames: string[] = ['pen-size-1', 'pen-size-2', 'pen-size-3', 'pen-size-4', 'pen-size-5'];

    thicknesses: number[] = [1, 3, 7, 10, 20];
    colors: string[] = [
        '#000000',
        '#FF0000',
        '#00FF00',
        '#0000FF',
        '#FFFF00',
        '#FF00FF',
        '#00FFFF',
        '#808080',
    ];

    selectedThicknessIndex: number = 1;
    selectedColorIndex: number = 0;

    onThicknessChange(thicknessIndex: number) {
        this.selectedThicknessIndex = thicknessIndex;
        this.thicknessSelected.emit(this.thicknesses[thicknessIndex]);
    }

    onColorChange(colorIndex: number) {
        this.selectedColorIndex = colorIndex;
        this.colorSelected.emit(this.colors[colorIndex]);
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
}
