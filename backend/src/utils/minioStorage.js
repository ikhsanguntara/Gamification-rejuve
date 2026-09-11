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
    fileSize: 5 * 1024 * 1024 // Batas maksimal 5MB
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
const uploadFileToStorage = async (file, subFolder = 'evidence', req = null) => {
  if (!file || !file.buffer) {
    throw new Error('File buffer tidak ditemukan');
  }

  const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
  const randomStr = crypto.randomBytes(6).toString('hex');
  const fileName = `${subFolder}-${Date.now()}-${randomStr}${ext}`;
  const objectPath = `${subFolder}/${fileName}`;

  // Simpan selalu salinan lokal ke disk sebagai fallback/cache cepat
  try {
    const localDir = path.join(__dirname, '..', '..', 'uploads', subFolder);
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    const localFilePath = path.join(localDir, fileName);
    fs.writeFileSync(localFilePath, file.buffer);
  } catch (localWriteErr) {
    console.warn('[Storage Local Copy Warning]', localWriteErr.message);
  }

  // 1. Coba upload ke MinIO jika server aktif
  if (minioClient && isMinioOnline()) {
    try {
      const metaData = {
        'Content-Type': file.mimetype
      };

      await minioClient.putObject(bucketName, objectPath, file.buffer, file.size, metaData);

      let publicBase = process.env.MINIO_PUBLIC_URL || `http://${process.env.MINIO_ENDPOINT || 'localhost'}:${process.env.MINIO_PORT || 9010}/${bucketName}`;
      if (req) {
        publicBase = `${req.protocol}://${req.get('host')}/${bucketName}`;
      }
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

  let baseUrl = process.env.APP_URL || process.env.BASE_URL;
  if (!baseUrl && req) {
    baseUrl = `${req.protocol}://${req.get('host')}`;
  }
  if (!baseUrl) {
    const port = process.env.PORT || 3000;
    baseUrl = `http://localhost:${port}`;
  }
  baseUrl = baseUrl.replace(/\/$/, '');

  const localUrl = `${baseUrl}/uploads/${subFolder}/${fileName}`;
  console.log(`[Storage Local] File disimpan secara lokal: ${localUrl}`);
  return localUrl;
};

/**
 * Normalisasi URL storage (mengubah localhost URL dari DB menjadi dynamic host URL).
 */
const normalizeStorageUrl = (url, req = null) => {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes('localhost:') && !url.includes('127.0.0.1:')) return url;

  let currentOrigin = process.env.APP_URL || process.env.BASE_URL;
  if (!currentOrigin && req) {
    currentOrigin = `${req.protocol}://${req.get('host')}`;
  }
  if (!currentOrigin) return url;
  currentOrigin = currentOrigin.replace(/\/$/, '');

  return url.replace(/^https?:\/\/[^/]+/, currentOrigin);
};

module.exports = {
  uploadMiddleware,
  uploadFileToStorage,
  normalizeStorageUrl
};
