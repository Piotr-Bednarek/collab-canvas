import { ElementRef, inject, Inject } from '@angular/core';
import { Drawing } from './Drawing';
import { Eraser } from './Eraser';
import { Grid } from './Grid';
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

    // public onDrawingComplete: EventEmitter<Drawing> = new EventEmitter<Drawing>();
    // public onDrawingUpdate: EventEmitter<Drawing> = new EventEmitter<Drawing>();
    // public onClearSelect: EventEmitter<Drawing> = new EventEmitter<Drawing>();

    //-----------------------------------

    private skipCheck: boolean = false;

    private selectedTool: SelectedTool = 'move';

    private isMoving: boolean = false;
    private isDrawing: boolean = false;
    private isErasing: boolean = false;

    private canvasScale: number = 1;

    private canvasScaleMin: number = 0.2;
    private canvasScaleMax: number = 4;

    private SCALE_BY = 1.05;

    //-----------------------------------

    canvasElementRef: ElementRef | null = null;
    context: CanvasRenderingContext2D | null = null;

    grid: Grid | null = null;
    eraser: Eraser | null = null;

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
        this.grid = new Grid('lines', 1, 'black', 0.2, this.gridSize);

        this.eraser = new Eraser([]);
    }

    setTool(tool: SelectedTool) {
        this.selectedTool = tool;
    }

    handleCtrlWheel($event: WheelEvent) {
        if (!this.context) return;

        const mouseX = $event.offsetX;
        const mouseY = $event.offsetY;

        let scaleBy = this.SCALE_BY;
        if ($event.deltaY > 0) {
            scaleBy = 1 / this.SCALE_BY;
        }

        this.calculateZoomValue(mouseX, mouseY, scaleBy);
    }

    calculateZoomValue(originX: number, originY: number, scaleBy: number) {
        const dx = originX - this.scaleOriginX;
        const dy = originY - this.scaleOriginY;

        // Calculate the new scale
        let newScale = this.canvasScale * scaleBy;

        // Clamp the new scale between canvasScaleMin and canvasScaleMax
        if (newScale < this.canvasScaleMin) {
            newScale = this.canvasScaleMin;
        } else if (newScale > this.canvasScaleMax) {
            newScale = this.canvasScaleMax;
        }

        // Adjust the scale origin based on the clamped scale
        this.scaleOriginX += dx * (1 - newScale / this.canvasScale);
        this.scaleOriginY += dy * (1 - newScale / this.canvasScale);

        // Update the canvas scale
        this.canvasScale = newScale;

        // Redraw the canvas
        this.draw();
    }

    handleMouseDown($event: MouseEvent) {
        console.log('mouse down');

        if (this.selectedTool === 'move') {
            // this.skipCheck = false;
            console.log('move tool');
            console.log('move tool');
            console.log('move tool');
            this.isMoving = true;

            this.moveStart($event.offsetX, $event.offsetY);

            // this.handleDrawingSelect();

            // this.handleAnchorSelect();
        }

        if (this.selectedTool === 'select') {
            this.skipCheck = false;

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
            this.addPointToEraser($event.offsetX, $event.offsetY);

            this.handleErasing();
        }
    }

    handleMouseUp($event: MouseEvent) {
        // console.log('mouse up');

        if (this.selectedTool === 'move') {
            // console.log('here');
            this.isMoving = false;
            // this.clearSelected();
        }

        if (this.selectedTool === 'select') {
            this.isMoving = false;
            this.clearSelected();
        }

        if (this.selectedTool === 'draw') {
            this.isDrawing = false;
            this.addDrawing();
        }
        if (this.selectedTool === 'erase') {
            this.isErasing = false;

            this.eraser?.clearPoints();
        }
    }

    handleMovingCanvas(x: number, y: number) {
        if (!this.context) return;

        // console.log('moving canvas');
        // console.log('scale: ', this.canvasScale);

        // console.log('move start x: ', this.moveStartX, 'move start y: ', this.moveStartY);
        // console.log('x: ', x, 'y: ', y);

        const dx = x - this.moveStartX;
        const dy = y - this.moveStartY;

        // console.log('dx: ', dx, 'dy: ', dy);

        this.context.translate(dx, dy);

        this.translateX -= dx / this.canvasScale;
        this.translateY -= dy / this.canvasScale;

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

        // const dx = (x - this.moveStartX * this.canvasScale) * this.canvasScale;
        // const dy = (y - this.moveStartY * this.canvasScale) * this.canvasScale;

        const dx = x - this.moveStartX * this.canvasScale;
        const dy = y - this.moveStartY * this.canvasScale;

        // console.log(this.hoveredDrawing);

        if (this.selectedDrawing) {
            this.isMovingDrawing = true;
            this.handleMouseMoveSelectedDrawing(dx, dy);
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

    moveStart(x: number, y: number) {
        this.moveStartX = x;
        this.moveStartY = y;
    }

    addDrawing() {
        if (!this.drawing) return false;

        this.drawing.finish();
        this.drawings.push(this.drawing!);

        // this.onDrawingComplete.emit(this.drawing);

        this.drawing = null;
        return true;
    }

    addPointToDrawing(x: number, y: number) {
        if (!this.drawing) {
            this.drawing = new Drawing();
        }

        // Apply translation and scaling to get the correct point
        const scaledX = (x - this.scaleOriginX) / this.canvasScale + this.translateX;
        const scaledY = (y - this.scaleOriginY) / this.canvasScale + this.translateY;

        // Debugging for transformed points
        console.log('scaled x: ', scaledX, 'scaled y: ', scaledY);

        // Add the transformed point to the drawing
        this.drawing.addPoint(new Point(scaledX, scaledY));

        this.drawUnfinished();
    }

    addPointToEraser(x: number, y: number) {
        if (!this.eraser) return;

        const scaledX = (x - this.scaleOriginX) / this.canvasScale + this.translateX;
        const scaledY = (y - this.scaleOriginY) / this.canvasScale + this.translateY;

        this.eraser.addPoint(new Point(scaledX, scaledY));
    }

    draw() {
        this.clearAndScaleCanvas();
        this.grid?.draw(
            this.context!,
            this.translateX,
            this.translateY,
            this.canvasScale,
            this.scaleOriginX,
            this.scaleOriginY
        );

        this.drawUnfinished();

        for (const drawing of this.drawings) {
            drawing.draw(this.context!, this.translateX, this.translateY);
        }

        this.eraser?.draw(this.context!, this.translateX, this.translateY);
    }

    drawUnfinished() {
        if (!this.drawing) return;

        this.drawing.draw(this.context!, this.translateX, this.translateY);
    }

    checkHover(x: number, y: number) {
        // Adjust for translation and scaling
        const transformedX = (x - this.scaleOriginX) / this.canvasScale + this.translateX;
        const transformedY = (y - this.scaleOriginY) / this.canvasScale + this.translateY;

        this.hoveredDrawing = null;

        for (let i = this.drawings.length - 1; i >= 0; i--) {
            const drawing = this.drawings[i];
            if (
                transformedX > drawing.bounds.left &&
                transformedX < drawing.bounds.right &&
                transformedY > drawing.bounds.top &&
                transformedY < drawing.bounds.bottom
            ) {
                drawing.isHovered = true;
                this.hoveredDrawing = drawing;
                break;
            } else {
                drawing.isHovered = false;
            }
        }

        if (this.hoveredDrawing) {
            this.drawings.forEach((drawing) => {
                if (drawing !== this.hoveredDrawing) {
                    drawing.isHovered = false;
                }
            });
        }
    }

    checkHoverAnchor(x: number, y: number) {
        if (!this.selectedDrawing) return;

        // Adjust for translation and scaling
        const transformedX = (x - this.scaleOriginX) / this.canvasScale + this.translateX;
        const transformedY = (y - this.scaleOriginY) / this.canvasScale + this.translateY;

        this.selectedDrawing.checkHoverAnchor(transformedX, transformedY);
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

    handleMouseMoveSelectedDrawing(x: number, y: number) {
        if (!this.selectedDrawing) return;

        this.selectedDrawing.handleMouseMove(x, y);
        this.draw();
    }

    // handleMouseUpSecond() {
    //     if (!this.selectedDrawing) return;

    //     this.isMovingDrawing = false;
    //     this.selectedDrawing.handleMouseUp();

    //     // this.onDrawingUpdate.emit(this.selectedDrawing);
    // }

    exportCanvas() {
        for (const drawing of this.drawings) {
            console.log(drawing.exportDrawing());
        }
    }

    // handleFirebaseDrawing(drawing: FirebaseDrawing) {
    //     console.log('Adding drawing from firebase');

    //     let newDrawing = new Drawing(drawing.id);

    //     for (const point of drawing.points) {
    //         newDrawing.addPoint(new Point(point.x, point.y));
    //     }

    //     newDrawing.finish();

    //     this.drawings.push(newDrawing);
    // }

    // updateDrawing(drawing: FirebaseDrawing) {
    //     console.log('id: ', drawing.id);

    //     const drawingIndex = this.drawings.findIndex((d) => d.id === drawing.id);

    //     if (drawingIndex === -1) {
    //         console.error('Drawing not found');
    //         return;
    //     }

    //     console.log('Drawing found');
    //     this.drawings[drawingIndex].updateDrawingPoints(drawing.points);

    //     this.draw();
    // }

    getSelectedTool(): SelectedTool {
        return this.selectedTool;
    }

    getZoomValue(): string {
        // console.log('zoom value: ', this.canvasScale.toFixed(2));

        return this.canvasScale.toFixed(2);
    }

    resetScale() {
        this.scaleOriginX = this.translateX * (1 - this.canvasScale);
        this.scaleOriginY = this.translateY * (1 - this.canvasScale);

        this.canvasScale = 1;

        this.draw();
    }

    zoomOut() {
        const canvasWidth = this.canvasElementRef?.nativeElement.width || 0;
        const canvasHeight = this.canvasElementRef?.nativeElement.height || 0;
        this.calculateZoomValue(canvasWidth / 2, canvasHeight / 2, 1 / this.SCALE_BY / 1.5);
    }

    zoomIn() {
        const canvasWidth = this.canvasElementRef?.nativeElement.width || 0;
        const canvasHeight = this.canvasElementRef?.nativeElement.height || 0;
        this.calculateZoomValue(canvasWidth / 2, canvasHeight / 2, this.SCALE_BY * 1.5);
    }
}

export { Canvas };
