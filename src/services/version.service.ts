import { Injectable, signal } from '@angular/core';

export interface Version {
  buildDate: string;
  buildTimestamp: number;
}

@Injectable({
  providedIn: 'root',
})
export class VersionService {
  buildDate = signal('');
  isLoading = signal(true);

  constructor() {
    this.loadVersion();
  }

  private loadVersion(): void {
    fetch('/assets/version.json')
      .then((response) => response.json())
      .then((data: Version) => {
        this.buildDate.set(data.buildDate);
      })
      .catch((error) => {
        console.error('Failed to load version:', error);
        // Fallback to current date
        this.buildDate.set(this.formatDate(new Date()));
      })
      .finally(() => {
        this.isLoading.set(false);
      });
  }

  private formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }
}
