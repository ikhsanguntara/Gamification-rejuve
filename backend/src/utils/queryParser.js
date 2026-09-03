'use strict';

/**
 * @file queryParser.js
 * @description Utility to parse Express req.query into a valid Prisma `where` object.
 * Supports:
 * - Exact match: ?status=ACTIVE
 * - Operators: ?stars[gte]=10, ?name[contains]=budi, ?role[in]=HEAD,CREW
 * - Dot notation for relations: ?role.roleCode=CREW, ?department.departmentCode[contains]=BKI
 * - Nested objects from qs: ?role[roleCode]=CREW, ?role[roleCode][contains]=CREW
 * - Global search: ?search=keyword (skipped, handled by controllers)
 */

const VALID_OPERATORS = [
  'gte', 'gt', 'lte', 'lt', 'contains', 'in', 'notIn',
  'startsWith', 'endsWith', 'equals', 'not'
];

// Helper: Auto-inference type casting
const castValue = (value) => {
  if (typeof value !== 'string') return value;
  
  const trimmed = value.trim();

  // Boolean
  if (trimmed.toLowerCase() === 'true') return true;
  if (trimmed.toLowerCase() === 'false') return false;

  // Number
  if (!isNaN(trimmed) && trimmed !== '') {
    if (trimmed.includes('.')) return parseFloat(trimmed);
    return parseInt(trimmed, 10);
  }

  // Date
  const dateRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(.\d{3})?Z?)?$/;
  if (dateRegex.test(trimmed)) {
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) return d;
  }

  // Comma separated list for array operators
  if (trimmed.includes(',')) {
    return trimmed.split(',').map(item => castValue(item));
  }

  return value;
};

// Helper: Set nested value given a dot-delimited path or array of keys
const setDeepValue = (targetObj, pathKeys, value) => {
  let current = targetObj;
  for (let i = 0; i < pathKeys.length - 1; i++) {
    const key = pathKeys[i];
    if (!current[key] || typeof current[key] !== 'object' || Array.isArray(current[key])) {
      current[key] = {};
    }
    current = current[key];
  }
  const lastKey = pathKeys[pathKeys.length - 1];

  // If value is an operator object (e.g. { contains: 'abc' }) and current[lastKey] already exists
  if (typeof value === 'object' && value !== null && !Array.isArray(value) && !(value instanceof Date)) {
    current[lastKey] = Object.assign(current[lastKey] || {}, value);
  } else {
    current[lastKey] = value;
  }
};

// Recursive parser for nested objects
const parseValueTree = (val) => {
  if (typeof val !== 'object' || val === null || Array.isArray(val)) {
    return castValue(val);
  }

  const result = {};
  for (const [subKey, subVal] of Object.entries(val)) {
    if (VALID_OPERATORS.includes(subKey)) {
      let casted = castValue(subVal);
      if ((subKey === 'in' || subKey === 'notIn') && !Array.isArray(casted)) {
        casted = [casted];
      }
      result[subKey] = casted;
      if (subKey === 'contains') {
        result.mode = 'insensitive';
      }
    } else {
      result[subKey] = parseValueTree(subVal);
    }
  }
  return result;
};

/**
 * Menerima object req.query dan memparsingnya menjadi objek `where` Prisma yang valid.
 * 
 * @param {Object} query - req.query dari Express
 * @returns {Object} prismaWhere - Objek filter Prisma
 */
const parsePrismaQuery = (query = {}, searchableFields = []) => {
  const skipFields = ['page', 'limit', 'search', 'q'];
  const prismaWhere = {};

  for (const [key, value] of Object.entries(query)) {
    if (skipFields.includes(key)) continue;

    // 1. Cek regex dot notation atau bracket notation:
    // e.g. "role.roleCode", "role.roleCode[contains]", "name[contains]"
    const bracketMatch = key.match(/^([^\[]+)\[([^\]]+)\]$/);
    if (bracketMatch) {
      const fieldPath = bracketMatch[1];
      const operatorOrSub = bracketMatch[2];

      if (VALID_OPERATORS.includes(operatorOrSub)) {
        let casted = castValue(value);
        if ((operatorOrSub === 'in' || operatorOrSub === 'notIn') && !Array.isArray(casted)) {
          casted = [casted];
        }
        const opObj = { [operatorOrSub]: casted };
        if (operatorOrSub === 'contains') opObj.mode = 'insensitive';
        setDeepValue(prismaWhere, fieldPath.split('.'), opObj);
      } else {
        // e.g. role[roleCode] = CREW
        const combinedPath = `${fieldPath}.${operatorOrSub}`.split('.');
        setDeepValue(prismaWhere, combinedPath, parseValueTree(value));
      }
      continue;
    }

    // 2. Dot notation: e.g. "role.roleCode" = "CREW"
    if (key.includes('.')) {
      const pathParts = key.split('.');
      setDeepValue(prismaWhere, pathParts, parseValueTree(value));
      continue;
    }

    // 3. Nested object from qs parser: e.g. { role: { roleCode: 'CREW' } }
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      prismaWhere[key] = parseValueTree(value);
      continue;
    }

    // 4. Exact match biasa: e.g. status = 'ACTIVE'
    prismaWhere[key] = castValue(value);
  }

  // 5. Global search handler (?search=... atau ?q=...)
  const searchTerm = query.search || query.q;
  if (searchTerm && typeof searchTerm === 'string' && searchTerm.trim() !== '' && Array.isArray(searchableFields) && searchableFields.length > 0) {
    const searchTrimmed = searchTerm.trim();
    const orConditions = searchableFields.map(field => {
      if (field.includes('.')) {
        const parts = field.split('.');
        const cond = {};
        setDeepValue(cond, parts, { contains: searchTrimmed, mode: 'insensitive' });
        return cond;
      }
      return { [field]: { contains: searchTrimmed, mode: 'insensitive' } };
    });

    if (prismaWhere.OR) {
      prismaWhere.AND = [
        ...(prismaWhere.AND || []),
        { OR: orConditions }
      ];
    } else {
      prismaWhere.OR = orConditions;
    }
  }

  return prismaWhere;
};

module.exports = {
  parsePrismaQuery,
  castValue
};
