import { effect } from '../reactivity/effect.js';
import { ShapeFlags } from '../shared/ShapeFlags.js';
import { createComponentInstance, setupComponent } from './component.js';
import { createAppApi } from './createApp.js';
import { Fragment, TextNode } from './vnode.js';



export const createRenderer = function (options) {
  const { createElement, patchProps: hostPatchProps, insert, unmountChildren, setElementText } = options;
  function render(vnode, rootComtainer, parentComponent) {
    // TODO有vnode表示挂载或者更新， 无vnode表示销毁
    if (vnode) {
      patch(null, vnode, rootComtainer, parentComponent);
    } else {
      // TODO
    }
  }
  function patch(n1, n2, rootComtainer, parentComponent, author) {
    if (!n1) {
      const { shapeFlag, type } = n2
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
            processElement(n1, n2, rootComtainer, parentComponent, author);
          } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
            processComponent(n1, n2, rootComtainer, parentComponent);
          }
          break;
      }
    } else {
      patchElement(n1, n2, rootComtainer, parentComponent)
    }
  }
  function patchElement(n1, n2, rootComtainer, parentComponent) {
    console.log('patchElement', n1, n2);
    let oldProps = n1.props || {};
    let newProps = n2.props || {};
    // 下一次n2就是老的了, 所以需要给n2也挂载上el
    let el = n2.el = n1.el
    patchChildren(n1, n2, el, parentComponent);
    patchProps(oldProps, newProps, el);
  }
  function patchChildren(n1, n2, el, parentComponent) {
    console.log(n1, n2)
    const prevShapeFlag = n1.shapeFlag;
    const nextShapeFlag = n2.shapeFlag;
    if (nextShapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 老的孩子是数组 新的孩子是文本
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 先卸载
        unmountChildren(n1.children);
        // 再重写
        setElementText(el, n2.children)
      } else if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        // 再重写
        setElementText(el, n2.children)
      }
    } else {
      // 老的是文本 新的是数组
      if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        setElementText(el, '')
        mountChildren(n2.children, el, parentComponent)
      } else if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 老的是数组 新的也是数组
        patchKeyedChildren(n1.children, n2.children, el, parentComponent);
      }
    }
  }
  function patchKeyedChildren(c1, c2, container, parentComponent) {
    let i = 0;
    let e1 = c1.length - 1;
    let e2 = c2.length - 1;
    // 从左侧开始新旧相同
    while (i <= e1 && i <= e2) {
      let n1 = c1[i]
      let n2 = c2[i]
      if (isSameVnode(n1, n2)) {
        // 继续比对
        patch(n1, n2, container, parentComponent)
      }else{
        break
      }
      i++
    }
    // 从右侧开始新旧相同
    while(e1 >=0 && e2 >= 0){
      let n1 = c1[e1]
      let n2 = c2[e2]
      if (isSameVnode(n1, n2)) {
        patch(n1, n2, container, parentComponent)
      }else{
        break
      }
      e1--;
      e2--;
    }
    if(i > e1 && i <= e2){
      // case:
      // AB -> ABCD
      // BA -> FDCBA
      let author = (i + 1 < c2.length) ? c2[e2+1].el : null;
      while( i <= e2){
        patch(null, c2[i], container, parentComponent, author)
        i++
      }
    }else if(i > e2 && i <= e1){
      // case:
      // ABCD -> AB
      // FDCBA -> BA
      while( i <= e1){
        unmountChildren(c1[i].el)
        i++
      }
    }else{
      // 中间对比
      let s1 = i;
      let s2 = i;
      let toBePatched = e2 - s2 + 1;
      let patched = 0;
      // 将新的孩子生成映射表
      let keyToNewindexMap = new Map();
      for(let i = s2; i <= e2; i++){
        const newChild = c2[i];
        keyToNewindexMap.set(newChild.key, i);
      }
      for(let i = s1; i <= e1; i++){
        // 如果新的孩子已经全部比对完了， 但是老的孩子还有剩余，那老的孩子就该被直接删除了
        if(patched > toBePatched){
          unmountChildren(prevChild.el);
        }
        let prevChild = c1[i];
        let newIndex;
        if(prevChild.key != null){
          newIndex = keyToNewindexMap.get(prevChild.key);
        }else{
          for(let j = s2; j <= e2; j++){
            if(isSameVnode(prevChild, c2[j])){
              newIndex = j;
              break;
            }
          }
        }
        if(newIndex === undefined){
          // 说明在新的孩子中没有找到该旧孩子，则删除旧孩子
          unmountChildren(prevChild.el);
        }else{
          patch(prevChild, c2[newIndex], container, parentComponent);
          patched++;
        }
      }
    }

    function isSameVnode(n1, n2) {
      return (n1.type === n2.type) && (n1.key === n2.key);
    }
  }
  function patchProps(oldProps, newProps, el) {
    for (const key in newProps) {
      if (Object.hasOwnProperty.call(newProps, key)) {
        const prevProp = oldProps[key];
        const nextProp = newProps[key];
        if (prevProp !== nextProp) {
          // 修改了prop
          hostPatchProps(el, key, prevProp, nextProp)
        }
      }
    }
    for (const key in oldProps) {
      if (Object.hasOwnProperty.call(oldProps, key)) {
        if (!(key in newProps)) {
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
  function processElement(n1, n2, rootComtainer, parentComponent, author) {
    // init
    mountElement(n1, n2, rootComtainer, parentComponent, author);
  };

  function mountElement(n1, n2, rootComtainer, parentComponent, author) {
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
    insert(el, rootComtainer, author)
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
      if (!instance.isMounted) {
        console.log('init', instance.type.name)
        // 执行render函数&改变其this
        const subTree = instance.prevSubTree = instance.render.call(instance.renderContext)
        // 递归处理
        patch(null, subTree, rootComtainer, instance);
        instance.vnode.el = subTree.el
        instance.isMounted = true;
      } else {
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
