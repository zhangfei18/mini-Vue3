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
};

function mountElement(vnode, rootComtainer) {
  const { props, children } = vnode;
  const el = vnode.el = document.createElement(vnode.type);
  // 处理props
  for (const key in props) {
    let prop = props[key]
    el.setAttribute(key, prop);
  }
  // 处理children
  mountChildren(children, el)

  rootComtainer.appendChild(el)
}
function mountChildren(children, el) {
  // children不是数组
  if (Array.isArray(children)) {
    children.forEach((c) => {
      patch(c, el)
    })
  } else if (typeof children === 'string') {// children是数组
    el.textContent = children;
  }
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
  const subTree = instance.render.call(instance.proxy)
  // 递归处理
  patch(subTree, rootComtainer);
  instance.vnode.el = subTree.el
}