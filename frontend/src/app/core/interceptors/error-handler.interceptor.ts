
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const errorHandlerInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ha ocurrido un error inesperado';

      if (error.error instanceof ErrorEvent) {
        errorMessage = `Error de cliente: ${error.error.message}`;
      } else {
        switch (error.status) {
          case 0:
            errorMessage = 'No hay conexión con el servidor.';
            break;
          case 400:
            errorMessage = 'Solicitud incorrecta.';
            break;
          case 401:
            errorMessage = 'No autorizado. Redirigiendo al login...';
            router.navigate(['/login']);
            break;
          case 403:
            errorMessage = 'Acceso denegado.';
            break;
          case 404:
            errorMessage = 'Recurso no encontrado.';
            break;
          case 422:
            errorMessage = 'Error de validación.';
            break;
          case 429:
            errorMessage = 'Demasiadas solicitudes. Espere un momento.';
            break;
          case 500:
            errorMessage = 'Error interno del servidor.';
            break;
          case 503:
            errorMessage = 'Servicio no disponible.';
            break;
          default:
            errorMessage = `Error ${error.status}: ${error.message || 'Error desconocido'}`;
        }
      }

      snackBar.open(errorMessage, 'Cerrar', {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
      });

      return throwError(() => error);
    })
  );
};
