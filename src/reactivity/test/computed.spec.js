import { effect } from '../effect';
import { computed } from '../computed';
import { reactive } from '../reactive';

describe("计算属性依赖的effect函数更新", () => {
  it("懒执行", () => {
    let dummy;
    let effectFn = effect(() => {
      dummy = 1;
    }, {
      lazy: true
    });
    expect(dummy).toBeUndefined();
    effectFn()
    expect(dummy).toBe(1);
  })
});

describe("计算属性", () => {
  it("happy path", () => {
    let originObj = { foo: 1, bar: 2 };
    let proxyObj = reactive(originObj);
    let sum = computed(function(){
      return proxyObj.foo + proxyObj.bar;
    });
    expect(sum.value).toBe(3);
  })
  it("缓存", () => {
    let dummy = 0;
    let originObj = { foo: 1, bar: 2 };
    let proxyObj = reactive(originObj);
    let sum = computed(function(){
      dummy++;
      return proxyObj.foo + proxyObj.bar;
    });
    expect(dummy).toBe(0);
    expect(sum.value).toBe(3);
    expect(dummy).toBe(1);
    expect(sum.value).toBe(3);
    expect(dummy).toBe(1);
  })
  it("既要缓存也要响应式", () => {
    let dummy = 0;
    let originObj = { foo: 1, bar: 2 };
    let proxyObj = reactive(originObj);
    let sum = computed(function(){
      dummy++;
      return proxyObj.foo + proxyObj.bar;
    });
    expect(dummy).toBe(0);
    expect(sum.value).toBe(3);
    expect(dummy).toBe(1);
    expect(sum.value).toBe(3);
    expect(dummy).toBe(1);
    proxyObj.foo = 2;
    expect(sum.value).toBe(4);
  })
  it("在另一个effect函数中读取计算属性值时", () => {
    let dummy = 0;
    let originObj = { foo: 1, bar: 2 };
    let proxyObj = reactive(originObj);
    let sum = computed(function(){
      dummy++;
      return proxyObj.foo + proxyObj.bar;
    });
    effect(() => {
      dummy = sum.value;
    });
    expect(dummy).toBe(3);
    proxyObj.foo++;
    expect(dummy).toBe(4);
  })
});