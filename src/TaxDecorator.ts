import {PriceDecorator, Price} from "./Price";
import {Currency} from "./currency";
import {_internalToAmount,_amountToInternal} from "./helper";
//fixme move common code here
export abstract class PriceWithTaxDecorator extends PriceDecorator {
    _price: Price;
    _tax: number;


    constructor(p: Price, c: { tax: number }) {
        super();
        this._price = p;
        this._tax = c.tax;
    }

    get currency(): Currency {
        return this._price.currency;
    }

    get amount(): number {
      return _internalToAmount(this.currency, this._internalAmmount);
    }

    toString(): string {
        return `${this.amount.toFixed(this.currency.decimal_digits)}`;
    }

    _internalTax: number;
    _internalAmmount: number;

    get tax(): number {
      return _internalToAmount(this.currency, this._internalTax);
    }

    get taxRate(): number {
        return this._tax;
    }

    get annotation(): string {
      return `including ${this.tax.toFixed(this.currency.decimal_digits)} (${this.taxRate}%) Tax`;
    }
}

export class PriceWithAddTaxDecorator extends PriceWithTaxDecorator {

    get _internalTax(): number {
        return (this._price._internalAmmount * this._tax) / 100;
    }

    get _internalAmmount(): number {
        return (this._price._internalAmmount + this._internalTax);
    }
}
export class PriceIncludingTaxDecorator extends PriceWithTaxDecorator {
    get _internalAmmount(): number {
        return (this._price._internalAmmount);
    }

    get _internalTax(): number { // FIXME: right formular
        return this._price._internalAmmount - (this._price._internalAmmount / ((100 + this._tax) / 100));
    }

}
