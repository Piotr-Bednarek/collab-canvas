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

        ctx.beginPath();

        ctx.moveTo(this.points[0].x - translateX, this.points[0].y - translateY);

        ctx.lineCap = 'round';
        ctx.strokeStyle = 'gray';
        ctx.lineWidth = 6;

        for (let i = 1; i < this.points.length; i++) {
            ctx.lineTo(this.points[i].x - translateX, this.points[i].y - translateY);
        }

        ctx.stroke();
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
