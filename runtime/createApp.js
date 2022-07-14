import { createVNode } from './vnode';
import { render } from './renderer';
export function createApp(rootComponent){
  return {
    mount(rootComtanier) {
      const vnode = createVNode(rootComponent);
      render(vnode, rootComtanier);
    },
  }
}
