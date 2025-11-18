import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Api } from '../../../core/services/api.service';
import { Noticia } from '../../../core/models/noticia';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-noticias-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatListModule],
  templateUrl: './noticias-list.component.html',
  styleUrls: ['./noticias-list.component.css']
})
export class NoticiasListComponent implements OnInit {
  noticias: Noticia[] = [];

  constructor(private api: Api) {}

  ngOnInit(): void {
    this.api.getNoticias().subscribe({
      next: (data: Noticia[]) => this.noticias = data,
      error: (err: unknown) => console.error('Error cargando noticias', err)
    });
  }
}
