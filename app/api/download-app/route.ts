import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// Mark this route as dynamic
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform') || 'android';
    const userAgent = request.headers.get('user-agent') || '';

    // Detect platform from user agent if not specified
    let detectedPlatform = platform;
    if (platform === 'auto') {
      if (/iPhone|iPad|iPod/.test(userAgent)) {
        detectedPlatform = 'ios';
      } else if (/Android/.test(userAgent)) {
        detectedPlatform = 'android';
      } else {
        detectedPlatform = 'android'; // Default to Android
      }
    }

    // Path to APK/IPA files (these will be generated after building with Capacitor)
    let filePath: string;
    let fileName: string;
    let contentType: string;

    if (detectedPlatform === 'ios') {
      // iOS IPA file path (needs to be built and signed)
      filePath = join(process.cwd(), 'public', 'apps', 'STIS-Conference.ipa');
      fileName = 'STIS-Conference.ipa';
      contentType = 'application/octet-stream';
    } else {
      // Android APK file path
      filePath = join(process.cwd(), 'public', 'apps', 'app-release.apk');
      fileName = 'STIS-Conference.apk';
      contentType = 'application/vnd.android.package-archive';
    }

    // Check if file exists
    if (!existsSync(filePath)) {
      // Return 404 with helpful message
      return NextResponse.json(
        { 
          error: 'App file not found',
          message: 'The app has not been built yet. Please build it first.',
          instructions: {
            android: 'Run: npm run build && npm run cap:sync, then build APK in Android Studio',
            ios: 'Run: npm run build && npm run cap:sync, then build IPA in Xcode'
          },
          platform: detectedPlatform
        },
        { status: 404 }
      );
    }

    // Read and serve the file
    const fileBuffer = await readFile(filePath);

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': fileBuffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error('Download app error:', error);
    return NextResponse.json(
      { error: 'Failed to download app', details: error.message },
      { status: 500 }
    );
  }
}

