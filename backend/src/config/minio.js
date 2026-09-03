'use strict';

/**
 * @file minio.js
 * @description Inisialisasi MinIO Client dengan auto-bucket creation dan fallback lokal.
 */

const Minio = require('minio');

const endPoint = process.env.MINIO_ENDPOINT || 'localhost';
const port = parseInt(process.env.MINIO_PORT, 10) || 9000;
const useSSL = process.env.MINIO_USE_SSL === 'true';
const accessKey = process.env.MINIO_ACCESS_KEY || 'minioadmin';
const secretKey = process.env.MINIO_SECRET_KEY || 'minioadmin';
const bucketName = process.env.MINIO_BUCKET || 'gamification';

let minioClient = null;
let isMinioAvailable = false;

try {
  minioClient = new Minio.Client({
    endPoint,
    port,
    useSSL,
    accessKey,
    secretKey
  });
} catch (err) {
  console.warn('[MinIO Config] Gagal inisialisasi Minio Client:', err.message);
}

/**
 * Inisialisasi bucket MinIO saat aplikasi boot.
 * Jika server MinIO tidak aktif di lokal, sistem tidak akan crash melainkan mencatat peringatan.
 */
const initMinIO = async () => {
  if (!minioClient) return false;

  try {
    const bucketExists = await minioClient.bucketExists(bucketName);
    if (!bucketExists) {
      await minioClient.makeBucket(bucketName, 'us-east-1');
      console.log(`[MinIO] Bucket "${bucketName}" berhasil dibuat.`);
      
      // Set public read policy agar foto dapat diakses via URL oleh Frontend
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetBucketLocation', 's3:ListBucket'],
            Resource: [`arn:aws:s3:::${bucketName}`]
          },
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${bucketName}/*`]
          }
        ]
      };
      await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
      console.log(`[MinIO] Policy public-read berhasil dipasang pada bucket "${bucketName}".`);
    } else {
      console.log(`[MinIO] Terhubung ke bucket "${bucketName}".`);
    }
    isMinioAvailable = true;
    return true;
  } catch (err) {
    console.warn(`[MinIO Warning] Server MinIO (${endPoint}:${port}) tidak dapat dihubungi (${err.code || err.message}).`);
    console.warn(`[MinIO Fallback] Mengaktifkan mode penyimpanan lokal (uploads/evidence).`);
    isMinioAvailable = false;
    return false;
  }
};

module.exports = {
  minioClient,
  initMinIO,
  bucketName,
  isMinioOnline: () => isMinioAvailable
};
