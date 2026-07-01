import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthResponse, LoginRequest } from '../models/auth.model';
import { Observable, finalize, shareReplay, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  
  private readonly API_URL = `${environment.apiUrl}/auth`;
  private readonly TOKEN_KEY = 'sysclinica-token';
  private readonly ROLES_KEY = 'sysclinica-roles';

  /**
   * Caches the in-flight refresh call so concurrent 401s share a single
   * POST /auth/refresh instead of racing each other. The backend rotates
   * the refresh cookie on every call, so parallel calls would invalidate
   * one another and force an unwanted logout.
   */
  private refreshInProgress$: Observable<AuthResponse> | null = null;

  isAuthenticated = signal<boolean>(this.hasToken());
  
  // Signal now holds an array of strings
  userRoles = signal<string[]>(this.getStoredRoles());

  /** Reactive computed signals for role checks — use these in templates instead of hasAnyRole() */
  readonly isAdmin = computed(() => this.userRoles().includes('ROLE_ADMIN'));
  readonly isCadastros = computed(() => this.userRoles().includes('ROLE_CADASTROS'));
  readonly isAtendimento = computed(() => this.userRoles().includes('ROLE_ATENDIMENTO'));

  login(credentials: LoginRequest) {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials, {
      withCredentials: true 
    }).pipe(
      tap(response => {
        localStorage.setItem(this.TOKEN_KEY, response.accessToken);
        
        // If the backend sent roles, stringify the array and save it
        if (response.roles && response.roles.length > 0) {
          localStorage.setItem(this.ROLES_KEY, JSON.stringify(response.roles));
          this.userRoles.set(response.roles);
        }
        
        this.isAuthenticated.set(true);
      })
    );
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.ROLES_KEY);
    this.isAuthenticated.set(false);
    this.userRoles.set([]);
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Helper to safely parse the array from localStorage
  private getStoredRoles(): string[] {
    const rolesStr = localStorage.getItem(this.ROLES_KEY);
    if (rolesStr) {
      try {
        return JSON.parse(rolesStr);
      } catch (e) {
        return [];
      }
    }
    return [];
  }

  /**
   * Checks if ANY of the user's multiple roles match the allowed roles
   */
  hasAnyRole(allowedRoles: string[]): boolean {
    const currentRoles = this.userRoles();
    if (!currentRoles || currentRoles.length === 0) return false;
    
    // Returns true if the user has at least one role that is in the allowedRoles list
    return currentRoles.some(role => allowedRoles.includes(role));
  }

  refreshToken(): Observable<AuthResponse> {
    if (!this.refreshInProgress$) {
      this.refreshInProgress$ = this.http.post<AuthResponse>(`${environment.apiUrl}/auth/refresh`, {}, {
        withCredentials: true
      }).pipe(
        tap(response => {
          localStorage.setItem(this.TOKEN_KEY, response.accessToken);
          this.isAuthenticated.set(true);
        }),
        shareReplay(1),
        finalize(() => { this.refreshInProgress$ = null; })
      );
    }
    return this.refreshInProgress$;
  }
}