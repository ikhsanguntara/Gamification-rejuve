'use strict';

/**
 * @file db.js
 * @description Singleton Prisma Client untuk seluruh aplikasi.
 *
 * Prisma v7 mewajibkan penggunaan Driver Adapter.
 * Kita menggunakan @prisma/adapter-pg (PostgreSQL) yang membungkus `pg` Pool.
 *
 * Referensi: https://pris.ly/d/prisma7-client-config
 */

const { PrismaClient } = require('@prisma/client');
const { PrismaPg }     = require('@prisma/adapter-pg');
const { Pool }         = require('pg');

// Validasi: DATABASE_URL wajib ada di .env
if (!process.env.DATABASE_URL) {
  throw new Error('[db.js] DATABASE_URL tidak ditemukan di environment variables.');
}

// Buat connection pool PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Pool settings untuk efisiensi koneksi di lingkungan production
  max: 10,               // maksimum 10 koneksi paralel
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Bungkus pool dengan adapter Prisma untuk PostgreSQL
const adapter = new PrismaPg(pool);

// Inisialisasi PrismaClient — hanya satu instance (Singleton pattern)
const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development'
    ? ['query', 'warn', 'error']
    : ['warn', 'error'],
});

module.exports = prisma;
