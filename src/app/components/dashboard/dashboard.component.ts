import { Component,inject} from '@angular/core';
import {
  MatDialog,
  
} from '@angular/material/dialog';
import { DialogComponent } from '../dialog/dialog.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  readonly dialog = inject(MatDialog);

  openDialog() {
    this.dialog.open(DialogComponent,{
      maxWidth:"80vw",
      width:"100%",
    })
  }
}
