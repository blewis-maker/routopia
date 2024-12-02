import type { Activity } from '../../types/activity';
import type { Route } from '../../types/routes';
import type { SearchContext } from '../../types/search-context';

export interface TestableActivity extends Activity {
  __test__: {
    mockData?: boolean;
    simulateError?: boolean;
  };
}

export interface TestableRoute extends Route {
  __test__: {
    mockSegments?: boolean;
    simulateTraffic?: boolean;
  };
}

export interface TestableSearchContext extends SearchContext {
  __test__: {
    mockResults?: boolean;
    simulateLatency?: boolean;
  };
} 