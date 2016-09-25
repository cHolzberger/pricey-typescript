import {Currency} from "./currency";
import {_internalToAmount,_amountToInternal} from "./helper";

export interface IPrice {
    amount: number;
    currency: Currency;
    toString(): string;
//  toJSON(): string;
}

export class Price implements IPrice {
    currency: Currency;
    _internalAmmount: number;

    constructor(c: { amount: number, currency: Currency }) {
        this.currency = c.currency;
        this._internalAmmount = c.amount;
    }

    get amount(): number {
        return _internalToAmount(this.currency, this._internalAmmount);
    }

    toString() {
        return this.amount.toFixed(this.currency.decimal_digits);
    }
}

export abstract class PriceDecorator implements IPrice {
    _price: Price;
    currency: Currency;
    get decoratedPrice():Price {
      return this._price;
    }

    annotation:string;
    amount: number;
    abstract toString(): string;
}
