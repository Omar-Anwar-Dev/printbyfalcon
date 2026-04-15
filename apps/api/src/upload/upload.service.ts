import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

@Injectable()
export class UploadService implements OnModuleInit {
  private client: Minio.Client;
  private bucket: string;
  private readonly logger = new Logger(UploadService.name);

  constructor(private config: ConfigService) {
    this.client = new Minio.Client({
      endPoint: config.get('MINIO_ENDPOINT', 'minio'),
      port: parseInt(config.get('MINIO_PORT', '9000')),
      useSSL: false,
      accessKey: config.get('MINIO_ACCESS_KEY'),
      secretKey: config.get('MINIO_SECRET_KEY'),
    });
    this.bucket = config.get('MINIO_BUCKET', 'printbyfalcon-media');
  }

  async onModuleInit() {
    try {
      const exists = await this.client.bucketExists(this.bucket);
      if (!exists) {
        await this.client.makeBucket(this.bucket);
        this.logger.log(`✅ MinIO bucket created: ${this.bucket}`);
      } else {
        this.logger.log(`✅ MinIO bucket ready: ${this.bucket}`);
      }
    } catch (error) {
      this.logger.warn(`⚠️ MinIO not available: ${(error as Error).message}`);
    }
  }

  async uploadFile(
    buffer: Buffer,
    originalName: string,
    mimetype: string,
    folder: string = 'uploads',
  ): Promise<string> {
    const ext = path.extname(originalName);
    const filename = `${folder}/${uuidv4()}${ext}`;

    await this.client.putObject(this.bucket, filename, buffer, buffer.length, {
      'Content-Type': mimetype,
    });

    const endpoint = this.config.get('MINIO_ENDPOINT', 'minio');
    const port = this.config.get('MINIO_PORT', '9000');
    return `http://${endpoint}:${port}/${this.bucket}/${filename}`;
  }

  async deleteFile(fileUrl: string): Promise<void> {
    try {
      const url = new URL(fileUrl);
      const objectName = url.pathname.replace(`/${this.bucket}/`, '');
      await this.client.removeObject(this.bucket, objectName);
    } catch (error) {
      this.logger.warn(`Could not delete file: ${(error as Error).message}`);
    }
  }
}
