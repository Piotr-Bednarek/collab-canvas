import { v4 as uuidv4 } from 'uuid';
import { DrawingBounds, DrawingInterface } from '../app/interfaces/interfaces';
import { Anchor } from './Anchor';
import { Point } from './Point';

class Drawing implements DrawingInterface {
    id: string;

    points: Point[];
    bounds: DrawingBounds;
    anchors: Anchor[];

    lineWidth: number;
    strokeStyle: string;

    originalPoints: Point[] = [];
    originalBounds: DrawingBounds | undefined;

    isHovered: boolean;
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

    constructor(
        lineWidth: number,
        strokeStyle: string,
        points: Point[] = [],
        id?: string,
        bounds: DrawingBounds = { top: 0, left: 0, bottom: 0, right: 0 },
        selected: boolean = false
    ) {
        this.points = points;
        this.bounds = bounds;
        this.isHovered = selected;

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

        if (id) {
            this.id = id;
        } else {
            this.id = uuidv4();
        }

        this.lineWidth = lineWidth;
        this.strokeStyle = strokeStyle;
    }

    addPoint(point: Point) {
        this.points.push(point);

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

    updateAnchors() {
        for (const anchor of this.anchors) {
            if (this.selectedAnchor == this.hoveredAnchor) continue;
            anchor.isSelected = false;
        }

        this.anchors[0].x = this.bounds.left;
        this.anchors[0].y = this.bounds.top;

        this.anchors[1].x = this.bounds.right;
        this.anchors[1].y = this.bounds.top;

        this.anchors[2].x = this.bounds.left;
        this.anchors[2].y = this.bounds.bottom;

        this.anchors[3].x = this.bounds.right;
        this.anchors[3].y = this.bounds.bottom;

        this.anchors[4].x = (this.bounds.left + this.bounds.right) / 2;
        this.anchors[4].y = this.bounds.top;

        this.anchors[5].x = (this.bounds.left + this.bounds.right) / 2;
        this.anchors[5].y = this.bounds.bottom;

        this.anchors[6].x = this.bounds.left;
        this.anchors[6].y = (this.bounds.top + this.bounds.bottom) / 2;

        this.anchors[7].x = this.bounds.right;
        this.anchors[7].y = (this.bounds.top + this.bounds.bottom) / 2;
    }

    // logDrawing() {
    //     console.log(this.points.length, this.bounds, this.isHovered);
    // }

    calculateScaledPoints() {
        if (!this.originalBounds || !this.bounds) return;

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

        console.log('bounds1:', this.originalBounds);
        console.log('bounds2:', this.bounds);

        // this.bounds = {
        //     top: Math.min(...this.points.map((p) => p.y)),
        //     left: Math.min(...this.points.map((p) => p.x)),
        //     bottom: Math.max(...this.points.map((p) => p.y)),
        //     right: Math.max(...this.points.map((p) => p.x)),
        // };
    }

    draw(ctx: CanvasRenderingContext2D, translateX: number, translateY: number) {
        if (this.points.length < 1) {
            return;
        }

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
        if (!this.isSelected) return;

        for (const anchor of this.anchors) {
            anchor.draw(ctx, translateX, translateY);
        }
    }

    finish() {
        this.isFinished = true;

        this.originalPoints = [...this.points];

        this.updateBounds();
    }

    checkHoverAnchor(x: number, y: number) {
        this.hoveredAnchor = null;

        for (const anchor of this.anchors) {
            if (
                x > anchor.x - this.anchorSize / 2 &&
                x < anchor.x + this.anchorSize / 2 &&
                y > anchor.y - this.anchorSize / 2 &&
                y < anchor.y + this.anchorSize / 2
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
        if (!this.hoveredAnchor) return;

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

        console.table({ bounds: this.bounds, originalBounds: this.originalBounds });
    }

    clearSelectedAnchor() {
        if (!this.selectedAnchor) return;
        console.log('Clearing selected anchor');

        this.selectedAnchor.isSelected = false;
        this.selectedAnchor = null;

        this.selectedAnchorIndex = -1;

        this.isScalingDrawing = false;
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

            // Ensure bounds are updated correctly after scaling
            this.updateBounds();

            return;
        }

        this.moveStart(x, y);

        for (const point of this.points) {
            point.x += x;
            point.y += y;
        }

        // Ensure bounds are updated correctly after moving
        this.updateBoundsAfterMove();
        this.updateBounds();
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

        console.log('Setting thickness:', thickness);
    }

    setColor(color: string) {
        this.strokeStyle = color;

        console.log('Setting color:', color);
    }

    exportDrawing() {
        return {
            points: this.points,
        };
    }
}

export { Drawing };
