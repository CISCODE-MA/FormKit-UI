import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Switch } from '../Switch';

describe('Switch', () => {
  describe('basic rendering', () => {
    it('renders with name', () => {
      render(<Switch name="toggle" />);
      const input = document.querySelector('input[name="toggle"]');
      expect(input).toBeInTheDocument();
    });

    it('renders as checkbox input', () => {
      render(<Switch name="toggle" />);
      const input = document.querySelector('input[type="checkbox"]');
      expect(input).toBeInTheDocument();
    });

    it('renders switch role', () => {
      render(<Switch name="toggle" />);
      expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    it('renders with label', () => {
      render(<Switch name="toggle" label="Enable notifications" />);
      expect(screen.getByText('Enable notifications')).toBeInTheDocument();
    });

    it('shows required indicator', () => {
      render(<Switch name="toggle" label="Accept terms" required />);
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('renders with description', () => {
      render(<Switch name="toggle" label="Notifications" description="Get email updates" />);
      expect(screen.getByText('Get email updates')).toBeInTheDocument();
    });
  });

  describe('checked state', () => {
    it('is unchecked by default', () => {
      render(<Switch name="toggle" />);
      const switchElement = screen.getByRole('switch');
      expect(switchElement).toHaveAttribute('aria-checked', 'false');
    });

    it('respects defaultChecked prop', () => {
      render(<Switch name="toggle" defaultChecked />);
      const switchElement = screen.getByRole('switch');
      expect(switchElement).toHaveAttribute('aria-checked', 'true');
    });

    it('respects controlled checked prop', () => {
      render(<Switch name="toggle" checked />);
      const switchElement = screen.getByRole('switch');
      expect(switchElement).toHaveAttribute('aria-checked', 'true');
    });

    it('toggles on click', async () => {
      const handleChange = vi.fn();
      render(<Switch name="toggle" onChange={handleChange} />);

      const switchElement = screen.getByRole('switch');
      await userEvent.click(switchElement);

      expect(handleChange).toHaveBeenCalledWith(true);
    });

    it('toggles off when already on', async () => {
      const handleChange = vi.fn();
      render(<Switch name="toggle" defaultChecked onChange={handleChange} />);

      const switchElement = screen.getByRole('switch');
      await userEvent.click(switchElement);

      expect(handleChange).toHaveBeenCalledWith(false);
    });

    it('updates internal state when uncontrolled', async () => {
      render(<Switch name="toggle" />);

      const switchElement = screen.getByRole('switch');
      expect(switchElement).toHaveAttribute('aria-checked', 'false');

      await userEvent.click(switchElement);
      expect(switchElement).toHaveAttribute('aria-checked', 'true');
    });
  });

  describe('keyboard interaction', () => {
    it('toggles on Space key', async () => {
      const handleChange = vi.fn();
      render(<Switch name="toggle" onChange={handleChange} />);

      const switchElement = screen.getByRole('switch');
      switchElement.focus();
      fireEvent.keyDown(switchElement, { key: ' ' });

      expect(handleChange).toHaveBeenCalledWith(true);
    });

    it('toggles on Enter key', () => {
      const handleChange = vi.fn();
      render(<Switch name="toggle" onChange={handleChange} />);

      const switchElement = screen.getByRole('switch');
      switchElement.focus();
      fireEvent.keyDown(switchElement, { key: 'Enter' });

      expect(handleChange).toHaveBeenCalledWith(true);
    });

    it('is focusable', () => {
      render(<Switch name="toggle" />);
      const switchElement = screen.getByRole('switch');
      expect(switchElement).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('label position', () => {
    it('places label on right by default', () => {
      render(<Switch name="toggle" label="Toggle" />);

      const container = screen.getByRole('switch').closest('div')?.parentElement;
      const children = container?.children;

      // Switch should be before label
      expect(children?.[0]).toContainElement(screen.getByRole('switch'));
    });

    it('places label on left when specified', () => {
      render(<Switch name="toggle" label="Toggle" labelPosition="left" />);

      const label = screen.getByText('Toggle');
      expect(label).toBeInTheDocument();
    });
  });

  describe('sizes', () => {
    it('renders small size', () => {
      render(<Switch name="toggle" size="sm" />);
      const switchElement = screen.getByRole('switch');
      expect(switchElement.className).toContain('w-8');
    });

    it('renders medium size (default)', () => {
      render(<Switch name="toggle" size="md" />);
      const switchElement = screen.getByRole('switch');
      expect(switchElement.className).toContain('w-11');
    });

    it('renders large size', () => {
      render(<Switch name="toggle" size="lg" />);
      const switchElement = screen.getByRole('switch');
      expect(switchElement.className).toContain('w-14');
    });
  });

  describe('colors', () => {
    it('uses blue color by default', () => {
      render(<Switch name="toggle" defaultChecked />);
      const switchElement = screen.getByRole('switch');
      expect(switchElement.className).toContain('bg-blue-600');
    });

    it('uses green color', () => {
      render(<Switch name="toggle" color="green" defaultChecked />);
      const switchElement = screen.getByRole('switch');
      expect(switchElement.className).toContain('bg-green-600');
    });

    it('uses red color', () => {
      render(<Switch name="toggle" color="red" defaultChecked />);
      const switchElement = screen.getByRole('switch');
      expect(switchElement.className).toContain('bg-red-600');
    });

    it('uses purple color', () => {
      render(<Switch name="toggle" color="purple" defaultChecked />);
      const switchElement = screen.getByRole('switch');
      expect(switchElement.className).toContain('bg-purple-600');
    });

    it('uses gray when off', () => {
      render(<Switch name="toggle" />);
      const switchElement = screen.getByRole('switch');
      expect(switchElement.className).toContain('bg-gray-300');
    });
  });

  describe('on/off labels', () => {
    it('shows on label when checked', () => {
      render(<Switch name="toggle" onLabel="ON" defaultChecked />);
      expect(screen.getByText('ON')).toBeInTheDocument();
    });

    it('shows off label when unchecked', () => {
      render(<Switch name="toggle" offLabel="OFF" />);
      expect(screen.getByText('OFF')).toBeInTheDocument();
    });
  });

  describe('icons', () => {
    it('shows icons when enabled', () => {
      render(<Switch name="toggle" showIcons />);
      const switchElement = screen.getByRole('switch');
      const svgs = switchElement.querySelectorAll('svg');
      expect(svgs.length).toBe(2); // Check and X icons
    });

    it('hides icons by default', () => {
      render(<Switch name="toggle" />);
      const switchElement = screen.getByRole('switch');
      const svgs = switchElement.querySelectorAll('svg');
      expect(svgs.length).toBe(0);
    });
  });

  describe('disabled state', () => {
    it('disables the input', () => {
      render(<Switch name="toggle" disabled />);
      const input = document.querySelector('input');
      expect(input).toBeDisabled();
    });

    it('applies disabled styling', () => {
      render(<Switch name="toggle" disabled />);
      const switchElement = screen.getByRole('switch');
      expect(switchElement.className).toContain('opacity-50');
    });

    it('removes from tab order', () => {
      render(<Switch name="toggle" disabled />);
      const switchElement = screen.getByRole('switch');
      expect(switchElement).toHaveAttribute('tabIndex', '-1');
    });

    it('does not toggle when clicked', async () => {
      const handleChange = vi.fn();
      render(<Switch name="toggle" disabled onChange={handleChange} />);

      const switchElement = screen.getByRole('switch');
      await userEvent.click(switchElement);

      expect(handleChange).not.toHaveBeenCalled();
    });

    it('does not toggle on keyboard', () => {
      const handleChange = vi.fn();
      render(<Switch name="toggle" disabled onChange={handleChange} />);

      const switchElement = screen.getByRole('switch');
      fireEvent.keyDown(switchElement, { key: ' ' });

      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe('error state', () => {
    it('shows error message', () => {
      render(<Switch name="toggle" error="This field is required" />);
      expect(screen.getByRole('alert')).toHaveTextContent('This field is required');
    });

    it('marks input as invalid', () => {
      render(<Switch name="toggle" error="Error" />);
      const input = document.querySelector('input');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('controlled vs uncontrolled', () => {
    it('works as uncontrolled with defaultChecked', async () => {
      const handleChange = vi.fn();
      render(<Switch name="toggle" defaultChecked={false} onChange={handleChange} />);

      const switchElement = screen.getByRole('switch');
      await userEvent.click(switchElement);

      expect(switchElement).toHaveAttribute('aria-checked', 'true');
      expect(handleChange).toHaveBeenCalledWith(true);
    });

    it('calls onChange for controlled component', async () => {
      const handleChange = vi.fn();
      render(<Switch name="toggle" checked={false} onChange={handleChange} />);

      const switchElement = screen.getByRole('switch');
      await userEvent.click(switchElement);

      expect(handleChange).toHaveBeenCalledWith(true);
    });
  });

  describe('accessibility', () => {
    it('has role switch', () => {
      render(<Switch name="toggle" />);
      expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    it('has aria-checked attribute', () => {
      render(<Switch name="toggle" />);
      const switchElement = screen.getByRole('switch');
      expect(switchElement).toHaveAttribute('aria-checked', 'false');
    });

    it('links to description', () => {
      render(<Switch name="toggle" description="Toggle this option" />);
      const input = document.querySelector('input');
      expect(input).toHaveAttribute('aria-describedby', expect.stringContaining('description'));
    });

    it('links to error', () => {
      render(<Switch name="toggle" error="Required" />);
      const input = document.querySelector('input');
      expect(input).toHaveAttribute('aria-describedby', expect.stringContaining('error'));
    });

    it('uses custom id when provided', () => {
      render(<Switch name="toggle" id="custom-switch" />);
      const input = document.querySelector('#custom-switch');
      expect(input).toBeInTheDocument();
    });
  });

  describe('form integration', () => {
    it('submits value in form', async () => {
      const handleSubmit = vi.fn((e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        handleSubmit.mock.calls[0][1] = formData.get('newsletter');
      });

      render(
        <form onSubmit={handleSubmit}>
          <Switch name="newsletter" defaultChecked />
          <button type="submit">Submit</button>
        </form>,
      );

      const input = document.querySelector('input') as HTMLInputElement;
      expect(input.checked).toBe(true);
    });

    it('applies required attribute', () => {
      render(<Switch name="toggle" required />);
      const input = document.querySelector('input');
      expect(input).toBeRequired();
    });
  });
});
