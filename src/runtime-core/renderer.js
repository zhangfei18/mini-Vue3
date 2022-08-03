import { effect } from '../reactivity/effect.js';
import { ShapeFlags } from '../shared/ShapeFlags.js';
import { createComponentInstance, setupComponent } from './component.js';
import { createAppApi } from './createApp.js';
import { Fragment, TextNode } from './vnode.js';



export const createRenderer = function (options) {
  const { createElement, hostPatchProps, insert } = options;
  function render(vnode, rootComtainer, parentComponent) {
    // TODO有vnode表示挂载或者更新， 无vnode表示销毁
    if (vnode) {
      patch(null, vnode, rootComtainer, parentComponent);
    } else {
      // TODO
    }
  }
  function patch(n1, n2, rootComtainer, parentComponent) {
    if(!n1){
      const { shapeFlag, type } = n2
      let equal = Fragment === type
      console.log(equal)
  
      switch (type) {
        case Fragment:
          processFragment(n1, n2, rootComtainer, parentComponent)
          break;
        case TextNode: {
          processTextNode(n1, n2, rootComtainer)
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
    }else{
      patchElement(n1, n2, rootComtainer)
    }
  }
  function patchElement(n1, n2, rootComtainer){
    console.log('patchElement', n1, n2);
    let oldProps = n1.props || {};
    let newProps = n2.props || {};
    // 下一次n2就是老的了, 所以需要给n2也挂载上el
    let el = n2.el = n1.el
    patchProps(oldProps, newProps, el)
  }
  function patchProps(oldProps, newProps, el){
    for (const key in newProps) {
      if (Object.hasOwnProperty.call(newProps, key)) {
        const prevProp = oldProps[key];
        const nextProp = newProps[key];
        if(prevProp !== nextProp){
          // 修改了prop
          hostPatchProps(el, key, prevProp, nextProp)
        }
      }
    }
    for (const key in oldProps) {
      if (Object.hasOwnProperty.call(oldProps, key)) {
        if(!(key in newProps)){
          hostPatchProps(el, key, oldProps[key], null)
        }
      }
    }
  }
  function processTextNode(n1, n2, rootComtainer) {
    const { children } = n2
    let text = document.createTextNode(children);
    rootComtainer.appendChild(text)
  }


  function processFragment(n1, n2, rootComtainer, parentComponent) {
    mountChildren(n2.children, rootComtainer, parentComponent)
  }
  // 处理元素节点
  function processElement(n1, n2, rootComtainer, parentComponent) {
    // init
    mountElement(n1, n2, rootComtainer, parentComponent);
  };

  function mountElement(n1, n2, rootComtainer, parentComponent) {
    const { props, children, shapeFlag } = n2;
    const el = n2.el = createElement(n2.type);
    // 处理props
    for (const key in props) {
      let val = props[key]
      hostPatchProps(el, key, null, val)
    }
    // 处理children
    if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(children, el, parentComponent)
    } else if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children;
    }
    insert(el, rootComtainer)
  }
  function mountChildren(children, el, parentComponent) {
    children.forEach((c) => {
      patch(null, c, el, parentComponent)
    })
  }

  // 处理组件
  function processComponent(n1, n2, rootComtainer, parentComponent) {
    mountComponent(n1, n2, rootComtainer, parentComponent)
  }
  function mountComponent(n1, n2, rootComtainer, parentComponent) {
    const instance = createComponentInstance(n2, rootComtainer, parentComponent);
    setupComponent(instance);
    setupRenderEffect(instance, rootComtainer);
  }
  function setupRenderEffect(instance, rootComtainer) {
    effect(() => {
      if(!instance.isMounted){
        console.log('init')
        // 执行render函数&改变其this
        const subTree = instance.prevSubTree = instance.render.call(instance.renderContext)
        // 递归处理
        patch(null, subTree, rootComtainer, instance);
        instance.vnode.el = subTree.el
        instance.isMounted = true;
      }else{
        const subTree = instance.render.call(instance.renderContext)
        const prevSubTree = instance.prevSubTree
        instance.prevSubTree = subTree
        console.log('update-subTree', subTree)
        console.log('update-prevSubTree', prevSubTree)
        patch(prevSubTree, subTree, rootComtainer, instance);
      }
    })
  }

  return {
    createApp: createAppApi(render)
  }
}
