import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { FeatureManager } from '@/components/features/FeatureManager';
import { AdvancedFeatures } from '@/services/features/AdvancedFeatures';
import { EnhancedErrorHandler } from '@/services/error/EnhancedErrorHandler';
import { TestEnvironment } from '../setup/TestEnvironment';

describe('FeatureManager Integration', () => {
  let testEnv: TestEnvironment;
  let features: AdvancedFeatures;
  let errorHandler: EnhancedErrorHandler;

  beforeEach(async () => {
    testEnv = new TestEnvironment();
    await testEnv.setup();
    
    features = new AdvancedFeatures();
    errorHandler = new EnhancedErrorHandler();
  });

  afterEach(async () => {
    await testEnv.teardown();
  });

  describe('Offline Region Management', () => {
    test('should add new offline region', async () => {
      const { getByText, getByLabelText } = render(
        <FeatureManager features={features} errorHandler={errorHandler} />
      );

      const regionName = 'Test Region';
      const bounds: [[number, number], [number, number]] = [[0, 0], [1, 1]];

      fireEvent.change(getByLabelText('Region Name'), {
        target: { value: regionName }
      });

      fireEvent.click(getByText('Add Region'));

      await waitFor(() => {
        expect(getByText(regionName)).toBeInTheDocument();
      });
    });

    test('should handle region download errors', async () => {
      const mockError = new Error('Download failed');
      vi.spyOn(features, 'enableOfflineSupport').mockRejectedValue(mockError);

      const { getByText } = render(
        <FeatureManager features={features} errorHandler={errorHandler} />
      );

      fireEvent.click(getByText('Add Region'));

      await waitFor(() => {
        expect(getByText('Download failed')).toBeInTheDocument();
      });
    });
  });

  describe('Custom Activity Management', () => {
    test('should register new custom activity', async () => {
      const { getByText, getByLabelText } = render(
        <FeatureManager features={features} errorHandler={errorHandler} />
      );

      const activityName = 'Mountain Biking';
      
      fireEvent.change(getByLabelText('Activity Name'), {
        target: { value: activityName }
      });

      fireEvent.click(getByText('Add Activity'));

      await waitFor(() => {
        expect(getByText(activityName)).toBeInTheDocument();
      });
    });
  });

  describe('Predictive Routing', () => {
    test('should update predictive routing configuration', async () => {
      const { getByLabelText } = render(
        <FeatureManager features={features} errorHandler={errorHandler} />
      );

      const weatherToggle = getByLabelText('Weather-aware routing');
      fireEvent.click(weatherToggle);

      await waitFor(() => {
        expect(weatherToggle).toBeChecked();
      });
    });
  });

  describe('Service Status', () => {
    test('should display service degradation', async () => {
      const { getByText } = render(
        <FeatureManager features={features} errorHandler={errorHandler} />
      );

      errorHandler.handleError(new Error('Service degraded'), {
        service: 'routing',
        operation: 'getRoute',
        severity: 'medium'
      });

      await waitFor(() => {
        expect(getByText('Service Status: Degraded')).toBeInTheDocument();
      });
    });
  });
}); 