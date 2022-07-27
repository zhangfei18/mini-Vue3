import { h } from "../../lib/mini-vue.es.js"
import { renderSlots } from "../../src/runtime-core/helpers/renderSlots.js"

export const Foo = {
  render() {
    return h('div', {}, [renderSlots(this.$slots, 'header'), renderSlots(this.$slots, 'footer'), renderSlots(this.$slots, 'scope', {name: 'zf'})])
  },
  setup() {
    return {}
  }
}