import { PointType } from './interfaces';

export interface FirebaseDrawing {
    id: string;
    selectedBy: string | null;
    points: PointType[];
}
