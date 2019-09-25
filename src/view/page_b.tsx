import React from  'react'
import { KV, mapProp, doAction } from '../reaction';
import './page_b.sass'
import { MODULE_B } from '../model/consts';

/**
 * in this example, we call 'regStore' mannally
 * in the model_b.ts file. so we should import it to 
 * make sure the model_b.ts will be compled
 */
import '../model/model_b'; 
import { IUserMsg } from '../model/model_b';
import { freshUserMsgAction } from '../model/action_b';

/**
 * because we have called 'regStore' in model_b.ts,
 * here we can pass the moduleName's string to 'mapProp' decorator
 * BTW, you can still pass the mStoreB instance to 'mapProp' as you like
*/
@mapProp(MODULE_B, 'lists')
export class PageB extends React.Component<KV, {}> {
    constructor(props: KV) {
        super(props);
        this.state = {};
        doAction(freshUserMsgAction);
    }

    componentDidUpdate() {
        doAction(freshUserMsgAction);
    }

    render() {
        return (
            <div className="page-b">
                <div className="title">
                    some buyers' message:
                </div>
                <div className="msgs-con">
                    {
                        this.props.lists.map((m: IUserMsg, index: number) => {
                            return (
                                <div className="msg" key={`m-${m.username}-${index}`}>
                                    <span className="user">{m.username}</span>
                                    <span className="content">{m.msg}</span>
                                    <span className="time">{new Date(m.time).toLocaleTimeString()}</span>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        );
    }
}