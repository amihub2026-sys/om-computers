import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class About {}

const processCards = document.querySelectorAll(".process-card");

const processObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, index) => {
    if(entry.isIntersecting){
      setTimeout(() => {
        entry.target.classList.add("show");
      }, index * 150);
    }
  });
}, {
  threshold: 0.2
});

processCards.forEach(card => {
  processObserver.observe(card);
});