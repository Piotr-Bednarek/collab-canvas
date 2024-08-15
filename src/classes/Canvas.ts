import { ElementRef, Inject } from '@angular/core';
import { Drawing } from './Drawing';
import { Point } from './Point';

import { EventEmitter, Injectable } from '@angular/core';
import { FirebaseDrawing } from '../app/firebase-drawing';

@Injectable({
    providedIn: 'root',
})
class Canvas {
    public onDrawingComplete: EventEmitter<Drawing> = new EventEmitter<Drawing>();
    public onDrawingUpdate: EventEmitter<Drawing> = new EventEmitter<Drawing>();
    public onClearSelect: EventEmitter<Drawing> = new EventEmitter<Drawing>();

    canvasElementRef: ElementRef | null = null;
    context: CanvasRenderingContext2D | null = null;

    drawings: Drawing[];
    hoveredDrawing: Drawing | null = null;
    selectedDrawing: Drawing | null = null;

    translateX: number = 0;
    translateY: number = 0;

    moveStartX: number = 0;
    moveStartY: number = 0;

    gridSize = 40;

    drawing: Drawing | null = null;

    isMovingDrawing: boolean = false;

    constructor(
        @Inject(Drawing) drawings: Drawing[] = [],
        canvasElementRef: ElementRef,
        context: CanvasRenderingContext2D
    ) {
        this.drawings = drawings;
        this.canvasElementRef = canvasElementRef;
        this.context = context;
    }

    async addDrawing() {
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

    // logDrawings() {
    //     for (const drawing of this.drawings) {
    //         drawing.logDrawing();
    //     }
    // }

    draw() {
        this.clear();

        this.drawGrid();
        this.drawUnfinished();

        for (const drawing of this.drawings) {
            drawing.draw(this.context!, this.translateX, this.translateY);
        }
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

    clearSelected() {
        // console.log('selected: ', this.selectedDrawing);
        // console.log('hovered: ', this.hoveredDrawing);

        if (!this.selectedDrawing) return;

        if (this.selectedDrawing === this.hoveredDrawing) return;

        this.onClearSelect.emit(this.selectedDrawing);

        // if (!this.selectedDrawing.isHovered) {
        this.selectedDrawing.isSelected = false;
        this.selectedDrawing.clearSelectedAnchor();
        this.selectedDrawing = null;

        // }

        // this.selectedDrawing.isSelected = false;
    }

    checkHoverAnchor(x: number, y: number) {
        if (!this.hoveredDrawing) return;

        x = x + this.translateX;
        y = y + this.translateY;

        this.hoveredDrawing.checkHoverAnchor(x, y);
    }

    handleDrawingSelect() {
        if (this.isMovingDrawing) return;

        if (!this.hoveredDrawing) {
            this.clearSelected();
            return;
        }
        if (this.selectedDrawing) this.selectedDrawing.isSelected = false;

        this.hoveredDrawing.isSelected = true;
        this.selectedDrawing = this.hoveredDrawing;
    }

    handleAnchorSelect() {
        if (!this.hoveredDrawing) return;

        this.hoveredDrawing.handleAnchorSelect();
    }

    drawGrid() {
        this.context!.lineWidth = 1;

        const context = this.canvasElementRef!.nativeElement.getContext('2d');
        const canvasWidth = this.canvasElementRef!.nativeElement.width;
        const canvasHeight = this.canvasElementRef!.nativeElement.height;

        if (!context) return;

        this.context?.beginPath();
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

        this.context?.beginPath();
        this.context?.arc(0 - this.translateX, 0 - this.translateY, 5, 0, 2 * Math.PI);
        context.fillStyle = 'black';
        this.context?.fill();
    }

    clear() {
        this.context?.setTransform(1, 0, 0, 1, 0, 0);
        this.context?.clearRect(
            0,
            0,
            this.canvasElementRef!.nativeElement.width,
            this.canvasElementRef!.nativeElement.height
        );
    }

    handleMouseMove(x: number, y: number) {
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
        this.handleDrawingSelect();
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

    handleMouseUp() {
        if (!this.selectedDrawing) return;

        this.isMovingDrawing = false;
        this.selectedDrawing.handleMouseUp();

        this.onDrawingUpdate.emit(this.selectedDrawing);
    }

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
}

export { Canvas };
