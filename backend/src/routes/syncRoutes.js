'use strict';

const router = require('express').Router();
const syncController = require('../controllers/syncController');

// TODO: Tambahkan middleware otentikasi API Key antar-server (S2S) jika diperlukan di masa depan.
// Saat ini terbuka untuk testing sinkronisasi dari Lynx

router.post('/departments', syncController.syncDepartments);
router.post('/users', syncController.syncUsers);

// Rute untuk narik data masal dari GET Lynx API secara manual
router.post('/departments/pull-all', syncController.pullAllDepartments);
router.post('/users/pull-all', syncController.pullAllUsers);

module.exports = router;
