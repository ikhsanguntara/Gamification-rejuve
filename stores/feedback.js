import { defineStore } from 'pinia'
import {
  mockFeedbackSurveyTemplate,
  mockNewHireReportTemplate,
  mockSubmittedFeedbacks,
  mockNewHireReports
} from '~/mocks/feedbackTemplates.js'
import { getStoredData, setStoredData } from '~/utils/storage.js'

export const useFeedbackStore = defineStore('feedback', {
  state: () => ({
    surveyTemplate: getStoredData('rejuve_feedback_survey_tmpl_v1', mockFeedbackSurveyTemplate),
    raporTemplate: getStoredData('rejuve_newhire_rapor_tmpl_v1', mockNewHireReportTemplate),
    crewFeedbacks: getStoredData('rejuve_crew_feedbacks_v1', mockSubmittedFeedbacks),
    newHireReports: getStoredData('rejuve_newhire_reports_v1', mockNewHireReports)
  }),

  getters: {
    surveyQuestions: (state) => state.surveyTemplate.questions || [],
    raporCompetencies: (state) => state.raporTemplate.competencies || [],

    feedbackByCrewId: (state) => (crewId) => {
      return state.crewFeedbacks.find(f => f.crewId === crewId)
    },

    raporByCrewId: (state) => (crewId) => {
      return state.newHireReports.find(r => r.crewId === crewId)
    },

    allSubmittedFeedbacks: (state) => state.crewFeedbacks,
    allNewHireReports: (state) => state.newHireReports,

    averageSurveyRating: (state) => {
      if (state.crewFeedbacks.length === 0) return 0
      const total = state.crewFeedbacks.reduce((acc, curr) => acc + (curr.avgScore || 0), 0)
      return (total / state.crewFeedbacks.length).toFixed(1)
    }
  },

  actions: {
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
