import { EraserInterface } from '../app/interfaces/eraser';
import { Point } from './Point';

class Eraser implements EraserInterface {
    points: Point[] = [];

    maxLength: number = 8;

    constructor(points: Point[]) {
        this.points = points;
    }

    draw(ctx: CanvasRenderingContext2D, translateX: number, translateY: number) {
        if (this.points.length === 0) return;
        if (!ctx) return;

        ctx.lineCap = 'round';
        ctx.strokeStyle = 'gray';

        for (let i = 1; i < this.points.length; i++) {
            const startPoint = this.points[i - 1];
            const endPoint = this.points[i];

            // Calculate the line width based on the position in the array
            const lineWidth = 6 * (i / this.points.length);
            ctx.imageSmoothingQuality = 'high';
            ctx.lineWidth = lineWidth;

            ctx.beginPath();
            ctx.moveTo(startPoint.x - translateX, startPoint.y - translateY);

            // Calculate the control point for the Bezier curve
            const controlPointX = (startPoint.x + endPoint.x) / 2 - translateX;
            const controlPointY = (startPoint.y + endPoint.y) / 2 - translateY;

            // Draw the Bezier curve
            ctx.quadraticCurveTo(
                controlPointX,
                controlPointY,
                endPoint.x - translateX,
                endPoint.y - translateY
            );
            ctx.stroke();
        }
    }

    addPoint(point: Point) {
        this.points.push(point);

        if (this.points.length > this.maxLength) {
            this.points.shift();
        }
    }

    clearPoints() {
        this.points = [];
    }
}

export { Eraser };
