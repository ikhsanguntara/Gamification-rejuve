'use strict';

const router = require('express').Router();
const paramController = require('./param.controller');
const { authenticate } = require('../../middlewares/auth');
const { authorizeRole } = require('../../middlewares/role');

router.use(authenticate);

// ─── Public/Authenticated Read Options ────────────────────────────────────────
router.get('/group-code/:groupCode', paramController.getParamsByGroupCode);
router.get('/groups', paramController.getParamGroups);
router.get('/groups/:id', paramController.getParamGroupById);
router.get('/', paramController.getParams);
router.get('/:id', paramController.getParamById);

// ─── Superadmin Mutations ─────────────────────────────────────────────────────
router.post('/groups', authorizeRole(['SUPERADMIN']), paramController.createParamGroup);
router.put('/groups/:id', authorizeRole(['SUPERADMIN']), paramController.updateParamGroup);
router.delete('/groups/:id', authorizeRole(['SUPERADMIN']), paramController.deleteParamGroup);

router.post('/', authorizeRole(['SUPERADMIN']), paramController.createParam);
router.put('/:id', authorizeRole(['SUPERADMIN']), paramController.updateParam);
router.delete('/:id', authorizeRole(['SUPERADMIN']), paramController.deleteParam);

module.exports = router;
