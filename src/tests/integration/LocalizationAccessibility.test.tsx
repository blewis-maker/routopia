import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { TestContextProvider } from '../utils/TestContextProvider';
import { AppRouter } from '@/components/routing/AppRouter';
import { LocaleProvider } from '@/services/i18n/LocaleProvider';
import { A11yMonitor } from '@/services/monitoring/A11yMonitor';
import type { Locale, A11yReport } from '@/types/localization';

expect.extend(toHaveNoViolations);

describe('Localization and Accessibility', () => {
  let a11yMonitor: A11yMonitor;

  beforeEach(() => {
    a11yMonitor = new A11yMonitor();
    vi.clearAllMocks();
  });

  describe('Internationalization', () => {
    const testLocales: Locale[] = ['en-US', 'es-ES', 'fr-FR', 'de-DE', 'ja-JP'];

    test.each(testLocales)('should render correctly in %s locale', async (locale) => {
      render(
        <TestContextProvider>
          <LocaleProvider locale={locale}>
            <AppRouter />
          </LocaleProvider>
        </TestContextProvider>
      );

      // Verify navigation elements
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('aria-label', expect.any(String));
      
      // Verify form labels
      const form = screen.getByRole('form');
      const labels = within(form).getAllByRole('label');
      expect(labels.length).toBeGreaterThan(0);
      
      // Verify button text
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
      
      // Verify error messages
      fireEvent.submit(form);
      await waitFor(() => {
        const errors = screen.getAllByRole('alert');
        expect(errors.length).toBeGreaterThan(0);
      });
    });

    test('should handle RTL languages correctly', async () => {
      render(
        <TestContextProvider>
          <LocaleProvider locale="ar-SA">
            <AppRouter />
          </LocaleProvider>
        </TestContextProvider>
      );

      const container = screen.getByTestId('app-container');
      expect(container).toHaveStyle({ direction: 'rtl' });
      
      // Verify text alignment
      const textElements = screen.getAllByRole('textbox');
      textElements.forEach(element => {
        expect(element).toHaveStyle({ textAlign: 'right' });
      });
    });

    test('should format numbers and dates correctly', async () => {
      const testCases = [
        { locale: 'en-US', number: 1234.56, expected: '1,234.56' },
        { locale: 'de-DE', number: 1234.56, expected: '1.234,56' },
        { locale: 'fr-FR', number: 1234.56, expected: '1 234,56' }
      ];

      for (const { locale, number, expected } of testCases) {
        render(
          <TestContextProvider>
            <LocaleProvider locale={locale}>
              <AppRouter />
            </LocaleProvider>
          </TestContextProvider>
        );

        expect(screen.getByTestId('formatted-number')).toHaveTextContent(expected);
      }
    });
  });

  describe('Accessibility Compliance', () => {
    test('should meet WCAG 2.1 Level AA requirements', async () => {
      const { container } = render(
        <TestContextProvider>
          <AppRouter />
        </TestContextProvider>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should handle keyboard navigation correctly', async () => {
      const user = userEvent.setup();
      render(
        <TestContextProvider>
          <AppRouter />
        </TestContextProvider>
      );

      // Test tab order
      await user.tab();
      expect(screen.getByRole('link', { name: 'Home' })).toHaveFocus();
      
      await user.tab();
      expect(screen.getByRole('button', { name: 'Create Route' })).toHaveFocus();
      
      // Test skip links
      const skipLink = screen.getByText('Skip to main content');
      await user.click(skipLink);
      expect(screen.getByRole('main')).toHaveFocus();
    });

    test('should provide appropriate ARIA attributes', async () => {
      render(
        <TestContextProvider>
          <AppRouter />
        </TestContextProvider>
      );

      // Test landmarks
      expect(screen.getByRole('banner')).toBeInTheDocument();
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('navigation')).toBeInTheDocument();

      // Test live regions
      const alerts = screen.getAllByRole('alert');
      alerts.forEach(alert => {
        expect(alert).toHaveAttribute('aria-live', 'polite');
      });
    });

    test('should maintain sufficient color contrast', async () => {
      render(
        <TestContextProvider>
          <AppRouter />
        </TestContextProvider>
      );

      const report: A11yReport = await a11yMonitor.checkColorContrast();
      expect(report.contrastViolations).toHaveLength(0);
      expect(report.minContrast).toBeGreaterThanOrEqual(4.5);
    });

    test('should handle screen reader announcements', async () => {
      render(
        <TestContextProvider>
          <AppRouter />
        </TestContextProvider>
      );

      // Test dynamic content updates
      const updateButton = screen.getByRole('button', { name: 'Update Route' });
      await userEvent.click(updateButton);

      await waitFor(() => {
        const announcement = screen.getByRole('status');
        expect(announcement).toHaveTextContent('Route updated successfully');
        expect(announcement).toHaveAttribute('aria-live', 'polite');
      });
    });
  });

  describe('Content Adaptation', () => {
    test('should adapt content for different cultures', async () => {
      const culturalContent = {
        'en-US': { distance: 'miles', date: 'MM/DD/YYYY' },
        'fr-FR': { distance: 'kilomètres', date: 'DD/MM/YYYY' }
      };

      for (const [locale, expected] of Object.entries(culturalContent)) {
        render(
          <TestContextProvider>
            <LocaleProvider locale={locale}>
              <AppRouter />
            </LocaleProvider>
          </TestContextProvider>
        );

        expect(screen.getByTestId('distance-unit')).toHaveTextContent(expected.distance);
        expect(screen.getByTestId('date-format')).toHaveTextContent(expected.date);
      }
    });
  });
}); 