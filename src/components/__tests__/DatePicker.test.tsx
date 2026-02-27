/**
 * Tests for DatePicker component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DatePicker, formatDate, parseDate } from '../DatePicker';
import { required } from '../../validation/validators';

describe('DatePicker', () => {
  describe('basic rendering', () => {
    it('renders input with name', () => {
      render(<DatePicker name="birthdate" />);
      const input = document.querySelector('input[name="birthdate"]');
      expect(input).toBeInTheDocument();
    });

    it('renders with placeholder', () => {
      render(<DatePicker name="date" placeholder="Choose a date" />);
      const input = screen.getByPlaceholderText('Choose a date');
      expect(input).toBeInTheDocument();
    });

    it('renders with default value', () => {
      const date = new Date(2025, 5, 15); // June 15, 2025
      render(<DatePicker name="date" defaultValue={date} />);
      const input = document.querySelector('input[name="date"]') as HTMLInputElement;
      expect(input.value).toBe('2025-06-15');
    });

    it('renders with string default value', () => {
      render(<DatePicker name="date" defaultValue="2025-06-15" />);
      const input = document.querySelector('input[name="date"]') as HTMLInputElement;
      expect(input.value).toBe('2025-06-15');
    });
  });

  describe('label and accessibility', () => {
    it('renders with label', () => {
      render(<DatePicker name="date" label="Date of Birth" />);
      const label = screen.getByText('Date of Birth');
      expect(label).toBeInTheDocument();
    });

    it('associates label with input', () => {
      render(<DatePicker name="date" label="Date of Birth" />);
      const input = screen.getByLabelText('Date of Birth');
      expect(input).toBeInTheDocument();
    });

    it('shows required indicator', () => {
      render(<DatePicker name="date" label="Date" required />);
      const required = screen.getAllByText('*');
      expect(required.length).toBeGreaterThan(0);
    });

    it('renders with hint text', () => {
      render(<DatePicker name="date" hint="Select your birthday" />);
      const hint = screen.getByText('Select your birthday');
      expect(hint).toBeInTheDocument();
    });

    it('has proper sr-only label when no visible label', () => {
      render(<DatePicker name="date" />);
      const label = document.querySelector('label.sr-only');
      expect(label).toBeInTheDocument();
    });

    it('has aria-haspopup attribute', () => {
      render(<DatePicker name="date" />);
      const input = document.querySelector('input[name="date"]');
      expect(input).toHaveAttribute('aria-haspopup', 'dialog');
    });
  });

  describe('calendar popup', () => {
    it('opens calendar on input click', async () => {
      const user = userEvent.setup();
      render(<DatePicker name="date" />);
      const input = document.querySelector('input[name="date"]') as HTMLInputElement;

      await user.click(input);

      const calendar = document.querySelector('.formkit-calendar');
      expect(calendar).toBeInTheDocument();
    });

    it('opens calendar on calendar icon click', async () => {
      const user = userEvent.setup();
      render(<DatePicker name="date" />);
      const button = screen.getByRole('button', { name: /open calendar/i });

      await user.click(button);

      const calendar = document.querySelector('.formkit-calendar');
      expect(calendar).toBeInTheDocument();
    });

    it('closes calendar on date selection', async () => {
      const user = userEvent.setup();
      render(<DatePicker name="date" />);
      const input = document.querySelector('input[name="date"]') as HTMLInputElement;

      await user.click(input);

      // Find and click a day button
      const dayButtons = screen.getAllByRole('gridcell');
      const enabledDay = dayButtons.find((btn) => !btn.hasAttribute('disabled'));
      if (enabledDay) {
        await user.click(enabledDay);
      }

      await waitFor(() => {
        const calendar = document.querySelector('.formkit-calendar');
        expect(calendar).not.toBeInTheDocument();
      });
    });

    it('closes calendar on escape key', async () => {
      const user = userEvent.setup();
      render(<DatePicker name="date" />);
      const input = document.querySelector('input[name="date"]') as HTMLInputElement;

      await user.click(input);
      expect(document.querySelector('.formkit-calendar')).toBeInTheDocument();

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(document.querySelector('.formkit-calendar')).not.toBeInTheDocument();
      });
    });

    it('shows today button', async () => {
      const user = userEvent.setup();
      render(<DatePicker name="date" showTodayButton />);
      const input = document.querySelector('input[name="date"]') as HTMLInputElement;

      await user.click(input);

      const todayButton = screen.getByRole('button', { name: /today/i });
      expect(todayButton).toBeInTheDocument();
    });

    it('shows clear button', async () => {
      const user = userEvent.setup();
      render(<DatePicker name="date" showClearButton />);
      const input = document.querySelector('input[name="date"]') as HTMLInputElement;

      await user.click(input);

      const clearButton = screen.getByRole('button', { name: /clear/i });
      expect(clearButton).toBeInTheDocument();
    });

    it('selects today when clicking today button', async () => {
      const user = userEvent.setup();
      render(<DatePicker name="date" showTodayButton />);
      const input = document.querySelector('input[name="date"]') as HTMLInputElement;

      await user.click(input);
      const todayButton = screen.getByRole('button', { name: /today/i });
      await user.click(todayButton);

      const today = new Date();
      const expected = formatDate(today);
      expect(input.value).toBe(expected);
    });

    it('clears value when clicking clear button', async () => {
      const user = userEvent.setup();
      const date = new Date(2025, 5, 15);
      render(<DatePicker name="date" defaultValue={date} showClearButton />);
      const input = document.querySelector('input[name="date"]') as HTMLInputElement;

      expect(input.value).toBe('2025-06-15');

      await user.click(input);
      const clearButton = screen.getByRole('button', { name: /clear/i });
      await user.click(clearButton);

      expect(input.value).toBe('');
    });
  });

  describe('month navigation', () => {
    it('shows current month by default', async () => {
      const user = userEvent.setup();
      render(<DatePicker name="date" />);
      const input = document.querySelector('input[name="date"]') as HTMLInputElement;

      await user.click(input);

      const today = new Date();
      const monthNames = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ];
      const expectedMonth = monthNames[today.getMonth()];

      expect(screen.getByText(new RegExp(expectedMonth))).toBeInTheDocument();
    });

    it('navigates to previous month', async () => {
      const user = userEvent.setup();
      const date = new Date(2025, 5, 15); // June 2025
      render(<DatePicker name="date" defaultValue={date} />);
      const input = document.querySelector('input[name="date"]') as HTMLInputElement;

      await user.click(input);
      expect(screen.getByText(/June/)).toBeInTheDocument();

      const prevButton = screen.getByRole('button', { name: /previous month/i });
      await user.click(prevButton);

      expect(screen.getByText(/May/)).toBeInTheDocument();
    });

    it('navigates to next month', async () => {
      const user = userEvent.setup();
      const date = new Date(2025, 5, 15); // June 2025
      render(<DatePicker name="date" defaultValue={date} />);
      const input = document.querySelector('input[name="date"]') as HTMLInputElement;

      await user.click(input);
      expect(screen.getByText(/June/)).toBeInTheDocument();

      const nextButton = screen.getByRole('button', { name: /next month/i });
      await user.click(nextButton);

      expect(screen.getByText(/July/)).toBeInTheDocument();
    });
  });

  describe('date constraints', () => {
    it('disables dates before minDate', async () => {
      const user = userEvent.setup();
      const minDate = new Date(2025, 5, 15); // June 15, 2025
      render(<DatePicker name="date" minDate={minDate} defaultValue={new Date(2025, 5, 20)} />);
      const input = document.querySelector('input[name="date"]') as HTMLInputElement;

      await user.click(input);

      // Day 10 should be disabled
      const dayButtons = screen.getAllByRole('gridcell');
      const day10 = dayButtons.find((btn) => btn.textContent === '10');
      expect(day10).toBeDisabled();
    });

    it('disables dates after maxDate', async () => {
      const user = userEvent.setup();
      const maxDate = new Date(2025, 5, 15); // June 15, 2025
      render(<DatePicker name="date" maxDate={maxDate} defaultValue={new Date(2025, 5, 10)} />);
      const input = document.querySelector('input[name="date"]') as HTMLInputElement;

      await user.click(input);

      // Day 20 should be disabled
      const dayButtons = screen.getAllByRole('gridcell');
      const day20 = dayButtons.find((btn) => btn.textContent === '20');
      expect(day20).toBeDisabled();
    });
  });

  describe('date formats', () => {
    it('formats date as yyyy-MM-dd by default', () => {
      const date = new Date(2025, 5, 15);
      render(<DatePicker name="date" defaultValue={date} />);
      const input = document.querySelector('input[name="date"]') as HTMLInputElement;
      expect(input.value).toBe('2025-06-15');
    });

    it('formats date as MM/dd/yyyy', () => {
      const date = new Date(2025, 5, 15);
      render(<DatePicker name="date" defaultValue={date} dateFormat="MM/dd/yyyy" />);
      const input = document.querySelector('input[name="date"]') as HTMLInputElement;
      expect(input.value).toBe('06/15/2025');
    });

    it('formats date as dd/MM/yyyy', () => {
      const date = new Date(2025, 5, 15);
      render(<DatePicker name="date" defaultValue={date} dateFormat="dd/MM/yyyy" />);
      const input = document.querySelector('input[name="date"]') as HTMLInputElement;
      expect(input.value).toBe('15/06/2025');
    });

    it('formats date as dd.MM.yyyy', () => {
      const date = new Date(2025, 5, 15);
      render(<DatePicker name="date" defaultValue={date} dateFormat="dd.MM.yyyy" />);
      const input = document.querySelector('input[name="date"]') as HTMLInputElement;
      expect(input.value).toBe('15.06.2025');
    });
  });

  describe('first day of week', () => {
    it('starts week on Sunday by default', async () => {
      const user = userEvent.setup();
      render(<DatePicker name="date" />);
      const input = document.querySelector('input[name="date"]') as HTMLInputElement;

      await user.click(input);

      const dayHeaders = document.querySelectorAll('.formkit-calendar .grid-cols-7 > div');
      expect(dayHeaders[0].textContent).toBe('Su');
    });

    it('starts week on Monday when configured', async () => {
      const user = userEvent.setup();
      render(<DatePicker name="date" firstDayOfWeek={1} />);
      const input = document.querySelector('input[name="date"]') as HTMLInputElement;

      await user.click(input);

      const dayHeaders = document.querySelectorAll('.formkit-calendar .grid-cols-7 > div');
      expect(dayHeaders[0].textContent).toBe('Mo');
    });
  });

  describe('user interaction', () => {
    it('calls onChange handler on date select', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<DatePicker name="date" onChange={onChange} />);
      const input = document.querySelector('input[name="date"]') as HTMLInputElement;

      await user.click(input);

      const dayButtons = screen.getAllByRole('gridcell');
      const enabledDay = dayButtons.find((btn) => !btn.hasAttribute('disabled'));
      if (enabledDay) {
        await user.click(enabledDay);
      }

      expect(onChange).toHaveBeenCalled();
    });

    it('calls onBlur handler', async () => {
      const user = userEvent.setup();
      const onBlur = vi.fn();
      render(<DatePicker name="date" onBlur={onBlur} />);
      const input = document.querySelector('input[name="date"]') as HTMLInputElement;

      await user.click(input);
      await user.tab();

      expect(onBlur).toHaveBeenCalled();
    });

    it('calls onFocus handler', async () => {
      const user = userEvent.setup();
      const onFocus = vi.fn();
      render(<DatePicker name="date" onFocus={onFocus} />);
      const input = document.querySelector('input[name="date"]') as HTMLInputElement;

      await user.click(input);
      expect(onFocus).toHaveBeenCalled();
    });
  });

  describe('validation', () => {
    it('shows required error', async () => {
      const user = userEvent.setup();
      render(
        <DatePicker
          name="date"
          label="Date"
          required
          validationRules={[{ validator: required() }]}
          validateOn="blur"
        />,
      );
      const input = document.querySelector('input[name="date"]') as HTMLInputElement;

      await user.click(input);
      await user.tab();

      const error = await screen.findByRole('alert');
      expect(error).toBeInTheDocument();
    });

    it('calls onValidationChange callback', async () => {
      const onValidationChange = vi.fn();
      const date = new Date(2025, 5, 15);
      render(
        <DatePicker
          name="date"
          validationRules={[{ validator: required() }]}
          validateOn="change"
          onValidationChange={onValidationChange}
          defaultValue={date}
        />,
      );

      await waitFor(() => {
        expect(onValidationChange).toHaveBeenCalled();
      });
    });
  });

  describe('disabled and readonly states', () => {
    it('renders disabled input', () => {
      render(<DatePicker name="date" disabled />);
      const input = document.querySelector('input[name="date"]');
      expect(input).toBeDisabled();
    });

    it('renders readonly input', () => {
      render(<DatePicker name="date" readOnly />);
      const input = document.querySelector('input[name="date"]');
      expect(input).toHaveAttribute('readonly');
    });

    it('does not open calendar when disabled', async () => {
      const user = userEvent.setup();
      render(<DatePicker name="date" disabled />);
      const button = screen.getByRole('button', { name: /open calendar/i });

      await user.click(button);

      const calendar = document.querySelector('.formkit-calendar');
      expect(calendar).not.toBeInTheDocument();
    });
  });
});

describe('formatDate', () => {
  it('formats as yyyy-MM-dd', () => {
    const date = new Date(2025, 5, 15);
    expect(formatDate(date, 'yyyy-MM-dd')).toBe('2025-06-15');
  });

  it('formats as MM/dd/yyyy', () => {
    const date = new Date(2025, 5, 15);
    expect(formatDate(date, 'MM/dd/yyyy')).toBe('06/15/2025');
  });

  it('formats as dd/MM/yyyy', () => {
    const date = new Date(2025, 5, 15);
    expect(formatDate(date, 'dd/MM/yyyy')).toBe('15/06/2025');
  });

  it('formats as dd.MM.yyyy', () => {
    const date = new Date(2025, 5, 15);
    expect(formatDate(date, 'dd.MM.yyyy')).toBe('15.06.2025');
  });

  it('returns empty string for null', () => {
    expect(formatDate(null)).toBe('');
  });

  it('pads single digit month and day', () => {
    const date = new Date(2025, 0, 5); // Jan 5
    expect(formatDate(date, 'yyyy-MM-dd')).toBe('2025-01-05');
  });
});

describe('parseDate', () => {
  it('parses yyyy-MM-dd format', () => {
    const result = parseDate('2025-06-15', 'yyyy-MM-dd');
    expect(result?.getFullYear()).toBe(2025);
    expect(result?.getMonth()).toBe(5);
    expect(result?.getDate()).toBe(15);
  });

  it('parses MM/dd/yyyy format', () => {
    const result = parseDate('06/15/2025', 'MM/dd/yyyy');
    expect(result?.getFullYear()).toBe(2025);
    expect(result?.getMonth()).toBe(5);
    expect(result?.getDate()).toBe(15);
  });

  it('parses dd/MM/yyyy format', () => {
    const result = parseDate('15/06/2025', 'dd/MM/yyyy');
    expect(result?.getFullYear()).toBe(2025);
    expect(result?.getMonth()).toBe(5);
    expect(result?.getDate()).toBe(15);
  });

  it('parses dd.MM.yyyy format', () => {
    const result = parseDate('15.06.2025', 'dd.MM.yyyy');
    expect(result?.getFullYear()).toBe(2025);
    expect(result?.getMonth()).toBe(5);
    expect(result?.getDate()).toBe(15);
  });

  it('returns null for empty string', () => {
    expect(parseDate('')).toBeNull();
  });

  it('returns null for invalid input', () => {
    expect(parseDate('not-a-date')).toBeNull();
  });
});
