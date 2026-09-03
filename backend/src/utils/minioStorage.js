'use strict';

/**
 * @file minioStorage.js
 * @description Helper untuk upload buffer/file ke MinIO dengan fallback penyimpanan lokal.
 */

const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const { minioClient, bucketName, isMinioOnline } = require('../config/minio');

// Multer memory storage (menyimpan file di RAM sebelum dialirkan ke MinIO)
const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1 * 1024 * 1024 // Batas maksimal 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Format file tidak didukung. Harap upload gambar (JPEG, PNG, WEBP) atau PDF.'), false);
    }
  }
});

/**
 * Mengunggah file buffer ke MinIO atau ke folder uploads lokal jika MinIO offline.
 * 
 * @param {Object} file - Objek file dari Multer (req.file)
 * @param {string} subFolder - Subfolder tujuan (misal: 'evidence')
 * @returns {Promise<string>} publicUrl - URL publik file yang berhasil disimpan
 */
const uploadFileToStorage = async (file, subFolder = 'evidence') => {
  if (!file || !file.buffer) {
    throw new Error('File buffer tidak ditemukan');
  }

  const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
  const randomStr = crypto.randomBytes(6).toString('hex');
  const fileName = `${subFolder}-${Date.now()}-${randomStr}${ext}`;
  const objectPath = `${subFolder}/${fileName}`;

  // 1. Coba upload ke MinIO jika server aktif
  if (minioClient && isMinioOnline()) {
    try {
      const metaData = {
        'Content-Type': file.mimetype
      };

      await minioClient.putObject(bucketName, objectPath, file.buffer, file.size, metaData);

      const publicBase = process.env.MINIO_PUBLIC_URL || `http://${process.env.MINIO_ENDPOINT || 'localhost'}:${process.env.MINIO_PORT || 9000}/${bucketName}`;
      const fileUrl = `${publicBase}/${objectPath}`;
      console.log(`[Storage MinIO] File berhasil di-upload ke MinIO: ${fileUrl}`);
      return fileUrl;
    } catch (minioErr) {
      console.warn('[Storage MinIO Warning] Upload ke MinIO gagal, beralih ke local storage:', minioErr.message);
    }
  }

  // 2. Fallback: Simpan ke folder uploads lokal
  const localDir = path.join(__dirname, '..', '..', 'uploads', subFolder);
  if (!fs.existsSync(localDir)) {
    fs.mkdirSync(localDir, { recursive: true });
  }

  const localFilePath = path.join(localDir, fileName);
  fs.writeFileSync(localFilePath, file.buffer);

  const port = process.env.PORT || 3000;
  const localUrl = `http://localhost:${port}/uploads/${subFolder}/${fileName}`;
  console.log(`[Storage Local] File disimpan secara lokal: ${localUrl}`);
  return localUrl;
};

module.exports = {
  uploadMiddleware,
  uploadFileToStorage
};
