import { h, getCurrentInstance } from "../../lib/mini-vue.es.js"

export const Foo = {
  name: 'Foo',
  render() {
    return h('div', {}, [])
  },
  setup() {
    console.log('Foo', getCurrentInstance())
    return {}
  }
}