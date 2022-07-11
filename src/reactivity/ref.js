import { trackEffects, triggerEffects } from './effect';
import { reactive } from './reactive'
import { hasChanged, isObject } from '../shared/index';
class RefImpl{
  constructor(value, raw, key){
    // 提前将原本的数据保存起来, 否则后面value被reactive处理后就变成proxy后的
    // 数据了， 就不好作比较了
    this._rawValue = value;
    // 如果value是对象，需要将其变成相应式数据
    this._value = convert(value);
    this.deps = new Set();
    this._v_isRef = true;
    // 下面的两个属性供toRef方法使用
    this.raw = raw;
    this.key = key;
  }
  get value(){
    // 收集依赖
    trackEffects(this.deps)
    if(this.raw){
      return this.raw[this.key]
    }
    return this._value;
  }
  set value(newValue){
    if(hasChanged(this._rawValue, newValue)){
      this._rawValue = newValue;
      this._value = convert(newValue);
      toRefWithSetRawValue(this.raw, this.key, this._value);
      triggerEffects(this.deps);
    }
  }
}

function toRefWithSetRawValue(raw, key, value){
  if(raw){
    raw[key] = value;
  }
}
function convert(value){
  return isObject(value) ? reactive(value) : value;
};
/**
 * 核心函数-主要用来让基本值类型变成响应式
 * */ 
function ref(raw){
  return new RefImpl(raw)
};

function isRef(ref){
  return !!ref._v_isRef
}
/**
 * 脱ref
 * @param {*} ref 
 * @returns 
 */
function unRef(ref){
  return isRef(ref) ? ref.value : ref;
}

/**
 * 该函数用来处理组合式API setup函数的返回值为对象时的时候
 * @param {*} objectWithRefs 
 * @returns 
 */
function proxyRefs(objectWithRefs){
  return new Proxy(objectWithRefs, {
    get(target, key){
      return unRef(Reflect.get(target, key))
    },
    set(target, key, value){
      if(isRef(Reflect.get(target, key)) && isRef(value)){
        return target[key].value = value;
      }else{
        return Reflect.set(target, key, value);
      }
    }
  })
};
/**
 * 该函数用来将一个对象的属性值变为ref
 * */ 
function toRef(target, key){
  return new RefImpl(target[key], target, key);
};

export { ref, isRef, unRef, proxyRefs, toRef };