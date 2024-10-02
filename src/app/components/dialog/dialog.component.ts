import { NgClass, NgStyle } from '@angular/common';
import { Component, ViewChild, ElementRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Router } from '@angular/router';
import { DataService } from '../../services/data.service';
@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatButtonModule,
    NgClass,
    MatProgressBarModule,
    NgStyle,
  ],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.css',
})
export class DialogComponent {
  constructor(
    private router: Router,
    private dialogRef: MatDialogRef<DialogComponent>,
    private data: DataService
  ) {}
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;
  fileselected: boolean = false;
  progress: string = '0';
  showloader: boolean = false;
  openFileInput() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    const reader = new FileReader();

    if (file) {
      this.fileselected = true;
      reader.readAsDataURL(file);
      reader.onload = (e: any) => {
        this.data.addpdf(e.target.result);
      };
      console.log('Selected file:', file);
    }
    const arr = ['10', '30', '50', '60', '80', '100'];
    let i = 0;
    const interval = setInterval(() => {
      if (i > 5) {
        this.dialogRef.close();
        this.router.navigate(['/add']);

        clearInterval(interval);
      } else {
        this.progress = arr[i];
        i = i + 1;
      }
    }, 200);
  }
}
