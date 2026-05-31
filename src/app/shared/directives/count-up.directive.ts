import { Directive, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[appCountUp]',
  standalone: true
})
export class CountUpDirective implements OnChanges {
  @Input('appCountUp') targetValue: number = 0;
  private duration = 1000;

  constructor(private el: ElementRef) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['targetValue'] && typeof this.targetValue === 'number') {
      this.animate();
    }
  }

  private animate() {
    const startValue = 0;
    const startTime = performance.now();

    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3); // Cubic ease-out

    const update = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / this.duration, 1);
      
      const easedProgress = easeOut(progress);
      
      const currentValue = Math.round(startValue + (this.targetValue - startValue) * easedProgress);
      this.el.nativeElement.textContent = currentValue.toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };

    requestAnimationFrame(update);
  }
}
