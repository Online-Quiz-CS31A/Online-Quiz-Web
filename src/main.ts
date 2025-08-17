import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import './assets/index.css'

/* import the fontawesome core */
import { library } from '@fortawesome/fontawesome-svg-core'

/* import font awesome icon component */
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

/* import specific icons */
import { faGraduationCap, faEye, faEyeSlash, faCheck, faShieldAlt, faChartLine, faBolt, faSpinner, faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons'

/* add icons to the library */
library.add(faGraduationCap, faEye, faEyeSlash, faCheck, faShieldAlt, faChartLine, faBolt, faSpinner, faEnvelope, faLock)

const app = createApp(App)

app.component('font-awesome-icon', FontAwesomeIcon)
app.use(createPinia())
app.use(router)

app.mount('#app')
