'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const extend = Object.assign;
const isObject = (val) => {
  return val !== null && typeof val === 'object';
};

const hasOwn = function(target, key){
  return Object.prototype.hasOwnProperty.call(target, key);
};

const ShapeFlags = {
  ELEMENT: 1, // 0001
  STATEFUL_COMPONENT: 1 << 1, // 0010
  TEXT_CHILDREN: 1 << 2, // 0100
  ARRAY_CHILDREN: 1 << 3, // 1000
  SLOT_CHILDREN: 1 << 4 
};

const Fragment = Symbol('Fragment');
const TextNode = Symbol('TextNode');
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
  if(vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT){
    if(isObject(vnode.children)){
      vnode.shapeFlag |= ShapeFlags.SLOT_CHILDREN;
    }
  }
  return vnode;
}

function getShapeFlag(type) {
  if(typeof type === 'string'){
    return ShapeFlags.ELEMENT
  }else {
    return ShapeFlags.STATEFUL_COMPONENT;
  }
}


const createTextNode = function(text){
  return createVNode(TextNode, {}, text)
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
  // event名字优化
  // get-name => getName
  function camelize(event){
    return event.replace(/-(\w)/g, (_, e)=> {
      return e ? e.toUpperCase() : '';
    });
  }  // add => Add
  function capitalize(event){
    let cEvent = camelize(event);
    return cEvent.charAt(0).toUpperCase() + cEvent.slice(1)
  }  // Add => onAdd
  function toHandlerKey(event){
    return event ? 'on' + capitalize(event) : ''
  }  const handlerName = toHandlerKey(event);
  const handlerFn = props[handlerName];
  handlerFn && handlerFn(...params);
};

function initProps(instance, rawProps){
  // 
  instance.props = rawProps || {};
}

const publicPropertiesMap = {
  '$el': (instance) => instance.vnode.el,
  '$slots': (instance) => instance.slots
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

const initSlots = function(instance, children){
  const { vnode } = instance;
  if(vnode.shapeFlag & ShapeFlags.SLOT_CHILDREN){
    const slots = {};
    for (const key in children) {
      if (Object.hasOwnProperty.call(children, key)) {
        const value = children[key];
        slots[key] = (props) =>  normallizeSlotValue(value(props));
      }
    }
    instance.slots = slots;
  }
};

function normallizeSlotValue(value){
  return Array.isArray(value) ? value : [value]
}

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

function createComponentInstance(vnode, rootComtainer, parent) {
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
  instance.emit = emit.bind(null, instance);
  return instance;
}function setupComponent(instance) {
  // 初始化props
  initProps(instance, instance.vnode.props);
  // 初始化slots
  initSlots(instance, instance.vnode.children);
  setupStatefulComponent(instance);
}

function setupStatefulComponent(instance) {
  const component = instance.vnode.type;
  instance.renderContext = new Proxy({_: instance}, PublicInstanceProxyHandlers);
  const { setup } = component;
  if (setup) {
    setCurrentInstance(instance);
    // 执行setup函数
    const setupResult = setup(shallowReadonly(instance.props), { emit: instance.emit });
    handleSetupResult(instance, setupResult);
    setCurrentInstance(null);
  }
}
function handleSetupResult(instance, setupResult) {
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
let currentInstance = null;
const getCurrentInstance = function(){
  return currentInstance;
};

function setCurrentInstance(instance){
  currentInstance = instance;
}

function render(vnode, rootComtainer, parentComponent) {
  // TODO有vnode表示挂载或者更新， 无vnode表示销毁
  if (vnode) {
    patch(vnode, rootComtainer, parentComponent);
  }
}
function patch(vnode, rootComtainer, parentComponent) {
  const { shapeFlag, type } = vnode;
  let equal = Fragment === type;
  console.log(equal);
  
  switch (type) {
    case Fragment:
      processFragment(vnode, rootComtainer, parentComponent);
      break;
    case TextNode: {
      processTextNode(vnode, rootComtainer);
      break
    }
    default:
      if (shapeFlag & ShapeFlags.ELEMENT) {
        processElement(vnode, rootComtainer, parentComponent);
      } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        processComponent(vnode, rootComtainer, parentComponent);
      }
      break;
  }
}
function processTextNode(vnode, rootComtainer){
  const { children } = vnode;
  console.log(children);
  let text  = document.createTextNode(children);
  rootComtainer.appendChild(text);
}


function processFragment(vnode, rootComtainer, parentComponent){
  mountChildren(vnode.children, rootComtainer, parentComponent);
}
// 处理元素节点
function processElement(vnode, rootComtainer, parentComponent) {
  // init
  mountElement(vnode, rootComtainer, parentComponent);
}
function mountElement(vnode, rootComtainer, parentComponent) {
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
    mountChildren(children, el, parentComponent);
  } else if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = children;
  }
  rootComtainer.appendChild(el);
}
function mountChildren(children, el, parentComponent) {
  children.forEach((c) => {
    patch(c, el, parentComponent);
  });
}

// 处理组件
function processComponent(vnode, rootComtainer, parentComponent) {
  mountComponent(vnode, rootComtainer, parentComponent);
}
function mountComponent(vnode, rootComtainer, parentComponent) {
  const instance = createComponentInstance(vnode, rootComtainer, parentComponent);
  setupComponent(instance);
  setupRenderEffect(instance, rootComtainer);
}
function setupRenderEffect(instance, rootComtainer) {
  // 执行render函数&改变其this
  const subTree = instance.render.call(instance.renderContext);
  // 递归处理
  patch(subTree, rootComtainer, instance);
  instance.vnode.el = subTree.el;
}

function createApp(rootComponent){
  return {
    mount(rootComtainer) {
      const vnode = createVNode(rootComponent);
      render(vnode, rootComtainer, null);
    }
  }
}

function h(type, props, children){
  return createVNode(type, props, children);
}

const renderSlots = function(slots, name, props){
  const slot = slots[name];
  console.log(slot, 'slot');
  if(slot){
    if(typeof slot === 'function'){
      return createVNode(Fragment, {}, slot(props));
    }
    return createVNode(Fragment, {}, slot);
  }
};

/**
 * 解决问题：
 * 1.实现两个API provide inject
 * 2.解决如何在嵌套多层的组件中使用上层provide存的数据
 * 3.解决 在一个组件中修改和上面组件存的同名provide key之后， 子不会影响其他使用上面组件provide存的这个同名key
 * */ 
const provide = function(key, value){
  // 存
  let instance = getCurrentInstance();
  if(instance){
    let { provides } = instance;
    let parentProvides = instance.parent.provides;
    if(provides === parentProvides){
      provides = instance.provides = Object.create(parentProvides);
    }
    provides[key] = value;
  }
};
const inject = function(key){
  // 取
  let instance = getCurrentInstance();
  if(instance){
    let { provides } = instance;
    // const parentProvides = parent.provides;
    return provides[key]
  }
};

exports.Fragment = Fragment;
exports.TextNode = TextNode;
exports.createApp = createApp;
exports.createComponentInstance = createComponentInstance;
exports.createTextNode = createTextNode;
exports.createVNode = createVNode;
exports.getCurrentInstance = getCurrentInstance;
exports.h = h;
exports.inject = inject;
exports.provide = provide;
exports.renderSlots = renderSlots;
exports.setupComponent = setupComponent;
