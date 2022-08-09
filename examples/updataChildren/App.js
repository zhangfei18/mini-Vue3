import { h } from "../../lib/mini-vue.es.js"
import { ArrayToText } from './ArrayToText.js'
import { TextToArray } from './TextToArray.js'
import { TextToText } from './TextToText.js'
import { ArrayToArray } from './ArrayToArray.js'
export const App = {
  name: 'APP',
  render() {
    return h('div', { tid: 1 }, [
      // h(ArrayToText)
      // h(TextToText)
      // h(TextToArray)
      h(ArrayToArray)
    ]);
  },
  setup(props) {
    return {}
  }
}