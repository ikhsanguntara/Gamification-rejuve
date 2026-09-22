'use strict';

const router = require('express').Router();
const masterController = require('./master.controller');
const { authenticate } = require('../../middlewares/auth');
const { authorizeRole } = require('../../middlewares/role');

const multer = require('multer');

const uploadExcel = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

const { uploadMiddleware } = require('../../utils/minioStorage');

router.use(authenticate);
router.use(authorizeRole(['SUPERADMIN']));

// ─── Departments ─────────────────────────────────────────────────────────────
router.get('/departments/template', masterController.downloadDepartmentTemplate);
router.post('/departments/bulk-preview', uploadExcel.any(), masterController.bulkPreviewDepartments);
router.post('/departments/bulk-commit', masterController.bulkCommitDepartments);
router.get('/departments', masterController.getDepartments);
router.get('/departments/:id', masterController.getDepartmentById);
router.post('/departments', masterController.createDepartment);
router.put('/departments/:id', masterController.updateDepartment);
router.delete('/departments/:id', masterController.deleteDepartment);

// ─── Users & Bulk Import ─────────────────────────────────────────────────────
router.get('/users/template', masterController.downloadUserTemplate);
router.post('/users/bulk-preview', uploadExcel.any(), masterController.bulkPreviewUsers);
router.post('/users/bulk-commit', masterController.bulkCommitUsers);
router.get('/users', masterController.getUsers);
router.get('/users/:id', masterController.getUserById);
router.post('/users', uploadMiddleware.single('avatar'), masterController.createUser);
router.put('/users/:id', uploadMiddleware.single('avatar'), masterController.updateUser);
router.delete('/users/:id', masterController.deleteUser);

// ─── Roles ───────────────────────────────────────────────────────────────────
router.get('/roles', masterController.getRoles);
router.get('/roles/:id', masterController.getRoleById);
router.post('/roles', masterController.createRole);
router.put('/roles/:id', masterController.updateRole);
router.delete('/roles/:id', masterController.deleteRole);

module.exports = router;
