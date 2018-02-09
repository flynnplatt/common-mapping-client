/**
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as appActions from "_core/actions/appActions";
import * as appStrings from "_core/constants/appStrings";
import appConfig from "constants/appConfig";
import { ShareContainer as ShareContainerCore } from "_core/components/Share/ShareContainer.js";

export class ShareContainer extends ShareContainerCore {
    getActiveLayerString() {
        let map = this.props.maps.get(appStrings.MAP_LIB_3D);
        if (map) {
            let layerIds = map.getActiveLayerIds();
            if (layerIds) {
                let idsWithOpacity = layerIds.map(layerId => {
                    return (
                        layerId +
                        "(" +
                        this.props.layers.getIn([
                            appStrings.LAYER_GROUP_TYPE_DATA,
                            layerId,
                            "opacity"
                        ]) +
                        ")"
                    );
                });
                return appConfig.URL_KEYS.ACTIVE_LAYERS + "=" + idsWithOpacity.join(",");
            }
        }
        return "";
    }
}

ShareContainer.propTypes = ShareContainerCore.propTypes;

function mapStateToProps(state) {
    return {
        isOpen: state.share.get("isOpen"),
        updateFlag: state.share.get("updateFlag"),
        autoUpdateUrl: state.share.get("autoUpdateUrl"),
        maps: state.map.get("maps"),
        layers: state.map.get("layers"),
        in3DMode: state.map.getIn(["view", "in3DMode"]),
        extent: state.map.getIn(["view", "extent"]),
        enableTerrain: state.map.getIn(["displaySettings", "enableTerrain"]),
        mapDate: state.map.get("date"),
        dateSliderResolution: state.dateSlider.get("resolution")
    };
}

function mapDispatchToProps(dispatch) {
    return {
        appActions: bindActionCreators(appActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ShareContainer);
