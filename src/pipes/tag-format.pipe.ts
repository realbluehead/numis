import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tagCategory',
  standalone: true,
})
export class TagCategoryPipe implements PipeTransform {
  transform(value: string): string {
    return value.toUpperCase();
  }
}

@Pipe({
  name: 'tagValue',
  standalone: true,
})
export class TagValuePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return value;
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  }
}
