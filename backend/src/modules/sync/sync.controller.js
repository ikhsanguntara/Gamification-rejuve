'use strict';

/**
 * @file sync.controller.js
 * @description Controller untuk sinkronisasi data Master Departments dan Users dengan sistem Lynx.
 */

const axios = require('axios');
const bcrypt = require('bcryptjs');
const prisma = require('../../config/db');
const { sendSuccess, sendError } = require('../../utils/responseWrapper');

/**
 * Helper internal untuk memetakan role dari payload Lynx ke roleId UUID di Gamification.
 */
const resolveUserRoleId = async (user, roleMapByCode, roleMapById, defaultCrewRoleId, tx) => {
  if (user.roleId && roleMapById[user.roleId]) {
    return user.roleId;
  }

  const rawRole = String(user.roleCode || user.role || user.usergroup || '').trim().toUpperCase();

  if (rawRole && roleMapByCode[rawRole]) {
    return roleMapByCode[rawRole];
  }

  if (['CREW_STORE', 'BARISTA', 'STORE_CREW', 'CREW'].includes(rawRole)) {
    return roleMapByCode['CREW'] || defaultCrewRoleId;
  }
  if (['SUPERVISOR', 'STORE_LEADER', 'SL', 'STORE_LEADER_SUPERVISOR'].includes(rawRole)) {
    return roleMapByCode['STORE_LEADER'] || defaultCrewRoleId;
  }
  if (['HEAD', 'DISTRICT_MANAGER', 'DM', 'DISTRICT_MANAGER_HEAD'].includes(rawRole)) {
    return roleMapByCode['DISTRICT_MANAGER'] || defaultCrewRoleId;
  }
  if (['SUPERADMIN', 'ADMIN', 'SUPER_ADMIN'].includes(rawRole)) {
    return roleMapByCode['SUPERADMIN'] || defaultCrewRoleId;
  }

  if (rawRole && tx) {
    const createdRole = await tx.role.create({
      data: {
        roleCode: rawRole,
        roleName: rawRole.replace(/_/g, ' ')
      }
    });
    roleMapByCode[rawRole] = createdRole.roleId;
    roleMapById[createdRole.roleId] = createdRole.roleId;
    return createdRole.roleId;
  }

  return defaultCrewRoleId;
};

// =============================================================================
// DEPARTMENTS SYNC
// =============================================================================

const syncDepartments = async (req, res) => {
  try {
    const departments = req.body;
    
    if (!Array.isArray(departments)) {
      return sendError(res, { statusCode: 400, message: 'Payload must be an array' });
    }

    const results = [];
    
    await prisma.$transaction(async (tx) => {
      for (const dept of departments) {
        const result = await tx.department.upsert({
          where: { departmentId: dept.departmentId },
          update: {
            departmentCode: dept.departmentCode,
            departmentName: dept.departmentName,
            regionCode: dept.regionCode || null,
            isActive: dept.isActive !== undefined ? dept.isActive : true,
            userSlId: dept.userSlId || null,
            userDmId: dept.userDmId || null,
          },
          create: {
            departmentId: dept.departmentId,
            departmentCode: dept.departmentCode,
            departmentName: dept.departmentName,
            regionCode: dept.regionCode || null,
            isActive: dept.isActive !== undefined ? dept.isActive : true,
            userSlId: dept.userSlId || null,
            userDmId: dept.userDmId || null,
          }
        });
        results.push(result.departmentId);
      }
    });

    return sendSuccess(res, {
      statusCode: 200,
      message: `${results.length} departments synced successfully`,
      data: results
    });
  } catch (error) {
    return sendError(res, {
      statusCode: 500,
      message: 'Failed to sync departments',
      data: error.message
    });
  }
};

const pullAllDepartments = async (req, res) => {
  try {
    const lynxBaseUrl = process.env.LYNX_API_URL;
    const lynxToken = process.env.LYNX_API_TOKEN;

    if (!lynxBaseUrl) return sendError(res, { statusCode: 500, message: 'LYNX_API_URL is not set' });

    const response = await axios.get(`${lynxBaseUrl}/gamification/departments`, {
      headers: { 'Authorization': `Bearer ${lynxToken}` }
    });

    const departments = response.data;
    if (!Array.isArray(departments)) return sendError(res, { statusCode: 500, message: 'Invalid data format from Lynx' });

    const results = [];
    const lynxDeptIds = departments.map(d => d.departmentId).filter(Boolean);

    await prisma.$transaction(async (tx) => {
      if (lynxDeptIds.length > 0) {
        await tx.department.updateMany({
          where: {
            departmentId: { notIn: lynxDeptIds },
            isActive: true
          },
          data: {
            isActive: false
          }
        });
      }

      for (const dept of departments) {
        const result = await tx.department.upsert({
          where: { departmentId: dept.departmentId },
          update: {
            departmentCode: dept.departmentCode,
            departmentName: dept.departmentName,
            isActive: dept.isActive !== undefined ? dept.isActive : true,
          },
          create: {
            departmentId: dept.departmentId,
            departmentCode: dept.departmentCode,
            departmentName: dept.departmentName,
            regionCode: dept.regionCode || null,
            isActive: dept.isActive !== undefined ? dept.isActive : true,
          }
        });
        results.push(result.departmentId);
      }
    });

    return sendSuccess(res, {
      statusCode: 200,
      message: `Successfully pulled and upserted ${results.length} departments`,
      data: results
    });
  } catch (error) {
    return sendError(res, {
      statusCode: 500,
      message: 'Failed to pull departments from Lynx',
      data: error.message
    });
  }
};

// =============================================================================
// USERS SYNC
// =============================================================================

const syncUsers = async (req, res) => {
  try {
    const users = req.body;
    
    if (!Array.isArray(users)) {
      return sendError(res, { statusCode: 400, message: 'Payload must be an array' });
    }

    const roles = await prisma.role.findMany();
    const roleMapByCode = {};
    const roleMapById = {};
    for (const r of roles) {
      roleMapByCode[r.roleCode.toUpperCase()] = r.roleId;
      roleMapById[r.roleId] = r.roleId;
    }
    const defaultCrewRoleId = roleMapByCode['CREW'] || (roles[0] ? roles[0].roleId : null);

    const existingDepts = await prisma.department.findMany({ select: { departmentId: true } });
    const validDeptIds = new Set(existingDepts.map(d => d.departmentId));

    const results = [];
    
    await prisma.$transaction(async (tx) => {
      for (const user of users) {
        const roleId = await resolveUserRoleId(user, roleMapByCode, roleMapById, defaultCrewRoleId, tx);
        const departmentId = (user.departmentId && validDeptIds.has(user.departmentId)) ? user.departmentId : null;

        const result = await tx.user.upsert({
          where: { userId: user.userId },
          update: {
            name: user.name,
            email: user.email,
            password: user.password || '$2y$12$defaultHashedPasswordFallback',
            roleId,
            isActive: user.isActive !== undefined ? user.isActive : true,
            departmentId,
            isBuddy: user.isBuddy !== undefined ? user.isBuddy : false,
            userBuddyId: user.userBuddyId || null,
            batchId: user.batchId || null,
          },
          create: {
            userId: user.userId,
            name: user.name,
            email: user.email,
            password: user.password || '$2y$12$defaultHashedPasswordFallback', 
            roleId,
            isActive: user.isActive !== undefined ? user.isActive : true,
            departmentId,
            isBuddy: user.isBuddy !== undefined ? user.isBuddy : false,
            userBuddyId: user.userBuddyId || null,
            batchId: user.batchId || null,
          }
        });
        results.push(result.userId);
      }
    });

    return sendSuccess(res, {
      statusCode: 200,
      message: `${results.length} users synced successfully`,
      data: results
    });

  } catch (error) {
    return sendError(res, {
      statusCode: 500,
      message: 'Failed to sync users',
      data: error.message
    });
  }
};

const pullAllUsers = async (req, res) => {
  try {
    const lynxBaseUrl = process.env.LYNX_API_URL;
    const lynxToken = process.env.LYNX_API_TOKEN;

    if (!lynxBaseUrl) return sendError(res, { statusCode: 500, message: 'LYNX_API_URL is not set' });

    const response = await axios.get(`${lynxBaseUrl}/gamification/users`, {
      headers: { 'Authorization': `Bearer ${lynxToken}` }
    });

    const users = response.data;
    if (!Array.isArray(users)) return sendError(res, { statusCode: 500, message: 'Invalid data format from Lynx' });

    const roles = await prisma.role.findMany();
    const roleMapByCode = {};
    const roleMapById = {};
    for (const r of roles) {
      roleMapByCode[r.roleCode.toUpperCase()] = r.roleId;
      roleMapById[r.roleId] = r.roleId;
    }
    const defaultCrewRoleId = roleMapByCode['CREW'] || (roles[0] ? roles[0].roleId : null);

    const existingDepts = await prisma.department.findMany({ select: { departmentId: true } });
    const validDeptIds = new Set(existingDepts.map(d => d.departmentId));

    // Ambil daftar seluruh email pengguna yang sudah ada di database (Insert-only by email)
    const existingUsers = await prisma.user.findMany({ select: { email: true } });
    const existingEmailSet = new Set(
      existingUsers.map(u => (u.email ? u.email.toLowerCase().trim() : '')).filter(Boolean)
    );

    // Ambil default password dari user policy untuk fallback non-CREW jika Lynx tidak mengirim password
    let defaultNonCrewPassword = 'password123';
    try {
      const pwPolicy = await prisma.userPolicy.findFirst({
        where: {
          userpolicyCode: {
            equals: 'DEFAULT_PASSWORD',
            mode: 'insensitive'
          }
        }
      });
      if (pwPolicy?.userpolicyValue) {
        defaultNonCrewPassword = pwPolicy.userpolicyValue;
      }
    } catch (e) {}

    const results = [];
    let skippedCount = 0;

    await prisma.$transaction(async (tx) => {
      for (const user of users) {
        if (!user.email) continue;
        const normalizedEmail = String(user.email).toLowerCase().trim();

        // Jika email sudah terdaftar di Gamifikasi, lewati (insert-only by email, jangan update)
        if (existingEmailSet.has(normalizedEmail)) {
          skippedCount++;
          continue;
        }

        const roleId = await resolveUserRoleId(user, roleMapByCode, roleMapById, defaultCrewRoleId, tx);
        const departmentId = (user.departmentId && validDeptIds.has(user.departmentId)) ? user.departmentId : null;

        // Resolusi password dari Lynx:
        // Gunakan password yang di Lynx. Jika sudah berupa hash bcrypt ($2a$, $2b$, $2y$), simpan langsung.
        // Jika berupa plaintext, hash dengan bcrypt.
        // Jika kosong/null, fallback: CREW menggunakan emailPrefix, non-CREW menggunakan DEFAULT_PASSWORD policy.
        const emailPrefix = normalizedEmail.includes('@') ? normalizedEmail.split('@')[0] : (normalizedEmail || 'user123');
        const isCrewRole = roleId === defaultCrewRoleId || roleMapByCode['CREW'] === roleId;

        let finalHashedPassword;
        if (user.password && typeof user.password === 'string' && user.password.trim()) {
          const p = user.password.trim();
          if (p.startsWith('$2a$') || p.startsWith('$2b$') || p.startsWith('$2y$')) {
            finalHashedPassword = p;
          } else {
            finalHashedPassword = await bcrypt.hash(p, 10);
          }
        } else {
          const fallbackRaw = isCrewRole ? emailPrefix : defaultNonCrewPassword;
          finalHashedPassword = await bcrypt.hash(fallbackRaw, 10);
        }

        let normalizedGender = null;
        if (user.gender) {
          const g = String(user.gender).trim().toUpperCase();
          if (g === 'M' || g === 'L' || g === 'MALE' || g === 'LAKI-LAKI') normalizedGender = 'M';
          else if (g === 'F' || g === 'P' || g === 'FEMALE' || g === 'PEREMPUAN') normalizedGender = 'F';
          else normalizedGender = g;
        }

        const createdUser = await tx.user.create({
          data: {
            userId: user.userId,
            name: user.name,
            email: user.email,
            password: finalHashedPassword,
            roleId,
            isActive: user.isActive !== undefined ? user.isActive : true,
            departmentId,
            isBuddy: user.isBuddy !== undefined ? user.isBuddy : false,
            userBuddyId: user.userBuddyId || null,
            batchId: user.batchId || null,
            gender: normalizedGender,
            phone: user.phone ? String(user.phone).trim() : null,
            avatarUrl: user.avatarUrl ? String(user.avatarUrl).trim() : null
          }
        });

        existingEmailSet.add(normalizedEmail);
        results.push(createdUser.userId);
      }
    });

    return sendSuccess(res, {
      statusCode: 200,
      message: `Pull users completed: ${results.length} new users inserted, ${skippedCount} existing users skipped`,
      data: {
        insertedCount: results.length,
        skippedCount,
        insertedUserIds: results
      }
    });
  } catch (error) {
    return sendError(res, {
      statusCode: 500,
      message: 'Failed to pull users from Lynx',
      data: error.message
    });
  }
};

module.exports = {
  syncDepartments,
  syncUsers,
  pullAllDepartments,
  pullAllUsers
};
