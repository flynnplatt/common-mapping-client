## 2D Map Only

### Overview
This example removes the 3D map from the application. This involves
removing calls to initialize the 3D map and components that expect a
3D map to be present.

### Files Changed

**Components**
 * `src/components/App/AppContainer.js`: New AppContainer to pull in the new/modified components
 * `src/components/App/MapContainer.js`: New MapContainer that doesn't import/render the MapContainer3D
 * `src/components/App/MapControlsContainer.js`: New MapControlsContainer that doesn't render a 2D/3D switch button
 * `src/components/App/SettingsContainer.js`: New SettingsContainer that doesn't render 3D only options
 * `src/components/App/index.js`: New index to export the new components
 
 **Constants**
 * `src/constants/appConfig.js`: Update the `APP_TITLE` for display in the AppBar

**Utils**
 * `src/utils/MapCreator.js`: Modified MapCreator to not import the MapWrapperOpenlayers class and thus cut down on the bundle size

**Other**
 * `.circleci/config.yml`: Modified test step during the CI build to skip 3D tests
 * `src/index.js`: Modified to use the new AppContainer component
 * `src/index_template.html`: Modified the display title and header
