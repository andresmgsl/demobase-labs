import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ReactiveComponentModule } from '@ngrx/component';
import { SharedModule } from '../shared/shared.module';
import { InstructionComponent } from './instruction.component';

@NgModule({
  declarations: [InstructionComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: InstructionComponent,
        pathMatch: 'full',
      },
    ]),
    ReactiveFormsModule,
    ReactiveComponentModule,
    SharedModule,
  ],
})
export class InstructionModule {}
