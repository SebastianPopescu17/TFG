import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-dialogo-ayuda',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './dialogo-ayuda.component.html',
  styleUrls: ['./dialogo-ayuda.component.css']
})
export class DialogoAyudaComponent {}
