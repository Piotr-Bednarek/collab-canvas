import { PointType } from '../app/interfaces';

class Point implements PointType {
    x: number;
    y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

export { Point };
