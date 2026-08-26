import { initializeApp, getApps } from 'firebase/app'
import { getAnalytics, isSupported } from 'firebase/analytics'

export default defineNuxtPlugin(async () => {
  const firebaseConfig = {
    apiKey: 'AIzaSyA1HXfEUQLf9vaIS-NM1igbpuTPqOmrlCU',
    authDomain: 'gamification-dde4b.firebaseapp.com',
    projectId: 'gamification-dde4b',
    storageBucket: 'gamification-dde4b.firebasestorage.app',
    messagingSenderId: '405364988615',
    appId: '1:405364988615:web:38839d7c57149d148c3ce2',
    measurementId: 'G-2Z7HEYFZ3M'
  }

  // Initialize Firebase app if not already initialized
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

  let analytics = null
  if (typeof window !== 'undefined' && await isSupported()) {
    analytics = getAnalytics(app)
  }

  return {
    provide: {
      firebaseApp: app,
      firebaseAnalytics: analytics
    }
  }
})
