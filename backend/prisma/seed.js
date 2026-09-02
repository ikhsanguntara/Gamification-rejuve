'use strict';

/**
 * @file seed.js
 * @description Database seeder untuk data awal Gamification API (Phase 1 & 2).
 */

require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const { PrismaPg }     = require('@prisma/adapter-pg');
const { Pool }         = require('pg');
const bcrypt           = require('bcryptjs');

const pool    = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma  = new PrismaClient({ adapter });

const SALT_ROUNDS  = 10;
const DEFAULT_PASS = 'password123';

async function main() {
  console.log('\n🌱 Memulai proses seeding database...\n');

  const hashedPassword = await bcrypt.hash(DEFAULT_PASS, SALT_ROUNDS);

  // 1. Department
  const department = await prisma.department.upsert({
    where:  { departmentCode: 'BKI1' },
    update: {},
    create: {
      departmentCode: 'BKI1',
      departmentName: 'Re.juve Bekasi',
      regionCode: 'JABODETABEK',
      createdBy: 'seeder',
    },
  });
  console.log(`✅ Department : ${department.departmentName} (${department.departmentCode})`);

  // 2. User SUPERADMIN
  const superadmin = await prisma.user.upsert({
    where:  { email: 'superadmin@example.com' },
    update: {},
    create: {
      name:         'Super Admin',
      email:        'superadmin@example.com',
      password:     hashedPassword,
      role:         'SUPERADMIN',
      departmentId: department.departmentId,
      createdBy:    'seeder',
    },
  });
  console.log(`✅ SUPERADMIN : ${superadmin.name} <${superadmin.email}>`);
  
  // 3. User STORE_LEADER
  const sl = await prisma.user.upsert({
    where:  { email: 'sl@example.com' },
    update: {},
    create: {
      name:         'Store Leader',
      email:        'sl@example.com',
      password:     hashedPassword,
      role:         'STORE_LEADER',
      departmentId: department.departmentId,
      createdBy:    'seeder',
    },
  });
  console.log(`✅ STORE_LEADER : ${sl.name} <${sl.email}>`);

  console.log('\n──────────────────────────────────────────────────');
  console.log('🎉 Seeding selesai! Data siap digunakan.\n');
  console.log('Kredensial default (semua user):');
  console.log(`  Password : ${DEFAULT_PASS}`);
  console.log('──────────────────────────────────────────────────\n');
}

main()
  .catch((error) => {
    console.error('\n❌ Seeding gagal:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
