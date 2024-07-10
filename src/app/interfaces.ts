interface Point {
    x: number;
    y: number;
}

interface Drawing {
    points: Point[];
    bounds: DrawingBounds;
    selected: boolean;
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
