'use strict';

const router = require('express').Router();
const syncController = require('./sync.controller');

router.post('/departments', syncController.syncDepartments);
router.post('/users', syncController.syncUsers);

router.post('/departments/pull-all', syncController.pullAllDepartments);
router.post('/users/pull-all', syncController.pullAllUsers);

module.exports = router;
