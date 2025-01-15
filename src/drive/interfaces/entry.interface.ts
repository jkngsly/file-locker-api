import { Readable } from 'stream'

// File or Folder
export default interface Entry { 
    path: string
    type: string
    isFile: boolean
    isDirectory: boolean
    isImage: boolean
    thumbnail?: string
    parentId?: string
}