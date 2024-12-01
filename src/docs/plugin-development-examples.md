# Plugin Development Examples

## Map Layer Plugin

### Custom Visualization Layer
```typescript
import { MapLayerPlugin, LayerConfig } from '@routopia/plugin-sdk';

export class HeatmapLayer extends MapLayerPlugin {
  name = 'heatmap-layer';
  version = '1.0.0';

  async init(context: PluginContext) {
    const { map, data } = context;
    
    // Initialize heatmap
    const heatmap = new HeatmapLayer({
      data: await data.getPoints(),
      radius: 30,
      blur: 15,
      gradient: {
        0.4: 'blue',
        0.6: 'cyan',
        0.8: 'lime',
        0.9: 'yellow',
        1.0: 'red'
      }
    });

    map.addLayer(heatmap);
    
    // Handle updates
    this.subscribeToData((newData) => {
      heatmap.setData(newData);
    });
  }
}
```

### Route Analysis Plugin
```typescript
import { RoutePlugin, RouteAnalysis } from '@routopia/plugin-sdk';

export class ElevationAnalysis extends RoutePlugin {
  name = 'elevation-analysis';
  version = '1.0.0';

  async init(context: PluginContext) {
    const { route, ui } = context;
    
    // Add elevation profile
    const profile = await this.createElevationProfile(route);
    ui.addPanel('elevation', {
      title: 'Elevation Profile',
      content: profile
    });

    // Subscribe to route changes
    route.onChange(async (newRoute) => {
      const newProfile = await this.createElevationProfile(newRoute);
      ui.updatePanel('elevation', newProfile);
    });
  }

  private async createElevationProfile(route: Route) {
    const points = await this.getElevationData(route);
    return new ElevationChart({
      data: points,
      height: 200,
      interactive: true
    });
  }
}
```

### Data Provider Plugin
```typescript
import { DataPlugin, DataSource } from '@routopia/plugin-sdk';

export class WeatherDataProvider extends DataPlugin {
  name = 'weather-data';
  version = '1.0.0';

  async init(context: PluginContext) {
    const { data, events } = context;
    
    // Register data source
    data.registerSource('weather', {
      fetch: async (bounds) => {
        return this.fetchWeatherData(bounds);
      },
      refresh: 300000 // 5 minutes
    });

    // Handle viewport changes
    events.on('viewport.change', async (bounds) => {
      await data.refresh('weather', bounds);
    });
  }
}
``` 