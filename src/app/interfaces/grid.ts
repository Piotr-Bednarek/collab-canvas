interface GridInterface {
    type: GridType;
    size?: number;
    color?: string;
    opacity?: number;
    spacing?: number;
}

type GridType = 'none' | 'dots' | 'lines';

export { GridInterface, GridType };
