import { ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { RepositoryFacade } from '@pimp-my-pr/pmp-web/repository/data-access';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatSnackBar } from '@angular/material';
import { TimeUnit } from '@pimp-my-pr/shared/domain';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { AddEditRepositoryDialogData, Repository } from '@pimp-my-pr/pmp-web/repository/domain';

@Component({
  selector: 'pmp-add-repository-dialog',
  templateUrl: './add-edit-repository-dialog.component.html',
  styleUrls: ['./add-edit-repository-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddEditRepositoryDialogComponent implements OnInit, OnDestroy {
  dialogTitle: string;
  form: FormGroup;
  isEditMode: boolean;
  maxWaitingTimeFormControl: FormControl;
  repositoryToEdit: Repository;
  submitMsg: string;
  timeUnitFormControl: FormControl;
  TimeUnit = TimeUnit;

  constructor(
    @Inject(MAT_DIALOG_DATA) data: AddEditRepositoryDialogData,
    private repoFacade: RepositoryFacade,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddEditRepositoryDialogComponent>,
    private snackBar: MatSnackBar
  ) {
    if (!!data) {
      this.dialogTitle = data.dialogTitle;
      this.isEditMode = data.isEditMode;
      this.repositoryToEdit = data.repositoryToEdit;
      this.submitMsg = data.submitMsg;
    }
  }

  ngOnDestroy(): void {}

  ngOnInit(): void {
    this.initForm();
    this.initializeMaxWaitingTimeDefinitionControls();
  }

  initForm(): void {
    this.form = this.fb.group({
      repositoryUrl: ['', this.isEditMode ? null : Validators.required],
      maxLines: [this.repositoryToEdit ? this.repositoryToEdit.maxLines : null],
      maxWaitingTimeDefinition: this.fb.group({
        maxWaitingTime: [this.repositoryToEdit ? this.repositoryToEdit.maxWaitingTime : ''],
        timeUnit: [{ value: '' }]
      })
    });
    this.form
      .get('maxWaitingTimeDefinition')
      .get('timeUnit')
      .setValue(TimeUnit.Hour);
  }

  initializeMaxWaitingTimeDefinitionControls(): void {
    this.maxWaitingTimeFormControl = (this.form.controls.maxWaitingTimeDefinition as FormGroup)
      .controls.maxWaitingTime as FormControl;
    this.timeUnitFormControl = (this.form.controls.maxWaitingTimeDefinition as FormGroup).controls
      .timeUnit as FormControl;

    this.maxWaitingTimeFormControl.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(this.updateTimeUnitValidation);
  }

  submit(): void {
    if (this.form.valid) {
      const { repositoryUrl, maxLines } = this.form.value;
      const maxWaitingTime = this.maxWaitingTimeFormControl.value
        ? this.maxWaitingTimeFormControl.value * this.timeUnitFormControl.value
        : null;
      if (this.isEditMode) {
        this.editRepository(maxLines, maxWaitingTime);
      } else {
        this.addRepository(repositoryUrl, maxLines, maxWaitingTime);
      }
    }
  }

  updateTimeUnitValidation = (maxWaitingTime: number) => {
    if (maxWaitingTime && maxWaitingTime > 0) {
      this.timeUnitFormControl.setValidators(Validators.required);
      this.timeUnitFormControl.markAsTouched();
      this.timeUnitFormControl.enable();
    } else {
      this.timeUnitFormControl.markAsUntouched();
      this.timeUnitFormControl.disable();
      this.timeUnitFormControl.clearValidators();
    }

    this.timeUnitFormControl.updateValueAndValidity();
  };

  private addRepository(repositoryUrl: string, maxLines: number, maxWaitingTime: number): void {
    this.repoFacade
      .addRepository({
        repositoryUrl,
        maxLines,
        maxWaitingTime
      })
      .subscribe(
        () => {
          // TODO: move to separate lib with service e.g SnackbarService
          this.snackBar.open('Repository has been added', '', {
            duration: 2000
          });
          this.dialogRef.close();
        },
        error => {
          // TODO: move to separate lib with service e.g SnackbarService
          this.snackBar.open('Something went wrong. Repository was not added', '', {
            duration: 2000
          });
        }
      );
  }

  private editRepository(maxLines: number, maxWaitingTime: number): void {
    this.repoFacade
      .editRepository({
        repositoryId: this.repositoryToEdit.id,
        maxLines,
        maxWaitingTime
      })
      .subscribe(
        () => {
          // TODO: move to separate lib with service e.g SnackbarService
          this.snackBar.open('Repository has been updated', '', {
            duration: 2000
          });
          this.dialogRef.close();
        },
        error => {
          // TODO: move to separate lib with service e.g SnackbarService
          this.snackBar.open('Something went wrong. Repository was not updated', '', {
            duration: 2000
          });
        }
      );
  }
}
