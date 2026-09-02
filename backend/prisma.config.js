'use strict';

// Prisma v7 — File konfigurasi wajib untuk mendefinisikan koneksi database.
// Menggantikan 'url' yang dulu ada di datasource block pada schema.prisma.
// Referensi: https://pris.ly/d/config-datasource

require('dotenv').config();

const { defineConfig } = require('prisma/config');

module.exports = defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL,
  },
  migrations: {
    seed: 'node prisma/seed.js',
  },
});
