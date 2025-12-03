import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Api } from '../../../core/services/api.service';
import { Empresa } from '../../../core/models/empresa';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { distinctUntilChanged } from 'rxjs';
import { OrdenCreate } from '../../../core/models/orden';

@Component({
  selector: 'app-ordenes-programadas-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
  ],
  templateUrl: './ordenes-programadas-form.component.html',
  styleUrls: ['./ordenes-programadas-form.component.css'],
})
export class OrdenesProgramadasFormComponent implements OnInit {
  empresa!: Empresa;
  submitting = false;
  form;
  availableAmount = 0;
  userSaldo = 0;
  saldoInsuficiente = false;

  constructor(
    private fb: FormBuilder,
    private api: Api,
    private dialogRef: MatDialogRef<OrdenesProgramadasFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { empresa: Empresa }
  ) {
    this.form = this.fb.group({
      empresa_id: [null as number | null, Validators.required],
      tipo: ['compra', Validators.required],
      cantidad: [0.01, [Validators.required, Validators.min(0.000001)]],
      precio_objetivo: [null as number | null, [Validators.required, Validators.min(0.01)]],
      scheduled_at: [null as string | null],
    });
  }

  ngOnInit() {
    this.empresa = this.data.empresa;
    this.form.patchValue({ empresa_id: this.empresa.id });


    this.api.getSaldo().subscribe({
      next: (res) => {
        this.userSaldo = res.saldo;
        this.checkSaldoDisponible();
      },
      error: () => {
        this.userSaldo = 0;
      }
    });


    if (this.form.get('tipo')?.value === 'venta') {
      this.loadPosicion();
    } else {
      this.updateCantidadValidators();
    }


    this.form.get('tipo')?.valueChanges.pipe(distinctUntilChanged()).subscribe((t) => {
      if (t === 'venta') {
        this.loadPosicion();
      } else {
        this.availableAmount = 0;
        this.updateCantidadValidators();
      }
      this.checkSaldoDisponible();
    });

    // revalidar cantidad y precio objetivo
    this.form.get('cantidad')?.valueChanges.subscribe(() => this.updateImporteTotal());
    this.form.get('precio_objetivo')?.valueChanges.subscribe(() => this.updateImporteTotal());
  }

  loadPosicion() {
    const empresaId = this.empresa?.id;
    if (!empresaId) return;

    this.api.getPosicion(empresaId).subscribe({
      next: (res) => {
        this.availableAmount = res?.cantidad ?? 0;
        this.updateCantidadValidators();
      },
      error: () => {
        this.availableAmount = 0;
        this.updateCantidadValidators();
      },
    });
  }

  updateCantidadValidators() {
    const cantidadControl = this.form.get('cantidad');
    if (!cantidadControl) return;

    const validators = [Validators.required, Validators.min(0.000001)];
    if (this.form.get('tipo')?.value === 'venta') {
      validators.push(Validators.max(this.availableAmount));
    }

    cantidadControl.setValidators(validators);
    cantidadControl.updateValueAndValidity({ onlySelf: true, emitEvent: false });
  }

  updateImporteTotal() {
    const cantidad = this.form.get('cantidad')?.value ?? 0;
    const precio = this.form.get('precio_objetivo')?.value ?? 0;
    const tipo = this.form.get('tipo')?.value;

    if (tipo === 'compra') {
      const total = cantidad * precio;
      this.saldoInsuficiente = total > this.userSaldo;
      if (this.saldoInsuficiente) {
        this.form.get('cantidad')?.setErrors({ saldoInsuficiente: true });
      } else {
        this.form.get('cantidad')?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
      }
    } else {
      this.saldoInsuficiente = false;
    }
  }

  checkSaldoDisponible() {
    this.updateImporteTotal();
  }

  submit() {
    if (this.form.invalid) {
      const cantidadControl = this.form.get('cantidad');
      if (cantidadControl?.hasError('saldoInsuficiente')) {
        alert('No tienes saldo suficiente para esta orden de compra');
      }
      return;
    }

    this.submitting = true;

    const payload: OrdenCreate = {
      empresa_id: this.form.value.empresa_id!,
      tipo: this.form.value.tipo! as 'compra' | 'venta',
      cantidad: this.form.value.cantidad!,
      precio_objetivo: this.form.value.precio_objetivo ?? undefined,
      scheduled_at: this.form.value.scheduled_at ?? undefined,
    };

    // seguridad adicional: validar contra cantidad disponible si es venta
    if (payload.tipo === 'venta' && payload.cantidad > (this.availableAmount ?? 0)) {
      this.submitting = false;
      alert('La cantidad a vender excede las acciones disponibles: ' + (this.availableAmount ?? 0));
      return;
    }

    this.api.createOrden(payload).subscribe({
      next: () => {
        this.submitting = false;
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.submitting = false;
        alert(err?.error?.error ?? 'Error creando la orden');
      },
    });
  }

  cancelar() {
    this.dialogRef.close(false);
  }
}
