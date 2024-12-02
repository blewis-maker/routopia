import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import { createMockS3 } from './mockS3';

describe('AWS S3 Integration', () => {
  let s3Client: any;
  const TEST_BUCKET = 'test-bucket';

  beforeAll(() => {
    s3Client = createMockS3();
  });

  it('should upload files successfully', async () => {
    const testData = Buffer.from('Hello, World!');
    const result = await s3Client.putObject({
      Bucket: TEST_BUCKET,
      Key: 'test-file.txt',
      Body: testData
    });

    expect(result.ETag).toBeDefined();
    expect(result.VersionId).toBeDefined();
  });

  it('should retrieve uploaded files', async () => {
    const testData = Buffer.from('Hello, World!');
    await s3Client.putObject({
      Bucket: TEST_BUCKET,
      Key: 'test-file.txt',
      Body: testData
    });

    const result = await s3Client.getObject({
      Bucket: TEST_BUCKET,
      Key: 'test-file.txt'
    });

    expect(result.Body).toEqual(testData);
    expect(result.ContentLength).toBe(testData.length);
  });

  it('should list objects in bucket', async () => {
    // Upload multiple test files
    await Promise.all([
      s3Client.putObject({
        Bucket: TEST_BUCKET,
        Key: 'file1.txt',
        Body: Buffer.from('Content 1')
      }),
      s3Client.putObject({
        Bucket: TEST_BUCKET,
        Key: 'file2.txt',
        Body: Buffer.from('Content 2')
      })
    ]);

    const result = await s3Client.listObjects({
      Bucket: TEST_BUCKET
    });

    expect(result.Contents.length).toBeGreaterThanOrEqual(2);
    expect(result.Contents[0].Key).toBeDefined();
    expect(result.Contents[0].Size).toBeDefined();
  });

  it('should delete objects', async () => {
    // Upload and then delete a file
    await s3Client.putObject({
      Bucket: TEST_BUCKET,
      Key: 'to-delete.txt',
      Body: Buffer.from('Delete me')
    });

    const deleteResult = await s3Client.deleteObject({
      Bucket: TEST_BUCKET,
      Key: 'to-delete.txt'
    });

    expect(deleteResult.DeleteMarker).toBe(true);
    
    // Verify deletion
    await expect(s3Client.getObject({
      Bucket: TEST_BUCKET,
      Key: 'to-delete.txt'
    })).rejects.toThrow('NoSuchKey');
  });
}); 