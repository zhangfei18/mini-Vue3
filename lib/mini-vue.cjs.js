'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const extend = Object.assign;
const isObject = (val) => {
  return val !== null && typeof val === 'object';
};
const hasChanged = function (value, newValue){
  return !Object.is(value, newValue);
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

const createAppApi = function (render) {
  return function createApp(rootComponent) {
    return {
      mount(rootComtainer) {
        const vnode = createVNode(rootComponent);
        render(vnode, rootComtainer, null);
      }
    }
  }
};

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

let activeEffectFn;
let effetStack = [];
// 把副作用函数从包含他们的依赖集合中删除
function cleanup(effectFn) {
  let deps = effectFn.deps;
  deps && deps.forEach((dep) => {
    dep.delete(effectFn);
  });
  effectFn.deps.length = 0;
}function effect(fn, options = {}) {
  let effectFn = () => {
    // 将该副作用函数在收集了其作为依赖的集合中剔除
    // 解决问题：解决分支切换带来的依赖收集了多余的副作用函数
    cleanup(effectFn);
    activeEffectFn = effectFn;
    // 解决问题：解决副作用函数的嵌套带来的问题
    effetStack.push(effectFn);
    // 执行副作用函数,触发新的依赖收集
    let ret = fn();
    // 执行完fn后将当前的副作用函数弹出
    effetStack.pop();
    // 更新activeEffectFn为栈中的最后一个
    activeEffectFn = effetStack[effetStack.length - 1];
    // 将fn函数执行结果返回
    return ret
  };
  // 为effectFn继承options参数
  extend(effectFn, options);
  // 存放收集了该副作用函数的依赖集合
  effectFn.deps = [];
  effectFn.active = true;
  // 如果参数中lazy为true(计算属性)则延迟执行副作用函数
  if (!options.lazy) {
    // 执行包装后的副作用函数
    effectFn();
  }
  // 返回副作用函数
  return effectFn;
}


let bucket = new WeakMap();
// 收集依赖
function track(target, key) {
  if (!activeEffectFn) return;
  let depsMap = bucket.get(target);
  if (!depsMap) {
    bucket.set(target, (depsMap = new Map()));
  }
  let deps = depsMap.get(key);
  if (!deps) {
    depsMap.set(key, (deps = new Set()));
  }
  trackEffects(deps);
}
// 抽离核心依赖收集代码
function trackEffects(deps) {
  if (activeEffectFn) {
    deps.add(activeEffectFn);
    activeEffectFn.deps.push(deps);
  }
}
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
    // readonly为只读对象, 不能设置set， 自然不需要触发依赖，当然也就不需要收集依赖
    !isReadonly && track(target, key);
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

class RefImpl{
  constructor(value, raw, key){
    // 提前将原本的数据保存起来, 否则后面value被reactive处理后就变成proxy后的
    // 数据了， 就不好作比较了
    this._rawValue = value;
    // 如果value是对象，需要将其变成相应式数据
    this._value = convert(value);
    this.deps = new Set();
    this._v_isRef = true;
    // 下面的两个属性供toRef方法使用
    this.raw = raw;
    this.key = key;
  }
  get value(){
    // 收集依赖
    trackEffects(this.deps);
    if(this.raw){
      return this.raw[this.key]
    }
    return this._value;
  }
  set value(newValue){
    if(hasChanged(this._rawValue, newValue)){
      this._rawValue = newValue;
      this._value = convert(newValue);
      toRefWithSetRawValue(this.raw, this.key, this._value);
      triggerEffects(this.deps);
    }
  }
}

function toRefWithSetRawValue(raw, key, value){
  if(raw){
    raw[key] = value;
  }
}
function convert(value){
  return isObject(value) ? reactive(value) : value;
}/**
 * 核心函数-主要用来让基本值类型变成响应式
 * */ 
function ref(raw){
  return new RefImpl(raw)
}
function isRef(ref){
  return !!ref._v_isRef
}
/**
 * 脱ref
 * @param {*} ref 
 * @returns 
 */
function unRef(ref){
  return isRef(ref) ? ref.value : ref;
}

/**
 * 该函数用来处理组合式API setup函数的返回值为对象时的时候
 * @param {*} objectWithRefs 
 * @returns 
 */
function proxyRefs(objectWithRefs){
  return new Proxy(objectWithRefs, {
    get(target, key){
      return unRef(Reflect.get(target, key))
    },
    set(target, key, value){
      if(isRef(Reflect.get(target, key)) && isRef(value)){
        return target[key].value = value;
      }else {
        return Reflect.set(target, key, value);
      }
    }
  })
}/**
 * 该函数用来将一个对象的属性值变为ref
 * */ 
function toRef(target, key){
  return new RefImpl(target[key], target, key);
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
    isMounted: false,
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
    instance.setupState = proxyRefs(setupResult);
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

const createRenderer = function (options) {
  const { createElement, hostPatchProps, insert } = options;
  function render(vnode, rootComtainer, parentComponent) {
    // TODO有vnode表示挂载或者更新， 无vnode表示销毁
    if (vnode) {
      patch(null, vnode, rootComtainer, parentComponent);
    }
  }
  function patch(n1, n2, rootComtainer, parentComponent) {
    if(!n1){
      const { shapeFlag, type } = n2;
      let equal = Fragment === type;
      console.log(equal);
  
      switch (type) {
        case Fragment:
          processFragment(n1, n2, rootComtainer, parentComponent);
          break;
        case TextNode: {
          processTextNode(n1, n2, rootComtainer);
          break
        }
        default:
          if (shapeFlag & ShapeFlags.ELEMENT) {
            processElement(n1, n2, rootComtainer, parentComponent);
          } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
            processComponent(n1, n2, rootComtainer, parentComponent);
          }
          break;
      }
    }else {
      patchElement(n1, n2);
    }
  }
  function patchElement(n1, n2, rootComtainer){
    console.log('patchElement', n1, n2);
    let oldProps = n1.props || {};
    let newProps = n2.props || {};
    // 下一次n2就是老的了, 所以需要给n2也挂载上el
    let el = n2.el = n1.el;
    patchProps(oldProps, newProps, el);
  }
  function patchProps(oldProps, newProps, el){
    for (const key in newProps) {
      if (Object.hasOwnProperty.call(newProps, key)) {
        const prevProp = oldProps[key];
        const nextProp = newProps[key];
        if(prevProp !== nextProp){
          // 修改了prop
          hostPatchProps(el, key, prevProp, nextProp);
        }
      }
    }
    for (const key in oldProps) {
      if (Object.hasOwnProperty.call(oldProps, key)) {
        if(!(key in newProps)){
          hostPatchProps(el, key, oldProps[key], null);
        }
      }
    }
  }
  function processTextNode(n1, n2, rootComtainer) {
    const { children } = n2;
    let text = document.createTextNode(children);
    rootComtainer.appendChild(text);
  }


  function processFragment(n1, n2, rootComtainer, parentComponent) {
    mountChildren(n2.children, rootComtainer, parentComponent);
  }
  // 处理元素节点
  function processElement(n1, n2, rootComtainer, parentComponent) {
    // init
    mountElement(n1, n2, rootComtainer, parentComponent);
  }
  function mountElement(n1, n2, rootComtainer, parentComponent) {
    const { props, children, shapeFlag } = n2;
    const el = n2.el = createElement(n2.type);
    // 处理props
    for (const key in props) {
      let val = props[key];
      hostPatchProps(el, key, null, val);
    }
    // 处理children
    if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(children, el, parentComponent);
    } else if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children;
    }
    insert(el, rootComtainer);
  }
  function mountChildren(children, el, parentComponent) {
    children.forEach((c) => {
      patch(null, c, el, parentComponent);
    });
  }

  // 处理组件
  function processComponent(n1, n2, rootComtainer, parentComponent) {
    mountComponent(n1, n2, rootComtainer, parentComponent);
  }
  function mountComponent(n1, n2, rootComtainer, parentComponent) {
    const instance = createComponentInstance(n2, rootComtainer, parentComponent);
    setupComponent(instance);
    setupRenderEffect(instance, rootComtainer);
  }
  function setupRenderEffect(instance, rootComtainer) {
    effect(() => {
      if(!instance.isMounted){
        console.log('init');
        // 执行render函数&改变其this
        const subTree = instance.prevSubTree = instance.render.call(instance.renderContext);
        // 递归处理
        patch(null, subTree, rootComtainer, instance);
        instance.vnode.el = subTree.el;
        instance.isMounted = true;
      }else {
        const subTree = instance.render.call(instance.renderContext);
        const prevSubTree = instance.prevSubTree;
        instance.prevSubTree = subTree;
        console.log('update-subTree', subTree);
        console.log('update-prevSubTree', prevSubTree);
        patch(prevSubTree, subTree, rootComtainer, instance);
      }
    });
  }

  return {
    createApp: createAppApi(render)
  }
};

const createElement = function (type) {
  return document.createElement(type)
};
// 判断是否是事件
const isOn = (key) => /^on[A-Z]/.test(key);
const hostPatchProps = function (el, key, preVal, nextVal) {
  console.log('hostPatchProps', preVal, nextVal);
  if (isOn(key)) {
    const eventName = key.slice(2).toLowerCase();
    el.addEventListener(eventName, nextVal);
  } else {
    if(nextVal === undefined || nextVal === null){
      el.removeAttribute(key);
    }else {
      el.setAttribute(key, nextVal);
    }
  }
};
const insert = function (el, parent) {
  parent.appendChild(el);
};

let renderer = createRenderer({ createElement, hostPatchProps, insert });

const createApp = function (...args) {
  return renderer.createApp(...args);
};

exports.Fragment = Fragment;
exports.TextNode = TextNode;
exports.createApp = createApp;
exports.createAppApi = createAppApi;
exports.createComponentInstance = createComponentInstance;
exports.createRenderer = createRenderer;
exports.createTextNode = createTextNode;
exports.createVNode = createVNode;
exports.getCurrentInstance = getCurrentInstance;
exports.h = h;
exports.inject = inject;
exports.isRef = isRef;
exports.provide = provide;
exports.proxyRefs = proxyRefs;
exports.ref = ref;
exports.renderSlots = renderSlots;
exports.setupComponent = setupComponent;
exports.toRef = toRef;
exports.unRef = unRef;
