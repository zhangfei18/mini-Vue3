
const publicPropertiesMap = {
  '$el': (instance) => instance.vnode.el
}

export const PublicInstanceProxyHandlers = {
  get({ _: instance }, key) {
    const { setupState, vnode } = instance;
    if (key in setupState) {
      return setupState[key]
    }
    let publicGetter = publicPropertiesMap[key]
    if (publicGetter) {
      return publicGetter(instance)
    }
  }
}