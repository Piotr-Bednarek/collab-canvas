import { DrawingBounds } from '../app/interfaces';
import { Anchor } from './Anchor';
import { Point } from './Point';

class Drawing implements Drawing {
    points: Point[];
    bounds: DrawingBounds;
    anchors: Anchor[];

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

    // scalingX: number = 1;
    // scalingY: number = 1;

    offsetX: number = 0;
    offsetY: number = 0;

    scalingThreshold: number = 0.1;

    // scaledPoints: Point[] = [];

    isScalingDrawing: boolean = false;

    translateX: number = 0;
    translateY: number = 0;

    constructor(
        points: Point[] = [],
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
    }

    addPoint(point: Point) {
        this.points.push(point);

        this.updateBounds();
    }

    updateBounds() {
        // this.calculateScaledPoints();

        // console.log(this.isFinished, this.originalBounds);

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

        // let temp = this.originalBounds.right - this.originalBounds.left;

        // let temp2 = this.bounds.right - this.bounds.left;

        // console.log('diff: ', temp, temp2);
        // console.log('scale: ', temp2 / temp);

        // if (this.isScalingDrawing) {
        // this.scalingX = temp2 / temp;

        // if (this.isFinished && this.bounds.top == 0) {
        //     this.bounds = { ...this.originalBounds };
        // }

        //get the original bound and the new bounds calculate the scale between them and apply it to the points

        if (this.isScalingDrawing) {
            this.calculateScaledPoints();
        }

        // const WIDTH_THRESHOLD = 20;
        // const HEIGHT_THRESHOLD = 20;

        // const width = this.bounds.right - this.bounds.left;
        // const height = this.bounds.bottom - this.bounds.top;

        // if (width < WIDTH_THRESHOLD) {
        //     this.bounds.left -= WIDTH_THRESHOLD / 2;
        //     this.bounds.right += WIDTH_THRESHOLD / 2;
        // }

        // if (height < HEIGHT_THRESHOLD) {
        //     this.bounds.top -= HEIGHT_THRESHOLD / 2;
        //     this.bounds.bottom += HEIGHT_THRESHOLD / 2;
        // }

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

    logDrawing() {
        console.log(this.points.length, this.bounds, this.isHovered);
    }

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

        ctx.strokeStyle = 'black';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(this.points[0].x - translateX, this.points[0].y - translateY);
        for (let i = 1; i < this.points.length; i++) {
            ctx.lineTo(this.points[i].x - translateX, this.points[i].y - translateY);
        }
        ctx.stroke();

        if (this.isFinished) {
            this.drawBoundsRectangle(ctx, translateX, translateY);
        }
    }

    drawBoundsRectangle(ctx: CanvasRenderingContext2D, translateX: number, translateY: number) {
        if (!this.isSelected && !this.isHovered) return;

        // console.log('Drawing bounds:', this.bounds);

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
        if (this.selectedAnchor) return;

        this.hoveredAnchor = null;

        // console.log('Checking hover anchor');
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
        this.clearSelectedAnchor();

        this.updateOriginalBounds();
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
        console.log('Updating original bounds');
        this.originalBounds = { ...this.bounds };
        this.originalPoints = [...this.points];
    }

    handleMouseMove(x: number, y: number) {
        // const dx = x - this.moveStartX;
        // const dy = y - this.moveStartY;

        this.translateX += x;
        this.translateY += y;

        // console.log('TranslateX:', this.translateX, 'TranslateY:', this.translateY);

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

            // console.log('Bounds:', this.bounds);

            // console.log('scalex: ', scaleX);

            // this.handleSelectedAnchorMouseMove(x, y);

            this.updateBounds();

            return;
        }

        this.moveStart(x, y);

        for (const point of this.points) {
            point.x += x;
            point.y += y;
        }

        this.updateBoundsAfterMove();
        // this.updateBounds();
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

    // handleSelectedAnchorMouseMove(x: number, y: number) {
    //     if (!this.selectedAnchor) return;

    //     const dx = x - this.moveStartX;
    //     const dy = y - this.moveStartY;

    //     const scaleX = dx / -(this.bounds.right - this.bounds.left);
    //     console.log('ScaleX:', scaleX);
    //     1;

    // this.scalingX -= scaleX * 2;

    // console.log('Selected anchor:', this.selectedAnchor);
    // console.log('dx:', dx, 'dy:', dy);

    // this.scaleDrawing(this.anchors.indexOf(this.selectedAnchor), dx, dy);

    // console.log('Bounds:', this.bounds);

    // console.log(this.scalingX, this.scalingY);
    // }

    // scaleDrawing(anchorIndex: number, dx: number, dy: number) {
    //     // console.log('Scaling drawing with anchor: ', anchorIndex, dx, dy);

    //     const currentWidth = this.bounds.right - this.bounds.left;
    //     const currentHeight = this.bounds.bottom - this.bounds.top;

    //     const newWidth = currentWidth + dx;
    //     const newHeight = currentHeight + dy;

    //     const scaleX = newWidth / currentWidth;
    //     const scaleY = newHeight / currentHeight;

    //     const centerX = this.bounds.left + (this.bounds.right - this.bounds.left) / 2;
    //     const centerY = this.bounds.top + (this.bounds.bottom - this.bounds.top) / 2;

    //     switch (anchorIndex) {
    //         case 0:
    //             console.log('Scaling top left');
    //             for (const point of this.points) {
    //                 point.x = (point.x - centerX) / scaleX + centerX;
    //                 point.y = (point.y - centerY) / scaleY + centerY;
    //             }

    //             break;
    //         case 1:
    //             console.log('Scaling top right');
    //             for (const point of this.points) {
    //                 point.x = (point.x - centerX) * scaleX + centerX;
    //                 point.y = (point.y - centerY) / scaleY + centerY;
    //             }
    //             break;
    //         case 2:
    //             console.log('Scaling bottom left');
    //             for (const point of this.points) {
    //                 point.x = (point.x - centerX) / scaleX + centerX;
    //                 point.y = (point.y - centerY) * scaleY + centerY;
    //             }
    //             break;
    //         case 3:
    //             console.log('Scaling bottom right');
    //             for (const point of this.points) {
    //                 point.x = (point.x - centerX) * scaleX + centerX;
    //                 point.y = (point.y - centerY) * scaleY + centerY;
    //             }
    //             break;
    //         case 4:
    //             console.log('Scaling top center');
    //             for (const point of this.points) {
    //                 point.y = (point.y - centerY) / scaleY + centerY;
    //             }
    //             break;
    //         case 5:
    //             console.log('Scaling bottom center');
    //             for (const point of this.points) {
    //                 point.y = (point.y - centerY) * scaleY + centerY;
    //             }
    //             break;
    //         case 6:
    //             console.log('Scaling left center');
    //             for (const point of this.points) {
    //                 point.x = (point.x - centerX) / scaleX + centerX;
    //             }
    //             break;
    //         case 7:
    //             console.log('Scaling right center');
    //             for (const point of this.points) {
    //                 point.x = (point.x - centerX) * scaleX + centerX;
    //             }

    //             break;
    //     }

    //     this.updateBounds();
    //     this.updateAnchors();
    // }

    moveStart(x: number, y: number) {
        this.moveStartX = x;
        this.moveStartY = y;
    }
}

export { Drawing };
