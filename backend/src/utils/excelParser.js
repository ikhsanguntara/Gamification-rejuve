'use strict';

/**
 * @file excelParser.js
 * @description Helper utility untuk membaca file Excel/CSV user import dan menghasilkan template Excel interaktif dengan Native Data Validation.
 */

const ExcelJS = require('exceljs');
const xlsx = require('xlsx');

/**
 * Menghasilkan buffer file Excel template import user (.xlsx) dengan Native Data Validation (Dropdown)
 */
const generateUserImportTemplate = async (rolesList = [], deptsList = [], buddiesList = []) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Re.juve Gamification Platform';
  workbook.created = new Date();

  // 1. Sheet Template Import
  const ws = workbook.addWorksheet('Template Import User', {
    views: [{ showGridLines: true }]
  });

  const columns = [
    { header: 'Nama Lengkap', key: 'name', width: 25 },
    { header: 'Email', key: 'email', width: 32 },
    { header: 'Gender', key: 'gender', width: 14 },
    { header: 'Role Code', key: 'roleCode', width: 22 },
    { header: 'Department Code', key: 'departmentCode', width: 22 },
    { header: 'Is Buddy', key: 'isBuddy', width: 14 },
    { header: 'Buddy Email', key: 'buddyEmail', width: 35 }
  ];
  ws.columns = columns;

  // Style Header Row (Baris 1)
  const headerRow = ws.getRow(1);
  headerRow.height = 28;
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF831843' } // Re.juve signature color
    };
    cell.font = {
      name: 'Calibri',
      size: 11,
      bold: true,
      color: { argb: 'FFFFFFFF' }
    };
    cell.alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true
    };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF6B133A' } },
      left: { style: 'thin', color: { argb: 'FF6B133A' } },
      bottom: { style: 'medium', color: { argb: 'FF4A0D28' } },
      right: { style: 'thin', color: { argb: 'FF6B133A' } }
    };
  });

  // Contoh baris data awal
  const sampleRows = [
    {
      name: 'Budi Santoso',
      email: 'budi.santoso@rejuve.co.id',
      gender: 'M',
      roleCode: 'CREW',
      departmentCode: 'BKI_01',
      isBuddy: 'FALSE',
      buddyEmail: ''
    },
    {
      name: 'Anita Wijaya',
      email: 'anita.wijaya@rejuve.co.id',
      gender: 'F',
      roleCode: 'STORE_LEADER',
      departmentCode: 'BKI_01',
      isBuddy: 'TRUE',
      buddyEmail: ''
    },
    {
      name: 'Rudi Hermawan',
      email: 'rudi.hermawan@rejuve.co.id',
      gender: 'M',
      roleCode: 'CREW',
      departmentCode: 'BKI_01',
      isBuddy: 'FALSE',
      buddyEmail: 'anita.wijaya@rejuve.co.id'
    }
  ];

  sampleRows.forEach(r => ws.addRow(r));

  // 2. Sheet Referensi Master Data (untuk sumber data dropdown)
  const wsRef = workbook.addWorksheet('Daftar Referensi Dropdown', {
    views: [{ showGridLines: true }]
  });

  wsRef.columns = [
    { header: 'Pilihan Role Code', key: 'roleCode', width: 22 },
    { header: 'Nama Role', key: 'roleName', width: 32 },
    { header: 'Pilihan Department Code', key: 'deptCode', width: 25 },
    { header: 'Nama Gerai / Toko', key: 'deptName', width: 35 },
    { header: 'Daftar Email Buddy Aktif', key: 'buddyEmail', width: 35 },
    { header: 'Nama Buddy', key: 'buddyName', width: 25 },
    { header: 'Gerai Buddy', key: 'buddyDept', width: 35 }
  ];

  const refHeader = wsRef.getRow(1);
  refHeader.height = 24;
  refHeader.eachCell(cell => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF1F5F9' }
    };
    cell.font = { bold: true, color: { argb: 'FF1E293B' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  const defaultRoles = [
    { roleCode: 'CREW', roleName: 'Crew Barista / Store Crew' },
    { roleCode: 'STORE_LEADER', roleName: 'Store Leader / Supervisor' },
    { roleCode: 'DISTRICT_MANAGER', roleName: 'District Manager / Area Head' },
    { roleCode: 'SUPERADMIN', roleName: 'Superadmin Gamification' }
  ];
  const activeRoles = rolesList.length > 0 ? rolesList : defaultRoles;

  const defaultDepts = [
    { departmentCode: 'BKI_01', departmentName: 'Re.juve Bintaro Xchange' },
    { departmentCode: 'GI_01', departmentName: 'Re.juve Grand Indonesia' },
    { departmentCode: 'PIM_02', departmentName: 'Re.juve Pondok Indah Mall 2' },
    { departmentCode: 'CP_01', departmentName: 'Re.juve Central Park' },
    { departmentCode: 'SEN_01', departmentName: 'Re.juve Senayan City' }
  ];
  const activeDepts = deptsList.length > 0 ? deptsList : defaultDepts;

  // Saring hanya user yang isBuddy === true
  const activeBuddies = (buddiesList && buddiesList.length > 0)
    ? buddiesList.filter(b => b.isBuddy !== false)
    : [];

  const maxRefRows = Math.max(activeRoles.length, activeDepts.length, activeBuddies.length, 1);
  for (let i = 0; i < maxRefRows; i++) {
    const r = activeRoles[i] || {};
    const d = activeDepts[i] || {};
    const b = activeBuddies[i] || {};
    wsRef.addRow({
      roleCode: r.roleCode || '',
      roleName: r.roleName || '',
      deptCode: d.departmentCode || '',
      deptName: d.departmentName || '',
      buddyEmail: b.email || '',
      buddyName: b.name || '',
      buddyDept: b.department?.departmentName || b.department?.departmentCode || ''
    });
  }

  // Range rumus Excel untuk dropdown list referencing Sheet Referensi
  const roleRefFormula = `'Daftar Referensi Dropdown'!$A$2:$A$${activeRoles.length + 1}`;
  const deptRefFormula = `'Daftar Referensi Dropdown'!$C$2:$C$${activeDepts.length + 1}`;
  const buddyRefFormula = activeBuddies.length > 0
    ? `'Daftar Referensi Dropdown'!$E$2:$E$${activeBuddies.length + 1}`
    : null;

  // Pasang Data Validation Dropdown pada baris 2 s/d 500 di Sheet Template
  for (let rowIdx = 2; rowIdx <= 500; rowIdx++) {
    const row = ws.getRow(rowIdx);

    // Col C: Gender (Dropdown: M, F)
    const genderCell = row.getCell(3);
    genderCell.dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: ['"M,F"'],
      showErrorMessage: true,
      errorTitle: 'Pilihan Tidak Valid',
      error: 'Pilih jenis kelamin dari daftar: M (Laki-laki) atau F (Perempuan).'
    };

    // Col D: Role Code (Dropdown)
    const roleCell = row.getCell(4);
    roleCell.dataValidation = {
      type: 'list',
      allowBlank: false,
      formulae: [roleRefFormula],
      showErrorMessage: true,
      errorTitle: 'Role Code Tidak Valid',
      error: 'Silakan pilih Role Code dari daftar dropdown.'
    };

    // Col E: Department Code (Dropdown)
    const deptCell = row.getCell(5);
    deptCell.dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: [deptRefFormula],
      showErrorMessage: true,
      errorTitle: 'Kode Gerai Tidak Valid',
      error: 'Silakan pilih Department / Gerai dari daftar dropdown.'
    };

    // Col F: Is Buddy (Dropdown: TRUE, FALSE)
    const isBuddyCell = row.getCell(6);
    isBuddyCell.dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: ['"TRUE,FALSE"'],
      showErrorMessage: true,
      errorTitle: 'Status Buddy Tidak Valid',
      error: 'Pilih TRUE atau FALSE.'
    };

    // Col G: Buddy Email (Dropdown hanya user yang isBuddy true)
    if (buddyRefFormula) {
      const buddyEmailCell = row.getCell(7);
      buddyEmailCell.dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [buddyRefFormula],
        showErrorMessage: true,
        errorTitle: 'Email Buddy Tidak Terdaftar',
        error: 'Pilih mentor buddy dari daftar Store Leader aktif.'
      };
    }
  }

  return await workbook.xlsx.writeBuffer();
};

/**
 * Helper untuk normalisasi nama header
 */
const normalizeKey = (key) => {
  if (!key) return '';
  const clean = String(key).trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  if (clean.includes('nama') || clean === 'name') return 'name';
  if (clean.includes('gender') || clean.includes('jeniskelamin') || clean === 'jk' || clean === 'sex') return 'gender';
  if (clean.includes('buddyemail') || clean.includes('emailbuddy')) return 'buddyEmail';
  if (clean === 'email') return 'email';
  if (clean.includes('role')) return 'roleCode';
  if (clean.includes('department') || clean.includes('dept') || clean.includes('toko') || clean.includes('gerai')) return 'departmentCode';
  if (clean.includes('isbuddy') || clean.includes('apakahbuddy') || clean.includes('statusbuddy') || clean.includes('sebagaibuddy') || clean === 'buddy') return 'isBuddy';
  if (clean.includes('batch')) return 'batchCode';
  return key;
};

/**
 * Membaca buffer file Excel (.xlsx / .xls / .csv) dan mengembalikan array data ter-mapping
 */
const parseUserImportFile = (fileBuffer) => {
  const wb = xlsx.read(fileBuffer, { type: 'buffer' });
  const sheetName = wb.SheetNames[0];
  if (!sheetName) {
    throw new Error('File Excel tidak memiliki sheet yang dapat dibaca.');
  }

  const ws = wb.Sheets[sheetName];
  const rawRows = xlsx.utils.sheet_to_json(ws, { defval: '' });

  if (!rawRows || rawRows.length === 0) {
    return [];
  }

  return rawRows.map((raw, index) => {
    const rowNumber = index + 2; // Baris 1 adalah header di Excel
    const mapped = {};

    for (const [key, val] of Object.entries(raw)) {
      const normalizedKey = normalizeKey(key);
      const strVal = typeof val === 'string' ? val.trim() : String(val).trim();
      mapped[normalizedKey] = strVal;
    }

    const isBuddyRaw = String(mapped.isBuddy || '').toUpperCase();
    const isBuddy = isBuddyRaw === 'TRUE' || isBuddyRaw === '1' || isBuddyRaw === 'YES' || isBuddyRaw === 'YA';

    let gender = (mapped.gender || '').toUpperCase();
    if (gender === 'L' || gender === 'LAKI_LAKI' || gender === 'LAKI-LAKI' || gender === 'MALE') gender = 'M';
    if (gender === 'P' || gender === 'PEREMPUAN' || gender === 'FEMALE') gender = 'F';

    return {
      rowNumber,
      name: mapped.name || '',
      email: (mapped.email || '').toLowerCase(),
      gender: gender === 'M' || gender === 'F' ? gender : (gender || null),
      roleCode: (mapped.roleCode || '').toUpperCase(),
      departmentCode: mapped.departmentCode || '',
      isBuddy,
      buddyEmail: (mapped.buddyEmail || '').toLowerCase(),
      batchCode: mapped.batchCode || '',
      raw
    };
  });
};

module.exports = {
  generateUserImportTemplate,
  parseUserImportFile
};
