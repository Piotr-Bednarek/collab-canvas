import { v4 as uuidv4 } from 'uuid';

import { DrawingBounds, DrawingInterface, DrawingType } from '../app/interfaces/drawing';
import { Anchor } from './Anchor';
import { Point } from './Point';

class Drawing implements DrawingInterface {
    id: string;
    drawingType: DrawingType;

    points: Point[];
    bounds: DrawingBounds;
    anchors: Anchor[] | undefined;

    lineWidth?: number;
    strokeStyle?: string;
    fillStyle?: string;
    url?: string;

    imageWidth?: number;
    imageHeight?: number;

    originalPoints: Point[] | undefined;
    originalBounds: DrawingBounds | undefined;

    isHovered: boolean | undefined;
    isSelected: boolean = false;
    isFinished: boolean = false;

    hoveredAnchor: Anchor | null = null;
    selectedAnchor: Anchor | null = null;
    selectedAnchorIndex: number = -1;

    anchorSize: number = 20;

    moveStartX: number = 0;
    moveStartY: number = 0;

    offsetX: number = 0;
    offsetY: number = 0;

    isScalingDrawing: boolean = false;

    translateX: number = 0;
    translateY: number = 0;

    addNextPoint: boolean = false;

    private preloadedImage: HTMLImageElement | null = null;

    constructor(
        drawingType: DrawingType,
        lineWidth?: number,
        strokeStyle?: string,
        fillStyle?: string,
        url?: string,
        points: Point[] = [],
        id: string = uuidv4(),
        bounds: DrawingBounds = { top: 0, left: 0, bottom: 0, right: 0 },
        selected: boolean = false
    ) {
        this.points = points;
        this.bounds = bounds;
        this.drawingType = drawingType;

        this.url = url;

        if (this.drawingType === 'image' && this.url) {
            this.preloadImage(this.url, () => {});
        }

        this.constructAnchors(this.bounds);

        this.id = id;

        this.lineWidth = lineWidth;
        this.strokeStyle = strokeStyle;
        this.fillStyle = fillStyle;
    }

    preloadImage(url: string, callback: () => void): void {
        this.preloadedImage = new Image();
        this.preloadedImage.src = url;

        this.preloadedImage.onload = () => {
            console.log('Image preloaded:', this.preloadedImage);
            this.updateImageBounds();
            callback();
        };
        this.imageWidth = this.preloadedImage.width;
        this.imageHeight = this.preloadedImage.height;
    }

    constructAnchors(bounds: DrawingBounds) {
        this.anchors = [
            new Anchor(bounds.left, bounds.top, this.anchorSize),
            new Anchor(bounds.right, bounds.top, this.anchorSize),
            new Anchor(bounds.left, bounds.bottom, this.anchorSize),
            new Anchor(bounds.right, bounds.bottom, this.anchorSize),
            new Anchor((bounds.left + bounds.right) / 2, bounds.top, this.anchorSize),
            new Anchor((bounds.left + bounds.right) / 2, bounds.bottom, this.anchorSize),
            new Anchor(bounds.left, (bounds.top + bounds.bottom) / 2, this.anchorSize),
            new Anchor(bounds.right, (bounds.top + bounds.bottom) / 2, this.anchorSize),
        ];
    }

    addPoint(point: Point) {
        console.log('Adding point:', point);
        console.log('drawing type:', this.drawingType);

        if (this.drawingType === 'freehand') {
            this.points.push(point);
        }

        if (this.drawingType === 'line') {
            console.log('Adding point:', point);
            console.log('Points:', this.points);

            if (this.addNextPoint) {
                this.points.push(point);
                this.addNextPoint = false;
                return;
            }
            // this.points = [this.points[0], point];
            //change the last point

            if (this.points.length < 2) {
                this.points.push(point);
                this.addNextPoint = true;
                return;
            }

            const lastIndex = this.points.length - 1;

            this.points[lastIndex] = point;
        }

        if (this.drawingType === 'rectangle') {
            if (this.points.length < 2) {
                this.points.push(point);
            } else {
                this.points[1] = point;
            }
        }

        if (this.drawingType === 'ellipse') {
            if (this.points.length < 2) {
                this.points.push(point);
            } else {
                this.points[1] = point;
            }
        }

        if (this.drawingType === 'image') {
            if (this.points.length < 1) {
                this.points.push(point);
            } else {
                this.points[0] = point;
            }

            console.log('Adding image point:', point);

            this.updateImageBounds();

            return;
        }

        console.log('type:', this.drawingType);

        this.updateBounds();
    }

    updateBounds() {
        if (this.isFinished && !this.originalBounds) {
            console.log('Setting original bounds');

            this.originalBounds = {
                top: Math.min(...this.points.map((p) => p.y)),
                left: Math.min(...this.points.map((p) => p.x)),
                bottom: Math.max(...this.points.map((p) => p.y)),
                right: Math.max(...this.points.map((p) => p.x)),
            };
            this.bounds = { ...this.originalBounds };
        }

        if (!this.originalBounds) return;

        if (this.isScalingDrawing) {
            this.calculateScaledPoints();
        }

        this.updateAnchors();
    }

    updateImageBounds() {
        if (!this.preloadedImage) return;

        if (!this.imageHeight || !this.imageWidth) {
            this.imageHeight = this.preloadedImage.height;
            this.imageWidth = this.preloadedImage.width;
        }

        // console.log(this.imageHeight, this.imageWidth);
        // console.log(this.points[0]);

        if (this.isFinished && !this.originalBounds) {
            // console.log('HERERRERER');
            // console.log('HERERRERER');
            // console.log('HERERRERER');
            // console.log('HERERRERER');

            this.originalBounds = {
                top: this.points[0].y,
                left: this.points[0].x,
                bottom: this.points[0].y + this.imageHeight,
                right: this.points[0].x + this.imageWidth,
            };

            this.bounds = { ...this.originalBounds };

            // console.log('Original bounds:', this.originalBounds);
            // console.log('Bounds:', this.bounds);

            // this.bounds = {  };
        }

        if (!this.originalBounds) return;

        // console.log('Updating image bounds');
        // console.log('Image:', this.preloadedImage);
        // console.log('Points:', this.points);

        this.imageHeight = this.bounds.bottom - this.bounds.top;
        this.imageWidth = this.bounds.right - this.bounds.left;

        // console.log('Image bounds:', this.bounds);
        // console.log('original bounds:', this.originalBounds);

        this.updateAnchors();
    }

    updateAnchors() {
        if (!this.anchors) return;

        for (const anchor of this.anchors) {
            if (this.selectedAnchor == this.hoveredAnchor) continue;
            anchor.isSelected = false;
        }

        this.anchors[0].point.x = this.bounds.left;
        this.anchors[0].point.y = this.bounds.top;

        this.anchors[1].point.x = this.bounds.right;
        this.anchors[1].point.y = this.bounds.top;

        this.anchors[2].point.x = this.bounds.left;
        this.anchors[2].point.y = this.bounds.bottom;

        this.anchors[3].point.x = this.bounds.right;
        this.anchors[3].point.y = this.bounds.bottom;

        this.anchors[4].point.x = (this.bounds.left + this.bounds.right) / 2;
        this.anchors[4].point.y = this.bounds.top;

        this.anchors[5].point.x = (this.bounds.left + this.bounds.right) / 2;
        this.anchors[5].point.y = this.bounds.bottom;

        this.anchors[6].point.x = this.bounds.left;
        this.anchors[6].point.y = (this.bounds.top + this.bounds.bottom) / 2;

        this.anchors[7].point.x = this.bounds.right;
        this.anchors[7].point.y = (this.bounds.top + this.bounds.bottom) / 2;
    }

    // logDrawing() {
    //     console.log(this.points.length, this.bounds, this.isHovered);
    // }

    calculateScaledPoints() {
        if (!this.originalBounds || !this.bounds || !this.originalPoints) return;

        const scaleX =
            (this.bounds.right - this.bounds.left) / (this.originalBounds.right - this.originalBounds.left);
        const scaleY =
            (this.bounds.bottom - this.bounds.top) / (this.originalBounds.bottom - this.originalBounds.top);

        // Use originalBounds for center calculation
        // let offsetX = (this.originalBounds.left + this.originalBounds.right) / 2;
        // let offsetY = (this.originalBounds.top + this.originalBounds.bottom) / 2;

        switch (this.selectedAnchorIndex) {
            case 0:
                this.offsetX = this.bounds.right;
                this.offsetY = this.bounds.bottom;
                break;
            case 1:
                this.offsetX = this.bounds.left;
                this.offsetY = this.bounds.bottom;
                break;
            case 2:
                this.offsetX = this.bounds.right;
                this.offsetY = this.bounds.top;
                break;
            case 3:
                this.offsetX = this.bounds.left;
                this.offsetY = this.bounds.top;
                break;
            case 4:
                this.offsetY = this.bounds.bottom;
                break;
            case 5:
                this.offsetY = this.bounds.top;
                break;
            case 6:
                this.offsetX = this.bounds.right;
                break;
            case 7:
                this.offsetX = this.bounds.left;
                break;
        }

        this.points = this.originalPoints.map((point) => ({
            x: (point.x - this.offsetX) * scaleX + this.offsetX,
            y: (point.y - this.offsetY) * scaleY + this.offsetY,
        }));

        // console.log('bounds1:', this.originalBounds);
        // console.log('bounds2:', this.bounds);

        // this.bounds = {
        //     top: Math.min(...this.points.map((p) => p.y)),
        //     left: Math.min(...this.points.map((p) => p.x)),
        //     bottom: Math.max(...this.points.map((p) => p.y)),
        //     right: Math.max(...this.points.map((p) => p.x)),
        // };
    }

    draw(ctx: CanvasRenderingContext2D, translateX: number, translateY: number) {
        if (this.drawingType === 'freehand') {
            this.drawFreehand(ctx, translateX, translateY);
        }

        if (this.drawingType === 'line') {
            this.drawLine(ctx, translateX, translateY);
        }

        if (this.drawingType === 'rectangle') {
            this.drawRectangle(ctx, translateX, translateY);
        }

        if (this.drawingType === 'ellipse') {
            this.drawEllipse(ctx, translateX, translateY);
        }

        if (this.drawingType === 'image') {
            this.drawImage(ctx, translateX, translateY);
        }
    }

    drawFreehand(ctx: CanvasRenderingContext2D, translateX: number, translateY: number) {
        if (this.points.length < 1) return;

        if (!this.strokeStyle || !this.lineWidth) return;

        ctx.strokeStyle = this.strokeStyle;
        ctx.lineWidth = this.lineWidth;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(this.points[0].x - translateX, this.points[0].y - translateY);

        for (let i = 1; i < this.points.length - 1; i++) {
            const currentPoint = this.points[i];
            const nextPoint = this.points[i + 1];

            const controlPointX = (currentPoint.x + nextPoint.x) / 2 - translateX;
            const controlPointY = (currentPoint.y + nextPoint.y) / 2 - translateY;

            ctx.quadraticCurveTo(
                currentPoint.x - translateX,
                currentPoint.y - translateY,
                controlPointX,
                controlPointY
            );
        }

        const lastPoint = this.points[this.points.length - 1];
        ctx.lineTo(lastPoint.x - translateX, lastPoint.y - translateY);

        ctx.lineWidth = this.lineWidth;
        ctx.stroke();

        if (this.isFinished) {
            this.drawBoundsRectangle(ctx, translateX, translateY);
        }
    }

    drawLine(ctx: CanvasRenderingContext2D, translateX: number, translateY: number) {
        if (this.points.length < 2) return;

        if (!this.strokeStyle || !this.lineWidth) return;

        ctx.strokeStyle = this.strokeStyle;
        ctx.lineWidth = this.lineWidth;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(this.points[0].x - translateX, this.points[0].y - translateY);

        for (let i = 1; i < this.points.length - 1; i++) {
            const currentPoint = this.points[i];

            ctx.lineTo(currentPoint.x - translateX, currentPoint.y - translateY);
        }

        const lastPoint = this.points[this.points.length - 1];
        ctx.lineTo(lastPoint.x - translateX, lastPoint.y - translateY);

        ctx.lineWidth = this.lineWidth;
        ctx.stroke();

        if (this.isFinished) {
            this.drawBoundsRectangle(ctx, translateX, translateY);
        }
    }

    drawRectangle(ctx: CanvasRenderingContext2D, translateX: number, translateY: number) {
        if (this.points.length < 2) return;

        if (!this.strokeStyle || !this.lineWidth || !this.fillStyle) return;

        ctx.strokeStyle = this.strokeStyle;
        ctx.lineWidth = this.lineWidth;
        ctx.lineCap = 'round';
        ctx.fillStyle = this.fillStyle;

        ctx.beginPath();

        const region = new Path2D();

        region.rect(
            this.points[0].x - translateX,
            this.points[0].y - translateY,
            this.points[1].x - this.points[0].x,
            this.points[1].y - this.points[0].y
        );

        ctx.globalAlpha = 0.5;

        ctx.fill(region);

        ctx.globalAlpha = 1;

        ctx.strokeRect(
            this.points[0].x - translateX,
            this.points[0].y - translateY,
            this.points[1].x - this.points[0].x,
            this.points[1].y - this.points[0].y
        );

        ctx.stroke();

        if (this.isFinished) {
            this.drawBoundsRectangle(ctx, translateX, translateY);
        }
    }

    drawEllipse(ctx: CanvasRenderingContext2D, translateX: number, translateY: number) {
        if (this.points.length < 2) return;

        if (!this.strokeStyle || !this.lineWidth || !this.fillStyle) return;

        ctx.strokeStyle = this.strokeStyle;
        ctx.lineWidth = this.lineWidth;
        ctx.lineCap = 'round';
        ctx.fillStyle = this.fillStyle;

        ctx.beginPath();

        // Find the top-left and bottom-right coordinates of the rectangle
        const x1 = this.points[0].x - translateX;
        const y1 = this.points[0].y - translateY;
        const x2 = this.points[1].x - translateX;
        const y2 = this.points[1].y - translateY;

        // Calculate the center of the rectangle
        const centerX = (x1 + x2) / 2;
        const centerY = (y1 + y2) / 2;

        // Calculate the radii for the ellipse
        const radiusX = Math.abs(x2 - x1) / 2;
        const radiusY = Math.abs(y2 - y1) / 2;

        // Draw the ellipse using the calculated center and radii
        ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);

        // Fill the ellipse with the fill color
        ctx.globalAlpha = 0.5;
        ctx.fill();

        // Reset global alpha for stroke
        ctx.globalAlpha = 1;

        // Stroke the ellipse with the stroke color
        ctx.stroke();

        // If the drawing is finished, draw the bounds rectangle (optional)
        if (this.isFinished) {
            this.drawBoundsRectangle(ctx, translateX, translateY);
        }
    }

    drawImage(ctx: CanvasRenderingContext2D, translateX: number, translateY: number) {
        if (!this.preloadedImage) return;
        if (!this.points) return;

        // console.log(this.points);

        // console.log('Drawing image:', this.preloadedImage);

        // ctx.drawImage(this.preloadedImage, this.points[0].x - translateX, this.points[0].y - translateY);
        // draw the image based on width and height but keep the top left corner at the same position
        // console.log('width: ', this.imageHeight);
        // console.log('height: ', this.imageHeight);

        // console.log(this.bounds);

        ctx.drawImage(
            this.preloadedImage,
            this.bounds.left - translateX,
            this.bounds.top - translateY,
            this.imageWidth || this.preloadedImage.width,
            this.imageHeight || this.preloadedImage.height
        );

        // console.log(this.isFinished);

        if (this.isFinished) {
            this.drawBoundsRectangle(ctx, translateX, translateY);
        }
    }

    drawBoundsRectangle(ctx: CanvasRenderingContext2D, translateX: number, translateY: number) {
        if (!this.isSelected && !this.isHovered) return;

        // console.log('Drawing bounds:', this.bounds);

        ctx.lineWidth = 3;

        ctx.strokeStyle = this.isHovered ? 'red' : 'black';
        ctx.strokeStyle = this.isSelected ? 'blue' : ctx.strokeStyle;

        // console.log('Drawing bounds:', this.bounds);

        ctx.strokeRect(
            this.bounds.left - translateX,
            this.bounds.top - translateY,
            this.bounds.right - this.bounds.left,
            this.bounds.bottom - this.bounds.top
        );

        // ctx.strokeStyle = 'black';

        this.drawAnchors(ctx, translateX, translateY);
    }

    drawAnchors(ctx: CanvasRenderingContext2D, translateX: number, translateY: number) {
        if (!this.isSelected || !this.anchors) return;

        for (const anchor of this.anchors) {
            anchor.draw(ctx, translateX, translateY);
        }
    }

    finish() {
        this.isFinished = true;

        if (this.drawingType === 'line') {
            this.points.pop();
        }

        this.originalPoints = [...this.points];

        if (this.drawingType === 'image') {
            this.updateImageBounds();
        } else this.updateBounds();
    }

    checkHoverAnchor(x: number, y: number) {
        if (!this.anchors) return;

        this.hoveredAnchor = null;

        for (const anchor of this.anchors) {
            if (
                x > anchor.point.x - this.anchorSize / 2 &&
                x < anchor.point.x + this.anchorSize / 2 &&
                y > anchor.point.y - this.anchorSize / 2 &&
                y < anchor.point.y + this.anchorSize / 2
            ) {
                anchor.isHovered = true;
                this.hoveredAnchor = anchor;
            } else {
                anchor.isHovered = false;
            }
        }

        if (this.hoveredAnchor) {
            this.anchors.forEach((a) => {
                if (a !== this.hoveredAnchor) a.isHovered = false;
            });
        }
    }

    handleAnchorSelect() {
        if (!this.hoveredAnchor || !this.anchors) return;

        this.updateOriginalBounds();

        this.hoveredAnchor.isSelected = true;
        this.selectedAnchor = this.hoveredAnchor;

        this.selectedAnchorIndex = this.anchors.indexOf(this.selectedAnchor);

        console.log('Selected anchor:', this.anchors.indexOf(this.selectedAnchor));
    }

    handleMouseUp() {
        this.updateBounds();
        this.updateOriginalBounds();

        this.clearSelectedAnchor();

        // console.table({ bounds: this.bounds, originalBounds: this.originalBounds });
    }

    clearSelectedAnchor() {
        if (!this.selectedAnchor) return;
        console.log('Clearing selected anchor');

        this.selectedAnchor.isSelected = false;
        this.selectedAnchor = null;

        this.selectedAnchorIndex = -1;

        this.isScalingDrawing = false;
    }

    handleMouseMove(x: number, y: number) {
        this.translateX += x;
        this.translateY += y;

        if (this.selectedAnchor) {
            this.isScalingDrawing = true;

            switch (this.selectedAnchorIndex) {
                case 0:
                    this.bounds.left += x;
                    this.bounds.top += y;
                    break;
                case 1:
                    this.bounds.right += x;
                    this.bounds.top += y;
                    break;
                case 2:
                    this.bounds.left += x;
                    this.bounds.bottom += y;
                    break;
                case 3:
                    this.bounds.right += x;
                    this.bounds.bottom += y;
                    break;
                case 4:
                    this.bounds.top += y;
                    break;
                case 5:
                    this.bounds.bottom += y;
                    break;
                case 6:
                    this.bounds.left += x;
                    break;
                case 7:
                    this.bounds.right += x;
                    break;
            }

            // console.table(this.bounds);

            // Ensure bounds are updated correctly after scaling

            if (this.drawingType === 'image') {
                this.updateImageBounds();
            } else {
                this.updateBounds();
            }

            return;
        }

        this.moveStart(x, y);

        for (const point of this.points) {
            point.x += x;
            point.y += y;
        }

        // console.log('Moving points:', this.points[0]);

        if (this.drawingType === 'image') {
            this.updateImageBoundsAfterMove();
            this.updateImageBounds();
        } else {
            this.updateBoundsAfterMove();
            this.updateBounds();
        }
    }

    updateBoundsAfterMove() {
        this.bounds = {
            top: Math.min(...this.points.map((p) => p.y)),
            left: Math.min(...this.points.map((p) => p.x)),
            bottom: Math.max(...this.points.map((p) => p.y)),
            right: Math.max(...this.points.map((p) => p.x)),
        };

        this.updateOriginalBounds();

        this.updateAnchors();
    }

    updateImageBoundsAfterMove() {
        this.imageHeight = this.bounds.bottom - this.bounds.top;
        this.imageWidth = this.bounds.right - this.bounds.left;

        // console.log('Moving points:', this.points[0]);
        // console.log('Moving points:', this.points[0]);

        this.bounds = {
            top: this.points[0].y,
            left: this.points[0].x,
            bottom: this.points[0].y + this.imageHeight,
            right: this.points[0].x + this.imageWidth,
        };

        // this.updateOriginalBounds();

        this.updateAnchors();
    }

    updateOriginalBounds() {
        // console.log('Updating original bounds');
        this.validateBounds();

        this.originalBounds = { ...this.bounds };
        this.originalPoints = [...this.points];
    }

    validateBounds() {
        if (!this.bounds) return;

        if (this.bounds.left > this.bounds.right) {
            const temp = this.bounds.left;
            this.bounds.left = this.bounds.right;
            this.bounds.right = temp;
        }

        if (this.bounds.top > this.bounds.bottom) {
            const temp = this.bounds.top;
            this.bounds.top = this.bounds.bottom;
            this.bounds.bottom = temp;
        }
    }

    updateDrawingPoints(points: Point[]) {
        this.points = points;
        this.updateBounds();
    }

    moveStart(x: number, y: number) {
        this.moveStartX = x;
        this.moveStartY = y;
    }

    setThickness(thickness: number) {
        this.lineWidth = thickness;

        // console.log('Setting thickness:', thickness);
    }

    setColor(color: string) {
        this.strokeStyle = color;

        // console.log('Setting color:', color);
    }

    setFillColor(color: string) {
        this.fillStyle = color;

        // console.log('Setting fill color:', color);
    }

    exportDrawing() {
        return {
            points: this.points,
        };
    }
}

export { Drawing };
