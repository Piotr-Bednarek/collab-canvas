export interface Canvases {
    loading: boolean;
    data: CanvasItem[];
}

export interface CanvasItem {
    id: string;
    title: string;
    ownerUid: string;
    created: string;
}
