import { PointType } from './interfaces/point';

export interface FirebaseDrawing {
    id: string;
    selectedBy: string | null;
    points: PointType[];
}
