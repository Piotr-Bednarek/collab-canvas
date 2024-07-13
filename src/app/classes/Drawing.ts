import { DrawingBounds } from '../interfaces';
import { Anchor } from './Anchor';
import { Point } from './Point';

class Drawing implements Drawing {
    points: Point[];
    bounds: DrawingBounds;
    anchors: Anchor[];

    isHovered: boolean;
    isSelected: boolean = false;
    finished: boolean = false;

    hoveredAnchor: Anchor | null = null;
    selectedAnchor: Anchor | null = null;

    anchorSize: number = 20;

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
        this.bounds = {
            top: Math.min(...this.points.map((p) => p.y)),
            left: Math.min(...this.points.map((p) => p.x)),
            bottom: Math.max(...this.points.map((p) => p.y)),
            right: Math.max(...this.points.map((p) => p.x)),
        };

        const WIDTH_THRESHOLD = 20;
        const HEIGHT_THRESHOLD = 20;

        const width = this.bounds.right - this.bounds.left;
        const height = this.bounds.bottom - this.bounds.top;

        if (width < WIDTH_THRESHOLD) {
            this.bounds.left -= WIDTH_THRESHOLD / 2;
            this.bounds.right += WIDTH_THRESHOLD / 2;
        }

        if (height < HEIGHT_THRESHOLD) {
            this.bounds.top -= HEIGHT_THRESHOLD / 2;
            this.bounds.bottom += HEIGHT_THRESHOLD / 2;
        }

        this.updateAnchors();
    }

    updateAnchors() {
        for (const anchor of this.anchors) {
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

        // this.anchors[0].isSelected = this.isHovered;
        // this.anchors[1].isSelected = this.isHovered;
        // this.anchors[2].isSelected = this.isHovered;
        // this.anchors[3].isSelected = this.isHovered;
        // this.anchors[4].isSelected = this.isHovered;
    }

    logDrawing() {
        console.log(this.points.length, this.bounds, this.isHovered);
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

        if (this.finished) {
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
        this.finished = true;
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

        this.hoveredAnchor.isSelected = true;
        this.selectedAnchor = this.hoveredAnchor;
    }

    clearSelectedAnchor() {
        if (!this.selectedAnchor) return;

        this.selectedAnchor.isSelected = false;
        this.selectedAnchor = null;
    }

    move(x: number, y: number) {
        // if (!this.selectedAnchor) return;

        for (const point of this.points) {
            point.x += x;
            point.y += y;
        }

        this.updateBounds();
    }
}

export { Drawing };
