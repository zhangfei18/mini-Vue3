import { isObject } from "../shared/index.js";
import { ShapeFlags } from "../shared/ShapeFlags.js";
export const Fragment = Symbol('Fragment');
export const TextNode = Symbol('TextNode');
export function createVNode(type, props, children) {
  const vnode = {
    type,
    props: props || {},
    slots: {},
    children,
    el: null,
    shapeFlag: getShapeFlag(type)
  }
  if (typeof children === 'string') {
    vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN; // 0001 | 0100=> 0101
  } else if (Array.isArray(children)) {
    vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN; // 0001 | 1000=> 1001
  }
  if(vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT){
    if(isObject(vnode.children)){
      vnode.shapeFlag |= ShapeFlags.SLOT_CHILDREN
    }
  }
  return vnode;
}

function getShapeFlag(type) {
  if(typeof type === 'string'){
    return ShapeFlags.ELEMENT
  }else{
    return ShapeFlags.STATEFUL_COMPONENT;
  }
}


export const createTextNode = function(text){
  return createVNode(TextNode, {}, text)
};