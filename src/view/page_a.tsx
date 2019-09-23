import React from 'react'
import { KV, mapProp, doAction } from '../reaction';
import { mStoreA } from '../model/model_a';
import { MODULE_A } from '../model/consts';
import './page_a.sass'

@mapProp(mStoreA, 'size', 'price', 'count', 'infos')
export class PageA extends React.Component<KV, {}> {
    render() {
        return (
            <div className="page-a">
                <p className="des">the product size:{this.props.size}</p>
                <p className="des">and the price: ￥{this.props.price}</p>
                <p className="des">made in {this.props.infos.madeIn}</p>
                <p className="des">sale to {this.props.infos.saleTo}</p>
                <div className="buy-some">
                    <p className="buy-cnt">
                        <span className="cnt-ctrl" onClick={this.decrease}>-</span>
                        <span>buy count:${this.props.count}</span>
                        <span className="cnt-ctrl" onClick={this.increase}>+</span>
                    </p>
                    <p className="total-price">and total fee:{this.props.price * this.props.count}</p>
                </div>
            </div>
        );
    }

    decrease = () => {
        let count = this.props.count;
        if (count > 0) {
            count--
            doAction(MODULE_A, {count})
        }
    }

    increase = () => {
        let count = this.props.count;
        if (count < 99) {
            count++;
            doAction(MODULE_A, {count})
        }
    }
}