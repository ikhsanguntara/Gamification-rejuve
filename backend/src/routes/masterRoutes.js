'use strict';
const router = require('express').Router();
const masterController = require('../controllers/masterController');
const { authenticate, authorize } = require('../middlewares/auth');

router.use(authenticate);
router.use(authorize('SUPERADMIN'));

// Departments
router.get('/departments', masterController.getDepartments);
router.get('/departments/:id', masterController.getDepartmentById);
router.post('/departments', masterController.createDepartment);
router.put('/departments/:id', masterController.updateDepartment);
router.delete('/departments/:id', masterController.deleteDepartment);

// Users
router.get('/users', masterController.getUsers);
router.get('/users/:id', masterController.getUserById);
router.post('/users', masterController.createUser);
router.put('/users/:id', masterController.updateUser);
router.delete('/users/:id', masterController.deleteUser);

module.exports = router;
