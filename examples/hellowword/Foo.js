import { h } from "../../lib/mini-vue.es.js"
export const Foo = {
  setup(props) {
    console.log(props)
    props.count = 2
    return {
      count: props.count || 0
    }
  },
  render() {
    return h('div', {}, `Foo: ${this.count}`)
  },
}