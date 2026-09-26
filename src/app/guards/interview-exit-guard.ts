import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { map } from 'rxjs';

import { Interview } from '../pages/interview/interview';
import { ConfirmDialog } from '../shared/confirm-dialog/confirm-dialog';

export const interviewExitGuard: CanDeactivateFn<Interview> = (component) => {
  if (!component.shouldConfirmExit()) {
    return true;
  }

  const dialog = inject(MatDialog);

  const dialogRef = dialog.open(ConfirmDialog, {
    width: '420px',
    autoFocus: false,
    data: {
      title: 'Leave this interview?',
      message:
        "Your submitted answers are saved, but this question won't be. You can resume the interview later from My Interviews.",
      confirmLabel: 'Leave interview',
      cancelLabel: 'Stay',
    },
  });

  return dialogRef.afterClosed().pipe(map((confirmed) => confirmed === true));
};