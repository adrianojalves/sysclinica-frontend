import { Injectable } from '@angular/core';
import { BaseCrudService } from '../base-crud.service';
import { Role } from '../../models/users/role-model';

@Injectable({
  providedIn: 'root'
})
export class RoleService extends BaseCrudService<Role, number> {
  protected readonly endpoint = 'clinica/role';

}