import { createApp, createTextNode, h, ref } from '../../lib/mini-vue.es.js'
createApp({
  name: 'app',
  render() {

    return h('div', {}, [createTextNode(`count: ${this.count}`), h('button', { onClick: this.clickFn }, [createTextNode('点我')])])
  },
  setup() {
    const count = ref(0)
    const clickFn = () => {
      count.value ++;
      console.log(count.value)
    }
    return {
      count: count,
      clickFn: clickFn
    }
  }
}).mount(document.querySelector('#app'));
