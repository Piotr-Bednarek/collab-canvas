interface PointType {
    x: number;
    y: number;
}

interface AnchorType {
    x: number;
    y: number;
    size: number;
    isSelected: boolean;
}

interface Drawing {
    id: string;
    points: PointType[];
    bounds: DrawingBounds;
    selected: boolean;
}

interface DrawingBounds {
    top: number;
    left: number;
    bottom: number;
    right: number;
}

export { AnchorType, Drawing, DrawingBounds, PointType };
