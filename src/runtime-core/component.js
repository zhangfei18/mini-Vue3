import { shallowReadonly } from '../reactivity/reactive.js';
import { emit } from './componentEmit.js';
import { initProps } from './componentProps.js';
import { PublicInstanceProxyHandlers } from './componentPublicInstance.js'
/**
 * instance: {
 *   vnode: {
 *     type: {},
 *     props: 
 *     children: 
 *   },
 *   setupState: 
 *   render: 
 *   renderContext:
 * }
 */

export function createComponentInstance(vnode, rootComtainer) {
  const instance = {
    vnode,
    emit(){}
  };
  instance.emit = emit.bind(null, instance)
  return instance;
};
export function setupComponent(instance) {
  // 初始化props
  initProps(instance, instance.vnode.props)
  // 初始化slots
  setupStatefulComponent(instance)
}
function setupStatefulComponent(instance) {
  const component = instance.vnode.type
  instance.renderContext = new Proxy({_: instance}, PublicInstanceProxyHandlers);
  const { setup } = component;
  if (setup) {
    const setupResult = setup(shallowReadonly(instance.props), { emit: instance.emit });
    handleSetupResult(instance, setupResult)
  }
};
function handleSetupResult(instance, setupResult) {
  if (typeof setupResult === 'object') {
    instance.setupState = setupResult
  }
  finishComponentSetup(instance)
}
function finishComponentSetup(instance) {
  const component = instance.vnode.type;
  if (component.render) {
    instance.render = component.render;
  }
}