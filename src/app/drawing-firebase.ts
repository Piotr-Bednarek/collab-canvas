import { PointType } from './interfaces';

export interface DrawingFirebase {
    selectedBy: string | null;
    points: PointType[];
}
