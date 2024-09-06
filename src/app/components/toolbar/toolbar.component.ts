import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DomSanitizer } from '@angular/platform-browser';
import { SelectedTool } from '../../interfaces/selected-tool';

const ERASER_ICON_ON = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#00006e"><path d="M690-240h190v80H610l80-80Zm-500 80-85-85q-23-23-23.5-57t22.5-58l440-456q23-24 56.5-24t56.5 23l199 199q23 23 23 57t-23 57L520-160H190Zm296-80 314-322-198-198-442 456 64 64h262Zm-6-240Z"/></svg>`;
const ERASER_ICON_OFF = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#979799"><path d="M690-240h190v80H610l80-80Zm-500 80-85-85q-23-23-23.5-57t22.5-58l440-456q23-24 56.5-24t56.5 23l199 199q23 23 23 57t-23 57L520-160H190Zm296-80 314-322-198-198-442 456 64 64h262Zm-6-240Z"/></svg>`;
const SELECT_ICON_ON = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#00006e"><path d="m320-410 79-110h170L320-716v306ZM551-80 406-392 240-160v-720l560 440H516l144 309-109 51ZM399-520Z"/></svg>`;
const SELECT_ICON_OFF = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#979799"><path d="m320-410 79-110h170L320-716v306ZM551-80 406-392 240-160v-720l560 440H516l144 309-109 51ZM399-520Z"/></svg>`;
const LINE_ICON_ON = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#00006e"><path d="M760-80q-50 0-85-35t-35-85q0-14 3-27t9-25L252-652q-12 6-25 9t-27 3q-50 0-85-35t-35-85q0-50 35-85t85-35q50 0 85 35t35 85q0 14-3 27t-9 25l400 400q12-6 25-9t27-3q50 0 85 35t35 85q0 50-35 85t-85 35Z"/></svg>`;
const LINE_ICON_OFF = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#979799"><path d="M760-80q-50 0-85-35t-35-85q0-14 3-27t9-25L252-652q-12 6-25 9t-27 3q-50 0-85-35t-35-85q0-50 35-85t85-35q50 0 85 35t35 85q0 14-3 27t-9 25l400 400q12-6 25-9t27-3q50 0 85 35t35 85q0 50-35 85t-85 35Z"/></svg>`;

@Component({
    selector: 'app-toolbar',
    standalone: true,
    imports: [MatIconModule, MatButtonModule, CommonModule, MatTooltipModule],
    templateUrl: './toolbar.component.html',
    styleUrl: './toolbar.component.scss',
})
export class ToolbarComponent {
    selectedTool: SelectedTool = 'move';

    constructor(private iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) {
        iconRegistry.addSvgIconLiteral('eraser-icon-on', sanitizer.bypassSecurityTrustHtml(ERASER_ICON_ON));
        iconRegistry.addSvgIconLiteral('eraser-icon-off', sanitizer.bypassSecurityTrustHtml(ERASER_ICON_OFF));
        iconRegistry.addSvgIconLiteral('select-icon-on', sanitizer.bypassSecurityTrustHtml(SELECT_ICON_ON));
        iconRegistry.addSvgIconLiteral('select-icon-off', sanitizer.bypassSecurityTrustHtml(SELECT_ICON_OFF));
        iconRegistry.addSvgIconLiteral('line-icon-on', sanitizer.bypassSecurityTrustHtml(LINE_ICON_ON));
        iconRegistry.addSvgIconLiteral('line-icon-off', sanitizer.bypassSecurityTrustHtml(LINE_ICON_OFF));
    }

    @Output() toolSelected = new EventEmitter<string>();

    selectTool(tool: SelectedTool): void {
        this.selectedTool = tool;
        this.toolSelected.emit(this.selectedTool);
    }

    @HostListener('window:keydown.1', ['$event'])
    handlePress1() {
        this.selectTool('move');
    }

    @HostListener('window:keydown.2', ['$event'])
    handlePress2() {
        this.selectTool('select');
    }

    @HostListener('window:keydown.3', ['$event'])
    handlePress3() {
        this.selectTool('draw');
    }

    @HostListener('window:keydown.4', ['$event'])
    handlePress4() {
        this.selectTool('erase');
    }

    @HostListener('window:keydown.5', ['$event'])
    handlePress5() {
        this.selectTool('line');
    }

    @HostListener('window:keydown.6', ['$event'])
    handlePress6() {
        this.selectTool('rectangle');
    }

    @HostListener('window:keydown.7', ['$event'])
    handlePress7() {
        this.selectTool('ellipse');
    }

    @HostListener('window:keydown.8', ['$event'])
    handlePress8() {
        this.selectTool('text_field');
    }
}
