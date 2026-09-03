'use strict';

const router = require('express').Router();
const masterController = require('./master.controller');
const { authenticate } = require('../../middlewares/auth');
const { authorizeRole } = require('../../middlewares/role');

router.use(authenticate);
router.use(authorizeRole(['SUPERADMIN']));

// ─── Departments ─────────────────────────────────────────────────────────────
router.get('/departments', masterController.getDepartments);
router.get('/departments/:id', masterController.getDepartmentById);
router.post('/departments', masterController.createDepartment);
router.put('/departments/:id', masterController.updateDepartment);
router.delete('/departments/:id', masterController.deleteDepartment);

// ─── Users ───────────────────────────────────────────────────────────────────
router.get('/users', masterController.getUsers);
router.get('/users/:id', masterController.getUserById);
router.post('/users', masterController.createUser);
router.put('/users/:id', masterController.updateUser);
router.delete('/users/:id', masterController.deleteUser);

// ─── Roles ───────────────────────────────────────────────────────────────────
router.get('/roles', masterController.getRoles);
router.get('/roles/:id', masterController.getRoleById);
router.post('/roles', masterController.createRole);
router.put('/roles/:id', masterController.updateRole);
router.delete('/roles/:id', masterController.deleteRole);

module.exports = router;
