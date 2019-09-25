import { ModuleAction, KV } from "../reaction";
import { MODULE_B } from "./consts";
import { IModuleB, IUserMsg } from "./model_b";

export const freshUserMsgAction: ModuleAction<KV, IModuleB> = {
    module: MODULE_B,

    process: async (payload: KV, moduleState: IModuleB) => {
        const msg = await fetchNewMsg();
        const lists = moduleState.lists;
        lists.push(msg);
        // by default, the param moduleState is a clone of the moduleStore
        // so directly modify won't cause any change in redux
        // you need to return a obj contains sth wanna be modify, in this example, we
        // only wanna modify the 'lists', then return {lists} 
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