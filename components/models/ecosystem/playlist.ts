export interface Playlist {
    id: string;
    name: string;
    description: string;
    type: number;
    createdAt: string;
    updatedAt: string | null;
    gameCount: number;
}