import { PointType } from './interfaces/interfaces';

export interface FirebaseDrawing {
    id: string;
    selectedBy: string | null;
    points: PointType[];
}
