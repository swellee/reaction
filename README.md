# reaction
modulized redux store management framework, based on react-redux

## features
  - modulized state/store management
  - inject module-state's props to components easily(no more 'connect' call)
  - native async action process
  - merged redux's action and reducer to make things atomization
  - simple apis

## useage
  - first of all, declare a [moduleStore](###ModuleStore)
  - then, optionally, you can call [regStore](##apis) manually or not
  - then, inject moduleStore's props into React.Component class by adding a decorator [mapProp](#apis) before the component-class's declaration. PS: when you use the [mapProp](#apis) decorator, the metioned moduleStore will be reg automaticly if it has not been registered.
  and if you are using ES5, you can call ```mapProp(moduleStore, ...props)(YourComponentClass)``` instead
  - during the runtime, please call [doAction](#apis) if you want to change the relative moduleStore's some props
  - please see the completed example via the repository of this project https://github.com/swellee/reaction

## apis
  - ```regStore``` register a moduleStore manually, if you call this method twice using a same moduleName, the early registered
  moduleStore will be replaced by the last one you given.
  given the fact that the ```mapProp``` can automatically register a moduleStore only once, you are not recommend to call this method manually!
  - ```mapProp``` this is a ES6+ (or typescript) decorator, you can use this to inject moduleStore's props to a Component by adding the decorator before the component-class's declaration. this method will register the given moduleStore automatically if it has not been registered.
  - ```doAction``` you need call this method if you want to modify some props of the specific moduleStore.
  - ```plusAction``` this method is allowed only inside an moduleAction's process function, and used to insert another moduleAction closely after the current action's process finished.
  - ```doFunction``` a sugar to call some method after the current action queue. \* pls notice: actions will be executed one by one in queue. so if you code: 
  ```typescript
    doAction(actionA);
    doAction(actionB);
    doAction(actionC);
    doFunction(functionD);
  ```
  + the functionD will execute when the actionC's process finished!

## interfaces
  - ```KV``` sth key-value (alias for Object)
    + ```typescript
      interface KV {
        [k: string]: any
      }
  - ```ModuleStore``` the modulized store:
    + ```typescript
      interface ModuleStore extends KV {
        module: string;
      }
  - ```ModuleAction``` an action is a processor to deal with some datas an make the changes to the specific module.
    + ```typescript
      interface ModuleAction<PAYLOAD_TYPE = any, MODULE_STORE = ModuleStore, PROCEED_RESULT = KV> {
        module: string;
        name?: string;
        maxProcessSeconds?: number;
        process?: (payload: PAYLOAD_TYPE, moduleStore: MODULE_STORE) => Promise<PROCEED_RESULT>;
      }
      
  