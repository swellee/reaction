# module-reaction
modulized redux store management framework, based on react-redux

## features
  - modulized state/store management
  - inject module-state's props to components easily(no more 'connect' call)
  - native async action process
  - merged redux's action and reducer to make things atomization
  - simple apis

## useage
  - first of all, import the ```Provider``` from 'module-reaction', and use it as the wrapper of you root Component, like this:
    + ```typescript
      import { Provider } from 'module-reaction';

      ReactDOM.render(<Provider><App /></Provider>, document.getElementById('root'));

  - go focus on your business , in large app project, we usually divide the whole application into businesses, so each business has its own model, it's a good rule that you should only modify the data of the business you belongs to, we call this 'modulize'. once you decided your modules, you can implemnts you ideas one by one or assign these modules to other guys. now let's imagine you hvae a module to go, let's begin the work with 'module-reaction' like this:
  - declare a [moduleStore](###ModuleStore) to store your business-module's data, like this:
    + ```typescript
      export const MODULE_A = 'module_a';
      export const mStoreA: ModuleStore = {
        module: MODULE_A,
        size: '2*2',
        count: 10,
        price: 9.9,
        infos: {
            madeIn: 'China',
            saleTo: 'anywhere'
        }
      }
  - optionally, you can call [regStore](##apis) manually or not
  - then, inject moduleStore's props into React.Component class by adding a decorator [mapProp](#apis) before the component-class's declaration. PS: when you use the [mapProp](#apis) decorator, the mentioned moduleStore will be reg automatically if it has not been registered.
  and if you are using ES5, you can call ```mapProp(moduleStore, ...props)(YourComponentClass)``` instead, here is an example:
    + ```typescript
      @mapProp(mStoreA, 'size', 'price', 'count', 'infos')
      export class PageA extends React.Component<KV, {}> {
        render() {
          return (
            <div>
            {this.props.size},
            {this.props.price * this.props.count},
            {this.props.infos.madeIn}
            </div>
          )
        }
    + and if you have called 'regStore' manually in other place:
    + ```typescript
      regStore(mStoreA);
    + then you can give the moduleName insdead of the moduleStore when use the 'mapProp' decorator, like this:
    + ```typescript
      @mapProp(MODULE_A, 'size', 'price', 'count', 'infos')
      export class PageA extends React.Component<KV, {}> {
        ...
      }
    + there's a sugar, if you want to inject all of the props of one moduleStore, you can code like this:
    + ```typescript
      @mapProp(MODULE_A)//or @mapProp(mStoreA)
      export class PageA extends React.Component<KV, {}> {
        ...
      }
    + if you want to inject more than one moduleStore to a Compoent, just:
    + ```typescript
      @mapProp(MODULE_A)
      @mapProp(MODULE_B, 'propxxx', 'p', 'sth')
      @mapProp(mStoreC, 'sss', 'sd', 'sth:sth2')
      export class PageA extends React.Component<KV, {}> {
        ...
      }
    + and have you noticed that there's a ```sth:sth2``` above? sometimes, the prop's name of different moduleStore maybe the same, eg: both mStoreB and mStoreC has a prop named 'sth', when injected those two into one Component, you can use a ```:``` gamar to rename the injected prop. so, the above code will inject a 'sth2' prop to PageA and refers to 'mStoreC.sth'
  - during the runtime, please call [doAction](#apis) if you want to change the relative moduleStore's some props. for example, when click a button, change the 'count'. usually, you need to declare a moduleAction to do this, here we go:
    + ```typescript
      export const increaseCountAction: MoudleAction = {
        module: MODULE_A,
        process: async (payload: KV, moduleState: ModuleStore) => {
          let count = moduleState.count;
          count++;
          return {count};
        }
      }
    + ```typescript
      ...
      <button onClick={this.increaseCnt}></button>
      ...
      ...
      private increaseCnt = e => {
        doAction(increaseCountAction);
      }
    + you may have noticed that the 'increaseCountAction' process is very simple, it just return a KV which contains the props to be modified~ 
    exactly, there's a sugar for these simple situation, if you won't do sth complicated in one moduleAction's process function, you are recommend to call the doAction method directly like this:
    + ```typescript
      doAction(MODULE_A, {count: this.props.count+1});
    + in other words, if you pass a moduleName and a KV payload to the doAction method, the framework will merge the payload to the moduleStore of the specific moduleName. in fact, you only need to declare a moduleAction when you have to do sth complicate or fetch server datas, .etc
  - please see the completed example via the repository of this project https://github.com/swellee/reaction

## apis
  - ```regStore``` register a moduleStore manually, if you call this method twice using a same moduleName, the early registered
  moduleStore will be replaced by the last one you given.
  given the fact that the ```mapProp``` can automatically register a moduleStore only once, you are not recommend to call this method manually!
  - ```mapProp``` this is a ES6+ (or typescript) decorator, you can use this to inject moduleStore's props to a Component by adding the decorator before the component-class's declaration. this method will register the given moduleStore automatically if it has not been registered.
  - ```doAction``` you need call this method if you want to modify some props of the specific moduleStore.
  - ```plusAction``` this method is allowed only inside an moduleAction's process function, and used to insert another moduleAction closely after the current action's process finished.
  - ```doFunction``` a sugar to call some method after the current action queue. \* pls notice: actions will be executed one by one in queue. so if you code: 
    + ```typescript
      doAction(actionA);
      doAction(actionB);
      doAction(actionC);
      doFunction(functionD);
    + the functionD will execute when the actionC's process finished!
  - ```Provider``` the Provider wrapped with react-redux's Provider
  - ```reaction``` a const object holding some default config
  - ```getGlobalState``` return the snapshot of the current redux' store
  - ```getModuleState``` return the snapshot of the current redux-store's some module
  - ```getModuleProp``` return the snapshot of the current redux-store's some module's some prop
  - ```enableDevtools``` enable the [Redux DevTools](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd) extention of chrome

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
## tips
  - there're much more comments in the source code [file](https://github.com/swellee/reaction/blob/master/src/reaction.tsx)
  - there're several means of usage examples in the source code [project](https://github.com/swellee/reaction)
  - also, there's a flutter-implements project [here](https://github.com/swellee/flutter_reaction)
  