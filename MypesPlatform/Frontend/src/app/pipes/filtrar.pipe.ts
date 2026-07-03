import { Pipe, PipeTransform } from '@angular/core';

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
      if (campos && campos.length > 0) {
        return campos.some(campo => {
          const valor = item[campo];
          return typeof valor === 'string' && valor.toLowerCase().includes(busqueda);
        });
      }

      return Object.values(item).some(valor =>
        typeof valor === 'string' && valor.toLowerCase().includes(busqueda)
      );
    });
  }
}

