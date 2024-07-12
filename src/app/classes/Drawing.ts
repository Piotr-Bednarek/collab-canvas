import { DrawingBounds } from '../interfaces';
import { Point } from './Point';

class Drawing implements Drawing {
    points: Point[];
    bounds: DrawingBounds;
    isHovered: boolean;
    isSelected: boolean = false;
    finished: boolean = false;
    constructor(
        points: Point[] = [],
        bounds: DrawingBounds = { top: 0, left: 0, bottom: 0, right: 0 },
        selected: boolean = false
    ) {
        this.points = points;
        this.bounds = bounds;
        this.isHovered = selected;
    }

    addPoint(point: Point) {
        this.points.push(point);

        this.updateBounds();
    }

    updateBounds() {
        this.bounds = {
            top: Math.min(...this.points.map((p) => p.y)),
            left: Math.min(...this.points.map((p) => p.x)),
            bottom: Math.max(...this.points.map((p) => p.y)),
            right: Math.max(...this.points.map((p) => p.x)),
        };
    }

    logDrawing() {
        console.log(this.points.length, this.bounds, this.isHovered);
    }

    draw(
        ctx: CanvasRenderingContext2D,
        translateX: number,
        translateY: number
    ) {
        if (this.points.length < 1) {
            return;
        }

        ctx.strokeStyle = 'black';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(
            this.points[0].x - translateX,
            this.points[0].y - translateY
        );
        for (let i = 1; i < this.points.length; i++) {
            ctx.lineTo(
                this.points[i].x - translateX,
                this.points[i].y - translateY
            );
        }
        ctx.stroke();

        if (this.finished) {
            this.drawBoundsRectangle(ctx, translateX, translateY);
        }
    }

    drawBoundsRectangle(
        ctx: CanvasRenderingContext2D,
        translateX: number,
        translateY: number
    ) {
        if (!this.isSelected && !this.isHovered) return;

        this.drawAnchors(ctx, translateX, translateY);

        console.log('Drawing bounds:', this.bounds);

        ctx.strokeStyle = this.isHovered ? 'red' : 'black';
        ctx.strokeStyle = this.isSelected ? 'blue' : ctx.strokeStyle;

        // console.log('Drawing bounds:', this.bounds);

        ctx.strokeRect(
            this.bounds.left - translateX,
            this.bounds.top - translateY,
            this.bounds.right - this.bounds.left,
            this.bounds.bottom - this.bounds.top
        );

        ctx.strokeStyle = 'black';
    }

    drawAnchors(
        ctx: CanvasRenderingContext2D,
        translateX: number,
        translateY: number
    ) {
        if (!this.isSelected) return;

        const { top, left, bottom, right } = this.bounds;
        const anchorSize = 12;

        ctx.fillStyle = 'blue';

        // Top left anchor
        ctx.fillRect(
            left - anchorSize / 2 - translateX,
            top - anchorSize / 2 - translateY,
            anchorSize,
            anchorSize
        );

        // Top right anchor
        ctx.fillRect(
            right - anchorSize / 2 - translateX,
            top - anchorSize / 2 - translateY,
            anchorSize,
            anchorSize
        );

        // Bottom left anchor
        ctx.fillRect(
            left - anchorSize / 2 - translateX,
            bottom - anchorSize / 2 - translateY,
            anchorSize,
            anchorSize
        );

        // Bottom right anchor
        ctx.fillRect(
            right - anchorSize / 2 - translateX,
            bottom - anchorSize / 2 - translateY,
            anchorSize,
            anchorSize
        );

        // Top middle anchor
        ctx.fillRect(
            (left + right) / 2 - anchorSize / 2 - translateX,
            top - anchorSize / 2 - translateY,
            anchorSize,
            anchorSize
        );

        // Bottom middle anchor
        ctx.fillRect(
            (left + right) / 2 - anchorSize / 2 - translateX,
            bottom - anchorSize / 2 - translateY,
            anchorSize,
            anchorSize
        );

        // Left middle anchor
        ctx.fillRect(
            left - anchorSize / 2 - translateX,
            (top + bottom) / 2 - anchorSize / 2 - translateY,
            anchorSize,
            anchorSize
        );

        // Right middle anchor
        ctx.fillRect(
            right - anchorSize / 2 - translateX,
            (top + bottom) / 2 - anchorSize / 2 - translateY,
            anchorSize,
            anchorSize
        );
    }

    finish() {
        this.finished = true;
    }
}

export { Drawing };
