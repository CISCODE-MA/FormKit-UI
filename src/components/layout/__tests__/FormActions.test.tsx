import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FormActions from '../FormActions';
import I18nProvider from '../../context/I18nContext';

describe('FormActions', () => {
  const renderActions = (props: Partial<React.ComponentProps<typeof FormActions>> = {}) =>
    render(
      <I18nProvider>
        <form>
          <FormActions {...props} />
        </form>
      </I18nProvider>,
    );

  it('renders default submit label from i18n', () => {
    renderActions();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
  });

  it('renders custom submit label', () => {
    renderActions({ submitLabel: 'Save Changes' });
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument();
  });

  it('renders previous and reset buttons when handlers are provided', async () => {
    const user = userEvent.setup();
    const onPrev = vi.fn();
    const onReset = vi.fn();

    renderActions({
      prevLabel: 'Back',
      onPrev,
      resetLabel: 'Reset',
      onReset,
    });

    await user.click(screen.getByRole('button', { name: 'Back' }));
    await user.click(screen.getByRole('button', { name: 'Reset' }));

    expect(onPrev).toHaveBeenCalledTimes(1);
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('hides previous and reset when labels exist but handlers are missing', () => {
    renderActions({ prevLabel: 'Back', resetLabel: 'Reset' });

    expect(screen.queryByRole('button', { name: 'Back' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Reset' })).not.toBeInTheDocument();
  });

  it('shows submitting state and disables buttons', () => {
    const onPrev = vi.fn();
    const onReset = vi.fn();

    renderActions({
      prevLabel: 'Back',
      onPrev,
      resetLabel: 'Reset',
      onReset,
      isSubmitting: true,
    });

    expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Reset' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Submitting...' })).toBeDisabled();
  });
});
