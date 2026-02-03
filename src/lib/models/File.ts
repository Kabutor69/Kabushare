import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFile extends Document {
    fileName: string;
    fileSize: number;
    fileType: string;
    gridFsId?: string;
    blobUrl?: string;
    accessId: string;
    createdAt: Date;
    expiresAt: Date;
}

const FileSchema = new Schema<IFile>(
    {
        fileName: {
            type: String,
            required: true,
        },
        fileSize: {
            type: Number,
            required: true,
        },
        fileType: {
            type: String,
            required: true,
        },
        gridFsId: {
            type: String,
            required: false,
        },
        blobUrl: {
            type: String,
            required: false,
        },
        accessId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        expiresAt: {
            type: Date,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);


const FileModel: Model<IFile> =
    mongoose.models.File || mongoose.model<IFile>('File', FileSchema);

export default FileModel;
