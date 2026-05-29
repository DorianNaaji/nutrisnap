import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { profileExistsGuard } from './profile-exists-guard';

describe('profileExistsGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => profileExistsGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
