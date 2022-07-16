'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function createVNode(type, props, children){
  const vnode = {
    type,
    props,
    children
  };
  return vnode;
}

function createComponentInstance(vnode, rootComtainer) {
  const instance = {
    vnode
  };
  return instance;
}function setupComponent(instance) {
  // 初始化props
  // 初始化slots
  setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
  const component = instance.vnode.type;
  const { setup } = component;
  if (setup) {
    const setupResult = setup();
    handleSetupResult(instance, setupResult);
  }
}function handleSetupResult(instance, setupResult) {
  if (typeof setupResult === 'object') {
    instance.setupState = setupResult;
  }
  finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
  const component = instance.vnode.type;
  if (component.render) {
    instance.render = component.render;
  }
}

function render(vnode, rootComtainer) {
  // TODO有vnode表示挂载或者更新， 无vnode表示销毁
  if (vnode) {
    patch(vnode, rootComtainer);
  }
}
function patch(vnode, rootComtainer) {
  if (typeof vnode.type === 'string') {
    processElement(vnode, rootComtainer);
  } else if (typeof vnode.type === 'object') {
    processComponent(vnode, rootComtainer);
  }
}
// 处理元素节点
function processElement(vnode, rootComtainer) {
  // init
  mountElement(vnode, rootComtainer);
}
function mountElement(vnode, rootComtainer) {
  const { props, children } = vnode;
  const el = document.createElement(vnode.type);
  // 处理props
  for (const key in props) {
    let prop = props[key];
    el.setAttribute(key, prop);
  }
  // 处理children
  mountChildren(children, el);

  rootComtainer.appendChild(el);
}
function mountChildren(children, el) {
  // children不是数组
  if (Array.isArray(children)) {
    children.forEach((c) => {
      patch(c, el);
    });
  } else if (typeof children === 'string') {// children是数组
    el.textContent = children;
  }
}

// 处理组件
function processComponent(vnode, rootComtainer) {
  mountComponent(vnode, rootComtainer);
}
function mountComponent(vnode, rootComtainer) {
  const instance = createComponentInstance(vnode);
  setupComponent(instance);
  setupRenderEffetct(instance, rootComtainer);
}
function setupRenderEffetct(instance, rootComtainer) {
  const subTree = instance.render();
  // 递归分解
  patch(subTree, rootComtainer);
}

function createApp(rootComponent){
  return {
    mount(rootComtainer) {
      const vnode = createVNode(rootComponent);
      render(vnode, rootComtainer);
    },
  }
}

function h(type, props, children){
  return createVNode(type, props, children);
}

exports.createApp = createApp;
exports.h = h;
