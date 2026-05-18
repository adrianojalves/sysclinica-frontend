import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router'; // Injetar ActivatedRoute
import { SHARED_UI_IMPORTS } from '../../../shared/imports/shared-ui.imports';
import { UserService } from '../../../core/services/users/user.service';
import { RoleService } from '../../../core/services/users/role.service'; 
import { MessageService } from '../../../core/services/message.service';
import { PasswordModule } from 'primeng/password';
import { ListboxModule } from 'primeng/listbox';
import { Role } from '../../../core/models/users/role-model';
import { STATUS_OPTIONS } from '../../../shared/constants/ui.constants';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [...SHARED_UI_IMPORTS, PasswordModule, ListboxModule],
  templateUrl: './user-form.component.html'
})
export class UserFormComponent implements OnInit {
  private readonly loadingService = inject(LoadingService);
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly roleService = inject(RoleService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute); // Injected to read URL params

  public userForm!: FormGroup;
  public isSubmitting = signal<boolean>(false);
  public roles = signal<Role[]>([]);
  public userId = signal<number | null>(null); // State to know if it's Edit mode

  public statusOptions = STATUS_OPTIONS;

  ngOnInit(): void {
    this.initForm();
    this.loadRoles();
    this.checkEditMode(); // New check
  }

  /**
   * Checks if there's an ID in the URL to enable Edit Mode.
   */
  private checkEditMode(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.userId.set(Number(id));
      this.loadUserToEdit(this.userId()!);
    }
  }

  /**
   * Fetches user data and patches the form.
   */
  private loadUserToEdit(id: number): void {
    this.userService.findById(id).subscribe({
      next: (user) => {
        this.userForm.patchValue({
          name: user.name,
          login: user.login,
          email: user.email,
          phone: user.phone,
          active: user.active,
          percentualDesconto: user.percentualDesconto,
          roleIds: user.roles?.map(r => r.id) || []
        });
        
        // Password is not required when editing
        this.userForm.get('password')?.clearValidators();
        this.userForm.get('password')?.updateValueAndValidity();
      },
      error: () => this.messageService.show('error', 'Erro', 'Falha ao carregar dados do usuário.')
    });
  }

  private loadRoles(): void {
    this.roleService.findAll().subscribe({
      next: (data) => {
        const formattedRoles = data.map(role => ({
          ...role,
          name: role.name.replace('ROLE_', '')
        }));
        this.roles.set(formattedRoles);
      }
    });
  }

  private initForm(): void {
    this.userForm = this.fb.group({
      name: ['', [Validators.required]],
      login: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      percentualDesconto: [0],
      roleIds: [[], [Validators.required]],
      active: [true]
    });
  }

  public onSubmit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.loadingService.show();
    
    const payload = { ...this.userForm.value };

    if (this.userId() && !payload.password) {
      payload.password = null;
    }

    const request$ = this.userId() 
      ? this.userService.update(this.userId()!, payload)
      : this.userService.save(payload);

    request$.subscribe({
      next: () => {
        this.loadingService.hide();
        this.messageService.show('success', 'Sucesso', `Usuário ${this.userId() ? 'atualizado' : 'cadastrado'} com sucesso!`);
        this.router.navigate(['/users']);
      },
      error: (err) => {
        this.loadingService.hide();
        
        if (err.status === 400 && err.error) {
          
          if (Array.isArray(err.error)) {
            err.error.forEach((erroDaApi: any) => {
              this.messageService.show('error', 'Atenção', erroDaApi.message);
            });
          } 
          else if (err.error.message) {
            this.messageService.show('error', 'Atenção', err.error.message);
          }

        } else {
          this.messageService.show('error', 'Erro', 'Não foi possível processar a requisição. Tente novamente.');
        }
      }
    });
  }

  public cancel(): void {
    this.router.navigate(['/users']);
  }
}