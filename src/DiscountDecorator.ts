import {PriceDecorator, Price} from "./Price";
import {Currency} from "./currency";
import {_internalToAmount,_amountToInternal} from "./helper";

export class PriceWithPercentualDiscountDecorator extends PriceDecorator {
    _price: Price;
    _discount: number;

    constructor(p: Price, c: { discount: number }) {
      super();
        this._price = p;
        this._discount = c.discount;
    }

    get currency(): Currency {
        return this._price.currency;
    }

    get _internalDiscount(): number {
        return (this._price._internalAmmount * this._discount) / 100;
    }

    get _internalAmmount(): number {
        return this._price._internalAmmount - this._internalDiscount;
    }

    get discount(): number {
      return _internalToAmount(this.currency, this._internalDiscount);
    }

    get amount(): number {
      return _internalToAmount(this.currency, this._internalAmmount);
    }

    toString(): string {
        return this.amount.toFixed(this.currency.decimal_digits);
    }

    get annotation():string {
      return `having ${this.discount} discount`;
    }
}
