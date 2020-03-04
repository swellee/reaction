import React from 'react';
import { connect, Provider as RdProvider } from 'react-redux';
import { createStore, Store } from 'redux';
// defines -------------------------------------------------------------
export const MODULE_COMMON = 'reaction_module_common';

export interface KV {
    [k: string]: any
}

export interface ModuleStore extends KV {
    module: string;
}

export interface ModuleAction<PAYLOAD_TYPE = any, MODULE_STORE = ModuleStore, PROCEED_RESULT = KV> {
    /** the relative module this action will modify */
    module: string;

    /** the action's name, by default will be 'moduleAction'*/
    name?: string;

    /** the max time(by seconds) allowed the process functiion execute, if timeout, the process will be cancel and return a blank {}  */
    maxProcessSeconds?: number;

    /** the business logic processor, normally, you can fetch apis, do sth complex, etc.
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
     *              return { level: res.level}
     *          }
     *      }
     * 
     * PS: in process function, you can call 'getGlobalState ro getModuleState or getModuleProp' to get
     * global/other module's store prop
     */
    process?: (payload: PAYLOAD_TYPE, moduleStore: MODULE_STORE) => Promise<PROCEED_RESULT>;
}
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
];
const _initStore: KV = {};
interface ReactionDb {
    store: Store; // the combined store of redux
    showLoading: (loadingTag?: string) => void; // the showLoading function
    hideLoading: (loadingTag?: string) => void; // the hideLoading function
    defaultMaxProcessSeconds: number; // the default max time(by seconds) of one action's process
}
const testLoadingFn = (tag?: string) => console.log(`
got a loading tag: ${tag}, 
you'd better implements your own 'showLoading' and 'hideLoading' 
by set reaction.showLoading/hideLoading property`
);

export const reaction: ReactionDb = {
    store: Object.create({}),
    showLoading: testLoadingFn,
    hideLoading: testLoadingFn,
    defaultMaxProcessSeconds: 8 // by default, one action's process function is allow to execute 8s
};

const reducer = (state: any, act: any) => {
    if (act.module) {
        let copy = { ...state };
        // deal with data via module
        const moduleStore = copy[act.module];
        if (moduleStore) {
            copy[act.module] = Object.assign(moduleStore, act.payload);
        } else if (act.payload) {
            // danger! treat the payload as a global data if there's no module id
            copy = Object.assign(copy, act.payload);
            console.warn(`you have produced a redux action without the 'module' id, which may cause error!`)
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
    moduleAction: ModuleAction<any, any, any> | string,
    payload?: P,
    loadingTag: string | 'none' = 'none'
) {
    if (inQueue<any>(actionQueue, moduleAction, payload, loadingTag)) {
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

/**
 * insert an action at the certain pos closely after the current
 * action's process be finished
 * @access this method can only be called inside a action's process!!
*/
export function plusAction<P = KV>(
    moduleAction: ModuleAction<any, any, any> | string,
    payload?: P,
    loadingTag: string | 'none' = 'none'
) {
    const { action } = actionQueue[0] as any;
    if (!action.__processing__) {
        throw new Error(`you are only allowed to call plusAction inside an action's process !!`);
    }
    const plusActions: ActionNode<P>[] = action.__plus_actions = action.__plus_actions || [];
    inQueue(plusActions, moduleAction, payload, loadingTag);
}

function inQueue<P = KV>(
    queue: ActionNode<P>[],
    moduleAction: ModuleAction<any, any, any> | string,
    payload?: P,
    loadingTag: string | 'none' = 'none'
) {
    let mAction: ModuleAction = typeof moduleAction === 'string' ?
        { module: moduleAction } : moduleAction;

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
        queue.push({
            action: {
                name: `@@begin loading:${mAction.name}`,
                module: MODULE_COMMON,
                process: async () => {
                    // call showLoading
                    reaction.showLoading();
                    // set the loadingTag of common module
                    return { loadingTag };
                }
            },
            payload: undefined as any
        });
    }
    queue.push({ action: mAction, payload: payload as any });
    if (useLoading) {
        // insert hideloading
        queue.push({
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
            payload: undefined as any
        });
        canStartAction = 3;
    }

    return queue.length === canStartAction
}

async function nextAction() {
    if (!actionQueue.length) {
        return;
    }
    const { action, payload } = actionQueue[0];
    const moduleState = getModuleState(action.module);
    try {
        const data = payload; // moduleAction如果不提供process函数，就认为payload无需处理
        let processData;
        if (action.process) {
            const maxTime = (action.maxProcessSeconds || reaction.defaultMaxProcessSeconds) * 1000;

            processData = await new Promise(resolve => {
                const tmHdl = setTimeout(() => {
                    console.error(`action:[module:${action.module},name:${action.name}] 's process timeout! `);
                    resolve({}); // return a blank obj
                }, maxTime);
                (action as any).__processing__ = true;
                action.process!(payload, moduleState).then(_ => resolve(_)).finally(() => {
                    clearTimeout(tmHdl);
                    delete (action as any).__processing__;
                });
            })

        }
        // dispatch a redux's action to merge data
        reaction.store.dispatch({
            type: action.name || 'moduleAction',
            module: action.module,
            payload: processData || data
        });
    } catch (ex) {
        console.dir(ex);
    }

    actionQueue.shift();

    if (action.hasOwnProperty('__plus_actions')) {
        const childActions: ActionNode[] = (action as any).__plus_actions;
        actionQueue.unshift(...childActions);
        delete (action as any).__plus_actions;
    }

    if (actionQueue.length > 0) {
        nextAction();
    }
}

/**
 * the decorator used to inject moduleStore's props to Compnent
 * you can use this decorator several times to inject different moduleStore's props, eg. mapProp(moduleA, 'a','b') mapProp(moduleB, 'c','d')
 * while, you can not use it twice or more when inject one same moduleStore. in other words, mapProp(moduleA, 'a','b') mapProp(moduleA, 'c', 'd') will course error, instead, use mapProp(moduleA, 'a','b','c','d') to inject all props you need in one call
 * 
 * @param moduleStore the moduleStore or the moduleName you wanna inject from.
 * here receive two types of para
 *  1. string, indicates the moduleName, make sure you have called the 'regStore' mannaully before
 *  2. moduleStore instance, then in this mapProp function, will call 'regStore' automaticly by using the [copy] of the moduleStore given only if moduleStore.module not registered before!!(so one module will not be registered twice or more)
 * @param props these propNames of the moduleStore you wanna inject, 
 * here're two syntax sugars:
 *  1.if you want to inject all the props of the moduleStore, you can bypass the props param(feel free to let this param blank)
 *  2.you can rename props by use a ':', eg. mapProp(moduleA, 'a','b:bbb'), then in the Component, this.props.bbb refers to the moduleA.b 's value
 * 
 */
export function mapProp(module: ModuleStore | string, ...props: string[]): Function {
    let moduleName: string;
    if (typeof module === 'string') {
        moduleName = module;
    } else {
        moduleName = module.module;
        if (!_initStore.hasOwnProperty(moduleName)) {
            // reg the moduleStore if it has not
            regStore(module);
        }
    }
    return function (target: any) {
        let mappedFlag: string = target.__mappedMd__ || '';
        if (mappedFlag && mappedFlag.includes(moduleName)) {
            return target;
        } else {
            mappedFlag += '_' + moduleName;
            target.__mappedMd__ = mappedFlag;

            return connect((state: KV) => {
                let st: KV = {};
                if (props.length > 0) {
                    const mdStore = state[moduleName];
                    props.forEach(key => {
                        if (mdStore) {
                            let uiKey, mdKey;
                            if (key.includes(':')) {
                                const kv = key.split(':');
                                mdKey = kv[0];
                                uiKey = kv[1];
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
function getType(obj: any) {
    var type = Object.prototype.toString.call(obj).match(/^\[object (.*)\]$/)![1].toLowerCase();
    if (obj === null) return 'null'; // PhantomJS has type "DOMWindow" for null
    if (obj === undefined) return 'undefined'; // PhantomJS has type "DOMWindow" for undefined
    return type;
}
function cloneV(val: any): any {
    const type = getType(val);
    switch (type) {
        case 'array':
            return val.map(_ => cloneV(_));
        case 'map':
            return new Map(val);
        case 'set':
            return new Set(val);
        case 'object':
            const res: KV = {};
            for (const k in val) {
                res[k] = cloneV(val[k])
            }
            return res;
        default:
            return val;
    }

}
/**
 * reg a moduleStore to global redux's store mannally
 * note: when you call this method mannally, it will replace the original data if there's already registed a moduleStore with the same module name
 * @param moduleStore the moduleStore to reg
 */
export function regStore(moduleStore: ModuleStore) {
    const mdNm = moduleStore.module;
    // make a copy when call regStore, so you may reset the moduleStore's prop to initial state by
    // simply doAction('xxModule', xxModuleStore)
    _initStore[mdNm] = cloneV(moduleStore);
    Object.assign(reaction.store, createStore(reducer, _initStore));
}
/**
 * enable redux_devtools
 */
export function enableDevtools() {
    let enhancer;
    const win: KV = window;
    if (win.__REDUX_DEVTOOLS_EXTENSION__) {
        enhancer = win.__REDUX_DEVTOOLS_EXTENSION__();
        Object.assign(reaction.store, createStore(reducer, _initStore, enhancer));
    }
}

// return the global store's snapshot state, return the clone by default
// so by default, don not modify the return data directly!!!
export function getGlobalState(useClone = true) {
    const st = reaction.store.getState();
    return useClone ? cloneV(st) : st;
}
// return the specific moduleStore's snapshot state
export function getModuleState<T>(moduleName: string, useClone = true): T | any {
    return getGlobalState(useClone)[moduleName] as T;
}
// return the specific moduleStore's prop by name
export function getModuleProp(moduleName: string, propName: string, useClone = true): any {
    const mdStore = getModuleState(moduleName, useClone);
    return mdStore ? mdStore[propName] : null;
}
// the wrapper of react-redux's Provider
export const Provider: React.FC = (props: any) => (<RdProvider store={reaction.store} {...props} />);