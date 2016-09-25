import {Currency} from "./currency";
import {IPrice, Price, PriceDecorator} from "./Price";
export {currencies} from "./currency";
import {PriceWithTaxDecorator,  PriceWithAddTaxDecorator, PriceIncludingTaxDecorator} from "./TaxDecorator";
import {PriceWithPercentualDiscountDecorator} from "./DiscountDecorator";
import {_internalToAmount,_amountToInternal} from "./helper";

export interface ICalulation {
    toString(): string;
}

export class Calculation implements ICalulation {
    _prices: IPrice[] = [];
    _taxRates: number[] = [];

    constructor(a:IPrice[]) {
      this._prices = a;

      a.forEach ( p => {
        if (p instanceof PriceWithTaxDecorator) {
            this._taxRates.push(p.taxRate);
        }
      });
    }

    _getAnnotations(p:IPrice):string[] {
      if ( p instanceof PriceDecorator) {
        return [(<PriceDecorator>p).annotation].concat(this._getAnnotations(p.decoratedPrice));
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







export default class Pricey {


    static createPrice(price: string | number, currency: Currency): Price {
        var f: number = 0;
        console.log("Create price: %s", price);

        if (typeof price === 'string') {
            f = parseFloat(price);
        } else if (typeof price === 'number') {
            f = price;
        }
        var repr: number = _amountToInternal(currency, f);
        return new Price({ amount: repr, currency: currency });
    }

    static hasTax(p: IPrice): boolean {
        if (p instanceof PriceWithTaxDecorator) {
            return true;
        }

        if ( p instanceof PriceDecorator) {
          return Pricey.hasTax(p.decoratedPrice);
        }

        return false;
    }

    static addTax(p: Price, t: number) {
      if ( Pricey.hasTax(p) ) {
        throw 'Price allready has tax';
      }
      return new PriceWithAddTaxDecorator(p, { tax: t });
    }

    static includingTax(p: Price, t: number) {
      if ( Pricey.hasTax(p) ) {
        throw 'Price allready has tax';
      }

      return new PriceIncludingTaxDecorator(p, { tax: t });
    }

    static addDiscount(p: Price, t: number) {
        return new PriceWithPercentualDiscountDecorator(p, { discount: t });
    }

    static createCalulation(arr:IPrice[]): Calculation {
        return new Calculation(arr);
    }
}
