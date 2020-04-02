import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'declorateLinks'
})
export class DeclorateLinksPipe implements PipeTransform {

  transform(value: string): unknown {
    return value.replace(/<\/a>/g, '<span class="material-icons">open_in_new</span></a>');
  }

}
