import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';

// Initialize S3 client with explicit configuration
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export async function POST(request: Request) {
  try {
    // Step 1: Log initial request
    console.log('Starting avatar upload process...');

    // Step 2: Check AWS configuration
    console.log('AWS Config:', {
      region: process.env.AWS_REGION,
      bucket: process.env.AWS_USER_AVATARS_BUCKET,
      hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
      hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY
    });

    // Step 3: Check authentication
    const session = await getServerSession(authOptions);
    console.log('Session check:', {
      isAuthenticated: !!session,
      hasEmail: !!session?.user?.email,
    });
    
    if (!session?.user?.email) {
      console.log('Authentication failed: No user session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Step 4: Get file from request
    const formData = await request.formData();
    const file = formData.get('file') as File;
    console.log('File details:', {
      fileName: file?.name,
      fileType: file?.type,
      fileSize: file?.size,
    });
    
    if (!file) {
      console.log('No file provided in request');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Step 5: Prepare file for upload
    const fileExtension = file.name.split('.').pop();
    const emailHash = Buffer.from(session.user.email).toString('base64').replace(/[/+=]/g, '');
    const fileName = `avatars/${emailHash}-${Date.now()}.${fileExtension}`;
    console.log('Prepared file name:', fileName);
    
    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    console.log('File converted to buffer, size:', buffer.length);

    try {
      // Step 6: Attempt S3 upload
      console.log('Starting S3 upload...', {
        bucket: process.env.AWS_USER_AVATARS_BUCKET,
        key: fileName,
        contentType: file.type
      });

      const uploadCommand = new PutObjectCommand({
        Bucket: process.env.AWS_USER_AVATARS_BUCKET!,
        Key: fileName,
        Body: buffer,
        ContentType: file.type,
        ACL: 'public-read',
      });

      const uploadResult = await s3Client.send(uploadCommand);
      console.log('S3 upload successful:', uploadResult);

    } catch (s3Error) {
      console.error('S3 Upload Error:', {
        error: s3Error,
        message: s3Error instanceof Error ? s3Error.message : 'Unknown S3 error',
        stack: s3Error instanceof Error ? s3Error.stack : undefined
      });
      return NextResponse.json({ 
        error: 'Failed to upload to S3',
        details: s3Error instanceof Error ? s3Error.message : 'Unknown S3 error'
      }, { status: 500 });
    }

    // Step 7: Generate and return URL
    const imageUrl = `https://${process.env.AWS_USER_AVATARS_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    console.log('Upload complete, generated URL:', imageUrl);

    return NextResponse.json({ 
      success: true, 
      imageUrl 
    });

  } catch (error) {
    console.error('Upload process error:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json({ 
      error: 'Failed to upload avatar',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export const config = {
  api: {
    bodyParser: false, // Disable body parsing, we'll handle it with formData
  },
}; 