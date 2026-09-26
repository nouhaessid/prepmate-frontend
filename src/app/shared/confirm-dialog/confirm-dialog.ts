import { Component, inject } from '@angular/core';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <div class="confirm-dialog">
      <h2 class="confirm-dialog__title">{{ data.title }}</h2>
      <p class="confirm-dialog__message">{{ data.message }}</p>

      <div class="confirm-dialog__actions">
        <button
          type="button"
          mat-stroked-button
          class="pm-button-secondary !py-1"
          (click)="dialogRef.close(false)"
        >
          {{ data.cancelLabel ?? 'Cancel' }}
        </button>
        <button
          type="button"
          mat-flat-button
          class="confirm-dialog__confirm !py-1"
          (click)="dialogRef.close(true)"
        >
          {{ data.confirmLabel ?? 'Confirm' }}
        </button>
      </div>
    </div>
  `,
  styleUrl: './confirm-dialog.scss',
})
export class ConfirmDialog {
  protected readonly dialogRef = inject(MatDialogRef<ConfirmDialog>);
  protected readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
}