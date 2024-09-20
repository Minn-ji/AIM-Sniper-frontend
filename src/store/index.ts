import surveyModule from '@/survey/store/surveyModule'
import accountModule from '@/account/store/accountModule'
import authenticationModule from '@/authentication/store/authenticationModule'
import googleAuthenticationModule from '@/googleAuthentication/store/googleAuthenticationModule'
import { createStore } from 'vuex'

export default createStore({
  state: {
  },
  getters: {
  },
  mutations: {
  },
  actions: {
  },
  modules: {
    surveyModule,
    accountModule,
    authenticationModule,    
    googleAuthenticationModule,
  }
})
