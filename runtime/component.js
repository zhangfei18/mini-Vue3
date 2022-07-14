
export function createComponentInstance(vnode, rootComtanier) {
  const instance = {
    vnode
  };
  return instance;
};
export function setupComponent(instance) {
  // 初始化props
  // 初始化slots
  setupStatefulComponent(instance)
}
function setupStatefulComponent(instance) {
  const component = instance.vnode.type
  const { setup } = component;
  if (setup) {
    const setupResult = setup();
    handleSetupResult(instance, setupResult)
  }
};
function handleSetupResult(instance, setupResult) {
  if (typeof setupResult === 'object') {
    instance.setupState = setupResult
  }
  finishComponentSetup(instance)
}
function finishComponentSetup(instance) {
  const component = instance.vnode.type;
  if (!instance.render) {
    instance.render = component.render;
  }
}