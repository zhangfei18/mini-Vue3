import { ShapeFlags } from "../shared/ShapeFlags";

export function createVNode(type, props, children) {
  const vnode = {
    type,
    props: props || {},
    children,
    el: null,
    shapeFlag: getShapeFlag(type)
  }
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