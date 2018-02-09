/**
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import MapWrapperCesiumCore from "_core/utils/MapWrapperCesium";
import * as appStrings from "_core/constants/appStrings";

export default class MapWrapperCesium extends MapWrapperCesiumCore {
    constructor(container, options) {
        super(container, options);
    }

    getActiveLayerIds() {
        let retList = [];
        let vectorLayers = this.map.dataSources;
        let imageLayers = this.map.imageryLayers;

        // added raster layer ids
        for (let i = 0; i < imageLayers.length; ++i) {
            let layer = imageLayers.get(i);
            if (layer._layerType === appStrings.LAYER_GROUP_TYPE_DATA) {
                retList.push(layer._layerId);
            }
        }

        // add vector layer ids
        // NOTE: Cesium vector layers are not added to the list until their data source is loaded (asyncronous)
        for (let i = 0; i < vectorLayers.length; ++i) {
            let layer = vectorLayers.get(i);
            if (layer._layerType === appStrings.LAYER_GROUP_TYPE_DATA) {
                retList.push(layer._layerId);
            }
        }

        return retList;
    }
}
