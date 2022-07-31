import { h, inject, createTextNode } from "../../lib/mini-vue.es.js"

export const FooSon = {
  name: 'Foo-son',
  render() {
    return h('div', {}, [createTextNode(`Foo-so: ${this.info}`)])
  },
  setup() {
    let info = inject('appInfo')
    return {
      info
    }
  }
}