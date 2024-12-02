import { vi } from 'vitest';

export class MockS3Client {
  private storage: Map<string, Buffer> = new Map();

  async putObject({ Bucket, Key, Body }: any) {
    const path = `${Bucket}/${Key}`;
    this.storage.set(path, Buffer.from(Body));
    return {
      ETag: `"${Math.random().toString(36).substring(7)}"`,
      VersionId: Date.now().toString()
    };
  }

  async getObject({ Bucket, Key }: any) {
    const path = `${Bucket}/${Key}`;
    const data = this.storage.get(path);
    
    if (!data) {
      throw new Error('NoSuchKey');
    }

    return {
      Body: data,
      ContentLength: data.length,
      LastModified: new Date()
    };
  }

  async deleteObject({ Bucket, Key }: any) {
    const path = `${Bucket}/${Key}`;
    this.storage.delete(path);
    return {
      DeleteMarker: true,
      VersionId: Date.now().toString()
    };
  }

  async listObjects({ Bucket, Prefix = '' }: any) {
    const objects = Array.from(this.storage.entries())
      .filter(([key]) => key.startsWith(`${Bucket}/${Prefix}`))
      .map(([key, value]) => ({
        Key: key.replace(`${Bucket}/`, ''),
        Size: value.length,
        LastModified: new Date()
      }));

    return {
      Contents: objects,
      IsTruncated: false
    };
  }
}

export const createMockS3 = () => {
  return new MockS3Client();
}; 