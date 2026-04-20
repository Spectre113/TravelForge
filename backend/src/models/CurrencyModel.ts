import { CurrencyRates } from '../types'

export class CurrencyModel {
  private static rates: CurrencyRates = {
    USD: 1,
    EUR: 0.92,
    TRY: 34,
    GEL: 2.7,
    RUB: 95,
    PLN: 4.0,
    CZK: 23,
    HUF: 360,
    RON: 4.6,
    BGN: 1.8,
    RSD: 108,
    HRK: 6.9,
    ALL: 95,
    MKD: 56,
    UAH: 37,
    BYN: 3.2,
    MDL: 18,
    LTL: 3.45,
    LVL: 0.6,
    EEK: 14.5,
  }

  static getRates(): CurrencyRates {
    return { ...this.rates }
  }

  static convertCurrency(
    amount: number,
    from: keyof CurrencyRates,
    to: keyof CurrencyRates,
  ): number {
    const usdAmount = amount / this.rates[from]
    return usdAmount * this.rates[to]
  }

  static updateRates(newRates: Partial<CurrencyRates>): void {
    this.rates = { ...this.rates, ...newRates }
  }
}
