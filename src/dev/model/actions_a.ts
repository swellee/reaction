import { ModuleAction } from "../../lib";
import { MODULE_A } from "./consts";
import { async } from "_@types_q@1.5.2@@types/q";
import { mStoreA } from "./model_a";

export const resetAToInitialAction: ModuleAction = {
    module: MODULE_A,
    process: async() => mStoreA
}

