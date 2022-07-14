import { createComponentInstance, setupComponent } from './component';
export function render(vnode, rootComtanier){
  patch(vnode, rootComtanier);
}
function patch(vnode, rootComtanier){
  processComponent(vnode, rootComtanier);
}

function processComponent(vnode, rootComtanier){
  mountComponent(vnode, rootComtanier)
}
function mountComponent(vnode, rootComtanier){
  const instance = createComponentInstance(vnode, rootComtanier);
  setupComponent(instance);
  setupRenderEffetct(instance, rootComtanier);
}
function setupRenderEffetct(instance, rootComtanier){
  const subTree = instance.render()
  patch(subTree, rootComtanier);
}