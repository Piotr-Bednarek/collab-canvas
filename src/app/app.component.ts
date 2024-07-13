import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Canvas } from './classes/Canvas';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
})
export class AppComponent {
    title = 'collab-canvas';

    @ViewChild('canvas') canvasElementRef: ElementRef<HTMLCanvasElement> | undefined;
    private context: CanvasRenderingContext2D | null = null;
    canvas: Canvas | null = null;

    // private moveStartX: number = 0;
    // private moveStartY: number = 0;

    private lastMouseMoveEvent: MouseEvent | null = null;
    isThrottled: any;

    private isDrawing: boolean = false;
    private isMoving: boolean = false;

    cursorMode = 'move'; // 'draw' or 'move'

    ngAfterViewInit() {
        if (this.canvasElementRef && this.canvasElementRef.nativeElement) {
            const canvasEl: HTMLCanvasElement = this.canvasElementRef.nativeElement;

            const dpr = window.devicePixelRatio || 1;
            const rect = canvasEl.getBoundingClientRect();

            canvasEl.style.width = rect.width + 'px';
            canvasEl.style.height = rect.height + 'px';

            canvasEl.width = rect.width * dpr;
            canvasEl.height = rect.height * dpr;

            const context = canvasEl.getContext('2d');
            context?.scale(dpr, dpr);

            this.context = context;
        }
        this.canvas = new Canvas([], this.canvasElementRef!, this.context!);

        this.canvas.draw();
    }

    onMouseMove($event: MouseEvent) {
        this.lastMouseMoveEvent = $event;
        if (!this.isThrottled) {
            this.isThrottled = true;
            window.requestAnimationFrame(() => {
                this.handleMouseMove(this.lastMouseMoveEvent);
                this.isThrottled = false;
            });
        }
    }

    private handleMouseMove($event: MouseEvent | null) {
        if (!$event) return;

        this.handleMouseHoverCheck($event);
        if (this.cursorMode === 'move') {
            if (!this.isMoving) return;

            // const dx = $event.offsetX - this.moveStartX;
            // const dy = $event.offsetY - this.moveStartY;

            // this.translateCanvas(dx, dy);
            this.canvas?.handleMouseMove($event.offsetX, $event.offsetY);

            // this.moveStartX = $event.offsetX;
            // this.moveStartY = $event.offsetY;
        }

        if (!this.isDrawing) return;

        this.canvas?.addPointToDrawing($event.offsetX, $event.offsetY);

        this.canvas?.drawUnfinished();
    }

    onMouseDown($event: MouseEvent) {
        // console.log('Mouse down');
        if (!this.canvas) return;

        if (this.cursorMode === 'move') {
            this.canvas.moveStart($event.offsetX, $event.offsetY);

            // this.moveStartX = $event.offsetX;
            // this.moveStartY = $event.offsetY;
            this.isMoving = true;
            this.handleMouseHoverCheck($event);
            this.handleMouseSelect();
        } else if (this.cursorMode === 'draw') {
            this.isDrawing = true;
            this.canvas?.handleDrawingSelect();
        }
        // this.canvas.clearSelected();
    }

    onMouseUp($event: MouseEvent) {
        // console.log('Mouse up');
        if (this.cursorMode === 'move') {
            this.isMoving = false;
            this.canvas?.handleMouseUp();
        } else if (this.cursorMode === 'draw') {
            // console.log(this.isDrawing);
            if (this.canvas?.addDrawing()) {
                console.log('Drawing added');
                this.isDrawing = false;
            } else {
                this.isDrawing = false;
            }
        }
    }

    onClick($event: MouseEvent) {
        // console.log('Click');
        if (this.cursorMode === 'draw') return;

        this.handleMouseSelect();
    }

    handleCursorModeSwitch() {
        this.cursorMode = this.cursorMode === 'move' ? 'draw' : 'move';
    }

    handleMouseHoverCheck($event: MouseEvent) {
        if (!this.canvas) return;

        this.canvas.checkHover($event.offsetX, $event.offsetY);
        this.canvas.checkHoverAnchor($event.offsetX, $event.offsetY);

        this.canvas?.draw();
    }

    handleMouseSelect() {
        if (!this.canvas) return;

        this.canvas.handleDrawingSelect();
        this.canvas.handleAnchorSelect();

        this.canvas?.draw();
    }

    @HostListener('window:keydown.1', ['$event'])
    changeCursorToDraw() {
        this.cursorMode = 'draw';
    }

    @HostListener('window:keydown.2', ['$event'])
    changeCursorToMove() {
        this.cursorMode = 'move';
    }

    @HostListener('contextmenu', ['$event'])
    onRightClick($event: MouseEvent) {
        $event.preventDefault();
    }
}
