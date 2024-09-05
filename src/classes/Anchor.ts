import { AnchorInterface } from '../app/interfaces/anchor';
import { PointType } from '../app/interfaces/point';
import { Point } from './Point';

class Anchor implements AnchorInterface {
    point: PointType;

    size: number;
    isHovered: boolean;
    isSelected: boolean;

    constructor(x: number, y: number, size: number) {
        this.point = new Point(x, y);

        this.size = size;
        this.isHovered = false;
        this.isSelected = false;
    }

    draw(ctx: CanvasRenderingContext2D, translateX: number, translateY: number) {
        ctx.fillStyle = this.isHovered ? 'red' : 'black';
        ctx.fillStyle = this.isSelected ? 'blue' : ctx.fillStyle;

        ctx.fillRect(
            this.point.x - this.size / 2 - translateX,
            this.point.y - this.size / 2 - translateY,
            this.size,
            this.size
        );
    }
}

export { Anchor };
