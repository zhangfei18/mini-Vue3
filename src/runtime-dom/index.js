import { createRenderer } from '../runtime-core/index'
const createElement = function (type) {
  return document.createElement(type)
}
// 判断是否是事件
const isOn = (key) => /^on[A-Z]/.test(key);
const hostPatchProps = function (el, key, preVal, nextVal) {
  console.log('hostPatchProps', preVal, nextVal);
  if (isOn(key)) {
    const eventName = key.slice(2).toLowerCase();
    el.addEventListener(eventName, nextVal);
  } else {
    if(nextVal === undefined || nextVal === null){
      el.removeAttribute(key);
    }else{
      el.setAttribute(key, nextVal);
    }
  }
}
const insert = function (el, parent) {
  parent.appendChild(el)
}

let renderer = createRenderer({ createElement, hostPatchProps, insert })

export const createApp = function (...args) {
  return renderer.createApp(...args);
}

export * from '../runtime-core/index'