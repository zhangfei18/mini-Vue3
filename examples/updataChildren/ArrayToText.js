// 老的孩子是数组, 新的孩子是文本
import { h, ref } from "../../lib/mini-vue.es.js"
const prevChildren = [h('div', {}, 'A'), h('div', {}, 'B')];
const nextChildren = 'newChildren';
export const ArrayToText = {
  name: 'ArrayToText',
  render() {
    return this.change ? h('div', {}, prevChildren) : h('div', {}, nextChildren);
  },
  setup() {
    const change = ref(true);
    // 方便我们调试, 我们调试时只需要在控制台将change改变成false就可以触发响应式更新
    window.change = change;
    return {
      change
    };
  }
}