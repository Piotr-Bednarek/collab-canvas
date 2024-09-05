import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DomSanitizer } from '@angular/platform-browser';

const PEN_SIZE_1 = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000"><path d="M199-199q-9-9-9-21t9-21l520-520q9-9 21-9t21 9q9 9 9 21t-9 21L241-199q-9 9-21 9t-21-9Z"/></svg>`;
const PEN_SIZE_2 = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000"><path d="M212-212q-11-11-11-28t11-28l480-480q11-12 27.5-12t28.5 12q11 11 11 28t-11 28L268-212q-11 11-28 11t-28-11Z"/></svg>`;
const PEN_SIZE_3 = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000"><path d="M218-218q-17-17-17-42t17-42l440-440q17-18 42-17.5t42 17.5q17 17 17.5 42T742-658L302-218q-17 17-42 17.5T218-218Z"/></svg>`;
const PEN_SIZE_4 = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000"><path d="M229-229q-29-29-29-71t29-71l360-360q29-29 71-29t71 29q29 29 29 71t-29 71L371-229q-29 29-71 29t-71-29Z"/></svg>`;
const PEN_SIZE_5 = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000"><path d="M235-235q-35-35-35-85t35-85l320-320q35-35 85-35t85 35q35 35 35 85t-35 85L405-235q-35 35-85 35t-85-35Z"/></svg>`;

@Component({
    selector: 'app-thickness-button',
    standalone: true,
    imports: [MatButtonModule, CommonModule, MatTooltipModule, MatIconModule],
    templateUrl: './thickness-button.component.html',
    styleUrl: './thickness-button.component.scss',
})
export class ThicknessButtonComponent {
    constructor(private iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) {
        iconRegistry.addSvgIconLiteral('pen-size-1', sanitizer.bypassSecurityTrustHtml(PEN_SIZE_1));
        iconRegistry.addSvgIconLiteral('pen-size-2', sanitizer.bypassSecurityTrustHtml(PEN_SIZE_2));
        iconRegistry.addSvgIconLiteral('pen-size-3', sanitizer.bypassSecurityTrustHtml(PEN_SIZE_3));
        iconRegistry.addSvgIconLiteral('pen-size-4', sanitizer.bypassSecurityTrustHtml(PEN_SIZE_4));
        iconRegistry.addSvgIconLiteral('pen-size-5', sanitizer.bypassSecurityTrustHtml(PEN_SIZE_5));
    }

    @Input() thickness: number = 1;
    @Input() icon: string = 'pen-size-1';
    @Input() isSelected: boolean = false;

    @Output() thicknessSelected = new EventEmitter<any>();

    handleClicked() {
        this.thicknessSelected.emit();
    }
}
