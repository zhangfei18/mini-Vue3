import { ShapeFlags } from '../shared/ShapeFlags';
import { createComponentInstance, setupComponent } from './component';


export function render(vnode, rootComtainer) {
  // TODO有vnode表示挂载或者更新， 无vnode表示销毁
  if (vnode) {
    patch(vnode, rootComtainer);
  } else {
    // TODO
  }
}
function patch(vnode, rootComtainer) {
  const { shapeFlag } = vnode
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
};

function mountElement(vnode, rootComtainer) {
  const { props, children, shapeFlag } = vnode;
  const el = vnode.el = document.createElement(vnode.type);
  // 处理props
  for (const key in props) {
    let prop = props[key]
    el.setAttribute(key, prop);
  }
  // 处理children
  if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    mountChildren(children, el)
  } else if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = children;
  }

  rootComtainer.appendChild(el)
}
function mountChildren(children, el) {
  children.forEach((c) => {
    patch(c, el)
  })
}

// 处理组件
function processComponent(vnode, rootComtainer) {
  mountComponent(vnode, rootComtainer)
}
function mountComponent(vnode, rootComtainer) {
  const instance = createComponentInstance(vnode, rootComtainer);
  setupComponent(instance);
  setupRenderEffect(instance, rootComtainer);
}
function setupRenderEffect(instance, rootComtainer) {
  // 执行render函数&改变其this
  const subTree = instance.render.call(instance.renderContext)
  // 递归处理
  patch(subTree, rootComtainer);
  instance.vnode.el = subTree.el
}