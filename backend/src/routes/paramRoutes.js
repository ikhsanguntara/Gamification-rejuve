'use strict';
const router = require('express').Router();
const paramController = require('../controllers/paramController');
const { authenticate, authorize } = require('../middlewares/auth');

router.use(authenticate);
router.use(authorize('SUPERADMIN'));

// Param Groups
router.get('/groups', paramController.getParamGroups);
router.get('/groups/:id', paramController.getParamGroupById);
router.post('/groups', paramController.createParamGroup);
router.put('/groups/:id', paramController.updateParamGroup);
router.delete('/groups/:id', paramController.deleteParamGroup);

// Params
router.get('/', paramController.getParams);
router.get('/:id', paramController.getParamById);
router.post('/', paramController.createParam);
router.put('/:id', paramController.updateParam);
router.delete('/:id', paramController.deleteParam);

module.exports = router;
