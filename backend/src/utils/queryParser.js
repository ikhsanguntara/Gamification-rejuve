'use strict';

/**
 * @file queryParser.js
 * @description Utility to parse Express req.query into Prisma valid `where` object.
 * Supports:
 * - Exact match: ?status=ACTIVE
 * - Operators: ?stars[gte]=10, ?name[contains]=budi, ?role[in]=HEAD,CREW
 * - Global search: ?search=keyword (must be handled separately by the controller if needed, but parser skips it).
 */

// Helper: Auto-inference type casting
const castValue = (value) => {
  if (typeof value !== 'string') return value;
  
  const trimmed = value.trim();

  // Boolean
  if (trimmed.toLowerCase() === 'true') return true;
  if (trimmed.toLowerCase() === 'false') return false;

  // Number (if it's purely a number and not an empty string)
  if (!isNaN(trimmed) && trimmed !== '') {
    // Check if it has a decimal
    if (trimmed.includes('.')) return parseFloat(trimmed);
    return parseInt(trimmed, 10);
  }

  // Date (basic check for YYYY-MM-DD or ISO 8601 string)
  // Ensures it doesn't accidentally cast regular strings that look like dates but aren't intended as such.
  const dateRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(.\d{3})?Z?)?$/;
  if (dateRegex.test(trimmed)) {
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) return d;
  }

  // Handle arrays for 'in' operator (e.g. "HEAD,CREW")
  if (trimmed.includes(',')) {
    return trimmed.split(',').map(item => castValue(item));
  }

  return value; // string fallback
};

const processOperator = (whereObj, field, operator, rawVal) => {
  const validOperators = ['gte', 'gt', 'lte', 'lt', 'contains', 'in', 'notIn', 'startsWith', 'endsWith', 'equals', 'not'];
  if (validOperators.includes(operator)) {
    let castedVal = castValue(rawVal);
    
    // Khusus 'in' dan 'notIn' WAJIB berupa array untuk Prisma
    if ((operator === 'in' || operator === 'notIn') && !Array.isArray(castedVal)) {
      castedVal = [castedVal];
    }

    // Inisialisasi object jika belum ada
    if (!whereObj[field] || typeof whereObj[field] !== 'object' || Array.isArray(whereObj[field])) {
      whereObj[field] = {};
    }
    
    whereObj[field][operator] = castedVal;
    
    // Khusus contains tambahkan mode insensitive (hanya untuk PostgreSQL)
    if (operator === 'contains') {
      whereObj[field].mode = 'insensitive';
    }
  }
};

/**
 * Menerima object req.query dan memparsingnya menjadi objek `where` Prisma.
 * Mengabaikan parameter `page`, `limit`, dan `search`.
 * 
 * @param {Object} query - req.query dari Express
 * @returns {Object} prismaWhere - Objek filter yang bisa dilempar ke Prisma
 */
const parsePrismaQuery = (query) => {
  const skipFields = ['page', 'limit', 'search'];
  const prismaWhere = {};

  for (const [key, value] of Object.entries(query)) {
    // Abaikan parameter paginasi/global search
    if (skipFields.includes(key)) continue;

    let field = key;
    let operatorStr = null;

    // 1. Cek jika key dalam bentuk "field[operator]" (fallback jika express tidak pakai extended query parser)
    const match = key.match(/^([^\[]+)\[([^\]]+)\]$/);
    if (match) {
      field = match[1];
      operatorStr = match[2];
    }

    // 2. Jika value berupa object (karena di-parse sukses oleh Express 'qs')
    if (typeof value === 'object' && !Array.isArray(value)) {
      for (const [op, rawVal] of Object.entries(value)) {
        processOperator(prismaWhere, field, op, rawVal);
      }
    } 
    // 3. Jika fallback regex menemukan operator
    else if (operatorStr) {
      processOperator(prismaWhere, field, operatorStr, value);
    }
    // 4. Exact match biasa
    else {
      prismaWhere[field] = castValue(value);
    }
  }

  return prismaWhere;
};

module.exports = {
  parsePrismaQuery,
  castValue
};
