import { Pipe, PipeTransform } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

@Pipe({
  name: 'brlCurrency',
  standalone: true
})
export class BrlCurrencyPipe implements PipeTransform {
  private readonly currency = new CurrencyPipe('pt-BR');

  transform(value: number | null | undefined): string {
    return this.currency.transform(value ?? 0, 'BRL', 'symbol', '1.2-2') ?? 'R$ 0,00';
  }
}
