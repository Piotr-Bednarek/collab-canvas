import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Canvas } from './classes/Canvas';
import { Drawing } from './classes/Drawing';
import { Point } from './classes/Point';
import exampleDrawings from './example.json';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
})
export class AppComponent {
    title = 'collab-canvas';

    @ViewChild('canvas') canvasElementRef:
        | ElementRef<HTMLCanvasElement>
        | undefined;
    private context: CanvasRenderingContext2D | null = null;
    private isDrawing: boolean = false;

    private moveStartX: number = 0;
    private moveStartY: number = 0;
    private isMoving: boolean = false;

    // private translateX: number = 0;
    // private translateY: number = 0;

    // drawing: Drawing | null = null;
    canvas: Canvas | null = null;

    cursorMode = 'move'; // 'draw' or 'move'

    private lastMouseMoveEvent: MouseEvent | null = null;
    isThrottled: any;

    ngAfterViewInit() {
        if (this.canvasElementRef && this.canvasElementRef.nativeElement) {
            const canvasEl: HTMLCanvasElement =
                this.canvasElementRef.nativeElement;

            const dpr = window.devicePixelRatio || 1;
            const rect = canvasEl.getBoundingClientRect();

            canvasEl.style.width = rect.width + 'px';
            canvasEl.style.height = rect.height + 'px';

            canvasEl.width = rect.width * dpr;
            canvasEl.height = rect.height * dpr;

            const context = canvasEl.getContext('2d');
            context?.scale(dpr, dpr);

            this.context = context;

            // this.applyStyles();

            // ----------------------------

            // this.drawGrid();
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

            const dx = $event.offsetX - this.moveStartX;
            const dy = $event.offsetY - this.moveStartY;

            // this.translateCanvas(dx, dy);
            this.canvas?.translateCanvas(dx, dy);

            this.moveStartX = $event.offsetX;
            this.moveStartY = $event.offsetY;
        }

        if (!this.isDrawing) return;

        // if (!this.drawing) retur1n;

        // this.applyStyles();

        this.canvas?.addPointToDrawing($event.offsetX, $event.offsetY);

        // this.drawing.addPoint(
        //     new Point(
        //         $event.offsetX + this.translateX,
        //         $event.offsetY + this.translateY
        //     )
        // );
        this.canvas?.drawUnfinished();
    }

    onMouseDown($event: MouseEvent) {
        if (!this.canvas) return;

        if (this.cursorMode === 'move') {
            this.moveStartX = $event.offsetX;
            this.moveStartY = $event.offsetY;
            this.isMoving = true;
        } else if (this.cursorMode === 'draw') {
            this.isDrawing = true;
            console.log('Mouse down');

            // this.drawing = new Drawing();

            // this.context?.beginPath();
            // this.context?.moveTo($event.offsetX, $event.offsetY);
        }

        this.canvas.clearSelected();
        this.handleMouseHoverCheck($event);
    }

    onMouseUp($event: MouseEvent) {
        if (this.cursorMode === 'move') {
            this.isMoving = false;
        } else if (this.cursorMode === 'draw') {
            this.isDrawing = false;

            // this.addDrawing();
            this.canvas?.addDrawing();

            // con1sole.log(this.drawings);
        }
    }

    onClick($event: MouseEvent) {
        console.log('Click');
        this.handleMouseSelect();
    }

    // addDrawing() {
    //     if (!this.canvas) return;
    //     if (!this.drawing) return;

    //     this.canvas.addDrawing(this.drawing);
    //     this.drawing.finished = true;

    //     // this.drawing.drawBoundsRectangle(
    //     // this.context!
    //     // this.translateX,
    //     // this.translateY
    //     // );

    //     this.canvas.logDrawings();
    // }

    handleImport() {
        console.log('Importing drawings');

        // this.drawings.logDrawings();
        // this.drawings.drawings = exampleDrawings;

        // this.drawImportedDrawings();

        // console.log(exampleDrawings);
    }

    handleCursorModeSwitch() {
        this.cursorMode = this.cursorMode === 'move' ? 'draw' : 'move';
    }

    // clearCanvas() {
    //     if (!this.context) return;

    //     // console.log('Clearing canvas');

    //     this.context.setTransform(1, 0, 0, 1, 0, 0); // Reset transformation matrix to the default state
    //     this.context.clearRect(
    //         0,
    //         0,
    //         this.canvasElementRef!.nativeElement.width,
    //         this.canvasElementRef!.nativeElement.height
    //     );
    // }

    // drawGrid() {
    //     const gridSize = 40;

    //     const context = this.canvasElementRef!.nativeElement.getContext('2d');
    //     const canvasWidth = this.canvasElementRef!.nativeElement.width;
    //     const canvasHeight = this.canvasElementRef!.nativeElement.height;

    //     if (!context) return;

    //     this.context?.beginPath();
    //     for (
    //         let x = -this.translateX % gridSize;
    //         x < canvasWidth;
    //         x += gridSize
    //     ) {
    //         context.moveTo(x, 0);
    //         context.lineTo(x, canvasHeight);
    //     }
    //     for (
    //         let y = -this.translateY % gridSize;
    //         y < canvasHeight;
    //         y += gridSize
    //     ) {
    //         context.moveTo(0, y);
    //         context.lineTo(canvasWidth, y);
    //     }
    //     context.strokeStyle = '#ccc';
    //     context.stroke();

    //     this.context?.beginPath();
    //     this.context?.arc(
    //         0 - this.translateX,
    //         0 - this.translateY,
    //         5,
    //         0,
    //         2 * Math.PI
    //     );
    //     context.fillStyle = 'black';
    //     this.context?.fill();
    // }

    // translateCanvas(dx: number, dy: number) {
    //     if (!this.context) return;

    //     this.context.translate(dx, dy);

    //     this.translateX -= dx;12
    //     this.translateY -= dy;

    //     this.canvas?.updateTranslate(dx, dy);

    //     this.redrawCanvas();
    // }

    // applyStyles() {
    //     if (!this.context) return;

    //     this.context.strokeStyle = 'black';
    //     this.context.lineWidth = 3;
    //     this.context.lineCap = 'round';
    // }

    handleMouseHoverCheck($event: MouseEvent) {
        if (!this.canvas) return;

        this.canvas.checkHover($event.offsetX, $event.offsetY);

        this.canvas?.draw();
    }

    handleMouseSelect() {
        if (!this.canvas) return;

        this.canvas.handleDrawingSelect();

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
