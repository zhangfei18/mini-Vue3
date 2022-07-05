import { effect, track, trigger } from './effect';
function computed(getter) {
  let value;
  let dirty = true;
  let effectFn = effect(getter, {
    lazy: true,
    scheduler: function () {
      if (!dirty) {
        dirty = true;
        trigger(obj, 'value');
      }
    }
  });
  const obj = {
    get value() {
      if (dirty) {
        dirty = false;
        value = effectFn();
      }
      track(obj, 'value')
      return value;
    }
  };
  return obj;
};
export {
  computed
}