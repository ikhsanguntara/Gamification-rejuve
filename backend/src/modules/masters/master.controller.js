'use strict';

/**
 * @file master.controller.js
 * @description Handles CRUD untuk Master Data: Departments, Users, dan Roles.
 */

const bcrypt = require('bcryptjs');
const prisma = require('../../config/db');
const { sendSuccess, sendError, sendPaginated } = require('../../utils/responseWrapper');
const { parsePrismaQuery } = require('../../utils/queryParser');
const { pushToLynx } = require('../../utils/lynxSync');

// =============================================================================
// DEPARTMENTS
// =============================================================================

/**
 * Helper untuk menyematkan data Store Leader (SL) dan District Manager (DM) ke objek departemen.
 */
const enrichDepartmentsWithManagers = async (departments) => {
  if (!Array.isArray(departments) || departments.length === 0) {
    return departments;
  }

  const managerIds = [...new Set(
    departments.flatMap(d => [d.userSlId, d.userDmId]).filter(Boolean)
  )];

  if (managerIds.length === 0) {
    for (const d of departments) {
      d.userSl = null;
      d.userDm = null;
    }
    return departments;
  }

  const users = await prisma.user.findMany({
    where: { userId: { in: managerIds } },
    select: {
      userId: true,
      name: true,
      email: true,
      isActive: true,
      role: {
        select: {
          roleId: true,
          roleCode: true,
          roleName: true
        }
      }
    }
  });

  const userMap = new Map();
  for (const u of users) {
    userMap.set(u.userId, {
      userId: u.userId,
      id: u.userId,
      name: u.name,
      email: u.email,
      username: u.email,
      defaultPassword: 'password123',
      position: u.role?.roleName || (u.role?.roleCode === 'STORE_LEADER' ? 'Store Leader' : 'District Manager'),
      role: u.role?.roleCode || '',
      roleCode: u.role?.roleCode || '',
      roleName: u.role?.roleName || '',
      isActive: u.isActive
    });
  }

  for (const d of departments) {
    d.userSl = d.userSlId ? userMap.get(d.userSlId) || null : null;
    d.userDm = d.userDmId ? userMap.get(d.userDmId) || null : null;
  }

  return departments;
};

const getDepartments = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const queryClone = { ...req.query };
    delete queryClone.page;
    delete queryClone.limit;

    // Searchable: departmentCode, departmentName, regionCode
    const where = parsePrismaQuery(queryClone, ['departmentCode', 'departmentName', 'regionCode']);

    const [rawDepartments, total] = await Promise.all([
      prisma.department.findMany({
        where,
        skip,
        take: limit,
        orderBy: { departmentCode: 'asc' }
      }),
      prisma.department.count({ where })
    ]);

    const data = await enrichDepartmentsWithManagers(rawDepartments);

    return sendPaginated(res, {
      message: 'Daftar departemen berhasil diambil.',
      data,
      total,
      page,
      limit
    });
  } catch (error) {
    next(error);
  }
};

const getDepartmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await prisma.department.findUnique({
      where: { departmentId: id }
    });

    if (!data) {
      return sendError(res, { statusCode: 404, message: 'Departemen tidak ditemukan.' });
    }

    await enrichDepartmentsWithManagers([data]);

    return sendSuccess(res, {
      message: 'Detail departemen berhasil diambil.',
      data
    });
  } catch (error) {
    next(error);
  }
};

const createDepartment = async (req, res, next) => {
  try {
    const { departmentCode, departmentName, regionCode, isActive, userSlId, userDmId } = req.body;
    const creatorId = req.user?.id || req.user?.userId || null;

    const department = await prisma.department.create({
      data: {
        departmentCode,
        departmentName,
        regionCode,
        isActive: isActive !== undefined ? isActive : true,
        userSlId: userSlId || null,
        userDmId: userDmId || null,
        createdBy: creatorId
      }
    });

    await enrichDepartmentsWithManagers([department]);

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Departemen berhasil dibuat.',
      data: department
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return sendError(res, { statusCode: 409, message: `Kode departemen "${req.body.departmentCode}" sudah digunakan.` });
    }
    next(error);
  }
};

const updateDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { departmentCode, departmentName, regionCode, isActive, userSlId, userDmId } = req.body;
    const updaterId = req.user?.id || req.user?.userId || null;

    const department = await prisma.department.update({
      where: { departmentId: id },
      data: {
        departmentCode,
        departmentName,
        regionCode,
        isActive,
        userSlId,
        userDmId,
        updatedBy: updaterId
      }
    });

    await enrichDepartmentsWithManagers([department]);

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Departemen berhasil diperbarui.',
      data: department
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return sendError(res, { statusCode: 409, message: `Kode departemen "${req.body.departmentCode}" sudah digunakan.` });
    }
    next(error);
  }
};

const deleteDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.department.delete({ where: { departmentId: id } });

    return sendSuccess(res, { statusCode: 200, message: 'Departemen berhasil dihapus.' });
  } catch (error) {
    next(error);
  }
};

// =============================================================================
// USERS CRUD
// =============================================================================

const getUsers = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const queryClone = { ...req.query };
    delete queryClone.page;
    delete queryClone.limit;

    // Filter khusus hasBatch: true / false
    let hasBatchFilter = undefined;
    if (queryClone.hasBatch !== undefined) {
      const val = String(queryClone.hasBatch).toLowerCase();
      if (val === 'true') {
        hasBatchFilter = { not: null };
      } else if (val === 'false') {
        hasBatchFilter = null;
      }
      delete queryClone.hasBatch;
    }

    // Searchable: name, email
    const where = parsePrismaQuery(queryClone, ['name', 'email']);

    if (hasBatchFilter !== undefined) {
      where.batchId = hasBatchFilter;
    }

    // Alias convenience: ?role=CREW atau ?roleCode=CREW dipetakan otomatis ke { role: { roleCode: ... } }
    if (where.role && typeof where.role === 'string') {
      where.role = { roleCode: where.role };
    }
    if (where.roleCode) {
      where.role = where.role || {};
      where.role.roleCode = where.roleCode;
      delete where.roleCode;
    }

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          userId: true,
          name: true,
          email: true,
          gender: true,
          roleId: true,
          role: true,
          isActive: true,
          stars: true,
          points: true,
          level: true,
          isBuddy: true,
          userBuddyId: true,
          departmentId: true,
          department: true,
          batchId: true,
          batch: {
            select: {
              batchId: true,
              code: true,
              name: true,
              status: true,
              currentWeek: true
            }
          },
          activeBatchId: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    const formattedData = data.map(user => ({
      ...user,
      hasBatch: Boolean(user.batchId)
    }));

    return sendPaginated(res, {
      message: 'Daftar user berhasil diambil.',
      data: formattedData,
      total,
      page,
      limit
    });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { userId: id },
      select: {
        userId: true,
        name: true,
        email: true,
        gender: true,
        roleId: true,
        role: true,
        isActive: true,
        stars: true,
        points: true,
        level: true,
        isBuddy: true,
        userBuddyId: true,
        departmentId: true,
        department: true,
        batchId: true,
        batch: {
          select: {
            batchId: true,
            code: true,
            name: true,
            status: true,
            currentWeek: true
          }
        },
        activeBatchId: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return sendError(res, { statusCode: 404, message: 'User tidak ditemukan.' });
    }

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Detail user berhasil diambil.',
      data: {
        ...user,
        hasBatch: Boolean(user.batchId)
      }
    });
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { name, email, password, roleId, departmentId, isBuddy, userBuddyId, batchId, isActive, activeBatchId, gender } = req.body;
    const creatorId = req.user?.id || req.user?.userId || null;

    let normalizedGender = null;
    if (gender) {
      const g = String(gender).trim().toUpperCase();
      if (g === 'M' || g === 'L' || g === 'MALE' || g === 'LAKI-LAKI') normalizedGender = 'M';
      else if (g === 'F' || g === 'P' || g === 'FEMALE' || g === 'PEREMPUAN') normalizedGender = 'F';
      else normalizedGender = g;
    }

    // Cek apakah role yang dibuat adalah CREW
    let isCrew = false;
    if (roleId) {
      const targetRole = await prisma.role.findUnique({ where: { roleId } });
      if (targetRole && targetRole.roleCode === 'CREW') {
        isCrew = true;
      }
    }

    // Password default: CREW menggunakan prefix email sebelum '@', role lain membaca UserPolicy DB (DEFAULT_PASSWORD)
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

    const emailPrefix = (email && email.includes('@')) ? email.split('@')[0] : (email || 'crew123');
    let rawPassword;
    if (isCrew) {
      rawPassword = (password && password !== 'password123') ? password : emailPrefix;
    } else {
      rawPassword = (password && password !== 'password123') ? password : defaultNonCrewPassword;
    }
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        gender: normalizedGender,
        roleId,
        departmentId: departmentId || null,
        isBuddy: isBuddy || false,
        userBuddyId: userBuddyId || null,
        batchId: batchId || null,
        activeBatchId: activeBatchId || null,
        isActive: isActive !== undefined ? isActive : true,
        createdBy: creatorId
      },
      include: { role: true, department: true }
    });

    // Sinkronkan mutasi user ke Lynx HANYA jika bukan role CREW
    if (!isCrew) {
      await pushToLynx('/gamification/webhook/users', [user], 'POST');
    }

    const userResponse = {
      ...user,
      hasBatch: Boolean(user.batchId)
    };
    delete userResponse.password;

    return sendSuccess(res, {
      statusCode: 201,
      message: 'User berhasil dibuat.',
      data: userResponse
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return sendError(res, { statusCode: 409, message: `Email "${req.body.email}" sudah digunakan.` });
    }
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, password, roleId, departmentId, isBuddy, userBuddyId, batchId, isActive, activeBatchId, gender } = req.body;
    const updaterId = req.user?.id || req.user?.userId || null;

    const data = {
      updatedBy: updaterId
    };
    if (name !== undefined) data.name = name;
    if (email !== undefined) data.email = email;
    if (roleId !== undefined) data.roleId = roleId;
    if (departmentId !== undefined) data.departmentId = departmentId;
    if (isBuddy !== undefined) data.isBuddy = isBuddy;
    if (userBuddyId !== undefined) data.userBuddyId = userBuddyId;
    if (batchId !== undefined) data.batchId = batchId;
    if (activeBatchId !== undefined) data.activeBatchId = activeBatchId;
    if (isActive !== undefined) data.isActive = isActive;
    if (gender !== undefined) {
      if (!gender) {
        data.gender = null;
      } else {
        const g = String(gender).trim().toUpperCase();
        if (g === 'M' || g === 'L' || g === 'MALE' || g === 'LAKI-LAKI') data.gender = 'M';
        else if (g === 'F' || g === 'P' || g === 'FEMALE' || g === 'PEREMPUAN') data.gender = 'F';
        else data.gender = g;
      }
    }

    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { userId: id },
      data,
      include: { role: true, department: true }
    });

    // Sinkronkan mutasi user ke Lynx (Upsert via POST)
    await pushToLynx('/gamification/webhook/users', [user], 'POST');

    const userResponse = {
      ...user,
      hasBatch: Boolean(user.batchId)
    };
    delete userResponse.password;

    return sendSuccess(res, {
      statusCode: 200,
      message: 'User berhasil diperbarui.',
      data: userResponse
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return sendError(res, { statusCode: 409, message: `Email "${req.body.email}" sudah digunakan.` });
    }
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Sinkronkan delete user ke Lynx Webhook
    await pushToLynx('/gamification/webhook/users/delete', { userId: id }, 'POST');

    await prisma.user.delete({ where: { userId: id } });

    return sendSuccess(res, { statusCode: 200, message: 'User berhasil dihapus.' });
  } catch (error) {
    next(error);
  }
};

// =============================================================================
// ROLES CRUD
// =============================================================================

const getRoles = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const queryClone = { ...req.query };
    delete queryClone.page;
    delete queryClone.limit;

    // Searchable: roleCode, roleName
    const where = parsePrismaQuery(queryClone, ['roleCode', 'roleName']);

    const [data, total] = await Promise.all([
      prisma.role.findMany({
        where,
        skip,
        take: limit,
        include: {
          _count: { select: { users: true } }
        },
        orderBy: { roleCode: 'asc' }
      }),
      prisma.role.count({ where })
    ]);

    return sendPaginated(res, {
      message: 'Daftar role berhasil diambil.',
      data,
      total,
      page,
      limit
    });
  } catch (error) {
    next(error);
  }
};

const getRoleById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const role = await prisma.role.findUnique({
      where: { roleId: id },
      include: {
        _count: { select: { users: true } }
      }
    });

    if (!role) {
      return sendError(res, { statusCode: 404, message: 'Role tidak ditemukan.' });
    }

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Detail role berhasil diambil.',
      data: role
    });
  } catch (error) {
    next(error);
  }
};

const createRole = async (req, res, next) => {
  try {
    const { roleCode, roleName } = req.body;
    const creatorId = req.user?.id || req.user?.userId || null;

    if (!roleCode || !roleName) {
      return sendError(res, { statusCode: 400, message: 'Field "roleCode" dan "roleName" wajib diisi.' });
    }

    const role = await prisma.role.create({
      data: {
        roleCode: roleCode.toUpperCase(),
        roleName,
        createdBy: creatorId
      }
    });

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Role berhasil dibuat.',
      data: role
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return sendError(res, { statusCode: 409, message: `Kode role "${req.body.roleCode}" sudah digunakan.` });
    }
    next(error);
  }
};

const updateRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { roleCode, roleName } = req.body;
    const updaterId = req.user?.id || req.user?.userId || null;

    const data = { updatedBy: updaterId };
    if (roleCode !== undefined) data.roleCode = roleCode.toUpperCase();
    if (roleName !== undefined) data.roleName = roleName;

    const role = await prisma.role.update({
      where: { roleId: id },
      data
    });

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Role berhasil diperbarui.',
      data: role
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return sendError(res, { statusCode: 409, message: `Kode role "${req.body.roleCode}" sudah digunakan.` });
    }
    next(error);
  }
};

const deleteRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.role.delete({ where: { roleId: id } });

    return sendSuccess(res, { statusCode: 200, message: 'Role berhasil dihapus.' });
  } catch (error) {
    next(error);
  }
};

// =============================================================================
// BULK USER IMPORT (TWO-PHASE: TEMPLATE -> PREVIEW -> COMMIT)
// =============================================================================

const { generateUserImportTemplate, parseUserImportFile } = require('../../utils/excelParser');

const downloadUserTemplate = async (req, res, next) => {
  try {
    const [roles, departments, buddies] = await Promise.all([
      prisma.role.findMany({ select: { roleCode: true, roleName: true }, orderBy: { roleCode: 'asc' } }),
      prisma.department.findMany({ select: { departmentCode: true, departmentName: true }, orderBy: { departmentCode: 'asc' } }),
      prisma.user.findMany({
        where: { isBuddy: true, isActive: true },
        select: {
          email: true,
          name: true,
          department: { select: { departmentCode: true, departmentName: true } }
        },
        orderBy: { name: 'asc' }
      })
    ]);
    const buffer = await generateUserImportTemplate(roles, departments, buddies);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="template_import_user.xlsx"');
    return res.send(buffer);
  } catch (error) {
    next(error);
  }
};

const bulkPreviewUsers = async (req, res, next) => {
  try {
    const uploadedFile = req.file || (Array.isArray(req.files) ? (req.files.find(f => f.fieldname === 'file' || f.fieldname === 'excel') || req.files[0]) : null);
    if (!uploadedFile || !uploadedFile.buffer) {
      return sendError(res, { statusCode: 400, message: 'File Excel/CSV wajib diunggah (field: "file" atau "excel").' });
    }

    const parsedRows = parseUserImportFile(uploadedFile.buffer);
    if (!parsedRows || parsedRows.length === 0) {
      return sendError(res, { statusCode: 400, message: 'File Excel tidak memiliki baris data atau kosong.' });
    }

    // Cache Master Data untuk validasi cepat (In-Memory Lookup)
    const [roles, departments, batches] = await Promise.all([
      prisma.role.findMany({ select: { roleId: true, roleCode: true, roleName: true } }),
      prisma.department.findMany({ select: { departmentId: true, departmentCode: true, departmentName: true } }),
      prisma.batch.findMany({ select: { batchId: true, code: true, name: true } })
    ]);

    const roleMap = new Map();
    roles.forEach(r => roleMap.set(r.roleCode.toUpperCase(), r));

    const deptMap = new Map();
    departments.forEach(d => deptMap.set(d.departmentCode.toUpperCase(), d));

    const batchMap = new Map();
    batches.forEach(b => batchMap.set(b.code.toUpperCase(), b));

    // Kumpulkan seluruh email dalam file untuk pengecekan duplikasi di DB
    const emailsInFile = parsedRows.map(r => r.email).filter(Boolean);
    const existingUsers = await prisma.user.findMany({
      where: { email: { in: emailsInFile } },
      select: { userId: true, email: true, name: true }
    });
    const existingEmailMap = new Map();
    existingUsers.forEach(u => existingEmailMap.set(u.email.toLowerCase(), u));

    // Ambil seluruh email buddy yang direferensikan
    const buddyEmails = parsedRows.map(r => r.buddyEmail).filter(Boolean);
    let buddyUsers = [];
    if (buddyEmails.length > 0) {
      buddyUsers = await prisma.user.findMany({
        where: { email: { in: buddyEmails } },
        select: { userId: true, email: true, name: true }
      });
    }
    const buddyMap = new Map();
    buddyUsers.forEach(u => buddyMap.set(u.email.toLowerCase(), u));

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const seenEmailsInFile = new Set();
    const evaluatedRows = [];

    for (const row of parsedRows) {
      const errors = [];
      const rowEmail = (row.email || '').toLowerCase();

      // 1. Validasi Nama
      if (!row.name || row.name.trim().length === 0) {
        errors.push('Nama Lengkap wajib diisi.');
      }

      // 2. Validasi Email
      if (!rowEmail) {
        errors.push('Email wajib diisi.');
      } else if (!emailRegex.test(rowEmail)) {
        errors.push(`Format email "${row.email}" tidak valid.`);
      } else if (seenEmailsInFile.has(rowEmail)) {
        errors.push(`Email "${row.email}" duplikat dalam file spreadsheet ini.`);
      } else {
        seenEmailsInFile.add(rowEmail);
      }

      // 3. Validasi Gender (Opsional jika ada)
      let normalizedGender = null;
      if (row.gender) {
        const g = String(row.gender).trim().toUpperCase();
        if (g === 'M' || g === 'L' || g === 'MALE' || g === 'LAKI-LAKI') normalizedGender = 'M';
        else if (g === 'F' || g === 'P' || g === 'FEMALE' || g === 'PEREMPUAN') normalizedGender = 'F';
        else normalizedGender = g;

        if (!['M', 'F'].includes(normalizedGender)) {
          errors.push(`Gender "${row.gender}" tidak valid. Pilihan: M (Laki-laki) atau F (Perempuan).`);
        }
      }

      // 4. Validasi Role
      let matchedRole = null;
      if (!row.roleCode) {
        errors.push('Role Code wajib diisi.');
      } else {
        matchedRole = roleMap.get(row.roleCode.toUpperCase());
        if (!matchedRole) {
          errors.push(`Role Code "${row.roleCode}" tidak terdaftar di sistem.`);
        }
      }

      // 5. Validasi Department
      let matchedDept = null;
      if (row.departmentCode) {
        matchedDept = deptMap.get(row.departmentCode.toUpperCase());
        if (!matchedDept) {
          errors.push(`Department Code "${row.departmentCode}" tidak ditemukan.`);
        }
      }

      // 6. Validasi Batch (Opsional)
      let matchedBatch = null;
      if (row.batchCode) {
        matchedBatch = batchMap.get(row.batchCode.toUpperCase());
        if (!matchedBatch) {
          errors.push(`Batch Code "${row.batchCode}" tidak ditemukan.`);
        }
      }

      // 7. Validasi Buddy (Opsional)
      let matchedBuddy = null;
      if (row.buddyEmail) {
        matchedBuddy = buddyMap.get(row.buddyEmail.toLowerCase());
        if (!matchedBuddy) {
          errors.push(`Buddy Email "${row.buddyEmail}" tidak ditemukan di database user.`);
        }
      }

      // 8. Cek apakah email sudah terdaftar di DB
      const existsInDb = Boolean(existingEmailMap.get(rowEmail));
      const status = errors.length === 0 ? 'VALID' : 'INVALID';

      evaluatedRows.push({
        rowNumber: row.rowNumber,
        name: row.name,
        email: rowEmail,
        gender: normalizedGender,
        roleCode: matchedRole ? matchedRole.roleCode : row.roleCode,
        roleId: matchedRole ? matchedRole.roleId : null,
        roleName: matchedRole ? matchedRole.roleName : null,
        departmentCode: matchedDept ? matchedDept.departmentCode : row.departmentCode,
        departmentId: matchedDept ? matchedDept.departmentId : null,
        departmentName: matchedDept ? matchedDept.departmentName : null,
        isBuddy: Boolean(row.isBuddy),
        buddyEmail: matchedBuddy ? matchedBuddy.email : row.buddyEmail,
        userBuddyId: matchedBuddy ? matchedBuddy.userId : null,
        batchCode: matchedBatch ? matchedBatch.code : row.batchCode,
        batchId: matchedBatch ? matchedBatch.batchId : null,
        batchName: matchedBatch ? matchedBatch.name : null,
        status,
        existsInDb,
        action: status === 'INVALID' ? 'REJECT' : (existsInDb ? 'EXISTS' : 'INSERT'),
        errors
      });
    }

    const totalRows = evaluatedRows.length;
    const validCount = evaluatedRows.filter(r => r.status === 'VALID').length;
    const invalidCount = evaluatedRows.filter(r => r.status === 'INVALID').length;
    const existingCount = evaluatedRows.filter(r => r.existsInDb).length;
    const newCount = evaluatedRows.filter(r => !r.existsInDb && r.status === 'VALID').length;

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Preview data import berhasil diproses.',
      data: {
        summary: {
          totalRows,
          validCount,
          invalidCount,
          newCount,
          existingCount
        },
        rows: evaluatedRows
      }
    });
  } catch (error) {
    next(error);
  }
};

const bulkCommitUsers = async (req, res, next) => {
  try {
    const { users, onDuplicate = 'SKIP' } = req.body;

    if (!Array.isArray(users) || users.length === 0) {
      return sendError(res, { statusCode: 400, message: 'Daftar user yang akan di-commit wajib berupa array dan tidak boleh kosong.' });
    }

    const currentUserId = req.user?.id || req.user?.userId || null;
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
    const defaultPasswordHash = await bcrypt.hash(defaultNonCrewPassword, 10);

    // Kumpulkan email dan data yang akan diproses
    const incomingEmails = users.map(u => (u.email || '').toLowerCase()).filter(Boolean);
    const existingUsers = await prisma.user.findMany({
      where: { email: { in: incomingEmails } }
    });
    const existingMap = new Map();
    existingUsers.forEach(u => existingMap.set(u.email.toLowerCase(), u));

    // Cache lookup jika ada payload yang mengirim code alih-alih ID
    const [roles, departments, batches] = await Promise.all([
      prisma.role.findMany(),
      prisma.department.findMany(),
      prisma.batch.findMany()
    ]);
    const roleCodeMap = new Map();
    const roleIdToCodeMap = new Map();
    roles.forEach(r => {
      roleCodeMap.set(r.roleCode.toUpperCase(), r.roleId);
      roleIdToCodeMap.set(r.roleId, r.roleCode.toUpperCase());
    });
    const deptCodeMap = new Map();
    departments.forEach(d => deptCodeMap.set(d.departmentCode.toUpperCase(), d.departmentId));
    const batchCodeMap = new Map();
    batches.forEach(b => batchCodeMap.set(b.code.toUpperCase(), b.batchId));

    let insertedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    const createdUsersList = [];

    await prisma.$transaction(async (tx) => {
      for (const item of users) {
        const email = (item.email || '').toLowerCase();
        if (!email || !item.name) {
          skippedCount++;
          continue;
        }

        const roleId = item.roleId || roleCodeMap.get((item.roleCode || '').toUpperCase());
        if (!roleId) {
          skippedCount++;
          continue;
        }

        const departmentId = item.departmentId || (item.departmentCode ? deptCodeMap.get(item.departmentCode.toUpperCase()) : null) || null;
        const batchId = item.batchId || (item.batchCode ? batchCodeMap.get(item.batchCode.toUpperCase()) : null) || null;
        const userBuddyId = item.userBuddyId || null;
        const isBuddy = Boolean(item.isBuddy);

        let normalizedGender = null;
        if (item.gender) {
          const g = String(item.gender).trim().toUpperCase();
          if (g === 'M' || g === 'L' || g === 'MALE' || g === 'LAKI-LAKI') normalizedGender = 'M';
          else if (g === 'F' || g === 'P' || g === 'FEMALE' || g === 'PEREMPUAN') normalizedGender = 'F';
          else normalizedGender = g;
        }

        const existingUser = existingMap.get(email);

        if (existingUser) {
          if (onDuplicate.toUpperCase() === 'UPDATE') {
            const updateData = {
              name: item.name,
              roleId,
              departmentId,
              batchId,
              userBuddyId,
              isBuddy,
              updatedBy: currentUserId
            };
            if (item.gender !== undefined) {
              updateData.gender = normalizedGender;
            }
            await tx.user.update({
              where: { userId: existingUser.userId },
              data: updateData
            });
            updatedCount++;
          } else {
            skippedCount++;
          }
        } else {
          // Default password: CREW menggunakan prefix email sebelum '@', role lain menggunakan 'password123'
          const roleCode = (item.roleCode || '').toUpperCase() || roleIdToCodeMap.get(roleId) || '';
          const isCrew = roleCode === 'CREW';
          let userPasswordHash = defaultPasswordHash;
          if (isCrew) {
            const emailPrefix = (email && email.includes('@')) ? email.split('@')[0] : (email || 'crew123');
            userPasswordHash = await bcrypt.hash(emailPrefix, 10);
          }

          const newUser = await tx.user.create({
            data: {
              name: item.name,
              email,
              password: userPasswordHash,
              gender: normalizedGender,
              roleId,
              departmentId,
              batchId,
              userBuddyId,
              isBuddy,
              isActive: true,
              createdBy: currentUserId
            },
            include: {
              role: true,
              department: true
            }
          });
          insertedCount++;
          createdUsersList.push(newUser);
        }
      }
    });

    // Lynx ERP push synchronization in background (HANYA untuk user non-CREW)
    const nonCrewUsers = createdUsersList.filter(u => u.role?.roleCode !== 'CREW');
    if (nonCrewUsers.length > 0) {
      pushToLynx('/gamification/webhook/users', nonCrewUsers, 'POST').catch(err => {
        console.error('[Lynx User Sync Error]:', err.message);
      });
    }

    return sendSuccess(res, {
      statusCode: 201,
      message: `Proses impor selesai. ${insertedCount} user baru berhasil dibuat, ${updatedCount} diperbarui, ${skippedCount} dilewati.`,
      data: {
        totalProcessed: users.length,
        insertedCount,
        updatedCount,
        skippedCount
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  downloadUserTemplate,
  bulkPreviewUsers,
  bulkCommitUsers
};
