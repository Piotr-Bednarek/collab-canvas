import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-toolbar',
    standalone: true,
    imports: [MatIconModule, MatButtonModule, CommonModule],
    templateUrl: './toolbar.component.html',
    styleUrl: './toolbar.component.scss',
})
export class ToolbarComponent {
    selectedTool: string = 'move';

    @Output() toolSelected = new EventEmitter<string>();

    selectTool(tool: string): void {
        this.selectedTool = tool;
        this.toolSelected.emit(this.selectedTool);
    }
}
