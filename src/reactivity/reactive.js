import { mutableHandlers, readHandlers } from './baseHandlers'
function reactive(raw) {
  let proxyObj = new Proxy(raw, mutableHandlers);
  return proxyObj;
}
function readonly(target) {
  return new Proxy(target, readHandlers);
}
export { reactive, readonly };
