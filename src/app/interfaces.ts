interface Point {
    x: number;
    y: number;
}

interface Drawing {
    points: Point[];
    bounds: DrawingBounds;
}

interface DrawingBounds {
    top: number;
    left: number;
    bottom: number;
    right: number;
}

interface Drawings {
    drawings: Drawing[];
}

export { Drawing, DrawingBounds, Drawings, Point };
