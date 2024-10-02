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
    { icon: 'fa fa-envelope', name: 'Input' },
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

    iframe.onload = () => {
      const iframeDocument =
        iframe.contentDocument || iframe.contentWindow.document;
      const watermark = iframeDocument.querySelector('.stl_01');
      if (watermark) {
        watermark.style.display = 'none';
      }

      iframeDocument.body.addEventListener('dragover', (event: DragEvent) => {
        event.preventDefault();
        event.dataTransfer!.dropEffect = 'copy';
      });

      iframeDocument.body.addEventListener('drop', (event: DragEvent) => {
        event.preventDefault();
        this.onDrop(event, iframeDocument);
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
    event.dataTransfer?.setData('text/plain', 'new:' + elementType);
    event.dataTransfer!.dropEffect = 'copy';
  }

  onDrop(event: DragEvent, iframeDocument: Document) {
    event.preventDefault();
    const data = event.dataTransfer?.getData('text/plain');
    if (!data) return;

    const rect = iframeDocument.body.getBoundingClientRect();
    const scrollLeft =
      iframeDocument.documentElement.scrollLeft ||
      iframeDocument.body.scrollLeft;
    const scrollTop =
      iframeDocument.documentElement.scrollTop || iframeDocument.body.scrollTop;

    const x = event.clientX - rect.left + scrollLeft;
    const y = event.clientY - rect.top + scrollTop;

    if (data.startsWith('new:')) {
      const type = data.substring(4); // Remove 'new:' prefix
      this.createDraggableInput(iframeDocument, type, x, y);
    } else {
      // This is an existing element being moved
      const draggedElement = iframeDocument.getElementById(data);
      if (draggedElement) {
        draggedElement.style.left = `${x}px`;
        draggedElement.style.top = `${y}px`;
      }
    }
  }

  createDraggableInput(
    iframeDocument: Document,
    type: string,
    x: number,
    y: number
  ) {
    const container = iframeDocument.createElement('div');
    container.style.position = 'absolute';
    container.style.left = `${x}px`;
    container.style.top = `${y}px`;
    container.style.width = '150px';
    container.style.height = 'auto';
    container.setAttribute('draggable', 'true');
    container.id = `input-container-${Date.now()}`;

    switch (type) {
      case 'Phone Number':
        const phoneInput = iframeDocument.createElement(
          'input'
        ) as HTMLInputElement;
        phoneInput.setAttribute('type', 'tel');
        phoneInput.placeholder = 'Phone Number';
        container.appendChild(phoneInput);
        break;

      case 'TextArea':
        const textAreaInput = iframeDocument.createElement(
          'textarea'
        ) as HTMLTextAreaElement;
        textAreaInput.placeholder = 'Enter text...';
        container.appendChild(textAreaInput);
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
        container.appendChild(checkboxInput);
        container.appendChild(checkboxLabelInput);
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
        container.appendChild(radioInput);
        container.appendChild(radioLabelInput);
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
        anyInput.setAttribute('type', 'text');
        anyInput.placeholder = 'Enter Input...';
        container.appendChild(anyInput);
        break;

      default:
        console.error('Unknown input type:', type);
        return;
    }

    iframeDocument.body.appendChild(container);
    this.makeElementDraggable(container, iframeDocument);
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
      event.preventDefault();
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
