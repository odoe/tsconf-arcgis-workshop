// Widgets
import LayerList from '@arcgis/core/widgets/LayerList';
import Legend from '@arcgis/core/widgets/Legend';

import esri = __esri;

export function initWidgets(view: esri.MapView | esri.SceneView) {
    const legend = new Legend({ view });
    const layerList = new LayerList({ view });

    view.ui.add(legend, 'bottom-left');
    view.ui.add(layerList, 'top-right');
    return view;
}