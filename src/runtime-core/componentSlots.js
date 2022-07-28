import { ShapeFlags } from "../shared/ShapeFlags";

export const initSlots = function(instance, children){
  const { vnode } = instance;
  if(vnode.shapeFlag & ShapeFlags.SLOT_CHILDREN){
    const slots = {}
    for (const key in children) {
      if (Object.hasOwnProperty.call(children, key)) {
        const value = children[key];
        slots[key] = (props) =>  normallizeSlotValue(value(props))
      }
    }
    instance.slots = slots;
  }
};

function normallizeSlotValue(value){
  return Array.isArray(value) ? value : [value]
}