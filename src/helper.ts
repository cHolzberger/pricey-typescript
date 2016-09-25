import {Currency} from "./currency";

export function _amountToInternal (c:Currency, a:number):number {
  return a * Math.pow(10, c.decimal_digits+3);
}

export function _internalToAmount(c:Currency, a:number):number {
  return a / Math.pow(10, c.decimal_digits+3);
}
