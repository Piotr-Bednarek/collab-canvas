import { PointType } from './point';

interface DrawingInterface {
    drawingType: DrawingType;
    id: string;
    points: PointType[];
    bounds: DrawingBounds;
    lineWidth: number;
    strokeStyle: string;
    fillStyle: string;
}

type DrawingType = 'freehand' | 'line' | 'rectangle' | 'circle' | 'text_field' | 'image';

type DrawingBounds = {
    top: number;
    left: number;
    bottom: number;
    right: number;
};

export { DrawingBounds, DrawingInterface, DrawingType };
