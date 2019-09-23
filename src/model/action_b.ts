import { ModuleAction, KV } from "../reaction";
import { MODULE_B } from "./consts";
import { IModuleB, IUserMsg } from "./model_b";

export const freshUserMsgAction: ModuleAction<KV, IModuleB> = {
    module: MODULE_B,

    process: async (payload: KV, moduleState: IModuleB) => {
        const msg = await fetchNewMsg();
        const lists = moduleState.lists;
        lists.push(msg);
        return { lists }
    }
}

const randomMsgs = 'asdkwoeiruwokxvmaskrowiusmvnasdkrowierksjvaiwerowoeir';
// mock function of fetch a new msg
function fetchNewMsg(): Promise<IUserMsg> {
    return new Promise(resolve => {
        const delay = (Math.random() * 6000) >> 0;
        setTimeout(() => {
            const msg = {
                    username: String.fromCharCode(67 + (Math.random() * 32) >> 0),
                    msg: randomMsgs.substr((Math.random() * 10) >> 0, (Math.random() * randomMsgs.length) >> 0),
                    time: Date.now()
                };
            resolve(msg);
        }, delay);
    })
}