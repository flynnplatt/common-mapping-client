/**
 * Copyright 2017 California Institute of Technology.
 *
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import Immutable from "immutable";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import ListSubheader from "material-ui/List/ListSubheader";
import List, { ListItem, ListItemIcon, ListItemText } from "material-ui/List";
import Checkbox from "material-ui/Checkbox";
import { MenuItem } from "material-ui/Menu";
import { FormControl, FormHelperText } from "material-ui/Form";
import Input, { InputLabel } from "material-ui/Input";
import Select from "material-ui/Select";
import SettingsBackupRestoreIcon from "material-ui-icons/SettingsBackupRestore";
import appConfig from "constants/appConfig";
import * as appStrings from "_core/constants/appStrings";
import * as appActions from "_core/actions/appActions";
import * as mapActions from "_core/actions/mapActions";
import * as dateSliderActions from "_core/actions/dateSliderActions";
import * as analyticsActions from "_core/actions/analyticsActions";
import MiscUtil from "_core/utils/MiscUtil";
import { ModalMenu } from "_core/components/ModalMenu";

export class SettingsContainer extends Component {
    shouldComponentUpdate(nextProps) {
        return nextProps.settingsOpen || nextProps.settingsOpen !== this.props.settingsOpen;
    }

    render() {
        return (
            <ModalMenu
                title="Settings"
                active={this.props.settingsOpen}
                closeFunc={() => this.props.appActions.setSettingsOpen(false)}
            >
                <List>
                    <ListSubheader disableSticky>Map Display</ListSubheader>
                    <ListItem>
                        <FormControl fullWidth>
                            <InputLabel htmlFor="scale-units-select">Scale Units</InputLabel>
                            <Select
                                value={this.props.mapSettings.get("selectedScaleUnits")}
                                onChange={event =>
                                    this.props.mapActions.setScaleUnits(event.target.value)
                                }
                                input={<Input name="Scale Units" id="scale-units-select" />}
                            >
                                {appConfig.SCALE_OPTIONS.map(x => (
                                    <MenuItem key={x.value} value={x.value}>
                                        {x.label}
                                        <small style={{ marginLeft: "7px" }}>{x.abbrev}</small>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </ListItem>
                    <ListItem>
                        <FormControl fullWidth>
                            <InputLabel htmlFor="terrain-exaggeration-select">
                                Terrain Exaggeration
                            </InputLabel>
                            <Select
                                value={this.props.mapSettings.get("selectedTerrainExaggeration")}
                                onChange={event =>
                                    this.props.mapActions.setTerrainExaggeration(event.target.value)
                                }
                                input={
                                    <Input
                                        name="Terrain Exaggeration"
                                        id="terrain-exaggeration-select"
                                    />
                                }
                            >
                                {appConfig.TERRAIN_EXAGGERATION_OPTIONS.map(x => (
                                    <MenuItem key={x.value} value={x.value}>
                                        {x.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </ListItem>
                    <ListItem
                        button
                        onClick={evt =>
                            this.props.mapActions.setTerrainEnabled(
                                !this.props.mapSettings.get("enableTerrain")
                            )
                        }
                    >
                        <Checkbox
                            disableRipple
                            checked={this.props.mapSettings.get("enableTerrain")}
                        />
                        <ListItemText
                            primary="Enable 3D Terrain"
                            secondary="Enable terrain on the 3D map"
                        />
                    </ListItem>
                    <ListSubheader disableSticky>Application Configuration</ListSubheader>
                    <ListItem
                        button
                        onClick={evt =>
                            this.props.analyticsActions.setAnalyticsEnabled(
                                !this.props.analyticsEnabled
                            )
                        }
                    >
                        <Checkbox disableRipple checked={this.props.analyticsEnabled} />
                        <ListItemText
                            primary="User Feedback Program"
                            secondary="Help us improve this tool by sending anonymous usage information"
                        />
                    </ListItem>
                    <ListItem
                        button
                        onClick={evt =>
                            this.props.appActions.setAutoUpdateUrl(!this.props.autoUpdateUrlEnabled)
                        }
                    >
                        <Checkbox disableRipple checked={this.props.autoUpdateUrlEnabled} />
                        <ListItemText
                            primary="Auto-Update Url"
                            secondary="Automatically update the url in this window to be shareable"
                        />
                    </ListItem>
                    <ListItem button onClick={this.props.appActions.resetApplicationState}>
                        <ListItemIcon style={{ margin: "0 12" }}>
                            <SettingsBackupRestoreIcon />
                        </ListItemIcon>
                        <ListItemText
                            primary="Reset Application"
                            secondary="Restore the application to its default state"
                        />
                    </ListItem>
                </List>
            </ModalMenu>
        );
    }
}

SettingsContainer.propTypes = {
    settingsOpen: PropTypes.bool.isRequired,
    analyticsEnabled: PropTypes.bool.isRequired,
    autoUpdateUrlEnabled: PropTypes.bool.isRequired,
    mapSettings: PropTypes.object.isRequired,
    appActions: PropTypes.object.isRequired,
    mapActions: PropTypes.object.isRequired,
    dateSliderActions: PropTypes.object.isRequired,
    analyticsActions: PropTypes.object.isRequired
};

function mapStateToProps(state) {
    return {
        settingsOpen: state.settings.get("isOpen"),
        mapSettings: state.map.get("displaySettings"),
        analyticsEnabled: state.analytics.get("isEnabled"),
        autoUpdateUrlEnabled: state.share.get("autoUpdateUrl")
    };
}

function mapDispatchToProps(dispatch) {
    return {
        appActions: bindActionCreators(appActions, dispatch),
        mapActions: bindActionCreators(mapActions, dispatch),
        dateSliderActions: bindActionCreators(dateSliderActions, dispatch),
        analyticsActions: bindActionCreators(analyticsActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SettingsContainer);
