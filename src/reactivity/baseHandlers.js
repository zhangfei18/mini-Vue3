import { track, trigger } from './effect'

// 只有在初始化该文件的时候才会执行createGetter一次(缓存)
const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)

function createGetter(isReadonly = false) {
  return function (target, key) {
    const res = Reflect.get(target, key);
    !isReadonly && track(target, key);
    return res;
  }
}
function createSetter() {
  return function (target, key, newVal) {
    const res = Reflect.set(target, key, newVal);
    trigger(target, key)
    return res;
  }
}

export const mutableHandlers = {
  get,
  set
}
export const readHandlers = {
  get: readonlyGet,
  set(target, key) {
    console.warn(`key:${key}, 不能被赋值, ${target}`);
    return true;
  }
}