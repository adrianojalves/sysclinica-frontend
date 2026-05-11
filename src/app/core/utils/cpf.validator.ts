// cpf.validator.ts
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function cpfValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const cpf = control.value?.replace(/\D/g, '');
    if (!cpf) return null;
    if (cpf.length !== 11 || !!cpf.match(/^(.)\1*$/)) return { cpfInvalid: true };

    const calculateDigit = (slice: string, factor: number) => {
      let sum = 0;
      for (const char of slice) sum += parseInt(char) * factor--;
      const rev = 11 - (sum % 11);
      return rev >= 10 ? 0 : rev;
    };

    const digit1 = calculateDigit(cpf.substring(0, 9), 10);
    const digit2 = calculateDigit(cpf.substring(0, 10), 11);

    return digit1 === parseInt(cpf[9]) && digit2 === parseInt(cpf[10]) 
      ? null 
      : { cpfInvalid: true };
  };
}