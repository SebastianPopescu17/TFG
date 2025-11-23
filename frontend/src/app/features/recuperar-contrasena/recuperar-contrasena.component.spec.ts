import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecuperarContrasenaComponent } from './recuperar-contrasena.component';
import { provideHttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

describe('RecuperarContrasenaComponent', () => {
  let component: RecuperarContrasenaComponent;
  let fixture: ComponentFixture<RecuperarContrasenaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RecuperarContrasenaComponent,
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [
        provideHttpClient()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RecuperarContrasenaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
