import { h, createTextNode } from '../../lib/mini-vue.es.js'
import { Foo } from './Foo.js';

export const App = {
  render() {
    
    let slotsObj = {
      header: () => [h('div', {}, 'header'), createTextNode('hello')],
      footer:  () => h('div', {}, 'footer'),
      scope: ({name}) => h('div', {}, 'scope' + name),
    }
    return h('div', {}, [`Hi, ${this.msg}`, h(Foo, {}, slotsObj)]);
  },
  setup() {
    return {
      msg: 'mini-vue'
    }
  }
}