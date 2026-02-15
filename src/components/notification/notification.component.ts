import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      @for (notification of notificationService.notifications(); track notification.id) {
        <div
          [ngClass]="{
            'bg-green-600': notification.type === 'success',
            'bg-red-600': notification.type === 'error',
            'bg-blue-600': notification.type === 'info',
            'bg-yellow-600': notification.type === 'warning',
          }"
          class="text-white px-4 py-3 rounded shadow-lg flex items-start gap-2 animate-slide-in"
        >
          <span class="text-lg flex-shrink-0">
            @switch (notification.type) {
              @case ('success') {
                ✓
              }
              @case ('error') {
                ✕
              }
              @case ('info') {
                ⓘ
              }
              @case ('warning') {
                ⚠
              }
            }
          </span>
          <div class="flex-1">
            <p class="text-sm break-words">{{ notification.message }}</p>
          </div>
          <button
            (click)="notificationService.remove(notification.id)"
            class="text-lg flex-shrink-0 hover:opacity-80"
          >
            ✕
          </button>
        </div>
      }
    </div>
  `,
  styles: `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    :host ::ng-deep .animate-slide-in {
      animation: slideIn 0.3s ease-out;
    }
  `,
})
export class NotificationComponent {
  notificationService = inject(NotificationService);
}
