import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar implements OnInit {
  isLoggedIn$: Observable<boolean>;
  isAdmin = false;

  constructor(
    public authService: AuthService,
    private router: Router
  ) {
    this.isLoggedIn$ = this.authService.isLoggedIn$;
  }

  ngOnInit(): void {
    this.isLoggedIn$.subscribe(() => {
      this.isAdmin = this.authService.isAdmin();
    });
    this.isAdmin = this.authService.isAdmin();
  }

  logout(): void {
    this.authService.logout();
  }
}
