import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe reutilizable para filtrar arrays por un término de búsqueda.
 * Usa genéricos para preservar el tipo del array de entrada.
 *
 * Uso:
 *   items | filtrar : terminoBusqueda
 *   items | filtrar : terminoBusqueda : ['nombre', 'direccion']
 */
@Pipe({
  name: 'filtrar',
  standalone: true
})
export class FiltrarPipe implements PipeTransform {

  transform<T extends object>(
    items: T[],
    termino: string,
    campos?: (keyof T)[]
  ): T[] {

    if (!termino || termino.trim() === '') {
      return items;
    }

    const busqueda = termino.toLowerCase().trim();

    return items.filter(item => {
      // Si se especifican campos, busca solo en esos
      if (campos && campos.length > 0) {
        return campos.some(campo => {
          const valor = item[campo];
          return typeof valor === 'string' && valor.toLowerCase().includes(busqueda);
        });
      }

      // Si no se especifican campos, busca en todos los valores string del objeto
      return Object.values(item).some(valor =>
        typeof valor === 'string' && valor.toLowerCase().includes(busqueda)
      );
    });
  }
}

