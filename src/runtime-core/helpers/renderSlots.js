import { createVNode } from "../vnode.js"

export const renderSlots = function(slots, name, props){
  const slot = slots[name]
  if(slot){
    if(typeof slot === 'function'){
      return createVNode('div', {}, slot(props));
    }
    return createVNode('div', {}, slot);
  }
}