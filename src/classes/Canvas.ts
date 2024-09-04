import { ElementRef, inject, Inject } from '@angular/core';
import { Drawing } from './Drawing';
import { Point } from './Point';

import { EventEmitter, Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { FirebaseDrawing } from '../app/firebase-drawing';
import { SelectedTool } from '../app/interfaces/selected-tool';

@Injectable({
    providedIn: 'root',
})
class Canvas {
    // private auth: Auth = inject(Auth);
    // private firestore: Firestore = inject(Firestore);

    public onDrawingComplete: EventEmitter<Drawing> = new EventEmitter<Drawing>();
    public onDrawingUpdate: EventEmitter<Drawing> = new EventEmitter<Drawing>();
    public onClearSelect: EventEmitter<Drawing> = new EventEmitter<Drawing>();

    //-----------------------------------

    private skipCheck: boolean = false;

    private selectedTool: SelectedTool = 'move';

    private isMoving: boolean = false;
    private isDrawing: boolean = false;
    private isErasing: boolean = false;

    private eraserTrail: Point[] = [];

    private canvasScale: number = 1;

    //-----------------------------------

    canvasElementRef: ElementRef | null = null;
    context: CanvasRenderingContext2D | null = null;

    drawings: Drawing[] = [];
    hoveredDrawing: Drawing | null = null;
    selectedDrawing: Drawing | null = null;

    translateX: number = 0;
    translateY: number = 0;

    moveStartX: number = 0;
    moveStartY: number = 0;

    gridSize = 40;

    drawing: Drawing | null = null;

    isMovingDrawing: boolean = false;

    scaleOriginX: number = 0;
    scaleOriginY: number = 0;

    constructor(canvasElementRef: ElementRef, context: CanvasRenderingContext2D) {
        this.canvasElementRef = canvasElementRef;
        this.context = context;
    }

    setTool(tool: SelectedTool) {
        this.selectedTool = tool;
    }

    handleWheel($event: WheelEvent) {
        if (!this.context) return;
        console.log('wheel');

        let SCALE_BY = 1.03;
        const MOUSE_X = $event.offsetX;
        const MOUSE_Y = $event.offsetY;

        if ($event.deltaY < 0) {
            this.canvasScale *= SCALE_BY;
        } else if ($event.deltaY > 0) {
            SCALE_BY = 1 / SCALE_BY;
            this.canvasScale *= SCALE_BY;
        }

        // Reduce the amount of movement
        const dx = MOUSE_X - this.scaleOriginX;
        const dy = MOUSE_Y - this.scaleOriginY;
        this.scaleOriginX += dx * (1 - SCALE_BY);
        this.scaleOriginY += dy * (1 - SCALE_BY);

        this.draw();
    }

    handleMouseDown($event: MouseEvent) {
        console.log('mouse down');

        if (this.selectedTool === 'move') {
            this.skipCheck = false;
            console.log('move tool');
            console.log('move tool');
            console.log('move tool');
            this.isMoving = true;

            this.moveStart($event.offsetX, $event.offsetY);

            this.handleDrawingSelect();

            this.handleAnchorSelect();
        }

        if (this.selectedTool === 'draw') {
            this.isDrawing = true;
        }

        if (this.selectedTool === 'erase') {
            this.isErasing = true;
        }
    }

    handleMouseMove($event: MouseEvent) {
        this.checkHover($event.offsetX, $event.offsetY);

        this.checkHoverAnchor($event.offsetX, $event.offsetY);

        if (this.selectedDrawing) {
            this.handleMoveStart($event.offsetX, $event.offsetY);
            return;
        }

        if (this.isMoving) {
            this.handleMovingCanvas($event.offsetX, $event.offsetY);
            return;
        }

        if (this.isDrawing) {
            this.addPointToDrawing($event.offsetX, $event.offsetY);
            return;
        }

        if (this.isErasing) {
            this.addPointToEraserTrail($event.offsetX, $event.offsetY);

            this.handleErasing();
        }

        // if (this.selectedDrawing === this.hoveredDrawing) {
        //     // this.selectedDrawing?.handleMouseMove($event.offsetX, $event.offsetY);
        //     this.handleSelectedDrawingMouseMove($event.offsetX, $event.offsetY);
        // }
    }

    handleMouseUp($event: MouseEvent) {
        console.log('mouse up');

        if (this.selectedTool === 'move') {
            console.log('here');
            this.isMoving = false;
            this.clearSelected();
        }

        if (this.selectedTool === 'draw') {
            this.isDrawing = false;
            this.addDrawing();
        }
        if (this.selectedTool === 'erase') {
            this.isErasing = false;

            this.clearEraserTrail();
        }
    }

    handleMovingCanvas(x: number, y: number) {
        if (!this.context) return;

        const dx = x - this.moveStartX;
        const dy = y - this.moveStartY;

        this.context.translate(dx, dy);

        this.translateX -= dx;
        this.translateY -= dy;

        this.moveStart(x, y);

        this.draw();
    }

    handleErasing() {
        if (!this.hoveredDrawing) return;

        console.log('erasing');

        console.log(this.hoveredDrawing);

        this.drawings = this.drawings.filter((drawing) => drawing !== this.hoveredDrawing);
    }

    handleMoveStart(x: number, y: number) {
        if (!this.context) return;

        const dx = x - this.moveStartX;
        const dy = y - this.moveStartY;

        // console.log(this.hoveredDrawing);

        if (this.selectedDrawing) {
            this.isMovingDrawing = true;
            this.handleSelectedDrawingMouseMove(dx, dy);
            // this.onDrawingUpdate.emit(this.selectedDrawing);

            // console.log('translate');
        } else if (!this.isMovingDrawing) {
            this.context.translate(dx, dy);
            this.translateX -= dx;
            this.translateY -= dy;
        }

        this.moveStart(x, y);

        this.draw();
        // this.handleDrawingSelect();
    }

    addDrawing() {
        if (!this.drawing) return false;

        this.drawing.finish();
        this.drawings.push(this.drawing!);

        this.onDrawingComplete.emit(this.drawing);

        this.drawing = null;
        return true;
    }

    addPointToDrawing(x: number, y: number) {
        if (!this.drawing) {
            this.drawing = new Drawing();
        }

        this.drawing.addPoint(new Point(x + this.translateX, y + this.translateY));

        this.drawUnfinished();
    }

    addPointToEraserTrail(x: number, y: number) {
        this.eraserTrail.push(new Point(x + this.translateX, y + this.translateY));

        let maxDistance = 8;

        if (this.eraserTrail.length > maxDistance) {
            this.eraserTrail.shift();
        }
    }

    // logDrawings() {
    //     for (const drawing of this.drawings) {
    //         drawing.logDrawing();
    //     }
    // }

    draw() {
        this.clearAndScaleCanvas();

        this.drawGrid();
        this.drawUnfinished();

        for (const drawing of this.drawings) {
            drawing.draw(this.context!, this.translateX, this.translateY);
        }

        this.drawEraserTrail();
    }

    drawUnfinished() {
        if (!this.drawing) return;

        this.drawing.draw(this.context!, this.translateX, this.translateY);
    }

    checkHover(x: number, y: number) {
        // if (this.selectedDrawing) return;

        x = x + this.translateX;
        y = y + this.translateY;

        // this.clearSelected();

        this.hoveredDrawing = null;

        for (let i = this.drawings.length - 1; i >= 0; i--) {
            const drawing = this.drawings[i];
            if (
                x > drawing.bounds.left &&
                x < drawing.bounds.right &&
                y > drawing.bounds.top &&
                y < drawing.bounds.bottom
            ) {
                drawing.isHovered = true;
                this.hoveredDrawing = drawing;
                break;
            } else {
                drawing.isHovered = false;
            }
        }

        // console.log(this.hoveredDrawing?.bounds);
        // console.log(this.hoveredDrawing?.isHovered);
        // console.log('x: ', x, 'y: ', y);

        if (this.hoveredDrawing) {
            this.drawings.forEach((drawing) => {
                if (drawing !== this.hoveredDrawing) {
                    drawing.isHovered = false;
                }
            });
        }
    }

    clearAfterDrawingMove() {
        if (this.selectedDrawing) {
            this.selectedDrawing.clearSelectedAnchor();
        }

        this.selectedDrawing = null;

        console.log('clear after drawing move');
        console.log('clear after drawing move');
        console.log('clear after drawing move');
        console.log('clear after drawing move');
    }

    clearSelected() {
        console.log('-----------------------------------');
        console.log('clear selected');

        if (!this.selectedDrawing) return;

        // console.log(this.selectedDrawing.id);
        // console.log(this.hoveredDrawing?.id);

        // this.onClearSelect.emit(this.selectedDrawing);

        // if (!this.selectedDrawing.isHovered) {

        console.log('selected: ', this.selectedDrawing);

        this.selectedDrawing.handleMouseUp();

        this.selectedDrawing.clearSelectedAnchor();

        this.selectedDrawing.isSelected = false;

        this.selectedDrawing = null;

        this.isMovingDrawing = false;

        console.log('-----------------------------------');
        console.log('selected: ', this.selectedDrawing);
        console.log('selected: ', this.selectedDrawing);
        console.log('-----------------------------------');
        // console.log('clear selected');
        // console.log('clear selected');
        // console.log('clear selected');

        this.skipCheck = true;
    }

    clearEraserTrail() {
        this.eraserTrail = [];
    }

    checkHoverAnchor(x: number, y: number) {
        if (!this.selectedDrawing) return;

        x = x + this.translateX;
        y = y + this.translateY;

        this.selectedDrawing.checkHoverAnchor(x, y);
    }

    handleDrawingSelect() {
        if (this.skipCheck) {
            this.skipCheck = false;
            return;
        }

        if (this.isMovingDrawing) return;

        if (!this.hoveredDrawing) {
            this.clearSelected();
            return;
        }
        if (this.selectedDrawing) this.selectedDrawing.isSelected = false;

        this.hoveredDrawing.isSelected = true;
        this.selectedDrawing = this.hoveredDrawing;

        console.log('selected drawing: ', this.selectedDrawing);
        console.log('selected drawing: ', this.selectedDrawing);
        console.log('selected drawing: ', this.selectedDrawing);
    }

    handleAnchorSelect() {
        if (!this.selectedDrawing) return;
        console.log('anchor select');

        this.selectedDrawing.handleAnchorSelect();
    }

    drawGrid() {
        if (!this.context) return;
        if (!this.canvasElementRef) return;

        this.context.lineWidth = 1;

        const context = this.canvasElementRef.nativeElement.getContext('2d');
        const canvasWidth = this.canvasElementRef.nativeElement.width;
        const canvasHeight = this.canvasElementRef.nativeElement.height;

        if (!context) return;

        this.context.beginPath();
        for (let x = -this.translateX % this.gridSize; x < canvasWidth; x += this.gridSize) {
            context.moveTo(x, 0);
            context.lineTo(x, canvasHeight);
        }
        for (let y = -this.translateY % this.gridSize; y < canvasHeight; y += this.gridSize) {
            context.moveTo(0, y);
            context.lineTo(canvasWidth, y);
        }
        context.strokeStyle = '#ccc';
        context.stroke();

        this.context.beginPath();
        this.context.arc(0 - this.translateX, 0 - this.translateY, 5, 0, 2 * Math.PI);
        context.fillStyle = 'black';
        this.context.fill();
    }

    drawEraserTrail() {
        if (this.eraserTrail.length === 0) return;

        if (!this.context) return;

        this.context.beginPath();

        this.context.moveTo(this.eraserTrail[0].x - this.translateX, this.eraserTrail[0].y - this.translateY);

        this.context.lineCap = 'round';
        this.context.strokeStyle = 'gray';
        this.context.lineWidth = 6;

        for (let i = 1; i < this.eraserTrail.length; i++) {
            this.context.lineTo(
                this.eraserTrail[i].x - this.translateX,
                this.eraserTrail[i].y - this.translateY
            );
        }

        this.context.stroke();
    }

    clearAndScaleCanvas() {
        if (!this.context) return;
        if (!this.canvasElementRef) return;

        this.context.setTransform(1, 0, 0, 1, 0, 0);
        this.context.clearRect(
            0,
            0,
            this.canvasElementRef.nativeElement.width,
            this.canvasElementRef.nativeElement.height
        );

        this.context.setTransform(
            this.canvasScale,
            0,
            0,
            this.canvasScale,
            this.scaleOriginX,
            this.scaleOriginY
        );
    }

    moveStart(x: number, y: number) {
        this.moveStartX = x;
        this.moveStartY = y;
    }

    handleSelectedDrawingMouseMove(x: number, y: number) {
        if (!this.selectedDrawing) return;

        // console.log('move selected drawing');
        // console.log('x: ', x, 'y: ', y);

        this.selectedDrawing.handleMouseMove(x, y);
        this.draw();
    }

    // handleMouseUpSecond() {
    //     if (!this.selectedDrawing) return;

    //     this.isMovingDrawing = false;
    //     this.selectedDrawing.handleMouseUp();

    //     this.onDrawingUpdate.emit(this.selectedDrawing);
    // }

    exportCanvas() {
        for (const drawing of this.drawings) {
            console.log(drawing.exportDrawing());
        }
    }

    handleFirebaseDrawing(drawing: FirebaseDrawing) {
        console.log('Adding drawing from firebase');

        let newDrawing = new Drawing(drawing.id);

        for (const point of drawing.points) {
            newDrawing.addPoint(new Point(point.x, point.y));
        }

        newDrawing.finish();

        this.drawings.push(newDrawing);
    }

    updateDrawing(drawing: FirebaseDrawing) {
        console.log('id: ', drawing.id);

        const drawingIndex = this.drawings.findIndex((d) => d.id === drawing.id);

        if (drawingIndex === -1) {
            console.error('Drawing not found');
            return;
        }

        console.log('Drawing found');
        this.drawings[drawingIndex].updateDrawingPoints(drawing.points);

        this.draw();
    }

    getSelectedTool(): SelectedTool {
        return this.selectedTool;
    }
}

export { Canvas };
