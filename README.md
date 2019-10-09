# reaction
modulized redux store management framework, based on react-redux

## features
  - modulized state/store management
  - inject module-state's props to components easily(no more 'connect' call)
  - native async action process
  - merged redux's action and reducer to make things atomization
  - simple apis

## useage
  - first of all, declare a moduleStore
  - then, optionally, you can call 'regStore' manually or not
  - then, inject moduleStore's props into React.Component class by adding a decorator 'mapProp' before the component-class's declaration. PS: when you use the 'mapProp' decorator, the metioned moduleStore will be reg automaticly if it has not been registered
  - during the runtime, please call 'doAction' if you want to change the relative moduleStore's some props
  - please see the completed example via the repository of this project https://github.com/swellee/reaction

## apis
  - ```regStore``` register a moduleStore manually, if you call this method twice using a same moduleName, the early registered
  moduleStore will be replaced by the last one you given.
  given the fact that the ```mapProp``` can automatically register a moduleStore only once, you are not recommend to call this method manually!
  - ```mapProp``` this is a ES6+ (or typescript) decorator, you can use this to inject moduleStore's props to a Component by adding the decorator before the component-class's declaration. 
  