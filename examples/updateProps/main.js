import { createApp, createTextNode, h, ref } from '../../lib/mini-vue.es.js'
createApp({
  name: 'app',
  render() {

    return h('div', 
      { 
        id: 'root',
        ...this.props 
      }, 
      [
        h('button', 
          { 
            onClick: this.clickFn 
          }, 
          [
            createTextNode('点我')
          ]
        ),
        h('button', 
          { 
            onClick: this.onChangePropsDemo1 
          }, 
          [
            createTextNode('点我修改props')
          ]
        ),
        h('button', 
          { 
            onClick: this.onChangePropsDemo3
          }, 
          [
            createTextNode('点我置空props')
          ]
        )
      ])
  },
  setup() {
    const count = ref(0)
    const props = ref({
      foo: 'foo',
      bar: 'bar'
    })
    const clickFn = () => {
      count.value++;
      console.log(count.value)
    }
    const onChangePropsDemo1 = function(){
      props.value.foo = 'new-foo';
    }
    const onChangePropsDemo2 = function(){
      props.value.foo = undefined;
    }
    const onChangePropsDemo3 = function(){
      props.value = { foo: 'foo' };
    }
    return {
      count: count,
      clickFn: clickFn,
      onChangePropsDemo1,
      onChangePropsDemo2,
      onChangePropsDemo3,
      props
    }
  }
}).mount(document.querySelector('#app'));
