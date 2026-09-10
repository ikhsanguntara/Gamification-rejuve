'use strict';

/**
 * @file seed.js
 * @description Database seeder untuk data awal Gamification API (m_roles, m_departments, m_users).
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

  // 1. Roles (Master Role UUID)
  const roleSuperAdmin = await prisma.role.upsert({
    where: { roleCode: 'SUPERADMIN' },
    update: {},
    create: {
      roleCode: 'SUPERADMIN',
      roleName: 'Super Administrator',
      createdBy: 'seeder'
    }
  });

  const roleDM = await prisma.role.upsert({
    where: { roleCode: 'DISTRICT_MANAGER' },
    update: {},
    create: {
      roleCode: 'DISTRICT_MANAGER',
      roleName: 'District Manager / Head',
      createdBy: 'seeder'
    }
  });

  const roleSL = await prisma.role.upsert({
    where: { roleCode: 'STORE_LEADER' },
    update: {},
    create: {
      roleCode: 'STORE_LEADER',
      roleName: 'Store Leader / Supervisor',
      createdBy: 'seeder'
    }
  });

  const roleCrew = await prisma.role.upsert({
    where: { roleCode: 'CREW' },
    update: {},
    create: {
      roleCode: 'CREW',
      roleName: 'Store Crew',
      createdBy: 'seeder'
    }
  });

  console.log('✅ Roles seeded: SUPERADMIN, DISTRICT_MANAGER, STORE_LEADER, CREW');

  // 2. Department
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

  // 3. User SUPERADMIN
  const superadmin = await prisma.user.upsert({
    where:  { email: 'superadmin@example.com' },
    update: {},
    create: {
      name:         'Super Admin',
      email:        'superadmin@example.com',
      password:     hashedPassword,
      roleId:       roleSuperAdmin.roleId,
      departmentId: department.departmentId,
      createdBy:    'seeder',
    },
  });
  console.log(`✅ SUPERADMIN : ${superadmin.name} <${superadmin.email}>`);

  // 4. User DISTRICT_MANAGER (DM)
  const dm = await prisma.user.upsert({
    where: { email: 'dm@example.com' },
    update: {},
    create: {
      name: 'District Manager Area 1',
      email: 'dm@example.com',
      password: hashedPassword,
      roleId: roleDM.roleId,
      departmentId: department.departmentId,
      createdBy: 'seeder'
    }
  });
  console.log(`✅ DISTRICT_MANAGER : ${dm.name} <${dm.email}>`);
  
  // 5. User STORE_LEADER (SL)
  const sl = await prisma.user.upsert({
    where:  { email: 'sl@example.com' },
    update: {},
    create: {
      name:         'Store Leader BKI1',
      email:        'sl@example.com',
      password:     hashedPassword,
      roleId:       roleSL.roleId,
      departmentId: department.departmentId,
      createdBy:    'seeder',
    },
  });
  console.log(`✅ STORE_LEADER : ${sl.name} <${sl.email}>`);

  // Hubungkan SL dan DM ke department
  await prisma.department.update({
    where: { departmentId: department.departmentId },
    data: {
      userSlId: sl.userId,
      userDmId: dm.userId
    }
  });

  // 6. User Buddy (Mentor Crew)
  const buddy = await prisma.user.upsert({
    where: { email: 'buddy@example.com' },
    update: {},
    create: {
      name: 'Senior Barista (Buddy)',
      email: 'buddy@example.com',
      password: hashedPassword,
      roleId: roleCrew.roleId,
      isBuddy: true,
      departmentId: department.departmentId,
      createdBy: 'seeder'
    }
  });
  console.log(`✅ BUDDY : ${buddy.name} <${buddy.email}>`);

  // 7. User Crew Mentee
  const crew = await prisma.user.upsert({
    where: { email: 'crew@example.com' },
    update: {},
    create: {
      name: 'Budi Santoso (Crew)',
      email: 'crew@example.com',
      password: hashedPassword,
      roleId: roleCrew.roleId,
      userBuddyId: buddy.userId,
      departmentId: department.departmentId,
      createdBy: 'seeder'
    }
  });
  console.log(`✅ CREW : ${crew.name} <${crew.email}>`);

  // 8. Bisnis Parameter (ParamGroup & Param)
  const groupMissionCat = await prisma.paramGroup.upsert({
    where: { code: 'MISSION_CATEGORY' },
    update: {},
    create: {
      code: 'MISSION_CATEGORY',
      name: 'Kategori Misi SOP',
      createdBy: 'seeder'
    }
  });

  const missionParams = [
    { code: 'TECHNICAL', value: 'TECHNICAL (Operasional)' },
    { code: 'SOFT_SKILL', value: 'SOFT_SKILL (Layanan)' },
    { code: 'LEADERSHIP', value: 'LEADERSHIP (Manajerial)' },
    { code: 'PROJECT', value: 'PROJECT (Proyek Khusus)' }
  ];
  for (const mp of missionParams) {
    await prisma.param.upsert({
      where: { code: mp.code },
      update: { value: mp.value },
      create: {
        paramgroupId: groupMissionCat.paramgroupId,
        code: mp.code,
        value: mp.value,
        createdBy: 'seeder'
      }
    });
  }
  console.log('✅ Param Group : MISSION_CATEGORY (4 parameter SOP)');

  const groupBuddyCat = await prisma.paramGroup.upsert({
    where: { code: 'BUDDY_CATEGORY' },
    update: {},
    create: {
      code: 'BUDDY_CATEGORY',
      name: 'Kategori Rapor Buddy',
      createdBy: 'seeder'
    }
  });

  const buddyParams = [
    { code: 'PRODUCT_KNOWLEDGE', value: 'Product Knowledge' },
    { code: 'CUSTOMER_SERVICE', value: 'Customer Service' },
    { code: 'SALES_UPSELLING', value: 'Sales & Upselling' },
    { code: 'CASHIER_OPERATION', value: 'Cashier Operation' },
    { code: 'STORE_OPERATION', value: 'Store Operation' },
    { code: 'FOOD_SAFETY_QUALITY', value: 'Food Safety & Quality' },
    { code: 'TEAMWORK_ATTITUDE', value: 'Teamwork & Attitude' }
  ];
  for (const bp of buddyParams) {
    await prisma.param.upsert({
      where: { code: bp.code },
      update: { value: bp.value },
      create: {
        paramgroupId: groupBuddyCat.paramgroupId,
        code: bp.code,
        value: bp.value,
        createdBy: 'seeder'
      }
    });
  }
  console.log('✅ Param Group : BUDDY_CATEGORY (7 parameter Rapor Buddy)');

  // 10. Param Group : GAMIFICATION_RULES
  const groupGamification = await prisma.paramGroup.upsert({
    where: { code: 'GAMIFICATION_RULES' },
    update: {
      name: 'Aturan & Parameter Gamifikasi'
    },
    create: {
      code: 'GAMIFICATION_RULES',
      name: 'Aturan & Parameter Gamifikasi',
      createdBy: 'seeder'
    }
  });

  const earlyBirdTiers = [
    { dayOffset: 0, stars: 5, points: 100, label: 'Hari H (Sangat Tepat Waktu)' },
    { dayOffset: 1, stars: 4, points: 80, label: 'H+1' },
    { dayOffset: 2, stars: 3, points: 60, label: 'H+2' },
    { dayOffset: 3, stars: 2, points: 40, label: 'H+3' },
    { dayOffset: 999, stars: 1, points: 20, label: 'H+4 ke atas (Standar)' }
  ];

  await prisma.param.upsert({
    where: { code: 'EARLY_BIRD_SCORES' },
    update: {
      paramgroupId: groupGamification.paramgroupId,
      value: JSON.stringify(earlyBirdTiers)
    },
    create: {
      paramgroupId: groupGamification.paramgroupId,
      code: 'EARLY_BIRD_SCORES',
      value: JSON.stringify(earlyBirdTiers),
      createdBy: 'seeder'
    }
  });
  console.log('✅ Param Group : GAMIFICATION_RULES (EARLY_BIRD_SCORES parameter tier)');

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
