import { AnchorType } from '../app/interfaces';

class Anchor implements AnchorType {
    x: number;
    y: number;
    size: number;
    isHovered: boolean;
    isSelected: boolean;

    constructor(x: number, y: number, size: number) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.isHovered = false;
        this.isSelected = false;
    }

    draw(ctx: CanvasRenderingContext2D, translateX: number, translateY: number) {
        ctx.fillStyle = this.isHovered ? 'red' : 'black';
        ctx.fillStyle = this.isSelected ? 'blue' : ctx.fillStyle;

        ctx.fillRect(
            this.x - this.size / 2 - translateX,
            this.y - this.size / 2 - translateY,
            this.size,
            this.size
        );
    }
}

export { Anchor };
