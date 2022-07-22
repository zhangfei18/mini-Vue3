const ShapeFlags = {
  ELEMENT: 1, // 0001
  STATEFUL_COMPONENT: 1 << 1, // 0010
  TEXT_CHILDREN: 1 << 2, // 0100
  ARRAY_CHILDREN: 1 << 3 // 1000
};

function createVNode(type, props, children) {
  const vnode = {
    type,
    props: props || {},
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

const extend = Object.assign;
const isObject = (val) => {
  return val !== null && typeof val === 'object';
};

const hasOwn = function(target, key){
  return Object.prototype.hasOwnProperty.call(target, key);
};

let activeEffectFn;


let bucket = new WeakMap();
// 触发提前收集的副作用函数
function trigger(target, key) {
  // 获取key与deps的映射表
  let depsMap = bucket.get(target);
  if (!depsMap) return;
  // 获取某个key的deps
  let effects = depsMap.get(key);
  if (!effects) return;
  triggerEffects(effects);
}
function triggerEffects(effects) {
  // 申请一个新的set来存储后面要执行的副作用函数
  let effectsToRun = new Set();
  effects.forEach((effectFn) => {
    // 如果effectFn不是当前激活的副作用函数activeEffectFn，才会在接下来执行
    // 解决问题：用来解决无限递归循环调用一个副作用函数
    if (effectFn !== activeEffectFn) {
      effectsToRun.add(effectFn);
    }
  });
  // trigger副作用函数执行
  effectsToRun.forEach((effectFn) => {
    if (effectFn.scheduler) {
      effectFn.scheduler(effectFn);
    } else {
      effectFn();
    }
  });
}

// 只有在初始化该文件的时候才会执行createGetter一次(缓存)
const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);

function createGetter(isReadonly = false, shallow = false) {
  return function (target, key) {
    if(key === '__v_isReactive'){
      return !isReadonly;
    }else if(key === '__v_isReadonly'){
      return isReadonly;
    }
    let res = Reflect.get(target, key);
    // 如果是浅对象则不同深度代理, 只代理最外面一层即可
    if(shallow){
      return res
    }
    // 如果是嵌套对象则深度代理
    if(isObject(res)){
      // 继续递归处理
      res = isReadonly ? readonly(res) : reactive(res);
    }
    return res;
  }
}
function createSetter() {
  return function (target, key, newVal) {
    const res = Reflect.set(target, key, newVal);
    trigger(target, key);
    return res;
  }
}

const mutableHandlers = {
  get,
  set
};
const readonlyHandlers = {
  get: readonlyGet,
  set(target, key) {
    console.warn(`key:${key}, 不能被赋值, ${target}`);
    return true;
  }
};
const shallowReadonlyHandler = extend({}, readonlyHandlers, {
  get: shallowReadonlyGet
});

// 将数据变成响应式的核心函数
function reactive(raw) {
  let proxyObj = new Proxy(raw, mutableHandlers);
  return proxyObj;
}
// 将数据变成只读
function readonly(raw) {
  return new Proxy(raw, readonlyHandlers);
}
// 将数据变成浅只读
function shallowReadonly(raw){
  return new Proxy(raw, shallowReadonlyHandler);
}

const emit = function(instance, event, ...params){
  const { props } = instance;
  console.log(event, props);
  // TODO event名字优化
  function capitalize(event){
    return event.charAt(0).toUpperCase() + event.slice(1)
  }
  const toHandlerKey = function(event){
    return 'on' + capitalize(event)
  };
  
  const handlerFn = props[toHandlerKey(event)];
  handlerFn(...params);
  // TODO可以传递参数
};

function initProps(instance, rawProps){
  // 
  instance.props = rawProps || {};
}

const publicPropertiesMap = {
  '$el': (instance) => instance.vnode.el
};

const PublicInstanceProxyHandlers = {
  get({ _: instance }, key) {
    const { setupState, props } = instance;
    if (hasOwn(setupState, key)) {
      return setupState[key]
    }
    if(hasOwn(props, key)){
      return props[key]
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
    vnode,
    emit(){}
  };
  instance.emit = emit.bind(null, instance);
  return instance;
}function setupComponent(instance) {
  // 初始化props
  initProps(instance, instance.vnode.props);
  // 初始化slots
  setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
  const component = instance.vnode.type;
  instance.renderContext = new Proxy({_: instance}, PublicInstanceProxyHandlers);
  const { setup } = component;
  if (setup) {
    const setupResult = setup(shallowReadonly(instance.props), { emit: instance.emit });
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
  }else {
    processTextContent(vnode, rootComtainer);
  }
}
function processTextContent(vnode, rootComtainer){
  rootComtainer.textContent = vnode;
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
  // 判断是否是事件
  const isOn = (key) => /^on[A-Z]/.test(key);
  for (const key in props) {
    let prop = props[key];
    if (isOn(key)) {
      const eventName = key.slice(2).toLowerCase();
      el.addEventListener(eventName, prop);
    } else {
      el.setAttribute(key, prop);
    }
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
    }
  }
}

function h(type, props, children){
  return createVNode(type, props, children);
}

export { createApp, h };
