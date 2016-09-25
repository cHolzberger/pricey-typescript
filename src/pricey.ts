export interface PriceySettings {
    accuracy: number,
    dec: number
}

export interface ICalulation {
    add(p: IPrice): ICalulation;
    toString(): string;
}


export interface IPrice {
    amount: number;
    settings: PriceySettings;
    toString(): string;
//  toJSON(): string;
}

export abstract class PriceDecorator implements IPrice {
    _price: Price;
    settings: PriceySettings;
    get decoratedPrice():Price {
      return this._price;
    }

    abstract get annotation():string;
    abstract get amount(): number;
    abstract toString(): string;
}

export class Calculation implements ICalulation {
    _prices: IPrice[] = [];
    _taxRates: number[] = [];
    add(p: IPrice): Calculation {
        this._prices.push(p);

        if (p instanceof PriceWithAddTaxDecorator) {
            this._taxRates.push(p.taxRate);
        }

        return this;
    }

    _getAnnotations(p:Price):string[] {
      if ( p instanceof PriceDecorator) {
        return [p.annotation].concat(this._getAnnotations(p.decoratedPrice));
      }

      return [];
    }

    toString(): string {
        var tax: { [s: string]: number } = {};
        var discounts = 0;

        this._taxRates.forEach((t: number) => tax[t] = 0);

        var str = "Calulation: \n";
        var total = this._prices.reduce((total: number, price: Price) => {
            total += price.amount;
            str += price.toString();
            str += "\n";
            this._getAnnotations(price).forEach((s:string)=>{
              str+=`\t${s}\n`;
            });

            str += "\n";

            if (price instanceof PriceWithPercentualDiscountDecorator) {
                discounts += price.discount;
            } else if (price instanceof PriceWithTaxDecorator) {
                tax[price.taxRate] += price.tax;
            }

            return total;
        }, 0);

        str += "Total is: \n";
        str += total.toFixed(2);
        str += "\n\tincluding:\n";
        str += "\t\tDiscounts: " + discounts.toFixed(2) + "\n";
        Object.keys(tax).forEach((t: string) => { str += `\t\t${t}%: ${tax[t].toFixed(2)}\n` });
        console.dir(tax);
        return str;
    }
}



export class Price implements IPrice {
    settings: PriceySettings;
    _internalAmmount: number;

    constructor(c: { amount: number, settings: PriceySettings }) {
        this.settings = c.settings;
        this._internalAmmount = c.amount;
    }

    get amount(): number {
        return this._internalAmmount / Math.pow(10, this.settings.accuracy);
    }

    toString() {
        return this.amount.toFixed(2);
    }
}

//fixme move common code here
export abstract class PriceWithTaxDecorator extends PriceDecorator {
    _price: Price;
    _tax: number;


    constructor(p: Price, c: { tax: number }) {
        super();
        this._price = p;
        this._tax = c.tax;
    }

    get settings(): PriceySettings {
        return this._price.settings;
    }

    get amount(): number {
        return ((this._internalAmmount) / Math.pow(10, this._price.settings.accuracy));
    }

    toString(): string {
        return `${this.amount.toFixed(2)}`;
    }

    abstract get _internalTax(): number;
    abstract get _internalAmmount(): number;

    get tax(): number {
        return this._internalTax / Math.pow(10, this._price.settings.accuracy);
    }

    get taxRate(): number {
        return this._tax;
    }

    get annotation(): string {
      return `including ${this.tax.toFixed(2)} (${this.taxRate}%) Tax`;
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

export class PriceWithPercentualDiscountDecorator extends PriceDecorator {
    _price: Price;
    _discount: number;

    constructor(p: Price, c: { discount: number }) {
      super();
        this._price = p;
        this._discount = c.discount;
    }

    get settings(): PriceySettings {
        return this._price.settings;
    }

    get _internalDiscount(): number {
        return (this._price._internalAmmount * this._discount) / 100;
    }

    get _internalAmmount(): number {
        return this._price._internalAmmount - this._internalDiscount;
    }

    get discount(): number {
        return this._internalDiscount / Math.pow(10, this._price.settings.accuracy);
    }

    get amount(): number {
        return this._internalAmmount / Math.pow(10, this._price.settings.accuracy);
    }

    toString(): string {
        return this.amount.toFixed(2);
    }

    get annotation():string {
      return `having ${this.discount} discount`;
    }
}

export default class Pricey {
    static createPrice(price: string | number, config: PriceySettings): Price {
        var f: number = 0;
        console.log("Create price: %s", price);

        if (typeof price === 'string') {
            f = parseFloat(price);
        } else if (typeof price === 'number') {
            f = price;
        }
        var repr: number = f * Math.pow(10, config.accuracy);
        return new Price({ amount: repr, settings: config });
    }

    static hasTax(p: Price): boolean {
        if (p instanceof PriceWithTaxDecorator) {
            return true;
        }

        if ( p instanceof PriceDecorator) {
          return Pricey.hasTax(p.decoratedPrice);
        }

        return false;
    }

    static addTax(p: Price, t: number) {
        return new PriceWithAddTaxDecorator(p, { tax: t });
    }

    static includingTax(p: Price, t: number) {
        return new PriceIncludingTaxDecorator(p, { tax: t });
    }

    static addDiscount(p: Price, t: number) {
        return new PriceWithPercentualDiscountDecorator(p, { discount: t });
    }

    static createCalulation(): Calculation {
        return new Calculation();
    }
}
