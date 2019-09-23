import { ModuleStore, regStore } from "../reaction";
import { MODULE_B } from "./consts";

export interface IUserMsg {
    username: string;
    msg: string;
    time: number;
}
export interface IModuleB extends ModuleStore {
    lists: IUserMsg[];
}
export const mStoreB: IModuleB = {
    module: MODULE_B,
    lists: []
}

// in this example, we call regStore mannally
regStore(mStoreB)