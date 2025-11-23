import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmpresaDetailComponent } from './empresa-detail.component';
import { provideHttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

describe('EmpresaDetailComponent', () => {
  let component: EmpresaDetailComponent;
  let fixture: ComponentFixture<EmpresaDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        EmpresaDetailComponent,
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [
        provideHttpClient()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EmpresaDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
