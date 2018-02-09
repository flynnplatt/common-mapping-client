/**
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import MapReducerCore from "_core/reducers/reducerFunctions/MapReducer";
import * as appStrings from "_core/constants/appStrings";
import { createMap } from "utils/3d-only/MapCreator";

//IMPORTANT: Note that with Redux, state should NEVER be changed.
//State is considered immutable. Instead,
//create a copy of the state passed and set new values on the copy.
export default class MapReducer extends MapReducerCore {
    static initializeMap(state, action) {
        let map = createMap(action.mapType, action.container, state);
        if (map && map.initializationSuccess) {
            return state.setIn(["maps", action.mapType], map);
        }

        let contextStr = action.mapType === appStrings.MAP_LIB_3D ? "3D" : "2D";
        return state.set(
            "alerts",
            state.get("alerts").push(
                alert.merge({
                    title: appStrings.ALERTS.CREATE_MAP_FAILED.title,
                    body: appStrings.ALERTS.CREATE_MAP_FAILED.formatString.replace(
                        "{MAP}",
                        contextStr
                    ),
                    severity: appStrings.ALERTS.CREATE_MAP_FAILED.severity,
                    time: new Date()
                })
            )
        );
    }

    static updateLayerOrder(state, action) {
        // use the 3D map as it is the only one available
        const map3D = state.getIn(["maps", appStrings.MAP_LIB_3D]);

        // pull the currently active vector layer ids from state
        let vectorLayerTypes = [
            appStrings.LAYER_VECTOR_GEOJSON,
            appStrings.LAYER_VECTOR_TOPOJSON,
            appStrings.LAYER_VECTOR_KML
        ];
        let activeVectorIds = state
            .getIn(["layers", appStrings.LAYER_GROUP_TYPE_DATA])
            .filter(layer => {
                return (
                    layer.get("isActive") && vectorLayerTypes.indexOf(layer.get("handleAs")) !== -1
                );
            })
            .map(layer => layer.get("id"));

        // get the layer order according the Cesium
        // NOTE: Cesium vector layers are not added to the list until their data source is loaded (asyncronous)
        let layerOrder = map3D.getActiveLayerIds();

        // make sure vector layers are accounted for
        layerOrder = activeVectorIds.reduce((acc, id) => {
            if (acc.indexOf(id) === -1) {
                acc.push(id);
            }
            return acc;
        }, layerOrder);

        // update the ordering in state
        for (let i = 0; i < layerOrder.length; ++i) {
            state = state.setIn(
                ["layers", appStrings.LAYER_GROUP_TYPE_DATA, layerOrder[i], "displayIndex"],
                layerOrder.length - i
            );
        }

        return state;
    }
}
