import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SecurityService } from '../../services/security.service';

@Component({
  selector: 'app-register',

  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);
  private securityService = inject(SecurityService);

  registerForm: FormGroup;
  readonly isSubmitting = signal<boolean>(false);

  private readonly formValues = signal<any>({});
  private readonly formErrors = signal<Record<string, any>>({});
  private readonly formValid = signal<boolean>(false);

  readonly canSubmit = computed(() => {
    return this.formValid() && !this.isSubmitting();
  });

  // Regex patterns
  private readonly EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  private readonly USERNAME_REGEX = /^[a-zA-Z][a-zA-Z0-9]*$/;
  private readonly PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?!.*\s).{8,}$/;

  constructor() {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, this.emailValidator.bind(this)]],
      username: ['', [Validators.required, this.usernameValidator.bind(this)]],
      password: ['', [Validators.required, this.passwordValidator.bind(this)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });

    this.registerForm.valueChanges.subscribe(values => {
      this.formValues.set(values);
    });

    this.registerForm.statusChanges.subscribe(() => {
      this.formValid.set(this.registerForm.valid);

      const errors: Record<string, any> = {};
      Object.keys(this.registerForm.controls).forEach(key => {
        const control = this.registerForm.get(key);
        if (control && control.errors) {
          errors[key] = control.errors;
        }
      });
      this.formErrors.set(errors);
    });

    this.formValid.set(this.registerForm.valid);
  }

  private emailValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const sanitized = this.securityService.sanitizeInput(value);
    if (typeof sanitized === 'string' && !this.EMAIL_REGEX.test(sanitized)) {
      return { emailFormat: true };
    }
    return null;
  }

  private usernameValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const sanitized = this.securityService.sanitizeInput(value);
    if (typeof sanitized === 'string' && !this.USERNAME_REGEX.test(sanitized)) {
      return { usernameFormat: true };
    }
    return null;
  }

  private passwordValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    if (!this.PASSWORD_REGEX.test(value)) {
      return { passwordFormat: true };
    }
    return null;
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) return null;

    if (password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }

  getErrorMessage(fieldName: string): string {
    const errors = this.formErrors();
    const fieldErrors = errors[fieldName];

    if (!fieldErrors) return '';

    if (fieldErrors['required']) {
      return 'שדה זה הינו חובה';
    }

    if (fieldErrors['emailFormat']) {
      return 'כתובת אימייל לא תקינה';
    }

    if (fieldErrors['usernameFormat']) {
      return 'שם משתמש חייב להכיל רק אותיות אנגליות ומספרים ולא להתחיל במספר';
    }

    if (fieldErrors['passwordFormat']) {
      return 'סיסמה חייבת להכיל לפחות אות גדולה אחת, לפחות ספרה אחת, ללא רווחים, ומינימום 8 תווים';
    }

    if (fieldErrors['passwordMismatch']) {
      return 'הסיסמאות לא תואמות';
    }

    return '';
  }

  async onSubmit(): Promise<void> {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    if (!this.canSubmit()) {
      return;
    }

    this.isSubmitting.set(true);

    const formValue = this.formValues();

    const sanitizedData = {
      email: this.securityService.sanitizeInput(formValue.email),
      username: this.securityService.sanitizeInput(formValue.username),
      password: formValue.password // Password doesn't need HTML sanitization
    };

    try {
      if (Date.now() % 2 === 0) {
        throw new Error('ההרשמה נכשלה');
      }

      this.snackBar.open('ההרשמה בוצעה בהצלחה!', 'סגור', {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });

    } catch (error: any) {
      const errorMessage = error?.error?.message || error?.message || 'ההרשמה נכשלה';
      this.snackBar.open(errorMessage, 'סגור', {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });

    } finally {
      this.resetForm();
      this.isSubmitting.set(false);
    }
  }

  private resetForm() {
    this.registerForm.reset();
    this.formValues.set({});
    this.formErrors.set({});
  }
}
