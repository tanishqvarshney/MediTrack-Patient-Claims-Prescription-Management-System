import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SearchService {
  query = signal<string>('');

  updateQuery(q: string) {
    this.query.set(q);
  }
}
