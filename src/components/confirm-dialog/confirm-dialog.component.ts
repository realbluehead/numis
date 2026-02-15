import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogService } from '../../services/dialog.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (dialogService.pendingDialog(); as dialog) {
      <!-- Backdrop -->
      <div
        class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
        (click)="dialogService.cancel()"
      >
        <!-- Dialog -->
        <div
          class="bg-amazon-card border border-amazon-border rounded-lg shadow-lg max-w-md w-full mx-4"
          (click)="$event.stopPropagation()"
        >
          <!-- Header -->
          <div
            [ngClass]="{ 'bg-amazon-danger/10': dialog.isDangerous, 'bg-amazon-card': !dialog.isDangerous }"
            class="px-6 py-4 border-b border-amazon-border"
          >
            <h2 class="text-lg font-semibold text-amazon-textLight">
              {{ dialog.title }}
            </h2>
          </div>

          <!-- Body -->
          <div class="px-6 py-4">
            <p class="text-sm text-amazon-text">
              {{ dialog.message }}
            </p>
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 border-t border-amazon-border flex justify-end gap-2">
            <button
              (click)="dialogService.cancel()"
              class="btn-sm btn-secondary"
            >
              {{ dialog.cancelText }}
            </button>
            <button
              (click)="dialogService.confirm_action()"
              [ngClass]="{ 'bg-amazon-danger hover:bg-red-700': dialog.isDangerous }"
              class="btn-sm"
              [class.btn-primary]="!dialog.isDangerous"
            >
              {{ dialog.confirmText }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class ConfirmDialogComponent {
  dialogService = inject(DialogService);
}
