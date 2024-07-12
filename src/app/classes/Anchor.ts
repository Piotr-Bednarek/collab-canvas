import { AnchorType } from '../interfaces';

class Anchor implements AnchorType {
    x: number;
    y: number;
    size: number;
    isSelected: boolean;
    constructor(x: number, y: number, size: number) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.isSelected = false;
    }

    draw(
        ctx: CanvasRenderingContext2D,
        translateX: number,
        translateY: number
    ) {
        ctx.beginPath();
        ctx.arc(
            this.x - translateX,
            this.y - translateY,
            this.size,
            0,
            2 * Math.PI
        );
        ctx.stroke();
    }
}

export { Anchor };
