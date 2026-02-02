import mongoose from 'mongoose';
import connectDB from './db';
import { Readable } from 'stream';

async function getGridFSBucket() {
    await connectDB();
    const db = mongoose.connection.db;
    if (!db) {
        throw new Error('Database not connected');
    }
    return new mongoose.mongo.GridFSBucket(db);
}

export async function saveFile(
    fileBuffer: Buffer,
    filename: string
): Promise<string> {
    const bucket = await getGridFSBucket();

    return new Promise((resolve, reject) => {
        const uploadStream = bucket.openUploadStream(filename);
        const readableStream = new Readable();
        readableStream.push(fileBuffer);
        readableStream.push(null);

        readableStream
            .pipe(uploadStream)
            .on('error', (error) => {
                reject(error);
            })
            .on('finish', () => {
                resolve(uploadStream.id.toString());
            });
    });
}

export async function getFileStream(gridFsId: string) {
    const bucket = await getGridFSBucket();
    try {
        const id = new mongoose.Types.ObjectId(gridFsId);
        return bucket.openDownloadStream(id);
    } catch (error) {
        throw new Error('Invalid file ID');
    }
}

export async function deleteFile(gridFsId: string): Promise<void> {
    try {
        const bucket = await getGridFSBucket();
        const id = new mongoose.Types.ObjectId(gridFsId);
        await bucket.delete(id);
    } catch (error) {
        console.error('Error deleting file from GridFS:', error);
    }
}

export async function fileExists(gridFsId: string): Promise<boolean> {
    try {
        const bucket = await getGridFSBucket();
        const id = new mongoose.Types.ObjectId(gridFsId);
        const files = await bucket.find({ _id: id }).toArray();
        return files.length > 0;
    } catch {
        return false;
    }
}
