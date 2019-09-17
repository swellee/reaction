"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var react_1 = require("react");
var react_redux_1 = require("react-redux");
var redux_1 = require("redux");
// defines -------------------------------------------------------------
exports.MODULE_COMMON = 'reaction_module_common';
/// ---------------------------------------------------------------------
// redux wrap------------------------------------------------------------
var js_meta_types = [
    'bigint',
    'boolean',
    'string',
    'number',
    'function',
    'symbol',
    'undefined'
];
var _initStore = {};
var testLoadingFn = function (tag) { return console.log("\ngot a loading tag: " + tag + ", \nyou'd better implements your own 'showLoading' and 'hideLoading' \nby set reaction.showLoading/hideLoading property"); };
exports.reaction = {
    store: Object.create({}),
    showLoading: testLoadingFn,
    hideLoading: testLoadingFn,
    defaultMaxProcessSeconds: 8 // by default, one action's process function is allow to execute 8s
};
var reducer = function (state, act) {
    if (act.module) {
        var copy = __assign({}, state);
        // deal with data via module
        var moduleStore = copy[act.module];
        if (moduleStore) {
            copy[act.module] = Object.assign(moduleStore, act.payload);
        }
        else if (act.payload) {
            // danger! treat the payload as a global data if there's no module id
            copy = Object.assign(copy, act.payload);
            console.warn("you have produced a redux action without the 'module' id, which may cause error!");
        }
        return copy;
    }
    return state;
};
var actionQueue = [];
/**
 * execute an action
 *  specially ,if the first param was given a moduleName string, meanwile the payload is k-v data,
 * the freamework will simply merge the payload to the moduleStore of the moduleName
 * @param moduleAction action instance or moduleName
 * @param payload this data will be passed to action's process method，typically , it's a k-v data, eg: {a: 1, b: 'xx'}. if you give a simple metadata type (such as string, number, boolean...), the moduleAction must has a process method to deal with it
 * @param loading whether call showloading when execute this action
 */
function doAction(moduleAction, payload, loadingTag) {
    var _this = this;
    if (loadingTag === void 0) { loadingTag = 'none'; }
    var mAction = typeof moduleAction === 'string' ?
        { module: moduleAction } : moduleAction;
    // rules: payload must be a KV type when there's no process function in given moduleAction
    if (!mAction.process && typeof payload in js_meta_types) {
        throw new Error("\n        payload must be a KV type when there's no process function in given moduleAction!\n        when call 'doAction',\n        the param 'payload' is promoted to be a KV type,\n        if you really want to use js simple meta type data, you must declare a 'process' function in\n        the ModuleAction to deal with the payload and return a KV data\n        ");
    }
    var canStartAction = 1;
    var useLoading = loadingTag !== 'none';
    if (useLoading) {
        // insert showloading
        actionQueue.push({
            action: {
                name: "@@begin loading:" + mAction.name,
                module: exports.MODULE_COMMON,
                process: function () { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        // call showLoading
                        exports.reaction.showLoading();
                        // set the loadingTag of common module
                        return [2 /*return*/, { loadingTag: loadingTag }];
                    });
                }); }
            },
            payload: undefined
        });
    }
    actionQueue.push({ action: mAction, payload: payload });
    if (useLoading) {
        // insert hideloading
        actionQueue.push({
            action: {
                name: "@@end loading:" + mAction.name,
                module: exports.MODULE_COMMON,
                process: function () { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        // call hideLoading
                        exports.reaction.hideLoading();
                        // reset the loadingTag of common module
                        return [2 /*return*/, { loadingTag: 'none' }];
                    });
                }); }
            },
            payload: undefined
        });
        canStartAction = 3;
    }
    if (actionQueue.length === canStartAction) {
        nextAction();
    }
}
exports.doAction = doAction;
function doFunction(fn, payload) {
    var action = {
        module: 'none',
        process: fn
    };
    doAction(action, payload);
}
exports.doFunction = doFunction;
function nextAction() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, action, payload, globalState, moduleState, data, processData, maxTime_1, ex_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!actionQueue.length) {
                        return [2 /*return*/];
                    }
                    _a = actionQueue[0], action = _a.action, payload = _a.payload;
                    globalState = exports.reaction.store.getState();
                    moduleState = globalState[action.module];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, , 5]);
                    data = payload;
                    processData = void 0;
                    if (!action.process) return [3 /*break*/, 3];
                    maxTime_1 = (action.maxProcessSeconds || exports.reaction.defaultMaxProcessSeconds) * 1000;
                    return [4 /*yield*/, new Promise(function (resolve) {
                            var tmHdl = setTimeout(function () {
                                console.error("action:[module:" + action.module + ",name:" + action.name + "] 's process timeout! ");
                                resolve({}); // return a blank obj
                            }, maxTime_1);
                            action.process(payload, moduleState).then(function (_) { return resolve(_); })["finally"](function () { return clearTimeout(tmHdl); });
                        })];
                case 2:
                    processData = _b.sent();
                    _b.label = 3;
                case 3:
                    // dispatch a redux's action to merge data
                    exports.reaction.store.dispatch({
                        type: action.name || 'moduleAction',
                        module: action.module,
                        payload: processData || data
                    });
                    return [3 /*break*/, 5];
                case 4:
                    ex_1 = _b.sent();
                    console.dir(ex_1);
                    return [3 /*break*/, 5];
                case 5:
                    actionQueue.shift();
                    if (actionQueue.length > 0) {
                        nextAction();
                    }
                    return [2 /*return*/];
            }
        });
    });
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
function mapProp(module) {
    var props = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        props[_i - 1] = arguments[_i];
    }
    var moduleName;
    if (typeof module === 'string') {
        moduleName = module;
    }
    else {
        moduleName = module.module;
        if (!_initStore.hasOwnProperty(moduleName)) {
            // reg the moduleStore if it has not
            // make a copy when call regStore, so you may reset the moduleStore's prop to initial state by
            // simply doAction({module: 'xxModule'}, xxModuleStore)
            regStore(__assign({}, module));
        }
    }
    return function (target) {
        var mappedFlag = target.__mappedMd__ || '';
        if (mappedFlag && mappedFlag.includes(moduleName)) {
            return target;
        }
        else {
            mappedFlag += '_' + moduleName;
            target.__mappedMd__ = mappedFlag;
            return react_redux_1.connect(function (state) {
                var st = {};
                if (props.length > 0) {
                    var mdStore_1 = state[moduleName];
                    props.forEach(function (key) {
                        if (mdStore_1) {
                            var uiKey = void 0, mdKey = void 0;
                            if (key.includes(':')) {
                                var kv = key.split(':');
                                uiKey = kv[0];
                                mdKey = kv[1];
                            }
                            else {
                                uiKey = mdKey = key;
                            }
                            st[uiKey] = mdStore_1[mdKey];
                        }
                        else {
                            throw new Error('please inject module-store to global by call regStore() first of all.');
                        }
                    });
                }
                else {
                    var mdStore = state[moduleName];
                    st = __assign({}, mdStore);
                }
                return st;
            })(target);
        }
    };
}
exports.mapProp = mapProp;
function regStore(moduleStore) {
    var mdNm = moduleStore.module;
    _initStore[mdNm] = moduleStore;
    Object.assign(exports.reaction.store, redux_1.createStore(reducer, _initStore));
}
exports.regStore = regStore;
function enableDevtools() {
    var enhancer;
    var win = window;
    if (win.__REDUX_DEVTOOLS_EXTENSION__) {
        enhancer = win.__REDUX_DEVTOOLS_EXTENSION__();
    }
    Object.assign(exports.reaction.store, redux_1.createStore(reducer, _initStore, enhancer));
}
exports.enableDevtools = enableDevtools;
// return the global store's snapshot state
function getGlobalState() {
    return exports.reaction.store.getState();
}
exports.getGlobalState = getGlobalState;
// return the specific moduleStore's snapshot state
function getModuleState(moduleName) {
    return getGlobalState()[moduleName];
}
exports.getModuleState = getModuleState;
// return the specific moduleStore's prop by name
function getModuleProp(moduleName, propName) {
    var mdStore = getModuleState(moduleName);
    return mdStore ? mdStore[propName] : null;
}
exports.getModuleProp = getModuleProp;
var Pr = /** @class */ (function (_super) {
    __extends(Pr, _super);
    function Pr() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Pr.prototype.render = function () {
        return react_1["default"].createElement(react_redux_1.Provider, { store: exports.reaction.store }, this.props.children);
    };
    return Pr;
}(react_1["default"].Component));
exports.Pr = Pr;
