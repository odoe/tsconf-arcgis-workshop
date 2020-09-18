 
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import TileLayer from '@arcgis/core/layers/TileLayer';
import VectorTileLayer from '@arcgis/core/layers/VectorTileLayer';
import ArcGISMap from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';

import { initWidgets } from './widgets';

const featureLayer = new FeatureLayer({
  portalItem: {
    id: 'b234a118ab6b4c91908a1cf677941702'
  },
  outFields: ['NAME', 'STATE_NAME', 'VACANT', 'HSE_UNITS'],
  title: 'U.S. Counties'
});

const map = new ArcGISMap({
  basemap: {
    baseLayers: [
      // hillshade
      new TileLayer({
        portalItem: {
          id: '1b243539f4514b6ba35e7d995890db1d'
        }
      }),
      // topo
      new VectorTileLayer({
        portalItem: {
          id: '7dc6cea0b1764a1f9af2e679f642f0f5'
        }
      })
    ]
  },
  // layers: [featureLayer]
});

map.add(featureLayer);

const view = new MapView({
  container: 'viewDiv',
  map
});

featureLayer.when(() => {
  view.goTo(featureLayer.fullExtent);
});

view.when(initWidgets);

