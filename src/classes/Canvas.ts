import { CSP_NONCE, ElementRef, inject, Inject } from '@angular/core';
import { Drawing } from './Drawing';
import { Eraser } from './Eraser';
import { Grid } from './Grid';
import { Point } from './Point';

import { EventEmitter, Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { FirebaseDrawing } from '../app/firebase-drawing';
import { DrawingType } from '../app/interfaces/drawing';
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

    public canChangeTool: EventEmitter<boolean> = new EventEmitter<boolean>();

    //-----------------------------------

    private selectedTool: SelectedTool = 'move';

    private selectedThickness: number = 7;
    private selectedColor: string = '#000000';
    private selectedFillColor: string = '#FFFFFF';

    private selectedDrawingType: DrawingType = 'freehand';

    //-----------------------------------

    private isMoving: boolean = false;
    private isDrawing: boolean = false;
    private isErasing: boolean = false;

    private canvasScale: number = 1;

    private canvasScaleMin: number = 0.2;
    private canvasScaleMax: number = 30;

    private SCALE_BY = 1.05;

    private WHEEL_PAN_SPEED = 30;
    private skipCheck: boolean = false;

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

        this.draw();
        // this.addImageDrawing(
        //     'https://cdn.butternutbox.com/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBNVA1QXc9PSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9pZCJ9fQ==--a42522a8f65749f2fdd73d24a3edaa34f1d952de/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdCem9MWm05eWJXRjBPZ2wzWldKd09oSnlaWE5wZW1WZmRHOWZabWwwV3dkcEFyQUVhUUpZQWc9PSIsImV4cCI6bnVsbCwicHVyIjoidmFyaWF0aW9uIn19--b8ee90cfb113b226e9fc6ead29dc293e599be6e5/pexels-pixabay-532310.jpg'
        // );
    }

    setTool(tool: SelectedTool) {
        this.selectedTool = tool;

        this.clearSelected();

        this.evaluateSelectedDrawingType(tool);

        this.draw();
    }

    evaluateSelectedDrawingType(tool: SelectedTool) {
        if (tool === 'draw') {
            this.selectedDrawingType = 'freehand';
        }

        if (tool === 'line') {
            this.selectedDrawingType = 'line';
        }

        if (tool === 'rectangle') {
            this.selectedDrawingType = 'rectangle';
        }

        if (tool === 'ellipse') {
            this.selectedDrawingType = 'ellipse';
        }

        if (tool === 'text_field') {
            this.selectedDrawingType = 'text_field';
        }

        // console.log('selected drawing type: ', this.selectedDrawingType);

        // if (tool === 'image') {
        //     this.selectedDrawingType = 'image';
        // }
    }

    setThickness(thickness: number) {
        this.selectedThickness = thickness;

        if (this.selectedDrawing) {
            this.selectedDrawing.setThickness(thickness);

            this.draw();
        }
    }

    setColor(color: string) {
        this.selectedColor = color;

        console.log('color: ', color);

        if (this.selectedDrawing) {
            this.selectedDrawing.setColor(color);

            this.draw();
        }
    }

    setFillColor(color: string) {
        this.selectedFillColor = color;

        console.log('fillcolor: ', color);

        if (this.selectedDrawing) {
            this.selectedDrawing.setFillColor(color);

            this.draw();
        }
    }

    handleWheel($event: WheelEvent) {
        if ($event.ctrlKey) {
            this.handleCtrlWheel($event);
        } else if ($event.shiftKey) {
            this.handleShiftWheel($event);
        } else {
            this.handleWheelPan($event);
        }
    }

    handleMouseDown($event: MouseEvent) {
        if (this.selectedTool === 'move') {
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

            if (this.selectedDrawing) {
                this.isMovingDrawing = true;
            }
        }
        if (this.selectedTool === 'draw') {
            this.isDrawing = true;
            this.addPointToDrawing($event.offsetX, $event.offsetY);
        }

        if (this.selectedTool === 'line') {
            if ($event.button === 2) {
                console.log('right click');

                this.addDrawing();

                this.isDrawing = false;

                return;
            }

            this.isDrawing = true;
            this.addPointToDrawing($event.offsetX, $event.offsetY);

            if (this.drawing) this.drawing.addNextPoint = true;
        }

        if (this.selectedTool === 'rectangle') {
            this.isDrawing = true;
            this.addPointToDrawing($event.offsetX, $event.offsetY);
        }

        if (this.selectedTool === 'ellipse') {
            this.isDrawing = true;
            this.addPointToDrawing($event.offsetX, $event.offsetY);
        }

        if (this.selectedTool === 'erase') {
            this.isErasing = true;
        }

        console.log('mouse down');

        this.draw();
    }

    handleMouseMove($event: MouseEvent) {
        // console.log('current drawing: ', this.drawing?.drawingType);

        if (this.isMovingDrawing || this.isMoving || this.isDrawing || this.isErasing) {
            this.canChangeTool.emit(false);
            // console.log('can change tool: ', false);
        }

        this.checkHover($event.offsetX, $event.offsetY);
        this.checkHoverAnchor($event.offsetX, $event.offsetY);

        if (this.isMovingDrawing) {
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
            return;
        }

        this.canChangeTool.emit(true);
    }

    handleMouseUp($event: MouseEvent) {
        // console.log('mouse up');

        if (this.selectedTool === 'move') {
            // console.log('here');
            this.isMoving = false;
            // this.clearSelected();
        }

        if (this.selectedTool === 'select') {
            // this.isMoving = false;
            // this.checkHover($event.offsetX, $event.offsetY);
            // if (this.selectedDrawing === this.hoveredDrawing) return;
            // this.clearSelected();
            this.isMovingDrawing = false;

            this.selectedDrawing?.handleMouseUp();
        }

        if (this.selectedTool === 'draw') {
            this.isDrawing = false;
            this.addDrawing();

            console.log(this.drawings);
        }

        if (this.selectedTool === 'rectangle') {
            this.isDrawing = false;
            this.addDrawing();
        }

        if (this.selectedTool === 'ellipse') {
            this.isDrawing = false;
            this.addDrawing();
        }

        // if (this.selectedTool === 'line') {
        //     console.log('line up');
        // }

        if (this.selectedTool === 'erase') {
            this.isErasing = false;

            this.eraser?.clearPoints();
        }
    }

    handleImagePaste(blob: Blob) {
        console.log('image paste');

        const url = URL.createObjectURL(blob);

        this.addImageDrawing(url);
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

        // console.log('here: ', this.selectedDrawing);

        const dx = (x - this.moveStartX) / this.canvasScale;
        const dy = (y - this.moveStartY) / this.canvasScale;

        if (this.selectedDrawing) {
            this.isMovingDrawing = true;
            this.handleMouseMoveSelectedDrawing(dx, dy);
            // this.onDrawingUpdate.emit(this.selectedDrawing);
        } else if (!this.isMovingDrawing) {
            this.context.translate(dx, dy);
            this.translateX -= dx;
            this.translateY -= dy;
        }

        this.moveStart(x, y);

        this.draw();
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

    addImageDrawing(url: string) {
        //add points of middle of the screen
        const x = 0;
        const y = 0;
        this.drawing = new Drawing('image', 1, 'black', '#FFFFFF', url, [new Point(x, y)]);

        // this.drawing.addPoint(new Point(x, y));

        this.drawing.preloadImage(url, () => {
            this.drawing?.finish();
            this.drawings.push(this.drawing!);
            this.drawing = null;
            console.log('Image drawing added');
            this.draw();
        });
    }

    addPointToDrawing(x: number, y: number) {
        if (!this.drawing) {
            this.drawing = new Drawing(
                this.selectedDrawingType,
                this.selectedThickness,
                this.selectedColor,
                this.selectedFillColor
            );
        }

        this.drawing.setThickness(this.selectedThickness);
        this.drawing.setColor(this.selectedColor);

        const scaledX = (x - this.scaleOriginX) / this.canvasScale + this.translateX;
        const scaledY = (y - this.scaleOriginY) / this.canvasScale + this.translateY;

        // console.log('scaled x: ', scaledX, 'scaled y: ', scaledY);

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

        for (const drawing of this.drawings) {
            drawing.draw(this.context!, this.translateX, this.translateY);
        }

        this.drawUnfinished();

        this.eraser?.draw(this.context!, this.translateX, this.translateY);
    }

    drawUnfinished() {
        if (!this.drawing) return;

        if (this.drawing.points.length < 1) return;

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

        // console.log('clear after drawing move');
        // console.log('clear after drawing move');
        // console.log('clear after drawing move');
        // console.log('clear after drawing move');
    }

    clearSelected() {
        // console.log('-----------------------------------');
        // console.log('clear selected');

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

        // console.log('-----------------------------------');
        // console.log('selected: ', this.selectedDrawing);
        // console.log('selected: ', this.selectedDrawing);
        // console.log('-----------------------------------');
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
    }

    handleAnchorSelect() {
        if (!this.selectedDrawing) return;

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

        //find the selecteddrawing in the drawings array
        const drawingIndex = this.drawings.findIndex((d) => d === this.selectedDrawing);

        if (drawingIndex === -1) {
            console.error('Drawing not found');
            return;
        }

        this.drawings[drawingIndex].handleMouseMove(x, y);

        // this.selectedDrawing.handleMouseMove(x, y);
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

    handleShiftWheel($event: WheelEvent) {
        if (!this.context) return;

        const dx = $event.deltaY < 0 ? this.WHEEL_PAN_SPEED : -this.WHEEL_PAN_SPEED;

        this.translateX -= dx / this.canvasScale;

        this.draw();
    }

    handleWheelPan($event: WheelEvent) {
        if (!this.context) return;

        const dy = $event.deltaY < 0 ? this.WHEEL_PAN_SPEED : -this.WHEEL_PAN_SPEED;

        this.translateY -= dy / this.canvasScale;

        this.draw();
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

    getSelectedTool(): SelectedTool {
        return this.selectedTool;
    }

    getZoomValue(): string {
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
