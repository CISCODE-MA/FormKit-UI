import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import I18nProvider from '../I18nContext';
import { useI18n } from '../../../hooks/useI18n';
import { getTranslation } from '../../../core/i18n';
import { en } from '../../../locales';

function Probe() {
  const { locale, t, translations } = useI18n();

  return (
    <div>
      <span data-testid="locale">{locale}</span>
      <span data-testid="submit">{t('form.submit')}</span>
      <span data-testid="fallback">{t('form.unknown', undefined, 'fallback')}</span>
      <span data-testid="raw-month">{translations.datetime.months.january}</span>
    </div>
  );
}

describe('I18nContext', () => {
  it('uses default english locale', () => {
    render(
      <I18nProvider>
        <Probe />
      </I18nProvider>,
    );

    expect(screen.getByTestId('locale')).toHaveTextContent('en');
    expect(screen.getByTestId('submit')).toHaveTextContent('Submit');
    expect(screen.getByTestId('fallback')).toHaveTextContent('fallback');
  });

  it('supports french locale and custom translation overrides', () => {
    render(
      <I18nProvider
        locale="fr"
        customTranslations={{
          form: { ...en.form, submit: 'Envoyer' },
        }}
      >
        <Probe />
      </I18nProvider>,
    );

    expect(screen.getByTestId('locale')).toHaveTextContent('fr');
    expect(screen.getByTestId('submit')).toHaveTextContent('Envoyer');
    expect(screen.getByTestId('raw-month').textContent).toBeTruthy();
  });

  it('getTranslation interpolates params and returns path if missing', () => {
    const merged = {
      ...en,
      array: {
        ...en.array,
        minHint: 'Minimum {min}',
      },
    };

    expect(getTranslation(merged, 'array.minHint', { min: 2 })).toBe('Minimum 2');
    expect(getTranslation(merged, 'array.notExists')).toBe('array.notExists');
  });
});
