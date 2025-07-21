import { AfterViewInit, ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FlowbiteService } from '../flowbite.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
@Component({
  selector: 'app-root',
  imports: [RouterModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent implements OnInit, AfterViewInit {
  title = 'app-JWT-Auth-Frontend';
  isDarkMode = false; // Estado del modo oscuro

  constructor(
    private flowbiteService: FlowbiteService,
    @Inject(PLATFORM_ID) private platformId: object,
    public router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  // Usamos async/await para asegurar que el flujo sea correcto
  async ngOnInit(): Promise<void> {
    // Primero, gestionamos el estado del modo oscuro, antes de cualquier otra cosa
    if (isPlatformBrowser(this.platformId)) {
      // Verificar el estado del tema en localStorage o el tema preferido del sistema
      this.isDarkMode =
        localStorage.getItem('theme') === 'dark' ||
        (!('theme' in localStorage) &&
          window.matchMedia('(prefers-color-scheme: dark)').matches);
      this.updateTheme(); // Aplicar el tema si ya se sabe el estado
    }

    // Cargar Flowbite solo cuando se necesite
    await this.flowbiteService.loadFlowbite();
  }

  ngAfterViewInit(): void {
    // Forzamos la detección de cambios después de la renderización de la vista
    this.cdr.detectChanges();
  }

  // Método para cambiar el tema (oscuro/claro)
  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode; // Alternamos el estado del tema
    const html = document.documentElement;

    // Cambiamos la clase en el HTML según el estado del tema
    if (this.isDarkMode) {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }

  // Método para actualizar el tema en el DOM
  updateTheme(): void {
    if (isPlatformBrowser(this.platformId)) {
      document.documentElement.classList.toggle('dark', this.isDarkMode); // Aplicamos el tema al documento
    }
  }
}
