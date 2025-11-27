import { Component, OnInit } from '@angular/core';

import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  form: FormGroup;
  error = '';
  hidePassword = true;
  hideConfirmPassword = true;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group(
      {
        name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, this.passwordStrengthValidator]],
        password_confirmation: ['', Validators.required],
      },
      { validators: this.passwordsMatchValidator }
    );
  }

  ngOnInit(): void {
    if (this.auth.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  private passwordsMatchValidator: ValidatorFn = (
    group: AbstractControl
  ): ValidationErrors | null => {
    let password = group.get('password')?.value;
    let confirm = group.get('password_confirmation')?.value;
    return password === confirm ? null : { passwordsMismatch: true };
  };

  private passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    let value = control.value;
    if (!value) return null;

    let hasUpperCase = /[A-Z]/.test(value);
    let hasNumber = /\d/.test(value);
    let hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    let hasMinLength = value.length >= 8;

    let valid = hasUpperCase && hasNumber && hasSymbol && hasMinLength;
    return valid ? null : { weakPassword: true };
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.auth.register(this.form.value).subscribe({
        next: () => this.router.navigate(['/dashboard']),
        error: (err) => {
          console.log('Error Laravel:', err);
          this.error = err.error?.message || 'Datos inválidos';
        },
      });
    }
  }
}
