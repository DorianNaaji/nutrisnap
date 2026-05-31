import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslateService } from '../../core/services/translate.service';

@Pipe({ name: 't', pure: false, standalone: true })
export class TranslatePipe implements PipeTransform {
  private translate = inject(TranslateService);
  transform(key: string, params?: Record<string, string | number>): string {
    return this.translate.t(key, params);
  }
}
