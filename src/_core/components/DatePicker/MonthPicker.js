/**
 * Copyright 2017 California Institute of Technology.
 *
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Input from "material-ui/Input";
import MiscUtil from "_core/utils/MiscUtil";
import appConfig from "constants/appConfig";
import styles from "_core/components/DatePicker/DatePicker.scss";

const MAX_LENGTH = 3;

export class MonthPicker extends Component {
    componentDidMount() {
        this.month = this.props.month;
        this.error = false;
        this.updateFromInternal = false;
    }
    shouldComponentUpdate(nextProps) {
        return nextProps.month !== this.props.month || nextProps.month !== this.month;
    }
    handleKeyPress(evt) {
        let monthStr = this.month;
        if (evt.charCode === 13) {
            // enter key
            this.submitMonth(monthStr);
        }
    }
    handleBlur(evt) {
        let monthStr = this.month;
        this.submitMonth(monthStr);
    }
    handleChange(monthStr) {
        if (monthStr.length <= MAX_LENGTH) {
            this.month = monthStr;
        }
        this.error = false;
        this.updateFromInternal = true;
        this.forceUpdate();
    }
    submitMonth(monthStr) {
        this.props.onUpdate(monthStr);

        // if the update failed because date was invalid
        // force a re-render the go back to previous valid state
        if (this.month !== this.props.month) {
            this.error = true;
            this.forceUpdate();
        }
    }
    render() {
        let monthStr = this.updateFromInternal ? this.month : this.props.month;
        this.month = monthStr;
        this.updateFromInternal = false;
        let containerClasses = MiscUtil.generateStringFromSet({
            [styles.datePickerSelector]: true,
            [styles.datePickerSelectorError]: this.error
        });
        return (
            <div className={containerClasses}>
                <Input
                    type="text"
                    tabIndex="0"
                    value={monthStr}
                    inputProps={{
                        onBlur: evt => {
                            this.handleBlur(evt.target.value);
                        },
                        onKeyPress: evt => {
                            this.handleKeyPress(evt);
                        }
                    }}
                    onChange={evt => this.handleChange(evt.target.value)}
                    classes={{ input: styles.selectionInput }}
                />
            </div>
        );
    }
}

MonthPicker.propTypes = {
    onUpdate: PropTypes.func.isRequired,
    month: PropTypes.string.isRequired
};

export default connect()(MonthPicker);
