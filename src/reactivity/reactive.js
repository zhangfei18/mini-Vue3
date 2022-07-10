import { mutableHandlers, readonlyHandlers, shallowReadonlyHandler } from './baseHandlers'
const REACTIVE_FLAGS = {
  IS_REACTIVE: '__v_isReactive',
  IS_READONLY: '__v_isReadonly'
}
// 将数据变成响应式的核心函数
function reactive(raw) {
  let proxyObj = new Proxy(raw, mutableHandlers);
  return proxyObj;
}
// 将数据变成只读
function readonly(raw) {
  return new Proxy(raw, readonlyHandlers);
}
// 将数据变成浅只读
function shallowReadonly(raw){
  return new Proxy(raw, shallowReadonlyHandler);
};

// 判断数据是否是响应式
function isReactive(value){
  return !!value[REACTIVE_FLAGS.IS_REACTIVE]
}
// 判断数据是否是只读
function isReadonly(value){
  return !!value[REACTIVE_FLAGS.IS_READONLY]
}
function isProxy(value){
  return isReactive(value) || isReadonly(value)
}
export { reactive, readonly, shallowReadonly, isReactive, isReadonly, isProxy };
