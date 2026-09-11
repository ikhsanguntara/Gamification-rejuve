'use strict';

/**
 * @file excelParser.js
 * @description Helper utility untuk membaca file Excel/CSV user import dan menghasilkan template Excel.
 */

const xlsx = require('xlsx');

/**
 * Menghasilkan buffer file Excel template import user (.xlsx)
 */
const generateUserImportTemplate = (rolesList = [], deptsList = [], buddiesList = []) => {
  const headers = [
    'Nama Lengkap',
    'Email',
    'Role Code',
    'Department Code',
    'Is Buddy',
    'Buddy Email',
    'Batch Code'
  ];

  const sampleRows = [
    [
      'Budi Santoso',
      'budi.santoso@rejuve.co.id',
      'CREW',
      'BKI_01',
      'FALSE',
      '',
      ''
    ],
    [
      'Anita Wijaya',
      'anita.wijaya@rejuve.co.id',
      'STORE_LEADER',
      'BKI_01',
      'TRUE',
      '',
      ''
    ],
    [
      'Rudi Hermawan',
      'rudi.hermawan@rejuve.co.id',
      'CREW',
      'BKI_01',
      'FALSE',
      'anita.wijaya@rejuve.co.id',
      ''
    ]
  ];

  const data = [headers, ...sampleRows];
  const ws = xlsx.utils.aoa_to_sheet(data);

  // Atur lebar kolom agar rapi saat dibuka di Microsoft Excel
  ws['!cols'] = [
    { wch: 25 }, // Nama Lengkap
    { wch: 32 }, // Email
    { wch: 22 }, // Role Code
    { wch: 25 }, // Department Code
    { wch: 14 }, // Is Buddy
    { wch: 32 }, // Buddy Email
    { wch: 20 }  // Batch Code
  ];

  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, 'Template Import User');

  // Sheet 2: Referensi Master Data (Kode Role, Kode Departemen, & Daftar Buddy Aktif)
  const defaultRoles = [
    ['CREW', 'Crew Barista / Store Crew'],
    ['STORE_LEADER', 'Store Leader / Supervisor'],
    ['DISTRICT_MANAGER', 'District Manager / Area Head'],
    ['SUPERADMIN', 'Superadmin Gamification']
  ];
  const rolesData = (rolesList.length > 0 ? rolesList.map(r => [r.roleCode, r.roleName]) : defaultRoles);

  const defaultDepts = [
    ['BKI_01', 'Re.juve Bintaro Xchange'],
    ['GI_01', 'Re.juve Grand Indonesia'],
    ['PIM_02', 'Re.juve Pondok Indah Mall 2'],
    ['CP_01', 'Re.juve Central Park'],
    ['SEN_01', 'Re.juve Senayan City']
  ];
  const deptsData = (deptsList.length > 0 ? deptsList.map(d => [d.departmentCode, d.departmentName]) : defaultDepts);

  const buddiesData = (buddiesList && buddiesList.length > 0)
    ? buddiesList.map(b => [b.email, b.name, b.department?.departmentCode ? `${b.department.departmentCode} - ${b.department.departmentName}` : ''])
    : [];

  const maxRows = Math.max(rolesData.length, deptsData.length, buddiesData.length, 2);
  const refHeader = [
    'Pilihan Role Code', 'Nama Role', '',
    'Pilihan Department Code', 'Nama Gerai / Toko', '',
    'Pilihan Is Buddy', 'Keterangan', '',
    'Daftar Email Buddy Aktif', 'Nama Buddy', 'Gerai Buddy'
  ];
  const refRows = [refHeader];

  for (let i = 0; i < maxRows; i++) {
    const roleRow = rolesData[i] || ['', ''];
    const deptRow = deptsData[i] || ['', ''];
    const buddyRow = buddiesData[i] || ['', '', ''];
    let buddyChoice = '';
    let buddyDesc = '';
    if (i === 0) { buddyChoice = 'TRUE'; buddyDesc = 'User adalah mentor / pendamping buddy'; }
    if (i === 1) { buddyChoice = 'FALSE'; buddyDesc = 'User bukan buddy (default untuk Crew)'; }

    refRows.push([
      roleRow[0],
      roleRow[1],
      '',
      deptRow[0],
      deptRow[1],
      '',
      buddyChoice,
      buddyDesc,
      '',
      buddyRow[0],
      buddyRow[1],
      buddyRow[2]
    ]);
  }

  const wsRef = xlsx.utils.aoa_to_sheet(refRows);
  wsRef['!cols'] = [
    { wch: 22 }, // Role Code
    { wch: 32 }, // Nama Role
    { wch: 5 },  // spacing
    { wch: 25 }, // Dept Code
    { wch: 35 }, // Nama Toko
    { wch: 5 },  // spacing
    { wch: 18 }, // Is Buddy
    { wch: 45 }, // Keterangan Buddy
    { wch: 5 },  // spacing
    { wch: 32 }, // Email Buddy Aktif
    { wch: 25 }, // Nama Buddy
    { wch: 35 }  // Gerai Buddy
  ];
  xlsx.utils.book_append_sheet(wb, wsRef, 'Daftar Referensi Dropdown');

  return xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
};

/**
 * Helper untuk normalisasi nama header
 */
const normalizeKey = (key) => {
  if (!key) return '';
  const clean = String(key).trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  if (clean.includes('nama') || clean === 'name') return 'name';
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

    return {
      rowNumber,
      name: mapped.name || '',
      email: (mapped.email || '').toLowerCase(),
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
