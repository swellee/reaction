import { connect, Provider as RdProvider } from 'react-redux';
import { createStore, Store } from 'redux';

// defines -------------------------------------------------------------
export const MODULE_COMMON = 'reaction_module_common';

export interface KV {
    [k: string]: any
}
// tslint:disable-next-line:interface-name
export interface ModuleStore extends KV {
    module: string;
}

/**
 * 
 * 如果process里想拿到全局store或其他模块store,可调用：getGlobalState或getModuleState ！！！
 */
export interface ModuleAction<PAYLOAD_TYPE = any, MODULE_STORE = ModuleStore, PROCEED_RESULT = KV> {
    /** the relative module this action will modify */
    module: string;

    /** the action's name, by default will be 'moduleAction'*/
    name?: string;

    /** the business logic processor, normally, you can fetch apis, do something composed, etc.
     * when finished your logic, please return the data to modify via k-v like, actually, you can
     * only modify the specific moduleStore's props which you indicates by the 'module' property
     * eg. there's a moduleStore holding the user info: 
     *      const userStore: ModuleStore = {module:'user', username: '', level: 0};
     * then there's an action to fetch userInfo:
     *      const getUserInfoAction: ModuleAction = {
     *          module: 'user',
     *          process: async (payload: KV, moduleStore: any) => {
     *              const res = await someFetchMethod(payload.username, payload.password);
     *              // when got the user info by server, return infos you wanna modify
     *              return {username: res.username, level: res.level}
     *          }
     *      }
     * 
     * PS: in process function, you can call 'getGlobalState ro getModuleState or getModuleProp' to get
     * global/other module's store prop
     */
    process?: (payload: PAYLOAD_TYPE, moduleStore: MODULE_STORE) => Promise<PROCEED_RESULT>;
}

// tslint:disable-next-line:interface-name
// export interface ModuleActionGeneric<T, K> {
//     module: string;
//     name?: string;
//     process?: (payload: T, moduleStore: ModuleStore) => Promise<K>;
// }

/// ---------------------------------------------------------------------

// redux wrap------------------------------------------------------------
const js_meta_types = [
    'bigint',
    'boolean',
    'string',
    'number',
    'function',
    'symbol',
    'undefined'
]
const _initStore = {};
interface ReactionDb {
store: Store;
    showLoading: (loadingTag?: string) => void;
    hideLoading: (loadingTag?: string) => void;
}
const testLoadingFn = tag => console.log(`
got a loading tag: ${tag}, 
you'd better implements your own 'showLoading' and 'hideLoading' 
by set reaction.showLoading/hideLoading property`
);

export const reaction: ReactionDb = {
    store: Object.create({}),
    showLoading: testLoadingFn,
    hideLoading: testLoadingFn
};

const reducer = (state: any, act: any) => {
    if (act.module) {
        let copy = { ...state };
        // 按moduleStore处理
        const moduleStore = copy[act.module];
        if (moduleStore) {
            copy[act.module] = Object.assign(moduleStore, act.payload);
        } else if (act.payload) {
            // 非moduleStore的话，兼容原始的全局reducer方式
            copy = Object.assign(copy, act.payload);
        }
        return copy;

    }

    return state;
};

// tslint:disable-next-line:interface-name
interface ActionNode<P = KV> {
    action: ModuleAction;
    payload: P;
}

const actionQueue: ActionNode<any>[] = [];
/**
 * execute an action
 *  specially ,if the first param was given a moduleName string, meanwile the payload is k-v data, 
 * the freamework will simply merge the payload to the moduleStore of the moduleName
 * @param moduleAction action instance or moduleName
 * @param payload this data will be passed to action's process method，typically , it's a k-v data, eg: {a: 1, b: 'xx'}. if you give a simple metadata type (such as string, number, boolean...), the moduleAction must has a process method to deal with it
 * @param loading whether call showloading when execute this action
 */
export function doAction<P = KV>(
    moduleAction: ModuleAction | string,
    payload?: P,
    loadingTag: string | 'none' = 'none'
) {
    let mAction: ModuleAction = typeof moduleAction === 'string' ? 
    {module: moduleAction} : moduleAction;

    // rules: payload must be a KV type when there's no process function in given moduleAction
    if (!mAction.process && typeof payload in js_meta_types) {
        throw new Error(`
        payload must be a KV type when there's no process function in given moduleAction!
        when call 'doAction',
        the param 'payload' is promoted to be a KV type,
        if you really want to use js simple meta type data, you must declare a 'process' function in
        the ModuleAction to deal with the payload and return a KV data
        `)
    }

    let canStartAction = 1;
    const useLoading = loadingTag !== 'none';
    if (useLoading) {
        // insert showloading
        actionQueue.push({
            action: {
                name: `@@begin loading:${mAction.name}`,
                module: MODULE_COMMON,
                process: async () => {
                    // call showLoading
                    reaction.showLoading();
                    // set the loadingTag of common module
                    return {loadingTag};
                }
            },
            payload: undefined
        });
    }
    actionQueue.push({ action: mAction, payload });
    if (useLoading) {
        // insert hideloading
        actionQueue.push({
            action: {
                name: `@@end loading:${mAction.name}`,
                module: MODULE_COMMON,
                process: async () => {
                    // call hideLoading
                    reaction.hideLoading();
                    // reset the loadingTag of common module
                    return { loadingTag: 'none' };
                }
            },
            payload: undefined
        });
        canStartAction = 3;
    }

    if (actionQueue.length === canStartAction) {
        nextAction();
    }
}

export function doFunction(fn: () => Promise<any>, payload?: KV) {
    const action = {
        module: 'none',
        process: fn
    };
    doAction(action, payload);
}

async function nextAction() {
    if (!actionQueue.length) {
        return;
    }
    const { action, payload } = actionQueue[0];
    const globalState = reaction.store.getState();
    const moduleState = globalState[action.module];
    try {
        const data = payload; // moduleAction如果不提供process函数，就认为payload无需处理
        let processData;
        if (action.process) {
            processData = await action.process(payload, moduleState);
        }
        // 通过redux 的dispatch, 将处理过的数据，合并到moudleState
        reaction.store.dispatch({
            type: action.name || 'moduleAction',
            module: action.module,
            payload: processData || data
        });
    } catch (ex) {
        console.dir(ex);
    }

    actionQueue.shift();

    if (actionQueue.length > 0) {
        nextAction();
    }
}

/**
 * 组件装饰器，用于给组件类添加模块store-> local props的属性映射
 * 可以对一个组件注入多个模块store, 即： 可以依次mapProp(moduleA, 'a', 'b'); mapProp(moduleB, 'c','d');
 * 注入同一个模块store的属性时，应一次性注入如需的属性，不能分开多次注入。即：mapProp(moduleA, 'a','b') 不能拆成mapProp(moduleA, 'a'); mapProp(moduleA, 'b');
 * @param moduleName 模块名，便于在全局store里标识所属的业务模块
 * @param props 要映射的字段名，eg:'aa','bb',对应于全局store里的[moduleName.aa]\[moduleName.bb],
 * 当props为空的时候,返回module的所有属性: by yaozhao 2019/1/23
 * @argument props传的字符串如果包含冒号，则表示映射时moduleStore中的属性进行重命名，举例如下：
 * eg: 'modulePropA:uiPropB' 相当与对UI组件的props注入： {uiPropB: moduleStore.modulePropA}
 */
export function mapProp(moduleStore: ModuleStore, ...props: string[]): Function {
    const moduleName = moduleStore.module;
    // reg the moduleStore if it has not
    if (!_initStore.hasOwnProperty(moduleName)) {
        // make a copy when call regStore, so you may reset the moduleStore's prop to initial state by
        // simply doAction({module: 'xxModule'}, xxModuleStore)
        regStore({...moduleStore}); 
    }
    return function (target: any) {
        let mappedFlag: string = target.__mappedMd__ || '';
        if (mappedFlag && mappedFlag.includes(moduleName)) {
            return target;
        } else {
            mappedFlag += '_' + moduleName;
            target.__mappedMd__ = mappedFlag;

            return connect(state => {
                let st = {};
                if (props.length > 0) {
                    const mdStore = state[moduleName];
                    props.forEach(key => {
                        if (mdStore) {
                            let uiKey, mdKey;
                                if (key.includes(':')) {
                                const kv = key.split(':');
                                uiKey = kv[0];
                                mdKey = kv[1];
                            } else {
                                uiKey = mdKey = key;
                            }
                            st[uiKey] = mdStore[mdKey];
                        } else {
                            throw new Error('please inject module-store to global by call regStore() first of all.');
                        }
                    });
                } else {
                    const mdStore = state[moduleName];
                    st = { ...mdStore };
                }
                return st;
            })(target);
        }

    };
}

export function regStore(moduleStore: ModuleStore) {
    const mdNm = moduleStore.module;
    // delete moduleStore.module;
    _initStore[mdNm] = moduleStore;
    Object.assign(reaction.store, createStore(reducer, _initStore));
}

export function enableDevtools() {
    let enhancer;
    const win: KV = window;
    if (win.__REDUX_DEVTOOLS_EXTENSION__) {
        enhancer = win.__REDUX_DEVTOOLS_EXTENSION__();
    }
    Object.assign(reaction.store, createStore(reducer, _initStore, enhancer));
}

// return the global store's snapshot state
export function getGlobalState() {
    return reaction.store.getState();
}

// return the specific moduleStore's snapshot state
export function getModuleState<T>(moduleName: string): T | any {
    return getGlobalState()[moduleName] as T;
}

// return the specific moduleStore's prop by name
export function getModuleProp(moduleName: string, propName: string): any {
    const mdStore = getModuleState(moduleName);
    return mdStore ? mdStore[propName] : null;
}

export const Provider = props => RdProvider({...props, store: reaction.store})