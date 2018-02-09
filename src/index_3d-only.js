/*eslint-disable import/default*/
import "babel-polyfill";
import React from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";
import configureStore from "store/3d-only/configureStore";
import { AppContainer } from "components/3d-only";
require("_core/styles/resources/img/apple-touch-icon.png");
require("_core/styles/resources/img/favicon-32x32.png");
require("_core/styles/resources/img/favicon-16x16.png");
require("_core/styles/resources/img/safari-pinned-tab.svg");
require("_core/styles/resources/img/favicon.ico");
require("_core/styles/resources/img/7994970.png");
require("_core/styles/resources/img/layer_thumbnails/AMSR2_Sea_Ice_Brightness_Temp_6km_89H.png");
require("_core/styles/resources/img/layer_thumbnails/GHRSST_L4_G1SST_Sea_Surface_Temperature.png");
require("_core/styles/resources/img/layer_thumbnails/MODIS_Terra_Brightness_Temp_Band31_Day.png");
require("_core/styles/resources/img/layer_thumbnails/VIIRS_SNPP_CorrectedReflectance_TrueColor.png");
require("_core/styles/resources/img/layer_thumbnails/flight_paths_kml.png");
require("_core/styles/resources/img/layer_thumbnails/us_state_outline_topojson.png");
require("_core/styles/resources/img/layer_thumbnails/ESRI_World_Imagery.jpeg");
require("_core/styles/resources/img/layer_thumbnails/BlueMarble_ShadedRelief_Bathymetry.jpeg");
require("_core/styles/resources/img/layer_thumbnails/OSM_Land_Water_Map.png");
require("_core/styles/resources/img/layer_thumbnails/ASTER_GDEM_Color_Shaded_Relief.jpeg");

const store = configureStore();

render(
    <Provider store={store}>
        <AppContainer />
    </Provider>,
    document.getElementById("app")
);
