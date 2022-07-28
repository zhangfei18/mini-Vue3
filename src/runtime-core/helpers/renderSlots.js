import { createVNode, Fragment } from "../vnode.js"

export const renderSlots = function(slots, name, props){
  const slot = slots[name]
  console.log(slot, 'slot')
  if(slot){
    if(typeof slot === 'function'){
      return createVNode(Fragment, {}, slot(props));
    }
    return createVNode(Fragment, {}, slot);
  }
}