import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-legal-footer',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './legal-footer.component.html',
  styleUrls: ['./legal-footer.component.css']
})
export class LegalFooterComponent {
  showLegal = false;
  showOpenSource = false;
}
