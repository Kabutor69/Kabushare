
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import FileModel from '@/lib/models/File';
import { del } from '@vercel/blob';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        await connectDB();

        const now = new Date();
        const expiredFiles = await FileModel.find({ expiresAt: { $lt: now } });

        console.log(`🧹 Cleanup started at ${now.toISOString()}. Found ${expiredFiles.length} expired files.`);

        const results = {
            total: expiredFiles.length,
            deleted: 0,
            errors: 0,
        };

        for (const file of expiredFiles) {
            try {
                if (file.blobUrl) {
                    await del(file.blobUrl);
                }
                await FileModel.deleteOne({ _id: file._id });

                results.deleted++;
            } catch (error) {
                console.error(`❌ Error cleaning up file ${file.accessId}:`, error);
                results.errors++;
            }
        }

        return NextResponse.json({
            message: 'Cleanup completed',
            results,
        });
    } catch (error) {
        console.error('Cleanup error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
