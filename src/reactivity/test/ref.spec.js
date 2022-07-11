import { ref, isRef, unRef, proxyRefs, toRef } from '../ref';
import { effect } from '../effect';
import { reactive } from '../reactive'
describe("ref", () => {
  it('happy path', () => {
    const a = ref(1);
    expect(a.value).toBe(1);
  });
  it('should be reactive', () => {
    const a = ref(1);
    let dummy;
    let calls = 0;
    effect(() => {
      calls++;
      dummy = a.value;
    })
    expect(calls).toBe(1);
    expect(dummy).toBe(1);
    // 响应式
    a.value = 2
    expect(calls).toBe(2);
    expect(dummy).toBe(2);
    // 相同的值不更新
    a.value = 2
    expect(calls).toBe(2);
    expect(dummy).toBe(2);
  });
  it("should make nested peoperties reactive", () => {
    const a = ref({
      count: 1
    });
    let dummy;
    effect(() => {
      dummy = a.value.count
    })
    expect(dummy).toBe(1);
    a.value.count = 2
    expect(dummy).toBe(2);
  });
  it("isRef", () => {
    const a = ref(1)
    expect(isRef(a)).toBe(true);
    expect(isRef(1)).toBe(false);
  });
  it("unRef", () => {
    const a = ref(1)
    const user = ref({
      age: 11
    })
    expect(unRef(a)).toBe(1);
    expect(unRef(user).age).toBe(11);
  });
  it("proxyRefs", () => {
    function setup(props, context) {
      const readersNumber = ref(0)
      const book = reactive({ title: 'Vue 3 Guide' })
      return {
        readersNumber,
        book
      }
    }
    let setupRet = proxyRefs(setup());
    expect(setupRet.readersNumber).toBe(0);
    expect(setupRet.book.title).toBe('Vue 3 Guide');

  });
  it("toRef", () => {
    const state = reactive({
      foo: 1,
      bar: 2
    })
    
    const fooRef = toRef(state, 'foo')
    
    fooRef.value++
    expect(state.foo).toBe(2);
    
    state.foo++
    expect(fooRef.value).toBe(3)
  });
});