import { Component, HostBinding, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Application, DemobaseService } from '@demobase-labs/demobase-sdk';

@Component({
  selector: 'demobase-edit-application',
  template: `
    <h2 mat-dialog-title class="mat-primary">
      {{ data.application ? 'Edit' : 'Create' }} application
    </h2>

    <form
      [formGroup]="applicationGroup"
      class="flex flex-col gap-4"
      (ngSubmit)="onEditApplication()"
    >
      <mat-form-field
        class="w-full"
        appearance="fill"
        hintLabel="Enter the name."
      >
        <mat-label>Name</mat-label>
        <input
          matInput
          formControlName="name"
          required
          autocomplete="off"
          maxlength="32"
        />
        <mat-hint align="end">{{ nameControl.value?.length || 0 }}/32</mat-hint>

        <mat-error *ngIf="submitted && nameControl.errors?.required"
          >The name is mandatory.</mat-error
        >
        <mat-error *ngIf="submitted && nameControl.errors?.maxlength"
          >Maximum length is 32.</mat-error
        >
      </mat-form-field>

      <button
        mat-stroked-button
        color="primary"
        class="w-full"
        [disabled]="submitted && applicationGroup.invalid"
      >
        {{ data.application ? 'Save' : 'Create' }}
      </button>
    </form>

    <button
      mat-icon-button
      aria-label="Close edit application form"
      class="w-8 h-8 leading-none absolute top-0 right-0"
      mat-dialog-close
    >
      <mat-icon>close</mat-icon>
    </button>
  `,
})
export class EditApplicationComponent implements OnInit {
  @HostBinding('class') class = 'block w-72 relative';
  submitted = false;
  readonly applicationGroup = new FormGroup({
    name: new FormControl('', {
      validators: [Validators.required, Validators.maxLength(32)],
    }),
  });

  get nameControl() {
    return this.applicationGroup.get('name') as FormControl;
  }

  constructor(
    private readonly _demobaseService: DemobaseService,
    private readonly _matDialogRef: MatDialogRef<EditApplicationComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      application?: Application;
    }
  ) {}
  
  ngOnInit() {
    if (this.data.application) {
      this.applicationGroup.setValue(
        {
          name: this.data.application.data.name,
        },
        { emitEvent: false }
      );
    }
  }

  async onEditApplication() {
    this.submitted = true;
    this.applicationGroup.markAllAsTouched();

    if (this.applicationGroup.valid) {
      const application = this.data.application;

      if (application) {
        await this._demobaseService.updateApplication(
          application.id,
          this.nameControl.value
        );
      } else {
        await this._demobaseService.createApplication(
          this.nameControl.value
        );
      }
      this._matDialogRef.close();
    }
  }
}
