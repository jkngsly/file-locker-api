import { Readable } from 'stream';

export default interface Entry { 
    path: string
    fullPath: string,
    type: string
    isFile: boolean
    isDirectory: boolean
    isImage: boolean
    thumbnail?: string
}