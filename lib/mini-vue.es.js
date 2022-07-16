function createVNode(type, props, children){
  const vnode = {
    type,
    props,
    children
  };
  return vnode;
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
  instance.proxy = new Proxy({_: instance}, PublicInstanceProxyHandlers);
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
  const el = vnode.el = document.createElement(vnode.type);
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
  setupRenderEffect(instance, rootComtainer);
}
function setupRenderEffect(instance, rootComtainer) {
  // 执行render函数&改变其this
  const subTree = instance.render.call(instance.proxy);
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

export { createApp, h };
