import { Song } from "./Song";

export interface Album {
  id: string;
  title: string;
  releaseDate: string | null;
  songs: Song[];
}
