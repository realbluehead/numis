import { Injectable, signal } from '@angular/core';

export interface ConfirmDialog {
  id: string;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  isDangerous?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  pendingDialog = signal<ConfirmDialog | null>(null);
  private dialogResolve: ((result: boolean) => void) | null = null;

  confirm(title: string, message: string, confirmText: string = 'Confirmar', cancelText: string = 'Cancelar', isDangerous: boolean = false): Promise<boolean> {
    return new Promise((resolve) => {
      this.dialogResolve = resolve;
      const id = `dialog-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      this.pendingDialog.set({
        id,
        title,
        message,
        confirmText,
        cancelText,
        isDangerous,
      });
    });
  }

  resolve(result: boolean): void {
    if (this.dialogResolve) {
      this.dialogResolve(result);
      this.dialogResolve = null;
    }
    this.pendingDialog.set(null);
  }

  cancel(): void {
    this.resolve(false);
  }

  confirm_action(): void {
    this.resolve(true);
  }
}
