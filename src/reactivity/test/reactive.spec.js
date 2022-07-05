import { reactive } from '../reactive'

describe('reactive', () => {
  it('happy path', () => {
    let originObj = {
      age: 11
    };
    const proxyObj = reactive(originObj);
    expect(proxyObj).not.toBe(originObj);
    expect(proxyObj.age).toBe(11);
  })
});