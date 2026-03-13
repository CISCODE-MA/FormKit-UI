/**
 * Tests for FormSection component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import FormSection from '../FormSection';
import { FormKitContext } from '../../context/FormKitContext';
import type { FormContextValue } from '../../../models/FormState';
import { FieldType } from '../../../core/types';
import type { SectionConfig } from '../../../models/SectionConfig';

// Mock form context
const createMockContext = (overrides: Partial<FormContextValue> = {}): FormContextValue => ({
  getValue: vi.fn(() => ''),
  setValue: vi.fn(),
  getError: vi.fn(() => null),
  setError: vi.fn(),
  getTouched: vi.fn(() => false),
  setTouched: vi.fn(),
  getValues: vi.fn(() => ({})),
  isSubmitting: false,
  isValid: true,
  ...overrides,
});

const renderWithContext = (
  ui: React.ReactElement,
  context: FormContextValue = createMockContext(),
) => {
  return render(<FormKitContext.Provider value={context}>{ui}</FormKitContext.Provider>);
};

describe('FormSection', () => {
  it('renders section with title', () => {
    const config: SectionConfig = {
      type: 'section',
      title: 'Personal Information',
      fields: [{ key: 'name', label: 'Name', type: FieldType.TEXT }],
    };

    renderWithContext(<FormSection config={config} />);

    expect(screen.getByText('Personal Information')).toBeInTheDocument();
  });

  it('renders section with description', () => {
    const config: SectionConfig = {
      type: 'section',
      title: 'Contact',
      description: 'Enter your contact details',
      fields: [{ key: 'email', label: 'Email', type: FieldType.EMAIL }],
    };

    renderWithContext(<FormSection config={config} />);

    expect(screen.getByText('Enter your contact details')).toBeInTheDocument();
  });

  it('renders fields inside section', () => {
    const config: SectionConfig = {
      type: 'section',
      fields: [
        { key: 'firstName', label: 'First Name', type: FieldType.TEXT },
        { key: 'lastName', label: 'Last Name', type: FieldType.TEXT },
      ],
    };

    renderWithContext(<FormSection config={config} />);

    expect(screen.getByText('First Name')).toBeInTheDocument();
    expect(screen.getByText('Last Name')).toBeInTheDocument();
  });

  it('applies border when title is present', () => {
    const config: SectionConfig = {
      type: 'section',
      title: 'With Border',
      fields: [{ key: 'field1', label: 'Field 1', type: FieldType.TEXT }],
    };

    const { container } = renderWithContext(<FormSection config={config} />);
    const fieldset = container.querySelector('fieldset');

    expect(fieldset?.className).toContain('border');
  });

  it('does not apply border when no title and bordered=false', () => {
    const config: SectionConfig = {
      type: 'section',
      bordered: false,
      fields: [{ key: 'field1', label: 'Field 1', type: FieldType.TEXT }],
    };

    const { container } = renderWithContext(<FormSection config={config} />);
    const fieldset = container.querySelector('fieldset');

    expect(fieldset?.className).not.toContain('border-gray-200');
  });

  it('applies custom className', () => {
    const config: SectionConfig = {
      type: 'section',
      className: 'custom-section-class',
      fields: [{ key: 'field1', label: 'Field 1', type: FieldType.TEXT }],
    };

    const { container } = renderWithContext(<FormSection config={config} />);
    const fieldset = container.querySelector('fieldset');

    expect(fieldset?.className).toContain('custom-section-class');
  });

  it('renders with grid classes for columns', () => {
    const config: SectionConfig = {
      type: 'section',
      columns: 2,
      fields: [
        { key: 'field1', label: 'Field 1', type: FieldType.TEXT },
        { key: 'field2', label: 'Field 2', type: FieldType.TEXT },
      ],
    };

    const { container } = renderWithContext(<FormSection config={config} />);
    const grid = container.querySelector('.grid');

    expect(grid?.className).toContain('grid-cols-2');
  });

  it('renders with responsive grid classes', () => {
    const config: SectionConfig = {
      type: 'section',
      columns: { default: 1, md: 2, lg: 3 },
      fields: [{ key: 'field1', label: 'Field 1', type: FieldType.TEXT }],
    };

    const { container } = renderWithContext(<FormSection config={config} />);
    const grid = container.querySelector('.grid');

    expect(grid?.className).toContain('grid-cols-1');
    expect(grid?.className).toContain('md:grid-cols-2');
    expect(grid?.className).toContain('lg:grid-cols-3');
  });

  it('applies colSpan to individual fields', () => {
    const config: SectionConfig = {
      type: 'section',
      columns: 2,
      fields: [
        { key: 'field1', label: 'Field 1', type: FieldType.TEXT, colSpan: 1 },
        { key: 'field2', label: 'Field 2', type: FieldType.TEXT, colSpan: 2 },
      ],
    };

    const { container } = renderWithContext(<FormSection config={config} />);
    const grid = container.querySelector('.grid');
    const children = grid?.children;

    expect(children?.[0]?.className).toContain('col-span-1');
    expect(children?.[1]?.className).toContain('col-span-2');
  });

  it('uses fieldset and legend for accessibility', () => {
    const config: SectionConfig = {
      type: 'section',
      title: 'Accessible Section',
      fields: [{ key: 'field1', label: 'Field 1', type: FieldType.TEXT }],
    };

    const { container } = renderWithContext(<FormSection config={config} />);

    expect(container.querySelector('fieldset')).toBeInTheDocument();
    expect(container.querySelector('legend')).toBeInTheDocument();
    expect(container.querySelector('legend')?.textContent).toBe('Accessible Section');
  });

  it('applies custom gap', () => {
    const config: SectionConfig = {
      type: 'section',
      gap: 6,
      fields: [{ key: 'field1', label: 'Field 1', type: FieldType.TEXT }],
    };

    const { container } = renderWithContext(<FormSection config={config} />);
    const grid = container.querySelector('.grid');

    expect(grid?.className).toContain('gap-6');
  });
});
