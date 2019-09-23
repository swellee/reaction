import { ModuleAction } from "../reaction";
import { MODULE_A } from "./consts";
import { mStoreA } from "./model_a";

export const resetAToInitialAction: ModuleAction = {
    module: MODULE_A,
    process: async() => mStoreA
}

