## 3D Map Only

### Overview
This example removes the 2D map from the application. This involves
removing a call to initialize the 2D map and overriding certain functions
that reference the 2D map by default.

### Files Changed

**Components**
 * `src/components/App/AppContainer.js`: New AppContainer to pull in the new/modified components
 * `src/components/App/MapContainer.js`: New MapContainer that doesn't import/render the MapContainer2D
 * `src/components/App/MapControlsContainer.js`: New MapControlsContainer that doesn't render a 2D/3D switch button
 * `src/components/App/ShareContainer.js`: New ShareContainer that extends the `_core` ShareContainer and overrides the method that extracts active layer information to reference the 3D instead of the 2D map
 * `src/components/App/index.js`: New index to export the new components

**Constants**
 * `src/constants/appConfig.js`: Update the `APP_TITLE` for display in the AppBar

**Reducers**
 * `src/reducers/MapReducer.js`: New MapReducer that extends the `_core` MapReducer and overrides the method that extracts and updates layer ordering information to reference the 3D map instead of the 2D map
 * `src/reducers/index.js`: Modified to use the new reducers
 * `src/reducers/map.js`: New reducer function to make use of the new MapReducer and model
 * `src/reducers/models/map.js`: New model to default the application to 3D view

 **Utils**
 * `src/utils/MapCreator.js`: Modified MapCreator to not import the MapWrapperOpenlayers class and thus cut down on the bundle size
 * `src/utils/MapWrapperCesium.js`: New MapWrapper that extends the `_core` MapWrapperCesium class to add a method that extracts the active layer order from the map

**Other**
 * `src/index.js`: Modified to use the new AppContainer component
 * `src/index_template.html`: Modified the display title and header

 **Tests**
 * `src/tests/core-test-overrides.spec.js`: Disable tests that rely on a 2D map
