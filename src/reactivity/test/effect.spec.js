// 副作用函数的测试用例
import { reactive } from '../reactive';
import { effect, stop } from '../effect';
describe('effect', () => {
  // 核心功能
  it('happy path', () => {
    const user = reactive({
      age: 10
    });
    let nextAge;
    effect(() => {
      nextAge = user.age + 1
    });
    expect(nextAge).toBe(11);
    // 更新
    user.age++;
    expect(nextAge).toBe(12);
  });
  // 副作用函数支持返回值
  it('should return a runner when call effect', () => {
    let foo = 10;
    let runner = effect(() => {
      foo++;
      return 'foo';
    });
    expect(foo).toBe(11);
    let ret = runner();
    expect(foo).toBe(12);
    expect(ret).toBe('foo');
  });
  it("测试分支切换问题", () => {
    let dummy;
    let flag = 'not'
    let originObj = { ok: true, text: 'hello effect' };
    let proxyObj = reactive(originObj);
    effect(function () {
      dummy = proxyObj.ok ? proxyObj.text : flag
    });
    expect(dummy).toBe('hello effect');
    proxyObj.ok = false;// 触发一次副作用函数
    flag = 'not1';
    proxyObj.text = 'hello effect2';// 此次不会触发副作用函数执行
    expect(dummy).toBe('not');
  });
  it("测试effect函数嵌套问题", () => {
    let temp1, temp2;
    let originObj = { foo: 1 };
    let proxyObj = reactive(originObj);
    effect(() => {
      effect(() => {
        temp2 = proxyObj.foo;
      })
      temp1 = proxyObj.foo;
    })
    expect(temp1).toBe(1)
    expect(temp2).toBe(1)
    proxyObj.foo++;
    expect(temp1).toBe(2)
    expect(temp2).toBe(2)
  })
  it("测试无限递归", () => {
    let originObj = { foo: 1 };
    let proxyObj = reactive(originObj);
    effect(() => {
      proxyObj.foo++;
      // proxyObj.foo = proxyObj.foo + 1;
    });
    expect(proxyObj.foo).toBe(2)
  })
  // 支持调度执行
  it("支持用户调度执行, 由用户决定什么时候触发副作用函数", () => {
    let dummy;
    let run;
    let scheduler = jest.fn(() => {
      run = runner
    });
    let obj = reactive({ foo: 1 });
    let runner = effect(() => {
      dummy = obj.foo;
    }, {
      scheduler: scheduler
    });
    expect(dummy).toBe(1);
    expect(scheduler).not.toHaveBeenCalled();
    obj.foo++;
    expect(scheduler).toHaveBeenCalledTimes(1);
    expect(dummy).toBe(1);
    run();
    expect(dummy).toBe(2);
  });
  it("实现stop功能", () => {
    let dummy;
    let obj = reactive({ prop: 1 });
    let runner = effect(() => {
      dummy = obj.prop;
    });
    effect(() => {
      console.log('我是滴滴');
    });
    obj.prop = 2;
    expect(dummy).toBe(2);
    stop(runner);
    // obj.prop = 3
    obj.prop++;
    expect(obj.prop).toBe(3)
    // 不会触发副作用函数执行
    expect(dummy).toBe(2)
  });
  it("onStop", () => {
    let obj = reactive({
      foo: 1
    });
    let onStop = jest.fn();
    let dummy
    let runner = effect(() => {
      dummy = obj.foo;
    }, {
      onStop
    })
    stop(runner)
    expect(onStop).toBeCalledTimes(1)
  })
});