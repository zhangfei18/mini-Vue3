export const initSlots = function(instance, children){
  const slots = {}
  for (const key in children) {
    if (Object.hasOwnProperty.call(children, key)) {
      const value = children[key];
      slots[key] = (props) =>  normallizeSlotValue(value(props))
    }
  }
  instance.slots = slots;
};

function normallizeSlotValue(value){
  return Array.isArray(value) ? value : [value]
}