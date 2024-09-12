import { BackgroundInterface } from '../app/interfaces/background';
import {
    backgroundColor,
    backgroundStyle,
    patternColor,
    patternSize,
} from '../app/interfaces/canvas-settings';

class Background implements BackgroundInterface {
    private patternSizeMap: { [key: string]: number } = {
        small: 20,
        medium: 40,
        large: 60,
    };

    backgroundStyle: backgroundStyle;
    backgroundColor: backgroundColor;
    patternSize: patternSize;
    patternColor: patternColor;

    spacing: number = 0;

    constructor(
        backgroundStyle: backgroundStyle,
        backgroundColor: backgroundColor,
        patternSize: patternSize,
        patternColor: patternColor
    ) {
        this.backgroundStyle = backgroundStyle;
        this.backgroundColor = backgroundColor;
        this.patternSize = patternSize;
        this.patternColor = patternColor;

        this.spacing = this.patternSizeMap[this.patternSize];
    }

    draw(
        ctx: CanvasRenderingContext2D,
        translateX: number,
        translateY: number,
        canvasScale: number,
        scaleOriginX: number,
        scaleOriginY: number
    ) {
        this.drawBackground(
            ctx,
            ctx.canvas.width,
            ctx.canvas.height,
            translateX,
            translateY,
            canvasScale,
            scaleOriginX,
            scaleOriginY
        );

        // ctx.fillStyle = 'black';
        // ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        ctx.lineWidth = 1;
        ctx.strokeStyle = this.patternColor;

        // ctx.save();
        // ctx.translate(translateX, translateY);

        if (this.backgroundStyle === 'dots') {
            this.drawDots(
                ctx,
                ctx.canvas.width,
                ctx.canvas.height,
                translateX,
                translateY,
                canvasScale,
                scaleOriginX,
                scaleOriginY
            );
        } else if (this.backgroundStyle === 'grid') {
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

        ctx.fillStyle = 'black';

        ctx.beginPath();
        ctx.arc(0 - translateX, 0 - translateY, 5, 0, 2 * Math.PI);
        ctx.fill();

        // ctx.restore();
    }

    private drawDots(
        ctx: CanvasRenderingContext2D,
        canvasWidth: number,
        canvasHeight: number,
        translateX: number,
        translateY: number,
        canvasScale: number,
        scaleOriginX: number,
        scaleOriginY: number
    ) {
        const spacing = this.patternSizeMap[this.patternSize];

        const topLeftX = -scaleOriginX / canvasScale;
        const topLeftY = -scaleOriginY / canvasScale;

        const bottomRightX = (canvasWidth - scaleOriginX) / canvasScale;
        const bottomRightY = (canvasHeight - scaleOriginY) / canvasScale;

        ctx.fillStyle = this.patternColor;

        for (let x = 0 - translateX + this.spacing; x < bottomRightX; x += this.spacing) {
            for (let y = 0 - translateY; y > topLeftY; y -= this.spacing) {
                ctx.beginPath();
                ctx.arc(x, y, 3, 0, 2 * Math.PI);
                ctx.fill();
            }
        }

        for (let y = 0 - translateY; y > topLeftY; y -= this.spacing) {
            for (let x = 0 - translateX; x > topLeftX; x -= this.spacing) {
                ctx.beginPath();
                ctx.arc(x, y, 3, 0, 2 * Math.PI);
                ctx.fill();
            }
        }
        //draw bottom left 1/4

        for (let x = 0 - translateX; x > topLeftX; x -= this.spacing) {
            for (let y = 0 - translateY + this.spacing; y < bottomRightY; y += this.spacing) {
                ctx.beginPath();
                ctx.arc(x, y, 3, 0, 2 * Math.PI);
                ctx.fill();
            }
        }

        for (let x = 0 - translateX + this.spacing; x < bottomRightX; x += this.spacing) {
            for (let y = 0 - translateY + this.spacing; y < bottomRightY; y += this.spacing) {
                ctx.beginPath();
                ctx.arc(x, y, 3, 0, 2 * Math.PI);
                ctx.fill();
            }
        }

        ctx.stroke();
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
        const spacing = this.patternSizeMap[this.patternSize];

        // console.log('drawLines');

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

        console.log('spacing: ', this.spacing);

        ctx.stroke();
    }

    private drawBackground(
        ctx: CanvasRenderingContext2D,
        canvasWidth: number,
        canvasHeight: number,
        translateX: number,
        translateY: number,
        canvasScale: number,
        scaleOriginX: number,
        scaleOriginY: number
    ) {
        // console.table({
        //     canvasWidth,
        //     canvasHeight,
        //     translateX,
        //     translateY,
        //     canvasScale,
        //     scaleOriginX,
        //     scaleOriginY,
        // });

        // Save the current context state
        ctx.save();

        // Reset transformations to draw the background correctly

        // Calculate the top-left corner considering the scale and translation
        const topLeftX = -scaleOriginX / canvasScale;
        const topLeftY = -scaleOriginY / canvasScale;

        const bottomRightX = (canvasWidth - scaleOriginX) / canvasScale;
        const bottomRightY = (canvasHeight - scaleOriginY) / canvasScale;

        ctx.fillStyle = this.backgroundColor;

        // Draw the background rectangle
        ctx.fillRect(topLeftX, topLeftY, bottomRightX - topLeftX, bottomRightY - topLeftY);

        // Restore the context to its original state
        ctx.restore();
    }

    updateSettings(settings: BackgroundInterface) {
        this.backgroundStyle = settings.backgroundStyle;
        this.backgroundColor = settings.backgroundColor;
        this.patternSize = settings.patternSize;
        this.patternColor = settings.patternColor;

        console.log('patternSize: ', settings);

        this.spacing = this.patternSizeMap[this.patternSize];
    }
}

export { Background };
