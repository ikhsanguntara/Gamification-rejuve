/**
 * @file queryBuilder.js
 * @description Helper utility untuk membangun HTTP query parameters yang sesuai dengan
 * standar queryParser backend Re.juve (Prisma Operators).
 *
 * Mendukung operator backend:
 * - Exact: ?field=value
 * - Equals: ?field[equals]=value
 * - Not: ?field[not]=value
 * - Contains: ?field[contains]=keyword (String, Case Insensitive)
 * - StartsWith: ?field[startsWith]=prefix
 * - EndsWith: ?field[endsWith]=suffix
 * - In: ?field[in]=val1,val2
 * - NotIn: ?field[notIn]=val1,val2
 * - Gte / Gt / Lte / Lt: ?field[gte]=number/date
 */

export function buildPrismaQuery({
  page = 1,
  limit = 10,
  exact = {},
  contains = {},
  equals = {},
  not = {},
  startsWith = {},
  endsWith = {},
  inList = {},
  notInList = {},
  gte = {},
  gt = {},
  lte = {},
  lt = {}
} = {}) {
  const query = { page, limit }

  // 1. Exact match (?field=value)
  for (const [key, val] of Object.entries(exact)) {
    if (val !== undefined && val !== null && val !== '') {
      query[key] = val
    }
  }

  // 2. Contains (?field[contains]=keyword)
  for (const [key, val] of Object.entries(contains)) {
    if (val !== undefined && val !== null && String(val).trim() !== '') {
      query[`${key}[contains]`] = String(val).trim()
    }
  }

  // 3. Equals (?field[equals]=value)
  for (const [key, val] of Object.entries(equals)) {
    if (val !== undefined && val !== null && val !== '') {
      query[`${key}[equals]`] = val
    }
  }

  // 4. Not (?field[not]=value)
  for (const [key, val] of Object.entries(not)) {
    if (val !== undefined && val !== null && val !== '') {
      query[`${key}[not]`] = val
    }
  }

  // 5. StartsWith (?field[startsWith]=prefix)
  for (const [key, val] of Object.entries(startsWith)) {
    if (val !== undefined && val !== null && String(val).trim() !== '') {
      query[`${key}[startsWith]`] = String(val).trim()
    }
  }

  // 6. EndsWith (?field[endsWith]=suffix)
  for (const [key, val] of Object.entries(endsWith)) {
    if (val !== undefined && val !== null && String(val).trim() !== '') {
      query[`${key}[endsWith]`] = String(val).trim()
    }
  }

  // 7. In (?field[in]=val1,val2)
  for (const [key, val] of Object.entries(inList)) {
    if (val !== undefined && val !== null && val !== '') {
      query[`${key}[in]`] = Array.isArray(val) ? val.join(',') : val
    }
  }

  // 8. NotIn (?field[notIn]=val1,val2)
  for (const [key, val] of Object.entries(notInList)) {
    if (val !== undefined && val !== null && val !== '') {
      query[`${key}[notIn]`] = Array.isArray(val) ? val.join(',') : val
    }
  }

  // 9. Numeric / Date comparisons (gte, gt, lte, lt)
  for (const [key, val] of Object.entries(gte)) {
    if (val !== undefined && val !== null && val !== '') query[`${key}[gte]`] = val
  }
  for (const [key, val] of Object.entries(gt)) {
    if (val !== undefined && val !== null && val !== '') query[`${key}[gt]`] = val
  }
  for (const [key, val] of Object.entries(lte)) {
    if (val !== undefined && val !== null && val !== '') query[`${key}[lte]`] = val
  }
  for (const [key, val] of Object.entries(lt)) {
    if (val !== undefined && val !== null && val !== '') query[`${key}[lt]`] = val
  }

  return query
}
