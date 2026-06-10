import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Header } from '../header/header';
import { Footer } from '../footer/footer';

@Component({
  selector: 'app-website-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    Header,
    Footer
  ],
  templateUrl: './website-layout.html',
  styleUrl: './website-layout.css'
})
export class WebsiteLayout {}