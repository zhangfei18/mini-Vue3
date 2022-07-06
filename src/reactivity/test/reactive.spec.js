import { reactive, isReactive } from '../reactive'

describe('reactive', () => {
  it('happy path', () => {
    let originObj = {
      age: 11,
      info: {
        name: 'zf'
      }
    };
    const proxyObj = reactive(originObj);
    expect(proxyObj).not.toBe(originObj);
    expect(proxyObj.age).toBe(11);
    expect(isReactive(proxyObj)).toBe(true);
    expect(isReactive(proxyObj.info)).toBe(true);
  })
});