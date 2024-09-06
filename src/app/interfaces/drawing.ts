import { PointType } from './point';

interface DrawingInterface {
    drawingType: DrawingType;
    id: string;
    bounds: DrawingBounds;
    points?: PointType[];
    lineWidth?: number;
    strokeStyle?: string;
    fillStyle?: string;
    url?: string;
}

type DrawingType = 'freehand' | 'line' | 'rectangle' | 'ellipse' | 'text_field' | 'image';

type DrawingBounds = {
    top: number;
    left: number;
    bottom: number;
    right: number;
};

export { DrawingBounds, DrawingInterface, DrawingType };
