import { Readable } from 'stream';

export default interface Entry { 
    path: string
    type: string
    isFile: boolean
    isDirectory: boolean
    isImage: boolean
    thumbnail?: string
}