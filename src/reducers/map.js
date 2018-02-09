/**
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import { mapState } from "reducers/3d-only/models/map";
import mapCore from "_core/reducers/map";
import MapReducer from "reducers/3d-only/MapReducer";

export default function map(state = mapState, action, opt_reducer = MapReducer) {
    switch (action.type) {
        default:
            return mapCore.call(this, state, action, opt_reducer);
    }
}
