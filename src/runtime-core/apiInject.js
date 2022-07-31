import { getCurrentInstance } from "./component";
/**
 * 解决问题：
 * 1.实现两个API provide inject
 * 2.解决如何在嵌套多层的组件中使用上层provide存的数据
 * 3.解决 在一个组件中修改和上面组件存的同名provide key之后， 子不会影响其他使用上面组件provide存的这个同名key
 * */ 
export const provide = function(key, value){
  // 存
  let instance = getCurrentInstance()
  if(instance){
    let { provides } = instance;
    let parentProvides = instance.parent.provides;
    if(provides === parentProvides){
      provides = instance.provides = Object.create(parentProvides)
    }
    provides[key] = value;
  }
};
export const inject = function(key){
  // 取
  let instance = getCurrentInstance()
  if(instance){
    let { provides } = instance
    // const parentProvides = parent.provides;
    return provides[key]
  }
};