import { readonly } from '../reactive'
describe("readonly", () => {
  it("happly path", () => {
    const original = { foo: 1, bar: { baz: 2 } }
    const wrapped = readonly(original);
    expect(wrapped).not.toBe(original);
    expect(wrapped.foo).toBe(1);
  });
  it("wran then call set", () => {
    console.warn = jest.fn();
    const original = { foo: 1, bar: { baz: 2 } }
    const wrapped = readonly(original);
    wrapped.foo = 2;
    expect(console.warn).toBeCalled();
  });
});