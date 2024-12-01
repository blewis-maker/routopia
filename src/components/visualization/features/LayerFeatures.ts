export const LayerFeatures = {
  route: {
    // Route styling features
    style: {
      gradient: (route: Route, theme: Theme) => {
        return createRouteGradient(route, theme);
      },
      pattern: (type: RouteType) => {
        return getRoutePattern(type);
      },
      animation: (state: RouteState) => {
        return getRouteAnimation(state);
      }
    },
    
    // Route interaction features
    interaction: {
      hover: (segment: RouteSegment) => {
        return highlightSegment(segment);
      },
      click: (point: RoutePoint) => {
        return selectPoint(point);
      },
      drag: (segment: RouteSegment) => {
        return enableSegmentDrag(segment);
      }
    },
    
    // Route metrics features
    metrics: {
      calculate: (route: Route) => {
        return calculateRouteMetrics(route);
      },
      display: (metrics: RouteMetrics) => {
        return formatMetricsDisplay(metrics);
      },
      update: (changes: RouteChanges) => {
        return updateMetricsRealtime(changes);
      }
    }
  },

  markers: {
    // Marker rendering features
    render: {
      icon: (type: MarkerType) => {
        return getMarkerIcon(type);
      },
      label: (marker: Marker) => {
        return createMarkerLabel(marker);
      },
      cluster: (markers: Marker[]) => {
        return renderCluster(markers);
      }
    },
    
    // Marker interaction features
    interaction: {
      hover: (marker: Marker) => {
        return showMarkerPreview(marker);
      },
      click: (marker: Marker) => {
        return openMarkerDetails(marker);
      },
      drag: (marker: Marker) => {
        return enableMarkerDrag(marker);
      }
    }
  }
}; 