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

interface DrawingInterface {
    id: string;
    points: PointType[];
    bounds: DrawingBounds;
    // selected: boolean;
    lineWidth: number;
}

interface DrawingBounds {
    top: number;
    left: number;
    bottom: number;
    right: number;
}

export { AnchorType, DrawingBounds, DrawingInterface, PointType };
