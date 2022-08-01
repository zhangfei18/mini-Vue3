import { createVNode } from './vnode';
export const createAppApi = function (render) {
  return function createApp(rootComponent) {
    return {
      mount(rootComtainer) {
        const vnode = createVNode(rootComponent);
        render(vnode, rootComtainer, null);
      }
    }
  }
}