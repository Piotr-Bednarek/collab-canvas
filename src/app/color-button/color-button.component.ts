import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-color-button',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './color-button.component.html',
    styleUrl: './color-button.component.scss',
})
export class ColorButtonComponent {
    @Input() color: string = '#000000';
    @Input() isSelected: boolean = false;

    selectedSizeRem: number = 2.5;
    notSelectedSizeRem: number = 1.8;
}
