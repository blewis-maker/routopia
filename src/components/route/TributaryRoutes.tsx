import { Route } from '@/types/route/types';

interface TributaryRoutesProps {
  mainRoute: Route;
  alternatives: Route[];
  onAlternativeSelect: (route: Route) => void;
}

export const TributaryRoutes: React.FC<TributaryRoutesProps> = ({
  mainRoute,
  alternatives,
  onAlternativeSelect
}) => {
  // For now, return null since we're focusing on the main route functionality
  return null;
}; 