import { hasOwn } from "../shared/index.js";

const publicPropertiesMap = {
  '$el': (instance) => instance.vnode.el,
  '$slots': (instance) => instance.slots
}

export const PublicInstanceProxyHandlers = {
  get({ _: instance }, key) {
    const { setupState, props } = instance;
    if (hasOwn(setupState, key)) {
      return setupState[key]
    }
    if(hasOwn(props, key)){
      return props[key]
    }
    let publicGetter = publicPropertiesMap[key]
    if (publicGetter) {
      return publicGetter(instance)
    }
  }
}