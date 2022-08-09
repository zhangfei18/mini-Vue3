import { createRenderer } from '../runtime-core/index'
const createElement = function (type) {
  return document.createElement(type)
}
// 判断是否是事件
const isOn = (key) => /^on[A-Z]/.test(key);
const patchProps = function (el, key, preVal, nextVal) {
  console.log('hostPatchProps', preVal, nextVal);
  if (isOn(key)) {
    const eventName = key.slice(2).toLowerCase();
    el.addEventListener(eventName, nextVal);
  } else {
    if (nextVal === undefined || nextVal === null) {
      el.removeAttribute(key);
    } else {
      el.setAttribute(key, nextVal);
    }
  }
}
const insert = function (el, parent, author) {
  // parent.appendChild(el)
  parent.insertBefore(el, author || null)
}

const unmountChildren = function (childs) {
  if (Array.isArray(childs)) {
    for (let index = 0; index < childs.length; index++) {
      const child = childs[index].el;
      let parent = child.parentNode;
      if (parent) {
        parent.removeChild(child)
      }
    }
  } else {
    let parent = childs.parentNode;
    if (parent) {
      parent.removeChild(childs)
    }
  }
}

const setElementText = function (el, child) {
  el && (el.textContent = child);
}
let renderer = createRenderer({ createElement, patchProps, insert, unmountChildren, setElementText })

export const createApp = function (...args) {
  return renderer.createApp(...args);
}

export * from '../runtime-core/index'