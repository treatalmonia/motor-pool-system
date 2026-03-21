import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#009900',
          secondary: '#f9dc07',
          accent: '#ff9900',
          error: '#ef4444',
          warning: '#f59e0b',
          info: '#0ea5e9',
          success: '#22c55e',
          background: '#ffffff',
          surface: '#f8fafc',
        },
      },
      dark: {
        dark: true,
        colors: {
          primary: '#00cc00',
          secondary: '#f9dc07',
          accent: '#ff9900',
          error: '#ef4444',
          warning: '#f59e0b',
          info: '#0ea5e9',
          success: '#22c55e',
          background: '#0a0c10',
          surface: '#10141c',
        },
      },
    },
  },
})
