'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const ShapeFlags = {
  ELEMENT: 1, // 0001
  STATEFUL_COMPONENT: 1 << 1, // 0010
  TEXT_CHILDREN: 1 << 2, // 0100
  ARRAY_CHILDREN: 1 << 3 // 1000
};

function createVNode(type, props, children) {
  const vnode = {
    type,
    props,
    children,
    el: null,
    shapeFlag: getShapeFlag(type)
  };
  if (typeof children === 'string') {
    vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN; // 0001 | 0100=> 0101
  } else if (Array.isArray(children)) {
    vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN; // 0001 | 1000=> 1001
  }
  return vnode;
}

function getShapeFlag(type) {
  return typeof type === 'string' ? ShapeFlags.ELEMENT : ShapeFlags.STATEFUL_COMPONENT;
}

const publicPropertiesMap = {
  '$el': (instance) => instance.vnode.el
};

const PublicInstanceProxyHandlers = {
  get({ _: instance }, key) {
    const { setupState, vnode } = instance;
    if (key in setupState) {
      return setupState[key]
    }
    let publicGetter = publicPropertiesMap[key];
    if (publicGetter) {
      return publicGetter(instance)
    }
  }
};

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
  instance.renderContext = new Proxy({_: instance}, PublicInstanceProxyHandlers);
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
  const { shapeFlag } = vnode;
  if (shapeFlag & ShapeFlags.ELEMENT) {
    processElement(vnode, rootComtainer);
  } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    processComponent(vnode, rootComtainer);
  }
}
// 处理元素节点
function processElement(vnode, rootComtainer) {
  // init
  mountElement(vnode, rootComtainer);
}
function mountElement(vnode, rootComtainer) {
  const { props, children, shapeFlag } = vnode;
  const el = vnode.el = document.createElement(vnode.type);
  // 处理props
  for (const key in props) {
    let prop = props[key];
    el.setAttribute(key, prop);
  }
  // 处理children
  if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    mountChildren(children, el);
  } else if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = children;
  }

  rootComtainer.appendChild(el);
}
function mountChildren(children, el) {
  children.forEach((c) => {
    patch(c, el);
  });
}

// 处理组件
function processComponent(vnode, rootComtainer) {
  mountComponent(vnode, rootComtainer);
}
function mountComponent(vnode, rootComtainer) {
  const instance = createComponentInstance(vnode);
  setupComponent(instance);
  setupRenderEffect(instance, rootComtainer);
}
function setupRenderEffect(instance, rootComtainer) {
  // 执行render函数&改变其this
  const subTree = instance.render.call(instance.renderContext);
  // 递归处理
  patch(subTree, rootComtainer);
  instance.vnode.el = subTree.el;
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
