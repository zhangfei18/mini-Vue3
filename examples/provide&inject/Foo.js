import { h, inject, createTextNode, provide } from "../../lib/mini-vue.es.js"
import { FooSon } from './Foo-son.js'
export const Foo = {
  name: 'Foo',
  render() {
    return h('div', {}, [createTextNode(`Foo: ${this.info}`), h(FooSon, {}, [])])
  },
  setup() {
    let info = inject('appInfo')
    provide('appInfo', 'hello-foo-son')
    return {
      info
    }
  }
}