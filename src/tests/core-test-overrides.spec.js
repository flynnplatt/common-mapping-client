/**
 * Copyright 2017 California Institute of Technology.
 *
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

/*global INCLUDE_CORE_TESTS*/
import "babel-polyfill";
import TestUtil from "_core/tests/TestUtil";
import { CacheSpec } from "_core/tests/Cache.spec";
import { MapUtilSpec } from "_core/tests/MapUtil.spec";
import { MiscUtilSpec } from "_core/tests/MiscUtil.spec";
import { StoreAnalyticsSpec } from "_core/tests/store.analytics.spec";
import { StoreAsyncSpec } from "_core/tests/store.async.spec";
import { StoreDateSliderSpec } from "_core/tests/store.dateSlider.spec";
import { StoreHelpSpec } from "_core/tests/store.help.spec";
import { StoreLayerInfoSpec } from "_core/tests/store.layerInfo.spec";
import { StoreMapSpec } from "_core/tests/store.map.spec";
import { StoreSettingsSpec } from "_core/tests/store.settings.spec";
import { StoreShareSpec } from "_core/tests/store.share.spec";
import { StoreSpec } from "_core/tests/store.spec";
import { StoreViewSpec } from "_core/tests/store.view.spec";
import { WebWorkerSpec } from "_core/tests/WebWorker.spec";
import { expect } from "chai";
import Immutable from "immutable";

//// Override any core tests here
//// MiscUtilSpec Overrides Examples

// Override a test
// MiscUtilSpec.tests.generateStringFromSet.test2 = () => {
//     it('OVERRIDE test2: blah blah', () => {
//         expect(1).to.be.true;
//     });
// }
// Disable a test
// MiscUtilSpec.generateStringFromSet.test3 = () => {};

// Disable a test set
// MiscUtilSpec.findObjectInArray = {};

// Disable tests that deal with the 2D map
StoreMapSpec.tests.default.test1 = () => {};
StoreMapSpec.tests.default.test3 = () => {};
StoreMapSpec.tests.default.test4 = () => {};
StoreMapSpec.tests.default.test9 = () => {};
StoreMapSpec.tests.default.test10 = () => {};
StoreMapSpec.tests.default.test11 = () => {};
StoreMapSpec.tests.default.test13 = () => {};
StoreMapSpec.tests.default.test14 = () => {};
StoreMapSpec.tests.default.test16 = () => {};
StoreMapSpec.tests.default.test16B = () => {};
StoreMapSpec.tests.default.test17 = () => {};
StoreMapSpec.tests.default.test17B = () => {};
StoreMapSpec.tests.default.test18 = () => {};
StoreMapSpec.tests.default.test18B = () => {};
StoreMapSpec.tests.default.test19 = () => {};
StoreMapSpec.tests.default.test20 = () => {};
StoreMapSpec.tests.default.test21 = () => {};
StoreMapSpec.tests.default.test22 = () => {};
StoreMapSpec.tests.default.test26 = () => {};
StoreMapSpec.tests.default.test28 = () => {};
StoreMapSpec.tests.default.test30 = () => {};
StoreMapSpec.tests.default.test30B = () => {};
StoreMapSpec.tests.default.test31 = () => {};
StoreMapSpec.tests.default.test31B = () => {};
StoreMapSpec.tests.default.test32 = () => {};
StoreMapSpec.tests.default.test32B = () => {};
StoreMapSpec.tests.default.test34 = () => {};
StoreMapSpec.tests.default.test34B = () => {};
StoreMapSpec.tests.default.test35 = () => {};
StoreMapSpec.tests.default.test35B = () => {};
WebWorkerSpec.tests.default.test3 = () => {};

// Run core tests
const testSuites = [
    CacheSpec,
    MiscUtilSpec,
    MapUtilSpec,
    StoreAnalyticsSpec,
    StoreAsyncSpec,
    StoreDateSliderSpec,
    StoreHelpSpec,
    StoreLayerInfoSpec,
    StoreMapSpec,
    StoreSettingsSpec,
    StoreShareSpec,
    StoreSpec,
    StoreViewSpec,
    WebWorkerSpec
];

if (INCLUDE_CORE_TESTS) {
    testSuites.map(testSuite => TestUtil.runTestSuite(testSuite));
}
