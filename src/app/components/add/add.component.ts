import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { NgClass } from '@angular/common';
import { DataService } from '../../services/data.service';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { FormioModule } from '@formio/angular';
import { Formio } from 'formiojs';
@Component({
  selector: 'app-add',
  standalone: true,
  imports: [
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    NgClass,
    PdfViewerModule,
    FormioModule,
  ],
  templateUrl: './add.component.html',
  styleUrl: './add.component.css',
})
export class AddComponent implements AfterViewInit {
  constructor(private data: DataService) {}
  clicked: boolean = false;
  url!: string;
  showfields: boolean = false;
  ngOnInit() {
    this.getpdfdata();
  }
  allfields = [
    { icon: 'fa fa-font', name: 'TextArea' },
    { icon: 'fa fa-circle', name: 'Radio Button' },
    { icon: 'fa fa-phone-square', name: 'Phone Number' },
    { icon: 'fa fa-check-square', name: 'Checkbox' },
    { icon: 'fa fa-envelope', name: 'Input' }, // Add this line for Input
  ];
  field() {
    this.clicked = true;
    this.showfields = !this.showfields;
  }
  getpdfdata() {
    this.url = this.data.getpdf();
  }

  @ViewChild('iframeElement', { static: true }) iframeElement!: ElementRef;

  ngAfterViewInit() {
    const iframe = this.iframeElement.nativeElement;

    // Wait for the iframe to load
    iframe.onload = () => {
      const iframeDocument =
        iframe.contentDocument || iframe.contentWindow.document;
      const watermark = iframeDocument.querySelector('.stl_01');
      if (watermark) {
        watermark.style.display = 'none';
      }

      // Allow drop functionality inside the iframe
      iframeDocument.body.addEventListener('dragover', (event: DragEvent) => {
        event.preventDefault(); // Allow drop
        event.dataTransfer!.dropEffect = 'copy'; // Indicate a copy operation
      });

      iframeDocument.body.addEventListener('drop', (event: DragEvent) => {
        event.preventDefault(); // Prevent default handling
        this.onDrop(event, iframeDocument); // Call the onDrop method
      });
    };

    this.initializeForm();
  }

  initializeForm() {
    const formDefinition = {
      components: [],
    };

    Formio.createForm(document.getElementById('formioDiv')!, formDefinition)
      .then((form) => {})
      .catch((err) => {
        console.error('Error initializing Form.io:', err);
      });
  }

  onDragStart(event: DragEvent, elementType: string) {
    event.dataTransfer?.setData('text/plain', elementType);
    event.dataTransfer!.dropEffect = 'copy';
  }
  onDrop(event: DragEvent, iframeDocument: Document) {
    const draggedElementData = event.dataTransfer?.getData('text/plain');
    console.log(`Dropped: ${draggedElementData}`);

    const iframeRect = this.iframeElement.nativeElement.getBoundingClientRect();

    const iframeScrollX =
      iframeDocument.documentElement.scrollLeft ||
      iframeDocument.body.scrollLeft;
    const iframeScrollY =
      iframeDocument.documentElement.scrollTop || iframeDocument.body.scrollTop;

    const scaleX =
      iframeDocument.documentElement.clientWidth /
      this.iframeElement.nativeElement.offsetWidth;
    const scaleY =
      iframeDocument.documentElement.clientHeight /
      this.iframeElement.nativeElement.offsetHeight;

    const x = (event.clientX - iframeRect.left + iframeScrollX) / scaleX;
    const y = (event.clientY - iframeRect.top + iframeScrollY) / scaleY;

    console.log(`Calculated Position - X: ${x}, Y: ${y}`);

    // Create a new input box based on the dragged element type
    if (draggedElementData) {
      this.createDraggableInput(iframeDocument, draggedElementData, x, y);
    }
  }

  createDraggableInput(
    iframeDocument: Document,
    type: string,
    x: number,
    y: number
  ) {
    const container = iframeDocument.createElement('div'); // Create a container for each input
    container.style.position = 'absolute';
    container.style.left = `${x}px`;
    container.style.top = `${y}px`;
    container.style.width = '150px';
    container.style.height = 'auto';

    container.setAttribute('draggable', 'true');
    container.id = `input-container-${Date.now()}`;

    let inputElement: HTMLElement;

    switch (type) {
      case 'Phone Number':
        const phoneInput = iframeDocument.createElement(
          'input'
        ) as HTMLInputElement;
        phoneInput.setAttribute('type', 'tel');
        phoneInput.placeholder = 'Phone Number'; // Use the placeholder property
        container.appendChild(phoneInput); // Append input to the container
        break;

      case 'TextArea':
        const textAreaInput = iframeDocument.createElement(
          'textarea'
        ) as HTMLTextAreaElement;
        textAreaInput.placeholder = 'Enter text...'; // Use the placeholder property
        container.appendChild(textAreaInput); // Append textarea to the container
        break;

      case 'Checkbox':
        const checkboxInput = iframeDocument.createElement(
          'input'
        ) as HTMLInputElement;
        checkboxInput.setAttribute('type', 'checkbox');

        const checkboxLabelInput = iframeDocument.createElement(
          'input'
        ) as HTMLInputElement;
        checkboxLabelInput.setAttribute('type', 'text');
        checkboxLabelInput.setAttribute('placeholder', 'Enter label...');

        // Append checkbox and label input to the container
        container.appendChild(checkboxInput);
        container.appendChild(checkboxLabelInput);

        // Event listener for the checkbox label
        checkboxLabelInput.addEventListener(
          'keydown',
          (event: KeyboardEvent) => {
            if (event.key === 'Enter') {
              const label = iframeDocument.createElement('label');
              label.textContent = checkboxLabelInput.value;
              container.replaceChild(label, checkboxLabelInput);
            }
          }
        );
        break;

      case 'Radio Button':
        const radioInput = iframeDocument.createElement(
          'input'
        ) as HTMLInputElement;
        radioInput.setAttribute('type', 'radio');
        radioInput.setAttribute('name', `radioGroup-${Date.now()}`);

        const radioLabelInput = iframeDocument.createElement(
          'input'
        ) as HTMLInputElement;
        radioLabelInput.setAttribute('type', 'text');
        radioLabelInput.setAttribute('placeholder', 'Enter option...');

        // Append radio button and label input to the container
        container.appendChild(radioInput);
        container.appendChild(radioLabelInput);

        // Event listener for the radio button label
        radioLabelInput.addEventListener('keydown', (event: KeyboardEvent) => {
          if (event.key === 'Enter') {
            const label = iframeDocument.createElement('label');
            label.textContent = radioLabelInput.value;
            container.replaceChild(label, radioLabelInput);
          }
        });
        break;

      case 'Input':
        const anyInput = iframeDocument.createElement(
          'input'
        ) as HTMLInputElement;
        anyInput.setAttribute('type', 'Input');
        anyInput.placeholder = 'Enter Input...'; // Use the placeholder property
        container.appendChild(anyInput); // Append anyInput input to the container
        break;

      default:
        console.error('Unknown input type:', type);
        return;
    }

    // Append the container to the iframe document body
    iframeDocument.body.appendChild(container);
    this.makeElementDraggable(container, iframeDocument); // Make the entire container draggable
  }

  makeElementDraggable(element: HTMLElement, iframeDocument: Document) {
    let offsetX = 0;
    let offsetY = 0;

    element.addEventListener('dragstart', (event: DragEvent) => {
      offsetX = event.offsetX;
      offsetY = event.offsetY;
      event.dataTransfer?.setData('text/plain', element.id);
    });

    iframeDocument.body.addEventListener('dragover', (event: DragEvent) => {
      event.preventDefault(); // Allow drop
    });

    iframeDocument.body.addEventListener('drop', (event: DragEvent) => {
      event.preventDefault();
      const elementId = event.dataTransfer?.getData('text/plain');
      const draggedElement = iframeDocument.getElementById(elementId!);

      if (draggedElement) {
        const x = event.clientX - offsetX;
        const y = event.clientY - offsetY;

        draggedElement.style.left = `${x}px`;
        draggedElement.style.top = `${y}px`;
      }
    });
  }
}
