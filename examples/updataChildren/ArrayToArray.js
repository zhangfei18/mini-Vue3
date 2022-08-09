// 老的孩子是数组, 新的孩子是数组
import { h, ref } from "../../lib/mini-vue.es.js"
// const prevChildren = [
//   h('div', { key: 'A' }, 'A'), 
//   h('div',{ key: 'B' }, 'B'), 
//   h('div',{ key: 'C' }, 'C')
// ];
// const nextChildren = [
//   h('div', { key: 'A' }, 'A'), 
//   h('div',{ key: 'B' }, 'B'), 
//   h('div',{ key: 'D' }, 'D'), 
//   h('div',{ key: 'E' }, 'E')
// ];

// const prevChildren = [
//   h('div', { key: 'A' }, 'A'), 
//   h('div',{ key: 'B' }, 'B'), 
//   h('div',{ key: 'C' }, 'C')
// ];
// const nextChildren = [
//   h('div', { key: 'D' }, 'D'), 
//   h('div',{ key: 'E' }, 'E'), 
//   h('div',{ key: 'B' }, 'B'), 
//   h('div',{ key: 'C' }, 'C')
// ];

// const prevChildren = [
//   h('div', { key: 'A' }, 'A'), 
//   h('div',{ key: 'B' }, 'B'), 
// ];
// const nextChildren = [
//   h('div', { key: 'A' }, 'A'), 
//   h('div',{ key: 'B' }, 'B'), 
//   h('div',{ key: 'C' }, 'C'),
//   h('div',{ key: 'D' }, 'D'),
//   h('div',{ key: 'E' }, 'E'),
// ];

// const prevChildren = [
//   h('div', { key: 'B' }, 'B'),
//   h('div', { key: 'A' }, 'A'),
// ];
// const nextChildren = [
//   h('div', { key: 'D' }, 'D'),
//   h('div', { key: 'C' }, 'C'),
//   h('div', { key: 'B' }, 'B'),
//   h('div', { key: 'A' }, 'A'),
// ];

// const prevChildren = [
//   h('div', { key: 'A' }, 'A'),
//   h('div', { key: 'B' }, 'B'),
//   h('div', { key: 'C' }, 'C'),
//   h('div', { key: 'D' }, 'D'),
// ];
// const nextChildren = [
//   h('div', { key: 'A' }, 'A'),
//   h('div', { key: 'B' }, 'B'),
// ];
// const prevChildren = [
//   h('div', { key: 'A' }, 'A'),
//   h('div', { key: 'B' }, 'B'),
//   h('div', { key: 'C', id: '123' }, 'C'),
//   h('div', { key: 'D' }, 'D'),
//   h('div', { key: 'F' }, 'F'),
//   h('div', { key: 'G' }, 'G'),
// ];
// const nextChildren = [
//   h('div', { key: 'A' }, 'A'),
//   h('div', { key: 'B' }, 'B'),
//   h('div', { key: 'E' }, 'E'),
//   h('div', { key: 'C', id: '456' }, 'C'),
//   h('div', { key: 'F' }, 'F'),
//   h('div', { key: 'G' }, 'G'),
// ];

const prevChildren = [
    h('div', { key: 'A' }, 'A'),
    h('div', { key: 'B' }, 'B'),
    h('div', { key: 'E' }, 'E'),
    h('div', { key: 'C', id: '123' }, 'C'),
    h('div', { key: 'D' }, 'D'),
    h('div', { key: 'F' }, 'F'),
    h('div', { key: 'G' }, 'G'),
  ];
  const nextChildren = [
    h('div', { key: 'A' }, 'A'),
    h('div', { key: 'B' }, 'B'),
    h('div', { key: 'C', id: '456' }, 'C'),
    h('div', { key: 'E' }, 'E'),
    h('div', { key: 'F' }, 'F'),
    h('div', { key: 'G' }, 'G'),
  ];
export const ArrayToArray = {
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