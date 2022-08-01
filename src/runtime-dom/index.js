import { createRenderer } from '../runtime-core/index'
const createElement = function (type) {
  return document.createElement(type)
}
// 判断是否是事件
const isOn = (key) => /^on[A-Z]/.test(key);
const patchProps = function (el, key, val) {
  if (isOn(key)) {
    const eventName = key.slice(2).toLowerCase();
    el.addEventListener(eventName, val);
  } else {
    el.setAttribute(key, val);
  }
}
const insert = function (el, parent) {
  parent.appendChild(el)
}

let renderer = createRenderer({ createElement, patchProps, insert })

export const createApp = function (...args) {
  return renderer.createApp(...args);
}

export * from '../runtime-core/index'