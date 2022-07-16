import { h } from '../../lib/mini-vue.es.js'
export const App = {
  render() {
    return h('div', { class: 'red' }, [h('span', {class: 'blue'}, 'Hi'), h('h1', {class: 'blue'}, 'mini'), h('span', {class: 'blue'}, 'vue')]);
  },
  setup() {
    return {
      msg: 'mini-vue'
    }
  }
}