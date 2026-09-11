'use strict';

const router = require('express').Router();
const feedbackController = require('./feedback.controller');
const { authenticate } = require('../../middlewares/auth');

router.use(authenticate);

router.get('/questions', feedbackController.getQuestions);
router.get('/my-feedback', feedbackController.getMyFeedback);
router.post('/surveys', feedbackController.submitSurvey);
router.get('/surveys', feedbackController.getSurveys);
router.get('/surveys/:id', feedbackController.getSurveyById);

module.exports = router;
