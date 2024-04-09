import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export const confirmPasswordValidator: ValidatorFn =
  (control: AbstractControl,): ValidationErrors | null => {
    const password: string = control.get('password')?.value;
    const confirmPassword: string = control.get('confirmPassword')?.value;

    if (password.length > 0 && confirmPassword.length > 0 &&
      password !== confirmPassword) {
      return { passwordNotMatch: true };
    }
    return null;
  };