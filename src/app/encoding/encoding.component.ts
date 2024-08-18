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
  private encodingId: string | null = null;

  constructor(private http: HttpClient) {}

  startEncoding() {
    this.isEncoding = true;
    this.encodedText = '';

    const url = 'https://localhost:32769/encode'; //https://localhost:32769/encode
    const body = { input: this.inputText };

    this.http.post<{encodingId: string}>(url, body).subscribe({
      next: (response) => {
        this.encodingId = response.encodingId;
        const streamUrl = `${url}/${response.encodingId}`;
        this.eventSource = new EventSource(streamUrl);
        
        this.eventSource.onmessage = (event) => {
          this.encodedText += event.data;
          if (event.data.includes('Encoding cancelled') || event.data.includes('An error occurred')) {
            this.isEncoding = false;
            this.eventSource?.close();
          }
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

  //Cancellation function 
  cancelEncoding() {
    if (this.encodingId) {
      const cancelUrl = `https://localhost:32769/encode/${this.encodingId}/cancel`;
      this.http.post(cancelUrl, {}).subscribe({
        next: () => {
          console.log('Cancellation request sent');
        },
        error: (error) => {
          console.error('Error cancelling encoding:', error);
        }
      });
    }

    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    this.isEncoding = false;
    this.encodedText += ' (cancellation requested)';
  }

}
