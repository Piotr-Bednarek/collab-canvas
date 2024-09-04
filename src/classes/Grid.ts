import { GridInterface, GridType } from '../app/interfaces/grid';

class Grid implements GridInterface {
    type: GridType;
    size?: number;
    color?: string;
    opacity?: number;
    spacing?: number;
    constructor(
        type: 'none' | 'dots' | 'lines',
        size?: number,
        color?: string,
        opacity?: number,
        spacing?: number
    ) {
        this.type = type;
        this.size = size;
        this.color = color;
        this.opacity = opacity;
        this.spacing = spacing;
    }

    draw(
        ctx: CanvasRenderingContext2D,
        translateX: number,
        translateY: number,
        canvasScale: number,
        scaleOriginX: number,
        scaleOriginY: number
    ) {
        if (this.type === 'none') {
            return;
        }

        ctx.lineWidth = 1;
        ctx.strokeStyle = '#ccc';

        // ctx.save();
        // ctx.translate(translateX, translateY);

        if (this.type === 'dots') {
            this.drawDots(ctx);
        } else if (this.type === 'lines') {
            this.drawLines(
                ctx,
                ctx.canvas.width,
                ctx.canvas.height,
                translateX,
                translateY,
                canvasScale,
                scaleOriginX,
                scaleOriginY
            );
        }

        ctx.beginPath();
        ctx.arc(0 - translateX, 0 - translateY, 5, 0, 2 * Math.PI);
        ctx.fill();

        // ctx.restore();
    }

    private drawDots(ctx: CanvasRenderingContext2D) {
        if (!this.size || !this.spacing) {
            return;
        }

        ctx.strokeStyle = this.color || 'black';
        ctx.globalAlpha = this.opacity || 1;

        for (let x = 0; x < ctx.canvas.width; x += this.spacing) {
            for (let y = 0; y < ctx.canvas.height; y += this.spacing) {
                ctx.beginPath();
                ctx.arc(x, y, this.size / 2, 0, 2 * Math.PI);
                ctx.stroke();
            }
        }
    }

    private drawLines(
        ctx: CanvasRenderingContext2D,
        canvasWidth: number,
        canvasHeight: number,
        translateX: number,
        translateY: number,
        canvasScale: number,
        scaleOriginX: number,
        scaleOriginY: number
    ) {
        if (!this.spacing) {
            return;
        }

        console.log('drawLines');

        // const canvasWidth = this.canvasElementRef.nativeElement.width;
        // const canvasHeight = this.canvasElementRef.nativeElement.height;

        const topLeftX = -scaleOriginX / canvasScale;
        const topLeftY = -scaleOriginY / canvasScale;

        const bottomRightX = (canvasWidth - scaleOriginX) / canvasScale;
        const bottomRightY = (canvasHeight - scaleOriginY) / canvasScale;

        ctx.beginPath();

        for (let x = 0 - translateX; x > topLeftX; x -= this.spacing) {
            ctx.moveTo(x, topLeftY);
            ctx.lineTo(x, bottomRightY);
        }
        //draw from the middleX to the right vertical line
        for (let x = 0 - translateX + this.spacing; x < bottomRightX; x += this.spacing) {
            ctx.moveTo(x, topLeftY);
            ctx.lineTo(x, bottomRightY);
        }
        //draw from the middleY to the top horizontal line
        for (let y = 0 - translateY; y > topLeftY; y -= this.spacing) {
            ctx.moveTo(topLeftX, y);
            ctx.lineTo(bottomRightX, y);
        }
        //draw from the middleY to the bottom horizontal line
        for (let y = 0 - translateY + this.spacing; y < bottomRightY; y += this.spacing) {
            ctx.moveTo(topLeftX, y);
            ctx.lineTo(bottomRightX, y);
        }

        ctx.stroke();
    }
}

export { Grid };
