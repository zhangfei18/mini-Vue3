import { h } from "../../lib/mini-vue.es.js"
export const Foo = {
  setup(props, { emit }) {
    function btnClickHandler(e) {
      e.stopPropagation();
      emit('add', 1, 2)
    }
    props.count = 2
    return {
      count: props.count || 0,
      btnClickHandler
    }
  },
  render() {
    const btn = h('button', {
      onClick: this.btnClickHandler
    }, '我是buttom')
    const foo = h('span', {}, `Foo: ${this.count}`);
    return h('div', {}, [btn, foo])
  },
}