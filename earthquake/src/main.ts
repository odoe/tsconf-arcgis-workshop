import ArcGISMap from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer';

// widgets
import TimeSlider from '@arcgis/core/widgets/TimeSlider';
import Legend from '@arcgis/core/widgets/Legend';
import Expand from '@arcgis/core/widgets/Expand';

import esri = __esri;

const geojsonURL = 'https://bsvensson.github.io/various-tests/geojson/usgs-earthquakes-06182019.geojson';

(async() => {
  const layer = new GeoJSONLayer({
    url: geojsonURL,
    copyright: 'USGS Earthquakes',
    title: 'USGS Earthquakes',
    timeInfo: {
      startField: 'time',
      interval: {
        unit: 'days',
        value: 1
      }
    },
    renderer: {
      type: 'simple',
      field: 'mag',
      symbol: {
        type: 'simple-marker',
        color: 'orange',
        outline: null
      },
      visualVariables: [
        {
          type: 'size',
          field: 'mag',
          stops: [
            {
              value: 1,
              size: '5px'
            },
            {
              value: 2,
              size: '15'
            },
            {
              value: 3,
              size: '35'
            }
          ]
        },
        {
          type: 'color',
          field: 'depth',
          stops: [
            {
              value: 2.5,
              color: '#F9C653',
              label: '<2km'
            },
            {
              value: 3.5,
              color: '#F8864D',
              label: '3km'
            },
            {
              value: 4,
              color: '#C53C06',
              label: '>4km'
            }
          ]
        }
      ]
    } as any,
    popupTemplate: {
      title: '{title}',
      content: [
        {
          type: 'fields',
          fieldInfos: [
            {
              fieldName: 'place',
              label: 'Location',
              visible: true
            },
            {
              fieldName: 'mag',
              label: 'Magnitude',
              visible: true
            },
            {
              fieldName: 'depth',
              label: 'Depth',
              visible: true
            }
          ]
        }
      ]
    }
  });

  const map = new ArcGISMap({
    basemap: 'dark-gray-vector',
    layers: [layer]
  });

  const view = new MapView({
    map: map,
    container: 'viewDiv',
    zoom: 13,
    center: [-117.50268, 34.04713]
  });

  const timeSlider = new TimeSlider({
    container: 'timeSlider',
    playRate: 50,
    stops: {
      interval: {
        value: 1,
        unit: 'hours'
      } as any
    }
  });
  view.ui.add(timeSlider, 'manual');

    const layerView = await view.whenLayerView(layer);
    const start = new Date(2019, 4, 25);

    timeSlider.fullTimeExtent = {
      start: start,
      end: layer.timeInfo.fullTimeExtent.end
    } as any;

    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    timeSlider.values = [start, end];

  timeSlider.watch('timeExtent', async () => {
    layer.definitionExpression =
      'time <= ' + timeSlider.timeExtent.end.getTime();

    layerView.effect = {
      filter: {
        timeExtent: timeSlider.timeExtent,
        geometry: view.extent
      },
      excludedEffect: 'grayscale(20%) opacity(12%)'
    } as any;

    const statQuery = layerView.effect.filter.createQuery();
    statQuery.outStatistics = [
      magMax,
      magAvg,
      magMin,
      tremorCount,
      avgDepth
    ] as any[];

    const result: esri.FeatureSet = await layer.queryFeatures(statQuery);
    let htmls = [];
    statsDiv.innerHTML = '';
    if (result.features.length >= 1) {
      const attributes = result.features[0].attributes;
      for (let name in statsFields) {
        if (attributes[name] && attributes[name] != null) {
          const html =
            '<br/>' +
            statsFields[name] +
            ': <b><span> ' +
            attributes[name].toFixed(2) +
            '</span></b>';
          htmls.push(html);
        }
      }
      const yearHtml =
        '<span>' +
        result.features[0].attributes['tremor_count'] +
        '</span> earthquakes were recorded between ' +
        timeSlider.timeExtent.start.toLocaleDateString() +
        ' - ' +
        timeSlider.timeExtent.end.toLocaleDateString() +
        '.<br/>';

      if (htmls[0] == undefined) {
        statsDiv.innerHTML = yearHtml;
      } else {
        statsDiv.innerHTML =
          yearHtml + htmls[0] + htmls[1] + htmls[2] + htmls[3];
      }
    }
  });

  const avgDepth = {
    onStatisticField: 'depth',
    outStatisticFieldName: 'Average_depth',
    statisticType: 'avg'
  };

  const magMax = {
    onStatisticField: 'mag',
    outStatisticFieldName: 'Max_magnitude',
    statisticType: 'max'
  };

  const magAvg = {
    onStatisticField: 'mag',
    outStatisticFieldName: 'Average_magnitude',
    statisticType: 'avg'
  };

  const magMin = {
    onStatisticField: 'mag',
    outStatisticFieldName: 'Min_magnitude',
    statisticType: 'min'
  };

  const tremorCount = {
    onStatisticField: 'mag',
    outStatisticFieldName: 'tremor_count',
    statisticType: 'count'
  };

  const statsFields = {
    Max_magnitude: 'Max magnitude',
    Average_magnitude: 'Average magnitude',
    Min_magnitude: 'Min magnitude',
    Average_depth: 'Average Depth'
  };

  const legendExpand = new Expand({
    expandIconClass: 'esri-icon-expand',
    expandTooltip: 'Legend',
    view: view,
    content: new Legend({
      view: view
    }),
    expanded: false
  });
  view.ui.add(legendExpand, 'top-left');

  const statsDiv = document.getElementById('statsDiv');
  const infoDiv = document.getElementById('infoDiv');
  const infoDivExpand = new Expand({
    expandIconClass: 'esri-icon-expand',
    expandTooltip: 'Expand earthquakes info',
    view: view,
    content: infoDiv,
    expanded: true
  });
  view.ui.add(infoDivExpand, 'top-right');
})()