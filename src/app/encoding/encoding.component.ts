import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-encoding',
  templateUrl: './encoding.component.html',
  styleUrls: ['./encoding.component.css']
})
export class EncodingComponent {
  inputText: string = '';
  encodedText: string = '';
  isEncoding: boolean = false;
  private eventSource: EventSource | null = null;

  constructor(private http: HttpClient) {}

  startEncoding() {
    this.isEncoding = true;
    this.encodedText = '';

    const url = 'https://localhost:32769/encode';
    const body = { input: this.inputText };

    this.http.post(url, body, { responseType: 'text' }).subscribe({
      next: () => {
        this.eventSource = new EventSource(url);
        this.eventSource.onmessage = (event) => {
          this.encodedText += event.data;
        };
        this.eventSource.onerror = (error) => {
          console.error('EventSource error:', error);
          this.isEncoding = false;
          this.eventSource?.close();
        };
      },
      error: (error) => {
        console.error('Error starting encoding:', error);
        this.isEncoding = false;
        this.encodedText = 'Error occurred while starting encoding.';
      }
    });
  }

  cancelEncoding() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.isEncoding = false;
    this.encodedText += ' (cancelled)';
  }
}
