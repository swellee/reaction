import { ModuleAction, KV } from "../reaction";
import { MODULE_B } from "./consts";
import { IModuleB, IUserMsg } from "./model_b";

export const freshUserMsgAction: ModuleAction<KV, IModuleB> = {
    module: MODULE_B,

    process: async (payload: KV, moduleState: IModuleB) => {
        const msg = await fetchNewMsg();
        if (msg) {
            const lists = moduleState.lists;
            lists.push(msg);
            return { lists }
        }
        return {}
    }
}

const randomMsgs = 'asdkwoeiruwokxvmaskrowiusmvnasdkrowierksjvaiwerowoeir';
// mock function of fetch a new msg
function fetchNewMsg(): Promise< IUserMsg | undefined> {
    return new Promise(resolve => {
        const delay = (Math.random() * 6000) >> 0;
        setTimeout(() => {
            return Math.random() > 0.5 ?
                undefined : {
                    username: String.fromCharCode((Math.random() * 32) >> 0 + 67),
                    msg: randomMsgs.substr((Math.random() * 10) >> 0, (Math.random() * randomMsgs.length) >> 0),
                    time: Date.now()
                };
        }, delay);
    })
}