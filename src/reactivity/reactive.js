import { mutableHandlers, readonlyHandlers, shallowReadonlyHandler } from './baseHandlers'
const REACTIVE_FLAGS = {
  IS_REACTIVE: '__v_isReactive',
  IS_READONLY: '__v_isReadonly'
}
function reactive(raw) {
  let proxyObj = new Proxy(raw, mutableHandlers);
  return proxyObj;
}
function readonly(raw) {
  return new Proxy(raw, readonlyHandlers);
}
function shallowReadonly(raw){
  return new Proxy(raw, shallowReadonlyHandler);
};
function isReactive(value){
  return !!value[REACTIVE_FLAGS.IS_REACTIVE]
}
function isReadonly(value){
  return !!value[REACTIVE_FLAGS.IS_READONLY]
}
export { reactive, readonly, isReactive, isReadonly, shallowReadonly };
