import { DrawingBounds, Point } from './interfaces';

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
            this.drawRectangle(ctx, translateX, translateY);
        }
    }

    drawRectangle(
        ctx: CanvasRenderingContext2D,
        translateX: number,
        translateY: number
    ) {
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
}

class Drawings implements Drawings {
    drawings: Drawing[];
    hoveredDrawing: Drawing | null = null;
    constructor(drawings: Drawing[] = []) {
        this.drawings = drawings;
    }

    addDrawing(drawing: Drawing) {
        this.drawings.push(drawing);

        console.log('Drawing added');
        console.log('Drawings:', this.drawings);
    }

    logDrawings() {
        for (const drawing of this.drawings) {
            drawing.logDrawing();
        }
    }

    draw(
        ctx: CanvasRenderingContext2D,
        translateX: number,
        translateY: number
    ) {
        for (const drawing of this.drawings) {
            drawing.draw(ctx, translateX, translateY);
        }
    }

    checkHover(x: number, y: number) {
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
        // console.log('x: ', x, 'y: ', y);

        if (this.hoveredDrawing) {
            this.drawings.forEach((d) => {
                if (d !== this.hoveredDrawing) d.isHovered = false;
            });
        }
    }

    handleDrawingSelect() {
        if (this.hoveredDrawing) {
            this.hoveredDrawing.isSelected = true;
        }
    }
}

export { Drawing, Drawings };
