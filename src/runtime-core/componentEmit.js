
export const emit = function(instance, event, ...params){
  const { props } = instance;
  console.log(event, props);
  // event名字优化
  // get-name => getName
  function camelize(event){
    return event.replace(/-(\w)/g, (_, e)=> {
      return e ? e.toUpperCase() : '';
    });
  };
  // add => Add
  function capitalize(event){
    let cEvent = camelize(event)
    return cEvent.charAt(0).toUpperCase() + cEvent.slice(1)
  };
  // Add => onAdd
  function toHandlerKey(event){
    return event ? 'on' + capitalize(event) : ''
  };
  const handlerName = toHandlerKey(event)
  const handlerFn = props[handlerName]
  handlerFn && handlerFn(...params)
}