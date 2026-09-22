'use strict';

/**
 * @file report.controller.js
 * @description Controller untuk Laporan Insentif Buddy & Audit Traceability Pengguna.
 */

const reportService = require('./report.service');
const { sendSuccess, sendError, sendPaginated } = require('../../utils/responseWrapper');

/**
 * GET /api/reports/buddy-incentive
 * Rekapitulasi bimbingan mentor buddy untuk dasar insentif HR.
 */
const getBuddyIncentive = async (req, res, next) => {
  try {
    const result = await reportService.getBuddyIncentiveReport(req.query, req.user);
    const { total, page, limit, totalPages } = result.pagination;
    return sendSuccess(res, {
      message: 'Laporan insentif buddy berhasil diambil.',
      data: result.buddies,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        summary: result.summary
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/reports/buddy-incentive/export
 * Ekspor spreadsheet Excel (.xlsx) rekap insentif buddy dan rincian mentee.
 */
const exportBuddyIncentive = async (req, res, next) => {
  try {
    const buffer = await reportService.exportBuddyIncentiveExcel(req.query, req.user);
    const filename = 'Laporan_Insentif_Buddy_' + Date.now() + '.xlsx';
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="' + filename + '"');
    return res.send(buffer);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/reports/buddy-incentive/:userId
 * Detail riwayat bimbingan dan estimasi insentif untuk satu Store Leader / Buddy tertentu.
 */
const getBuddyIncentiveDetail = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const result = await reportService.getBuddyIncentiveDetailByUserId(userId, req.query);
    if (!result) {
      return sendError(res, { statusCode: 404, message: 'Data pengguna/buddy tidak ditemukan.' });
    }
    return sendSuccess(res, {
      message: 'Detail insentif buddy berhasil diambil.',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/reports/user-traceability
 * Daftar dan pencarian pengguna untuk modul Traceability.
 */
const getUserTraceabilityList = async (req, res, next) => {
  try {
    const { data, pagination } = await reportService.getUserTraceabilityList(req.query, req.user);
    return sendPaginated(res, {
      message: 'Daftar audit traceability pengguna berhasil diambil.',
      data,
      total: pagination.total,
      page: pagination.page,
      limit: pagination.limit
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/reports/user-traceability/export
 * Ekspor spreadsheet Excel (.xlsx) data audit Active New Recruit Report (Traceability).
 */
const exportUserTraceability = async (req, res, next) => {
  try {
    const buffer = await reportService.exportUserTraceabilityExcel(req.query, req.user);
    const filename = 'Active_New_Recruit_Report_' + Date.now() + '.xlsx';
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="' + filename + '"');
    return res.send(buffer);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/reports/buddy-incentive/:userId/export
 * Ekspor spreadsheet Excel (.xlsx) rekapitulasi dan mentee khusus satu Buddy.
 */
const exportSingleBuddyIncentive = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const buffer = await reportService.exportSingleBuddyIncentiveExcel(userId, req.query);
    if (!buffer) {
      return sendError(res, { statusCode: 404, message: 'Data pengguna/buddy tidak ditemukan.' });
    }
    const filename = `Laporan_Insentif_Buddy_${userId}_${Date.now()}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(buffer);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/reports/user-traceability/:userId/export
 * Ekspor spreadsheet Excel (.xlsx) kartu audit jejak dan evaluasi misi satu pengguna.
 */
const exportSingleUserTraceability = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const buffer = await reportService.exportSingleUserTraceabilityExcel(userId);
    if (!buffer) {
      return sendError(res, { statusCode: 404, message: 'Data pengguna tidak ditemukan.' });
    }
    const filename = `Audit_Traceability_${userId}_${Date.now()}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(buffer);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/reports/user-traceability/:userId
 * Detail riwayat penugasan, gerai aktif, evaluator SL dan DM, serta riwayat skor misi pengguna.
 */
const getUserTraceabilityDetail = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const result = await reportService.getUserTraceabilityDetail(userId);
    if (!result) {
      return sendError(res, { statusCode: 404, message: 'Data pengguna tidak ditemukan.' });
    }
    return sendSuccess(res, {
      message: 'Detail traceability pengguna berhasil diambil.',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/reports/score
 * Rekapitulasi nilai dan skor kru per minggu (Week 1, Week 2, Week 3) beserta skor bintang dan poin.
 */
const getScoreReport = async (req, res, next) => {
  try {
    const { data, pagination } = await reportService.getScoreReport(req.query, req.user);
    return sendPaginated(res, {
      message: 'Laporan score berhasil diambil.',
      data,
      total: pagination.total,
      page: pagination.page,
      limit: pagination.limit
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/reports/score/export
 * Ekspor spreadsheet Excel (.xlsx) data Score Report.
 */
const exportScoreReport = async (req, res, next) => {
  try {
    const buffer = await reportService.exportScoreReportExcel(req.query, req.user);
    const filename = 'Score_Report_' + Date.now() + '.xlsx';
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="' + filename + '"');
    return res.send(buffer);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/reports/store
 * Rekapitulasi progres onboarding new hire berdasarkan gerai / store.
 */
const getStoreReport = async (req, res, next) => {
  try {
    const { data, pagination } = await reportService.getStoreReport(req.query, req.user);
    return sendPaginated(res, {
      message: 'Laporan per gerai (report by store) berhasil diambil.',
      data,
      total: pagination.total,
      page: pagination.page,
      limit: pagination.limit
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/reports/store/export
 * Ekspor spreadsheet Excel (.xlsx) data Report by Store.
 */
const exportStoreReport = async (req, res, next) => {
  try {
    const buffer = await reportService.exportStoreReportExcel(req.query, req.user);
    const filename = 'Report_By_Store_' + Date.now() + '.xlsx';
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="' + filename + '"');
    return res.send(buffer);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/reports/dm
 * Evaluasi performa dan kecepatan approval District Manager terhadap penilaian SL dan misi.
 */
const getDmReport = async (req, res, next) => {
  try {
    const { data, pagination } = await reportService.getDmReport(req.query, req.user);
    return sendPaginated(res, {
      message: 'Laporan supervisi DM (report by DM) berhasil diambil.',
      data,
      total: pagination.total,
      page: pagination.page,
      limit: pagination.limit
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/reports/dm/export
 * Ekspor spreadsheet Excel (.xlsx) data Report by DM.
 */
const exportDmReport = async (req, res, next) => {
  try {
    const buffer = await reportService.exportDmReportExcel(req.query, req.user);
    const filename = 'Report_By_DM_' + Date.now() + '.xlsx';
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="' + filename + '"');
    return res.send(buffer);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBuddyIncentive,
  exportBuddyIncentive,
  getBuddyIncentiveDetail,
  exportSingleBuddyIncentive,
  getUserTraceabilityList,
  exportUserTraceability,
  exportSingleUserTraceability,
  getUserTraceabilityDetail,
  getScoreReport,
  exportScoreReport,
  getStoreReport,
  exportStoreReport,
  getDmReport,
  exportDmReport
};
