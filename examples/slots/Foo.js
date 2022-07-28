import { h, renderSlots } from "../../lib/mini-vue.es.js"

export const Foo = {
  render() {
    return h('div', {}, [renderSlots(this.$slots, 'header'), renderSlots(this.$slots, 'footer'), renderSlots(this.$slots, 'scope', {name: 'zf'})])
  },
  setup() {
    return {}
  }
}