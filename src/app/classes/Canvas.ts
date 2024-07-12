import { ElementRef } from '@angular/core';
import { Drawing } from './Drawing';
import { Point } from './Point';

class Canvas {
    canvasElementRef: ElementRef | null = null;
    context: CanvasRenderingContext2D | null = null;

    drawings: Drawing[];
    hoveredDrawing: Drawing | null = null;
    selectedDrawing: Drawing | null = null;

    translateX: number = 0;
    translateY: number = 0;

    gridSize = 40;

    drawing: Drawing | null = null;

    constructor(
        drawings: Drawing[] = [],
        canvasElementRef: ElementRef,
        context: CanvasRenderingContext2D
    ) {
        this.drawings = drawings;
        this.canvasElementRef = canvasElementRef;
        this.context = context;
    }

    addDrawing() {
        this.drawing?.finish();
        this.drawings.push(this.drawing!);

        this.drawing = null;

        console.log('Drawing added');
        console.log('Drawings:', this.drawings);
    }

    addPointToDrawing(x: number, y: number) {
        if (!this.drawing) {
            this.drawing = new Drawing();
        }

        this.drawing.addPoint(
            new Point(x + this.translateX, y + this.translateY)
        );

        this.drawUnfinished();
    }

    // this.drawing.addPoint(
    //         new Point(
    //             $event.offsetX + this.translateX,
    //             $event.offsetY + this.translateY
    //         )
    //     );

    logDrawings() {
        for (const drawing of this.drawings) {
            drawing.logDrawing();
        }
    }

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
        if (this.selectedDrawing) return;

        x = x + this.translateX;
        y = y + this.translateY;

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

        console.log(this.hoveredDrawing?.bounds);
        console.log(this.hoveredDrawing?.isHovered);
        console.log('x: ', x, 'y: ', y);

        if (this.hoveredDrawing) {
            this.drawings.forEach((d) => {
                if (d !== this.hoveredDrawing) d.isHovered = false;
            });
        }
    }

    handleDrawingSelect() {
        if (this.hoveredDrawing) {
            this.hoveredDrawing.isSelected = true;
            this.selectedDrawing = this.hoveredDrawing;
        }
    }

    clearSelected() {
        if (this.selectedDrawing) {
            this.selectedDrawing.isSelected = false;
            this.selectedDrawing = null;
        }
    }

    drawGrid() {
        this.context!.lineWidth = 1;

        const context = this.canvasElementRef!.nativeElement.getContext('2d');
        const canvasWidth = this.canvasElementRef!.nativeElement.width;
        const canvasHeight = this.canvasElementRef!.nativeElement.height;

        if (!context) return;

        this.context?.beginPath();
        for (
            let x = -this.translateX % this.gridSize;
            x < canvasWidth;
            x += this.gridSize
        ) {
            context.moveTo(x, 0);
            context.lineTo(x, canvasHeight);
        }
        for (
            let y = -this.translateY % this.gridSize;
            y < canvasHeight;
            y += this.gridSize
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

    updateTranslate(dx: number, dy: number) {
        this.translateX -= dx;
        this.translateY -= dy;
    }

    clear() {
        // console.log('clearing');
        this.context?.setTransform(1, 0, 0, 1, 0, 0); // Reset transformation matrix to the default state
        this.context?.clearRect(
            0,
            0,
            this.canvasElementRef!.nativeElement.width,
            this.canvasElementRef!.nativeElement.height
        );
    }

    translateCanvas(dx: number, dy: number) {
        if (!this.context) return;

        this.context.translate(dx, dy);

        this.translateX -= dx;
        this.translateY -= dy;

        this.updateTranslate(dx, dy);

        this.draw();
    }
}

export { Canvas };
