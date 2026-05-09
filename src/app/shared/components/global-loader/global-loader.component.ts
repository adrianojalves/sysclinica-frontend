import { Component, inject } from '@angular/core';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
  selector: 'app-global-loader',
  standalone: true,
  template: `
    @if (loadingService.isLoading()) {
      <div class="fixed inset-0 z-[9999] flex items-center justify-center bg-cinza-chumbo/40 backdrop-blur-sm transition-all duration-300">
        <div class="flex flex-col items-center justify-center bg-branco-puro px-10 py-8 rounded-2xl shadow-2xl border border-cinza-contorno">
          
          <div class="relative w-20 h-20 flex items-center justify-center">
            <div class="absolute inset-0 rounded-full border-[5px] border-fundo-offwhite"></div>
            
            <div class="absolute inset-0 rounded-full border-[5px] border-azul-prisma border-t-verde-teal animate-spin"></div>
            
            <i class="pi pi-hourglass text-azul-prisma text-2xl animate-pulse"></i>
          </div>
          
          <span class="mt-6 text-xl font-bold text-azul-prisma">Processando...</span>
          <span class="mt-1 text-base text-cinza-medio font-medium">Por favor, aguarde</span>
        </div>
      </div>
    }
  `
})
export class GlobalLoaderComponent {
  public readonly loadingService = inject(LoadingService);
}