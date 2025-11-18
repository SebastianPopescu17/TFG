import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Api } from '../../core/services/api.service';

@Component({
  selector: 'app-orden-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './orden-dialog.component.html',
  styleUrls: ['./orden-dialog.component.css']
})
export class OrdenDialogComponent implements OnInit {
  form: FormGroup;
  saldo = 0;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<OrdenDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private api: Api
  ) {
    this.form = this.fb.group({
      cantidad: [null, [Validators.required, Validators.min(0.01)]]
    });
  }

  ngOnInit(): void {

    this.api.getSaldo().subscribe({
      next: (res) => (this.saldo = res.saldo),
      error: () => (this.saldo = 0),
    });
  }

  confirmar() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}
