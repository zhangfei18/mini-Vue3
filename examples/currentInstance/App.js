import { h, getCurrentInstance } from '../../lib/mini-vue.es.js'
import { Foo } from './Foo.js';

export const App = {
  name: 'App',
  render() {
    return h('div', {}, [`Hi, ${this.msg}`, h(Foo, {}, [])]);
  },
  setup() {
    console.log('App', getCurrentInstance())
    return {
      msg: 'mini-vue'
    }
  }
}