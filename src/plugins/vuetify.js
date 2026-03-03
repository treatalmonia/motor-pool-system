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
          primary: '#1B5E20',
          secondary: '#388E3C',
          accent: '#81C784',
          error: '#D32F2F',
          warning: '#F57C00',
          info: '#0288D1',
          success: '#2E7D32',
        },
      },
    },
  },
})