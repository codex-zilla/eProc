/**
 * Unit tests for status-utils functions
 * Target: 100% coverage
 */

import {
  getRequestStatusClass,
  getPOStatusClass,
  getProjectStatusClass,
  getRequestStatusLabel,
  type RequestStatus,
  type POStatus,
  type ProjectStatus,
} from './status-utils';

describe('getRequestStatusClass', () => {
  it('should return amber classes for PENDING', () => {
    expect(getRequestStatusClass('PENDING')).toBe(
      'bg-amber-100 text-amber-800 border-amber-200'
    );
  });

  it('should return blue classes for SUBMITTED', () => {
    expect(getRequestStatusClass('SUBMITTED')).toBe(
      'bg-blue-100 text-blue-800 border-blue-200'
    );
  });

  it('should return green classes for APPROVED', () => {
    expect(getRequestStatusClass('APPROVED')).toBe(
      'bg-green-100 text-green-800 border-green-200'
    );
  });

  it('should return yellow classes for PARTIALLY_APPROVED', () => {
    expect(getRequestStatusClass('PARTIALLY_APPROVED')).toBe(
      'bg-yellow-100 text-yellow-800 border-yellow-200'
    );
  });

  it('should return red classes for REJECTED', () => {
    expect(getRequestStatusClass('REJECTED')).toBe(
      'bg-red-100 text-red-800 border-red-200'
    );
  });

  it('should return slate classes for unknown status', () => {
    expect(getRequestStatusClass('UNKNOWN' as RequestStatus)).toBe(
      'bg-slate-100 text-slate-800 border-slate-200'
    );
  });
});

describe('getPOStatusClass', () => {
  it('should return blue classes for OPEN', () => {
    expect(getPOStatusClass('OPEN')).toBe(
      'bg-blue-100 text-blue-800 border-blue-200'
    );
  });

  it('should return gray classes for CLOSED', () => {
    expect(getPOStatusClass('CLOSED')).toBe(
      'bg-gray-100 text-gray-800 border-gray-200'
    );
  });

  it('should return slate classes for unknown status', () => {
    expect(getPOStatusClass('UNKNOWN' as POStatus)).toBe(
      'bg-slate-100 text-slate-800 border-slate-200'
    );
  });
});

describe('getProjectStatusClass', () => {
  it('should return green classes for ACTIVE', () => {
    expect(getProjectStatusClass('ACTIVE')).toBe(
      'bg-green-100 text-green-800 border-green-200'
    );
  });

  it('should return yellow classes for ON_HOLD', () => {
    expect(getProjectStatusClass('ON_HOLD')).toBe(
      'bg-yellow-100 text-yellow-800 border-yellow-200'
    );
  });

  it('should return blue classes for COMPLETED', () => {
    expect(getProjectStatusClass('COMPLETED')).toBe(
      'bg-blue-100 text-blue-800 border-blue-200'
    );
  });

  it('should return red classes for CANCELLED', () => {
    expect(getProjectStatusClass('CANCELLED')).toBe(
      'bg-red-100 text-red-800 border-red-200'
    );
  });

  it('should return slate classes for unknown status', () => {
    expect(getProjectStatusClass('UNKNOWN' as ProjectStatus)).toBe(
      'bg-slate-100 text-slate-800 border-slate-200'
    );
  });
});

describe('getRequestStatusLabel', () => {
  it('should return "Pending" for PENDING', () => {
    expect(getRequestStatusLabel('PENDING')).toBe('Pending');
  });

  it('should return "Submitted" for SUBMITTED', () => {
    expect(getRequestStatusLabel('SUBMITTED')).toBe('Submitted');
  });

  it('should return "Approved" for APPROVED', () => {
    expect(getRequestStatusLabel('APPROVED')).toBe('Approved');
  });

  it('should return "Partially Approved" for PARTIALLY_APPROVED', () => {
    expect(getRequestStatusLabel('PARTIALLY_APPROVED')).toBe(
      'Partially Approved'
    );
  });

  it('should return "Rejected" for REJECTED', () => {
    expect(getRequestStatusLabel('REJECTED')).toBe('Rejected');
  });

  it('should return the status itself for unknown status', () => {
    expect(getRequestStatusLabel('UNKNOWN' as RequestStatus)).toBe('UNKNOWN');
  });
});

// Integration test: Verify all status types are covered
describe('Status coverage', () => {
  it('should have classes for all RequestStatus types', () => {
    const statuses: RequestStatus[] = [
      'PENDING',
      'SUBMITTED',
      'APPROVED',
      'PARTIALLY_APPROVED',
      'REJECTED',
    ];
    
    statuses.forEach((status) => {
      const result = getRequestStatusClass(status);
      expect(result).toBeTruthy();
      expect(result).toContain('bg-');
      expect(result).toContain('text-');
      expect(result).toContain('border-');
    });
  });

  it('should have classes for all POStatus types', () => {
    const statuses: POStatus[] = ['OPEN', 'CLOSED'];
    
    statuses.forEach((status) => {
      const result = getPOStatusClass(status);
      expect(result).toBeTruthy();
      expect(result).toContain('bg-');
      expect(result).toContain('text-');
      expect(result).toContain('border-');
    });
  });

  it('should have classes for all ProjectStatus types', () => {
    const statuses: ProjectStatus[] = [
      'ACTIVE',
      'ON_HOLD',
      'COMPLETED',
      'CANCELLED',
    ];
    
    statuses.forEach((status) => {
      const result = getProjectStatusClass(status);
      expect(result).toBeTruthy();
      expect(result).toContain('bg-');
      expect(result).toContain('text-');
      expect(result).toContain('border-');
    });
  });
});
