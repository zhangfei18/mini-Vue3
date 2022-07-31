import { h, provide, createTextNode } from '../../lib/mini-vue.es.js'
import { Foo } from './Foo.js';

export const App = {
  name: 'App',
  render() {
    return h('div', {}, [createTextNode(`App: Hi, ${this.msg}`), h(Foo, {}, {})]);
  },
  setup() {
    provide('appInfo', 'hello-Foo');
    return {
      msg: 'mini-vue'
    }
  }
}