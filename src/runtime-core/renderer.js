import { ShapeFlags } from '../shared/ShapeFlags.js';
import { createComponentInstance, setupComponent } from './component.js';
import { Fragment, TextNode } from './vnode.js';


export function render(vnode, rootComtainer, parentComponent) {
  // TODO有vnode表示挂载或者更新， 无vnode表示销毁
  if (vnode) {
    patch(vnode, rootComtainer, parentComponent);
  } else {
    // TODO
  }
}
function patch(vnode, rootComtainer, parentComponent) {
  const { shapeFlag, type } = vnode
  let equal = Fragment === type
  console.log(equal)
  
  switch (type) {
    case Fragment:
      processFragment(vnode, rootComtainer, parentComponent)
      break;
    case TextNode: {
      processTextNode(vnode, rootComtainer)
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
  const { children } = vnode
  console.log(children)
  let text  = document.createTextNode(children);
  rootComtainer.appendChild(text)
}


function processFragment(vnode, rootComtainer, parentComponent){
  mountChildren(vnode.children, rootComtainer, parentComponent)
}
// 处理元素节点
function processElement(vnode, rootComtainer, parentComponent) {
  // init
  mountElement(vnode, rootComtainer, parentComponent);
};

function mountElement(vnode, rootComtainer, parentComponent) {
  const { props, children, shapeFlag } = vnode;
  const el = vnode.el = document.createElement(vnode.type);
  // 处理props
  // 判断是否是事件
  const isOn = (key) => /^on[A-Z]/.test(key);
  for (const key in props) {
    let prop = props[key]
    if (isOn(key)) {
      const eventName = key.slice(2).toLowerCase();
      el.addEventListener(eventName, prop);
    } else {
      el.setAttribute(key, prop);
    }
  }
  // 处理children
  if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    mountChildren(children, el, parentComponent)
  } else if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = children;
  }
  rootComtainer.appendChild(el)
}
function mountChildren(children, el, parentComponent) {
  children.forEach((c) => {
    patch(c, el, parentComponent)
  })
}

// 处理组件
function processComponent(vnode, rootComtainer, parentComponent) {
  mountComponent(vnode, rootComtainer, parentComponent)
}
function mountComponent(vnode, rootComtainer, parentComponent) {
  const instance = createComponentInstance(vnode, rootComtainer, parentComponent);
  setupComponent(instance);
  setupRenderEffect(instance, rootComtainer);
}
function setupRenderEffect(instance, rootComtainer) {
  // 执行render函数&改变其this
  const subTree = instance.render.call(instance.renderContext)
  // 递归处理
  patch(subTree, rootComtainer, instance);
  instance.vnode.el = subTree.el
}