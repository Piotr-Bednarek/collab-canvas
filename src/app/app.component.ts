import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Drawing, Drawings } from './classes';
import exampleDrawings from './example.json';
import { Point } from './interfaces';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
})
export class AppComponent {
    title = 'collab-canvas';

    @ViewChild('canvas') canvas: ElementRef<HTMLCanvasElement> | undefined;
    private context: CanvasRenderingContext2D | null = null;
    private isDrawing: boolean = false;

    private moveStartX: number = 0;
    private moveStartY: number = 0;
    private isMoving: boolean = false;

    private hoveredDrawing: Drawing | null = null;

    private selectedDrawing: Drawing | null = null;

    translateX: number = 0;
    translateY: number = 0;

    points: Point[] = [];

    drawing: Drawing | null = null;
    drawings = new Drawings();

    cursorMode = 'move'; // 'draw' or 'move'

    ngAfterViewInit() {
        if (this.canvas && this.canvas.nativeElement) {
            const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;

            const dpr = window.devicePixelRatio || 1;
            const rect = canvasEl.getBoundingClientRect();

            canvasEl.style.width = rect.width + 'px';
            canvasEl.style.height = rect.height + 'px';

            canvasEl.width = rect.width * dpr;
            canvasEl.height = rect.height * dpr;

            const context = canvasEl.getContext('2d');
            context?.scale(dpr, dpr);

            this.context = context;

            this.applyStyles();

            // ----------------------------

            this.drawGrid();
        }
    }

    applyStyles() {
        if (!this.context) return;

        this.context.strokeStyle = 'black';
        this.context.lineWidth = 3;
        this.context.lineCap = 'round';
    }

    onMouseMove($event: MouseEvent) {
        // console.table({
        //     x: $event.offsetX,
        //     y: $event.offsetY,
        //     x2: this.translateX,
        //     y2: this.translateY,
        // });

        this.handleMouseHoverCheck($event);
        if (this.cursorMode === 'move') {
            if (!this.isMoving) return;

            const dx = $event.offsetX - this.moveStartX;
            const dy = $event.offsetY - this.moveStartY;

            // console.log(this.translateX, this.translateY, dx, dy);

            // this.context?.translate(dx, dy);

            console.log(
                'mouseX: ',
                $event.offsetX + this.translateX,
                'mouseY: ',
                $event.offsetY + this.translateY
            );
            this.translateCanvas(dx, dy);

            this.moveStartX = $event.offsetX;
            this.moveStartY = $event.offsetY;
        }

        if (!this.isDrawing) return;

        if (!this.drawing) return;

        this.applyStyles();

        let point: Point = {
            x: $event.offsetX + this.translateX,
            y: $event.offsetY + this.translateY,
        };

        // this.points?.push(point);

        this.drawing.addPoint(point);
        this.drawing.draw(this.context!, this.translateX, this.translateY);
        // this.draw();
        // this.redrawCanvas();

        // this.redrawCanvas();

        // console.log(this.points);
    }

    onMouseDown($event: MouseEvent) {
        if (this.cursorMode === 'move') {
            this.moveStartX = $event.offsetX;
            this.moveStartY = $event.offsetY;
            this.isMoving = true;
        } else if (this.cursorMode === 'draw') {
            this.isDrawing = true;

            this.drawing = new Drawing();

            // this.context?.beginPath();
            // this.context?.moveTo($event.offsetX, $event.offsetY);
        }
    }

    onMouseUp($event: MouseEvent) {
        if (this.cursorMode === 'move') {
            this.isMoving = false;
        } else if (this.cursorMode === 'draw') {
            this.isDrawing = false;

            this.addDrawing();

            // console.log(this.drawings);
        }
    }

    onClick($event: MouseEvent) {
        console.log('Click');
        this.handleMouseSelect();
    }

    addDrawing() {
        if (!this.drawing) return;

        this.drawings.addDrawing(this.drawing);
        this.drawing.finished = true;

        this.drawing.drawRectangle(
            this.context!,
            this.translateX,
            this.translateY
        );

        this.drawings.logDrawings();
    }

    handleImport() {
        console.log('Importing drawings');

        // this.drawings.logDrawings();
        // this.drawings.drawings = exampleDrawings;

        // this.drawImportedDrawings();

        // console.log(exampleDrawings);
    }

    draw() {
        this.applyStyles();

        this.drawings.draw(this.context!, this.translateX, this.translateY);
    }

    handleCursorModeSwitch() {
        this.cursorMode = this.cursorMode === 'move' ? 'draw' : 'move';
    }

    clearCanvas() {
        if (!this.context) return;

        // console.log('Clearing canvas');

        this.context.setTransform(1, 0, 0, 1, 0, 0); // Reset transformation matrix to the default state
        this.context.clearRect(
            0,
            0,
            this.canvas!.nativeElement.width,
            this.canvas!.nativeElement.height
        );
    }

    drawGrid() {
        const gridSize = 40;

        const context = this.canvas!.nativeElement.getContext('2d');
        const canvasWidth = this.canvas!.nativeElement.width;
        const canvasHeight = this.canvas!.nativeElement.height;

        if (!context) return;

        this.context?.beginPath();
        for (
            let x = -this.translateX % gridSize;
            x < canvasWidth;
            x += gridSize
        ) {
            context.moveTo(x, 0);
            context.lineTo(x, canvasHeight);
        }
        for (
            let y = -this.translateY % gridSize;
            y < canvasHeight;
            y += gridSize
        ) {
            context.moveTo(0, y);
            context.lineTo(canvasWidth, y);
        }
        context.strokeStyle = '#ccc';
        context.stroke();

        this.context?.beginPath();
        this.context?.arc(
            0 - this.translateX,
            0 - this.translateY,
            5,
            0,
            2 * Math.PI
        );
        context.fillStyle = 'black';
        this.context?.fill();
    }

    translateCanvas(dx: number, dy: number) {
        if (!this.context) return;

        this.context.translate(dx, dy);

        this.translateX -= dx;
        this.translateY -= dy;

        // console.log('Translating canvas');
        // console.log('tX: ', this.translateX, 'tY: ', this.translateY);
        // console.log('dx: ', dx, 'dy: ', dy);
        // console.log(
        //     'moveStartX: ',
        //     this.moveStartX,
        //     'moveStartY: ',
        //     this.moveStartY
        // );

        this.redrawCanvas();
    }

    redrawCanvas() {
        this.clearCanvas();

        // this.drawGrid();

        // this.drawImportedDrawings();
        this.draw();
    }

    handleMouseHoverCheck($event: MouseEvent) {
        console.log('Checking hover');
        this.drawings.checkHover(
            $event.offsetX + this.translateX,
            $event.offsetY + this.translateY
        );

        this.redrawCanvas();

        // console.log('tX: ', this.translateX, 'tY: ', this.translateY);
    }

    handleMouseSelect() {
        console.log('Selecting drawing');

        this.drawings.handleDrawingSelect();

        this.redrawCanvas();
    }

    @HostListener('window:keydown.1', ['$event'])
    changeCursorToDraw() {
        this.cursorMode = 'draw';
    }

    @HostListener('window:keydown.2', ['$event'])
    changeCursorToMove() {
        this.cursorMode = 'move';
    }
}
