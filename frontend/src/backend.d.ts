import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface VideoMetadata {
    title: string;
    blob: ExternalBlob;
    description: string;
    fileSize: bigint;
    uploader: string;
    uploadTime: Time;
    videoId: string;
}
export type Time = bigint;
export interface backendInterface {
    addVideo(title: string, description: string, uploader: string, fileSize: bigint, videoId: string, blob: ExternalBlob): Promise<void>;
    deleteVideo(videoId: string): Promise<void>;
    getAllVideos(): Promise<Array<VideoMetadata>>;
    getVideo(videoId: string): Promise<VideoMetadata>;
    searchByUploader(uploader: string): Promise<Array<VideoMetadata>>;
}
