import { defineStore } from 'pinia'
import { getStoredData, setStoredData } from '../utils/storage.js'
import { feedbackApi } from '../services/api.js'

export const useFeedbackStore = defineStore('feedback', {
  state: () => ({
    surveyTemplate: getStoredData('rejuve_feedback_survey_tmpl_v1', { id: 'tpl-survey', title: 'Survey Onboarding Kru', questions: [] }),
    raporTemplate: getStoredData('rejuve_newhire_rapor_tmpl_v1', { id: 'tpl-rapor', title: 'Rapor Evaluasi 7 Kompetensi', competencies: [] }),
    crewFeedbacks: getStoredData('rejuve_crew_feedbacks_v1', []),
    newHireReports: getStoredData('rejuve_newhire_reports_v1', []),
    apiQuestions: [],
    myFeedback: null,
    surveysList: [],
    isLoadingQuestions: false,
    isLoadingMyFeedback: false,
    isSubmitting: false
  }),

  getters: {
    surveyQuestions: (state) => {
      if (state.apiQuestions && state.apiQuestions.length > 0) {
        return state.apiQuestions
      }
      return state.surveyTemplate.questions || []
    },
    raporCompetencies: (state) => state.raporTemplate.competencies || [],

    feedbackByCrewId: (state) => (crewId) => {
      if (state.myFeedback) {
        if (!crewId || state.myFeedback.crewId === crewId || state.myFeedback.userId === crewId || state.myFeedback.crew?.userId === crewId) {
          return state.myFeedback
        }
      }
      return state.crewFeedbacks.find(f => f.crewId === crewId || f.userId === crewId)
    },

    raporByCrewId: (state) => (crewId) => {
      return state.newHireReports.find(r => r.crewId === crewId)
    },

    allSubmittedFeedbacks: (state) => (state.surveysList.length > 0 ? state.surveysList : state.crewFeedbacks),
    allNewHireReports: (state) => state.newHireReports,

    averageSurveyRating: (state) => {
      const list = state.surveysList.length > 0 ? state.surveysList : state.crewFeedbacks
      if (list.length === 0) return 0
      const total = list.reduce((acc, curr) => acc + (Number(curr.avgScore || curr.averageScore) || 0), 0)
      return (total / list.length).toFixed(1)
    }
  },

  actions: {
    /**
     * GET /feedback/questions
     */
    async fetchQuestionsFromApi() {
      this.isLoadingQuestions = true
      try {
        const res = await feedbackApi.getQuestions()
        if (res?.success && res.data) {
          const list = Array.isArray(res.data) ? res.data : (res.data.questions || res.data.list || [])
          if (list.length > 0) {
            this.apiQuestions = list.map((q, idx) => ({
              id: q.id || q.questionId || `q-${idx + 1}`,
              number: q.number || q.orderNumber || idx + 1,
              text: q.text || q.questionText || q.title || '',
              category: q.category || q.topic || 'Onboarding & Kolaborasi',
              type: q.type || (q.inputType === 'TEXT' ? 'ESSAY' : 'SCALE_0_10')
            }))
            return this.apiQuestions
          }
        }
      } catch (err) {
        console.warn('fetchQuestionsFromApi failed, using fallback:', err.message)
      } finally {
        this.isLoadingQuestions = false
      }
      return this.surveyQuestions
    },

    /**
     * GET /feedback/my-feedback
     */
    async fetchMyFeedbackFromApi() {
      this.isLoadingMyFeedback = true
      try {
        const res = await feedbackApi.getMyFeedback()
        if (res?.success && res.data) {
          this.myFeedback = res.data
          return res.data
        }
      } catch (err) {
        console.warn('fetchMyFeedbackFromApi failed:', err.message)
      } finally {
        this.isLoadingMyFeedback = false
      }
      return null
    },

    /**
     * POST /feedback/surveys
     */
    async submitSurveyToApi(payload) {
      this.isSubmitting = true
      try {
        const res = await feedbackApi.submitSurvey(payload)
        if (res?.success && res.data) {
          this.myFeedback = res.data
          this.submitCrewFeedback(payload) // Sync local cache
          return res.data
        }
        return res
      } catch (err) {
        console.error('submitSurveyToApi failed:', err)
        throw err
      } finally {
        this.isSubmitting = false
      }
    },

    /**
     * GET /feedback/surveys
     */
    async fetchSurveysFromApi(params = {}) {
      try {
        const res = await feedbackApi.getSurveys(params)
        if (res?.success && res.data) {
          const list = Array.isArray(res.data) ? res.data : (res.data.surveys || res.data.list || [])
          this.surveysList = list
          return list
        }
      } catch (err) {
        console.warn('fetchSurveysFromApi failed:', err.message)
      }
      return this.crewFeedbacks
    },

    /**
     * GET /feedback/surveys/:id
     */
    async fetchSurveyByIdFromApi(id) {
      try {
        const res = await feedbackApi.getSurveyById(id)
        return res?.data || res
      } catch (err) {
        console.error('fetchSurveyByIdFromApi failed:', err)
        throw err
      }
    },

    /**
     * Submit Crew Survey Feedback
     */
    submitCrewFeedback({
      crewId,
      crewName,
      storeLocation,
      buddyName,
      ratings = {},
      essayAnswer = ''
    }) {
      const numericRatings = Object.values(ratings).filter(v => typeof v === 'number')
      const avg = numericRatings.length > 0
        ? (numericRatings.reduce((a, b) => a + b, 0) / numericRatings.length).toFixed(1)
        : 10

      let existing = this.crewFeedbacks.find(f => f.crewId === crewId)
      if (existing) {
        Object.assign(existing, {
          crewName,
          storeLocation,
          buddyName,
          ratings,
          essayAnswer,
          avgScore: Number(avg),
          submittedAt: new Date().toISOString()
        })
      } else {
        existing = {
          id: `fb-sub-${Date.now()}`,
          crewId,
          crewName,
          storeLocation,
          buddyName,
          ratings,
          essayAnswer,
          avgScore: Number(avg),
          submittedAt: new Date().toISOString()
        }
        this.crewFeedbacks.push(existing)
      }

      setStoredData('rejuve_crew_feedbacks_v1', this.crewFeedbacks)
      return existing
    },

    /**
     * Store Leader: Save Rapor New Hire
     */
    saveNewHireReport({
      crewId,
      crewName,
      storeLocation,
      storeCaptain,
      evaluationDate = new Date().toISOString().split('T')[0],
      indicatorsRating = {},
      notes = '',
      status = 'LULUS_KOMPETEN'
    }) {
      let existing = this.newHireReports.find(r => r.crewId === crewId)
      if (existing) {
        Object.assign(existing, {
          crewName,
          storeLocation,
          storeCaptain,
          evaluationDate,
          indicatorsRating,
          notes,
          status,
          updatedAt: new Date().toISOString()
        })
      } else {
        existing = {
          id: `rpt-nh-${Date.now()}`,
          crewId,
          crewName,
          storeLocation,
          storeCaptain,
          evaluationDate,
          indicatorsRating,
          notes,
          status,
          createdAt: new Date().toISOString()
        }
        this.newHireReports.push(existing)
      }

      setStoredData('rejuve_newhire_reports_v1', this.newHireReports)
      return existing
    },

    /**
     * Admin CRUD: Add / Update / Delete Survey Question
     */
    addSurveyQuestion(payload) {
      const newQ = {
        id: `q-${Date.now()}`,
        number: this.surveyTemplate.questions.length + 1,
        text: payload.text,
        category: payload.category || 'Umum',
        type: payload.type || 'SCALE_0_10'
      }
      this.surveyTemplate.questions.push(newQ)
      setStoredData('rejuve_feedback_survey_tmpl_v1', this.surveyTemplate)
      return newQ
    },

    updateSurveyQuestion(id, payload) {
      const q = this.surveyTemplate.questions.find(item => item.id === id)
      if (q) {
        Object.assign(q, payload)
        setStoredData('rejuve_feedback_survey_tmpl_v1', this.surveyTemplate)
      }
      return q
    },

    deleteSurveyQuestion(id) {
      const idx = this.surveyTemplate.questions.findIndex(item => item.id === id)
      if (idx !== -1) {
        const removed = this.surveyTemplate.questions.splice(idx, 1)[0]
        setStoredData('rejuve_feedback_survey_tmpl_v1', this.surveyTemplate)
        return removed
      }
      return null
    },

    /**
     * Admin CRUD: Add / Update / Delete Rapor Competency Indicator
     */
    addRaporIndicator(compId, payload) {
      const comp = this.raporTemplate.competencies.find(c => c.id === compId)
      if (!comp) return null
      const newInd = {
        id: `ind-${Date.now()}`,
        text: payload.text,
        isMandatoryIntro: !!payload.isMandatoryIntro
      }
      comp.indicators.push(newInd)
      setStoredData('rejuve_newhire_rapor_tmpl_v1', this.raporTemplate)
      return newInd
    },

    deleteRaporIndicator(compId, indId) {
      const comp = this.raporTemplate.competencies.find(c => c.id === compId)
      if (!comp) return false
      const idx = comp.indicators.findIndex(i => i.id === indId)
      if (idx !== -1) {
        comp.indicators.splice(idx, 1)
        setStoredData('rejuve_newhire_rapor_tmpl_v1', this.raporTemplate)
        return true
      }
      return false
    }
  }
})
