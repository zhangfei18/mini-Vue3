import { track, trigger } from './effect'
import { reactive, readonly } from './reactive'
import { isObject, extend } from '../shared/index'
// 只有在初始化该文件的时候才会执行createGetter一次(缓存)
const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)
const shallowReadonlyGet = createGetter(true, true)

function createGetter(isReadonly = false, shallow = false) {
  return function (target, key) {
    if(key === '__v_isReactive'){
      return !isReadonly;
    }else if(key === '__v_isReadonly'){
      return isReadonly;
    }
    let res = Reflect.get(target, key);
    // 如果是浅对象则不同深度代理, 只代理最外面一层即可
    if(shallow){
      return res
    }
    // 如果是嵌套对象则深度代理
    if(isObject(res)){
      // 继续递归处理
      res = isReadonly ? readonly(res) : reactive(res);
    }
    // readonly为只读对象, 不能设置set， 自然不需要触发依赖，当然也就不需要收集依赖
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
export const readonlyHandlers = {
  get: readonlyGet,
  set(target, key) {
    console.warn(`key:${key}, 不能被赋值, ${target}`);
    return true;
  }
}
export const shallowReadonlyHandler = extend({}, readonlyHandlers, {
  get: shallowReadonlyGet
});