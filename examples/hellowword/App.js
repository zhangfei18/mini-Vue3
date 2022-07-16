import { h } from '../../lib/mini-vue.es.js'
window.self = {}
export const App = {
  render() {
    window.self = this
    // return h('div', { class: 'red' }, [h('span', {class: 'blue'}, 'Hi'), h('h1', {class: 'blue'}, 'mini'), h('span', {class: 'blue'}, 'vue')]);
    return h('div', { class: 'red' }, `Hi, ${this.msg}`);
  },
  setup() {
    return {
      msg: 'mini-vue'
    }
  }
}