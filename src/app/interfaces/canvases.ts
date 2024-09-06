export interface Canvases {
    loading: boolean;
    data: CanvasItem[];
}

export interface CanvasItem {
    id: string;
    title: string;
    created: string;
    owner: string;
    collaborators?: string[];
}
