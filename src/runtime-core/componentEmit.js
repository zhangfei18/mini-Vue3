
export const emit = function(instance, event, ...params){
  const { props } = instance;
  console.log(event, props)
  // TODO event名字优化
  function capitalize(event){
    return event.charAt(0).toUpperCase() + event.slice(1)
  }
  const toHandlerKey = function(event){
    return 'on' + capitalize(event)
  }
  
  const handlerFn = props[toHandlerKey(event)]
  handlerFn(...params)
  // TODO可以传递参数
}