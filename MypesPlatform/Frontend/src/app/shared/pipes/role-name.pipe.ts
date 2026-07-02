import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'roleName',
  standalone: true,
})
export class RoleNamePipe implements PipeTransform {
  transform(value: string): string {
    const map: Record<string, string> = {
      ROLE_ADMIN: 'Dueño de tienda',
      ADMIN: 'Dueño de tienda',
      ROLE_CLIENTE: 'Cliente',
      CLIENTE: 'Cliente',
    };
    return map[value] || value;
  }
}
