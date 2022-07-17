import { extend } from "../shared/index.js";

let activeEffectFn;
let effetStack = [];
// 把副作用函数从包含他们的依赖集合中删除
function cleanup(effectFn) {
  let deps = effectFn.deps;
  deps && deps.forEach((dep) => {
    dep.delete(effectFn);
  });
  effectFn.deps.length = 0;
};
function effect(fn, options = {}) {
  let effectFn = () => {
    // 将该副作用函数在收集了其作为依赖的集合中剔除
    // 解决问题：解决分支切换带来的依赖收集了多余的副作用函数
    cleanup(effectFn);
    activeEffectFn = effectFn;
    // 解决问题：解决副作用函数的嵌套带来的问题
    effetStack.push(effectFn);
    // 执行副作用函数,触发新的依赖收集
    let ret = fn();
    // 执行完fn后将当前的副作用函数弹出
    effetStack.pop()
    // 更新activeEffectFn为栈中的最后一个
    activeEffectFn = effetStack[effetStack.length - 1]
    // 将fn函数执行结果返回
    return ret
  };
  // 为effectFn继承options参数
  extend(effectFn, options)
  // 存放收集了该副作用函数的依赖集合
  effectFn.deps = [];
  effectFn.active = true;
  // 如果参数中lazy为true(计算属性)则延迟执行副作用函数
  if (!options.lazy) {
    // 执行包装后的副作用函数
    effectFn();
  }
  // 返回副作用函数
  return effectFn;
}


let bucket = new WeakMap();
// 收集依赖
function track(target, key) {
  if (!activeEffectFn) return;
  let depsMap = bucket.get(target);
  if (!depsMap) {
    bucket.set(target, (depsMap = new Map()));
  }
  let deps = depsMap.get(key);
  if (!deps) {
    depsMap.set(key, (deps = new Set()));
  }
  trackEffects(deps);
}
// 抽离核心依赖收集代码
function trackEffects(deps) {
  if (activeEffectFn) {
    deps.add(activeEffectFn);
    activeEffectFn.deps.push(deps);
  }
}
// 触发提前收集的副作用函数
function trigger(target, key) {
  // 获取key与deps的映射表
  let depsMap = bucket.get(target);
  if (!depsMap) return;
  // 获取某个key的deps
  let effects = depsMap.get(key);
  if (!effects) return;
  triggerEffects(effects);
}
function triggerEffects(effects) {
  // 申请一个新的set来存储后面要执行的副作用函数
  let effectsToRun = new Set();
  effects.forEach((effectFn) => {
    // 如果effectFn不是当前激活的副作用函数activeEffectFn，才会在接下来执行
    // 解决问题：用来解决无限递归循环调用一个副作用函数
    if (effectFn !== activeEffectFn) {
      effectsToRun.add(effectFn)
    }
  });
  // trigger副作用函数执行
  effectsToRun.forEach((effectFn) => {
    if (effectFn.scheduler) {
      effectFn.scheduler(effectFn);
    } else {
      effectFn()
    }
  })
};
// 调用了stop函数后, 再出发响应式数据的set后不会触发副作用函数的执行
function stop(effectFn) {
  if (effectFn.active) {
    cleanup(effectFn)
    effectFn.active = false;
  }
  if (effectFn.onStop) {
    effectFn.onStop();
  }
}

export { effect, track, trigger, stop, trackEffects, triggerEffects };
