import { createVNode } from './vnode';
import { render } from './renderer';
export function createApp(rootComponent){
  return {
    mount(rootComtainer) {
      const vnode = createVNode(rootComponent);
      render(vnode, rootComtainer, null);
    }
  }
}
