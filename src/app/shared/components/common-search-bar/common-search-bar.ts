import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-common-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './common-search-bar.html',
  styleUrl: './common-search-bar.css'
})
export class CommonSearchBar {
  @Input() placeholder = 'Search...';
  @Input() value = '';

  @Output() valueChange = new EventEmitter<string>();

  onSearchChange(value: string) {
    this.valueChange.emit(value);
  }
}