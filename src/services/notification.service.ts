import { Injectable } from '@angular/core';
import { signal } from '@angular/core';

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  notifications = signal<Notification[]>([]);

  show(
    message: string,
    type: 'success' | 'error' | 'info' | 'warning' = 'info',
    duration: number = 4000,
  ): void {
    const id = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const notification: Notification = { id, message, type, duration };

    this.notifications.update((notifs) => [...notifs, notification]);

    // Auto-remove notification after duration
    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }
  }

  success(message: string, duration: number = 4000): void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration: number = 6000): void {
    this.show(message, 'error', duration);
  }

  info(message: string, duration: number = 4000): void {
    this.show(message, 'info', duration);
  }

  warning(message: string, duration: number = 5000): void {
    this.show(message, 'warning', duration);
  }

  remove(id: string): void {
    this.notifications.update((notifs) => notifs.filter((n) => n.id !== id));
  }

  clear(): void {
    this.notifications.set([]);
  }
}
