import { h } from '../../lib/mini-vue.es.js'
import { Foo } from './Foo.js';

window.self = {}
export const App = {
  render() {
    window.self = this
    // return h('div', { class: 'red' }, [h('span', {class: 'blue'}, 'Hi'), h('h1', {class: 'blue'}, 'mini'), h('span', {class: 'blue'}, 'vue')]);
    return h('div', { class: 'red', onClick: () => {console.log('click')} }, [`Hi, ${this.msg}`, h(Foo, {count: 1})]);
  },
  setup() {
    return {
      msg: 'mini-vue'
    }
  }
}