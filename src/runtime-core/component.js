import { shallowReadonly } from '../reactivity/reactive.js';
import { emit } from './componentEmit.js';
import { initProps } from './componentProps.js';
import { PublicInstanceProxyHandlers } from './componentPublicInstance.js'
import { initSlots } from './componentSlots.js';
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

export function createComponentInstance(vnode, rootComtainer, parent) {
  const instance = {
    vnode,
    type: vnode.type,
    setupState: {},
    props: {},
    slots: {},
    provides: parent ? parent.provides : {},
    parent: parent || {},
    emit(){}
  };
  instance.emit = emit.bind(null, instance)
  return instance;
};
export function setupComponent(instance) {
  // 初始化props
  initProps(instance, instance.vnode.props)
  // 初始化slots
  initSlots(instance, instance.vnode.children)
  setupStatefulComponent(instance)
}

function setupStatefulComponent(instance) {
  const component = instance.vnode.type
  instance.renderContext = new Proxy({_: instance}, PublicInstanceProxyHandlers);
  const { setup } = component;
  if (setup) {
    setCurrentInstance(instance);
    // 执行setup函数
    const setupResult = setup(shallowReadonly(instance.props), { emit: instance.emit });
    handleSetupResult(instance, setupResult)
    setCurrentInstance(null);
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
let currentInstance = null;
export const getCurrentInstance = function(){
  return currentInstance;
};

function setCurrentInstance(instance){
  currentInstance = instance;
};