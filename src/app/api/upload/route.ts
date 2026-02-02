import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import FileModel from '@/lib/models/File';
import { saveFile } from '@/lib/storage';
import {
    generateAccessId,
    validateFileSize,
    validateFileType,
    sanitizeFilename,
    calculateExpirationDate,
} from '@/lib/utils';


export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const files = formData.getAll('file') as File[];

        if (!files || files.length === 0) {
            return NextResponse.json(
                { error: 'No files provided' },
                { status: 400 }
            );
        }

        const results = [];

        for (const file of files) {
            if (!validateFileSize(file.size)) {
                results.push({
                    fileName: file.name,
                    error: 'File size exceeds 100MB limit',
                });
                continue;
            }

            if (!validateFileType(file.type)) {
                results.push({
                    fileName: file.name,
                    error: 'File type not allowed for security reasons',
                });
                continue;
            }

            const sanitizedName = sanitizeFilename(file.name);
            if (!sanitizedName) {
                results.push({
                    fileName: file.name,
                    error: 'Invalid filename',
                });
                continue;
            }

            const accessId = generateAccessId();

            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            const uniqueFilename = `${accessId}_${sanitizedName}`;

            const gridFsId = await saveFile(buffer, uniqueFilename);

            const expiresAt = calculateExpirationDate();

            await connectDB();

            const fileRecord = await FileModel.create({
                fileName: sanitizedName,
                fileSize: file.size,
                fileType: file.type,
                gridFsId,
                accessId,
                expiresAt,
            });

            results.push({
                success: true,
                accessId: fileRecord.accessId,
                fileName: fileRecord.fileName,
                expiresAt: fileRecord.expiresAt,
            });
        }

        return NextResponse.json(
            {
                success: true,
                files: results,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: 'Failed to upload files' },
            { status: 500 }
        );
    }
}
