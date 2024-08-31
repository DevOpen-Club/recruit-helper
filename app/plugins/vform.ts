import VFormRender from 'vform3-builds/dist/render.umd.js'
import 'vform3-builds/dist/render.style.css'

export default defineNuxtPlugin(({ vueApp }) => {
  vueApp.use(VFormRender)
})
