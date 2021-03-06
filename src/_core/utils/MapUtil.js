/**
 * Copyright 2017 California Institute of Technology.
 *
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import Immutable from "immutable";
import turfLineDistance from "turf-line-distance";
import turfArea from "turf-area";
import Qty from "js-quantities";
import turfCentroid from "turf-centroid";
import proj4js from "proj4";
import { GreatCircle } from "assets/arc/arc";
import Ol_Format_WMTSCapabilities from "ol/format/wmtscapabilities";
import Ol_Source_WMTS from "ol/source/wmts";
import Ol_Proj from "ol/proj";
import Ol_Proj_Projection from "ol/proj/projection";
import * as appStrings from "_core/constants/appStrings";
import appConfig from "constants/appConfig";
import MiscUtil from "_core/utils/MiscUtil";

export default class MapUtil {
    /**
     * Reference to a MiscUtil class
     *
     * @static
     * @memberof MapUtil
     */
    static miscUtil = MiscUtil;

    /**
     * constrains coordinates to [+-180, +-90]
     *
     * @static
     * @param {array} coords Array of [lon,lat] values
     * @param {boolean} [constrainY=true] true if the coordinates should be limited in the Y direction. Defaults to true
     * @returns {array} array of coordinates contrained to [+-180, +-90]
     * @memberof MapUtil
     */
    static constrainCoordinates(coords, constrainY = true) {
        // check for array of numbers
        if (
            typeof coords !== "object" ||
            coords.length !== 2 ||
            typeof coords[0] !== "number" ||
            typeof coords[1] !== "number"
        ) {
            return false;
        }

        let newCoords = [0, 0];

        // constrain x
        if (Math.abs(coords[0]) > 180) {
            let scale = Math.floor(coords[0] / 180);
            if (coords[0] < 0) {
                if (scale % 2 !== 0) {
                    newCoords[0] = coords[0] % 180;
                } else {
                    newCoords[0] = 180 - Math.abs(coords[0] % 180);
                }
            } else {
                if (scale % 2 !== 0) {
                    newCoords[0] = 0 - (180 - Math.abs(coords[0] % 180));
                } else {
                    newCoords[0] = coords[0] % 180;
                }
            }
        } else {
            newCoords[0] = coords[0];
        }

        // constrain y
        if (constrainY) {
            // simple top/bottom limit
            if (coords[1] > 0) {
                newCoords[1] = Math.min(90, coords[1]);
            } else {
                newCoords[1] = Math.max(-90, coords[1]);
            }
        } else {
            // handle vertical wrapping
            if (Math.abs(coords[1]) > 90) {
                let scale = Math.floor(coords[1] / 90);
                if (coords[1] < 0) {
                    if (scale % 2 !== 0) {
                        newCoords[1] = coords[1] % 90;
                    } else {
                        newCoords[1] = 90 - Math.abs(coords[1] % 90);
                    }
                } else {
                    if (scale % 2 !== 0) {
                        newCoords[1] = 0 - (90 - Math.abs(coords[1] % 90));
                    } else {
                        newCoords[1] = coords[1] % 90;
                    }
                }
            } else {
                newCoords[1] = coords[1];
            }
        }
        return newCoords;
    }

    /**
     * Deconstrain a set of constrained coordinates. This is meant for polylines
     * that cross the dateline.
     *
     * @static
     * @param {array} linesArr array of line segement start & end coordinate arrays [[[lon,lat], [lon,lat], ...], ...]
     * @returns {array} array of line segment start & end coordinate arrays with the coordinates deconstrained from [+-180, +-90]
     * @memberof MapUtil
     */
    static deconstrainArcCoordinates(linesArr) {
        // if there is only one polyline, then we assume no splitting has occured
        if (linesArr.length < 2) {
            return linesArr;
        }

        // take first set of constrained coordinates as initial frame
        // shift subsequent coordinates relative to those
        let referenceLine = linesArr[0];
        let referenceLineEnd = referenceLine[referenceLine.length - 1];

        let deconstrainedLine = linesArr[0].slice(0, linesArr[0].length);
        for (let i = 1; i < linesArr.length; ++i) {
            let line = linesArr[i];
            let lineStart = line[0];

            if (referenceLineEnd[0] <= 0) {
                if (lineStart[0] >= 0) {
                    let shiftedLine = line.map(coords => {
                        let shiftedCoords = coords.slice(0, coords.length);
                        shiftedCoords[0] -= 360;
                        return shiftedCoords;
                    });
                    // remove first point due to overlap
                    deconstrainedLine = deconstrainedLine.concat(
                        shiftedLine.slice(1, shiftedLine.length)
                    );
                } else {
                    deconstrainedLine = deconstrainedLine.concat(line.slice(1, line.length));
                }
            } else {
                if (lineStart[0] <= 0) {
                    let shiftedLine = line.map(coords => {
                        let shiftedCoords = coords.slice(0, coords.length);
                        shiftedCoords[0] += 360;
                        return shiftedCoords;
                    });
                    // remove first point due to overlap
                    deconstrainedLine = deconstrainedLine.concat(
                        shiftedLine.slice(1, shiftedLine.length)
                    );
                } else {
                    deconstrainedLine = deconstrainedLine.concat(line.slice(1, line.length));
                }
            }
        }
        return deconstrainedLine;
    }

    /**
     * parses a getCapabilities xml string
     * note that it uses openlayers to do the actual parsing
     *
     * @static
     * @param {string} xmlString string of capabilities XML
     * @returns {object} an opject of wmts cappabilities
     * @memberof MapUtil
     */
    static parseCapabilities(xmlString) {
        try {
            let parser = new Ol_Format_WMTSCapabilities();
            return parser.read(xmlString);
        } catch (err) {
            console.warn("Error in MapUtil.parseCapabilities:", err);
            return false;
        }
    }

    /**
     * generates a set of wmts options for a layer
     * note that it uses openlayers to do the actual info gathering
     *
     * @static
     * @param {object} options options for matching up the capabilities for the layer
     * - capabilities - {object} outfrom from parseCapabilities
     * - options - {object} see config from http://openlayers.org/en/latest/apidoc/ol.source.WMTS.html#.optionsFromCapabilities
     * @returns {object} an object containing WMTS capabilities options for the layer or false if the matchup failed
     * @memberof MapUtil
     */
    static getWmtsOptions(options) {
        try {
            this.prepProjection();
            let parseOptions = Ol_Source_WMTS.optionsFromCapabilities(
                options.capabilities,
                options.options
            );
            return {
                url: parseOptions.urls[0],
                layer: options.options.layer,
                format: parseOptions.format,
                requestEncoding: parseOptions.requestEncoding,
                matrixSet: parseOptions.matrixSet,
                projection: parseOptions.projection.getCode(),
                extents: parseOptions.projection.getExtent(),
                tileGrid: {
                    origin: [
                        parseOptions.projection.getExtent()[0],
                        parseOptions.projection.getExtent()[3]
                    ],
                    resolutions: parseOptions.tileGrid.getResolutions(),
                    matrixIds: parseOptions.tileGrid.getMatrixIds(),
                    minZoom: parseOptions.tileGrid.getMinZoom(),
                    maxZoom: parseOptions.tileGrid.getMaxZoom(),
                    tileSize: parseOptions.tileGrid.getTileSize(0)
                }
            };
        } catch (err) {
            console.warn("Error in MapUtil.getWmtsOptions:", err);
            return false;
        }
    }
    /**
     * Sets the proj4 instance used by openlayers and initializes the default
     * projection data within that instance
     *
     * @static
     * @returns {object} the openlayers projection object for the default projection
     * @memberof MapUtil
     */
    static prepProjection() {
        // define the projection for this application and reproject defaults
        Ol_Proj.setProj4(proj4js);
        proj4js.defs(appConfig.DEFAULT_PROJECTION.code, appConfig.DEFAULT_PROJECTION.proj4Def);

        // Ol3 doesn't properly handle the "urn:ogc:def:crs:OGC:1.3:CRS84"
        // string in getCapabilities and parses it into "OGC:CRS84". This
        // hopefully adds that as an equivalent projection
        let epsg4326Proj = Ol_Proj.get("EPSG:4326");
        let ogcCrs84Proj = new Ol_Proj_Projection({
            code: "OGC:CRS84",
            units: epsg4326Proj.getUnits(),
            extent: epsg4326Proj.getExtent(),
            global: epsg4326Proj.isGlobal(),
            metersPerUnit: epsg4326Proj.getMetersPerUnit(),
            worldExtent: epsg4326Proj.getWorldExtent(),
            getPointResolution: function(res, point) {
                return Ol_Proj.getPointResolution("EPSG:4326", res, point);
            }
        });
        Ol_Proj.addProjection(ogcCrs84Proj);
        Ol_Proj.addEquivalentProjections([ogcCrs84Proj, epsg4326Proj]);

        let mapProjection = Ol_Proj.get(appConfig.DEFAULT_PROJECTION.code);
        mapProjection.setExtent(appConfig.DEFAULT_PROJECTION.extent);

        return mapProjection;
    }

    /**
     * Generates a WMTS tile url from the provided options
     *
     * @static
     * @param {object} options options for constructing the url
     * - layerId - {string} layer identifier
     * - url - {string} base url template
     * - tileMatrixSet - {string} tile matrix
     * - tileMatrixLabels - {object} mapping of zoom level to string representing that level in the url (optional)
     * - col - {string|number} column number of this tile
     * - row - {string|number} row number of this tile
     * - format - {string} data format of this tile (image/png, image/jpg, etc)
     * - context - {string} context this tile was requested from (if openlayers, then the row is inverted and shifted)
     *
     * @returns {string} a url string for the WMTS tile
     * @memberof MapUtil
     */
    static buildTileUrl(options) {
        let layerId = options.layerId;
        let url = options.url;
        let tileMatrixSet = options.tileMatrixSet;
        let tileMatrixLabels = options.tileMatrixLabels;
        let col = options.col;
        let row = options.row;
        let level = options.level;
        let format = options.format;
        let context = options.context;

        // adjust tileRow
        if (context === appStrings.MAP_LIB_2D) {
            row = -options.row - 1;
        }

        let tileMatrix =
            typeof tileMatrixLabels !== "undefined" ? tileMatrixLabels[level] : level.toString();

        if (url.indexOf("{") >= 0) {
            // resolve tile-URL template
            url = url
                .replace("{TileMatrixSet}", tileMatrixSet)
                .replace("{TileMatrix}", tileMatrix)
                .replace("{TileRow}", row.toString())
                .replace("{TileCol}", col.toString());
        } else {
            // build KVP request
            let queryOptions = Immutable.OrderedMap({
                SERVICE: "WMTS",
                REQUEST: "GetTile",
                VERSION: "1.0.0",
                LAYER: layerId,
                STYLE: "",
                TILEMATRIXSET: tileMatrixSet,
                TILEMATRIX: tileMatrix,
                TILEROW: row,
                TILECOL: col,
                FORMAT: encodeURIComponent(format)
            });

            let queryStr = this.miscUtil.objectToUrlParams(queryOptions);

            url = url.replace("?", "");
            url = url + "?" + queryStr;
        }

        return url;
    }

    /**
     * Format distance according to the provided units
     * input assumed in correct base units (meters/feet vs kilometers/miles)
     *
     * @static
     * @param {number} distance the number to format
     * @param {string} units the units to format this number into (metric, imperial, nautical, schoolbus)
     * @returns {string} representing a formatted version of the value passed in
     * @memberof MapUtil
     */
    static formatDistance(distance, units) {
        // Type check on distance
        if (typeof distance !== "number") {
            return null;
        }

        let number, unitsStr;
        if (units === "metric") {
            if (Math.abs(distance) >= 1000) {
                number = distance / 1000;
                unitsStr = "km";
            } else {
                number = distance;
                unitsStr = "m";
            }
        } else if (units === "imperial") {
            if (Math.abs(distance) >= 5280) {
                number = distance / 5280;
                unitsStr = "mi";
            } else {
                number = distance;
                unitsStr = "ft";
            }
        } else if (units === "nautical") {
            number = distance;
            unitsStr = "nmi";
        } else if (units === "schoolbus") {
            number = distance;
            unitsStr = "school buses";
        } else {
            return null;
        }

        return this.formatNumber(number, { trim: false }) + " " + unitsStr;
    }

    /**
     * Format area according to the provided units
     * input assumed in correct base units (meters/feet vs kilometers/miles)
     *
     * @static
     * @param {number} area the number to format
     * @param {string} units the units to format this number into (metric, imperial, nautical, schoolbus)
     * @returns {string} representing a formatted version of the value passed in
     * @memberof MapUtil
     */
    static formatArea(area, units) {
        // Type check on area
        if (typeof area !== "number") {
            return null;
        }

        let number, unitsStr;
        if (units === "metric") {
            if (Math.abs(area) >= 1000000) {
                number = area / 1000000;
                unitsStr = "km<sup>2</sup>";
            } else {
                number = area;
                unitsStr = "m<sup>2</sup>";
            }
        } else if (units === "imperial") {
            if (Math.abs(area) >= 27878400) {
                number = area / 27878400;
                unitsStr = "mi<sup>2</sup>";
            } else {
                number = area;
                unitsStr = "ft<sup>2</sup>";
            }
        } else if (units === "nautical") {
            number = area;
            unitsStr = "nmi<sup>2</sup>";
        } else if (units === "schoolbus") {
            number = area;
            unitsStr = "school buses<sup>2</sup>";
        } else {
            return null;
        }

        return this.formatNumber(number, { trim: false }) + " " + unitsStr;
    }

    /**
     * Format a number as a string with commas and fixed decimal places
     *
     * @static
     * @param {number} number the number to format
     * @param {object} options options for the formatting
     * - fixedLen - {number} number of decimal places to format (default 2)
     * - trim - {boolean} true if the formatted number should remove trailing 0s after the decimal ("1.20" --> "1.2")
     * @returns {string} string of the formatted number
     * @memberof MapUtil
     */
    static formatNumber(number, options = {}) {
        let fixedLen = typeof options.fixedLen !== "undefined" ? options.fixedLen : 2;
        let numberStr = options.trim
            ? this.trimFloatString(number.toFixed(fixedLen))
            : number.toFixed(fixedLen);
        let parts = numberStr.split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
    }

    /**
     * Converts area in meters to another unit
     *
     * @static
     * @param {number} value the value, in meters squared, to convert
     * @param {string} units string representing the desired units
     * @returns {number} input value converted to specified units
     * @memberof MapUtil
     */
    static convertAreaUnits(value, units) {
        let unitEntry = this.miscUtil.findObjectInArray(appConfig.SCALE_OPTIONS, "value", units);
        if (units === "schoolbus") {
            return value / Math.pow(unitEntry.toMeters, 2);
        } else {
            return Qty(value, "m^2").to(unitEntry.qtyType + "^2").scalar;
        }
    }

    /**
     * Converts distance in meters to another unit
     *
     * @static
     * @param {number} value the value, in meters, to convert
     * @param {string} units string representing the desired units
     * @returns {number} input value converted to specified units
     * @memberof MapUtil
     */
    static convertDistanceUnits(value, units) {
        let unitEntry = this.miscUtil.findObjectInArray(appConfig.SCALE_OPTIONS, "value", units);
        if (units === "schoolbus") {
            return value / unitEntry.toMeters;
        } else {
            return Qty(value, "m").to(unitEntry.qtyType).scalar;
        }
    }

    /**
     * remove trailing zeros from fixed width float string
     *
     * @static
     * @param {string} value string representing float number to trim
     * @returns {string} string float with trailing 0s removed
     * @memberof MapUtil
     */
    static trimFloatString(value) {
        return parseFloat(value).toString();
    }

    /**
     * Calculates the distance of a polyline using turf
     * Reprojects into EPSG-4326 first
     * Expects an array of coordinates in form
     *
     * @static
     * @param {array} coords array of polyline coordintes [ [lon,lat], ... ]
     * @param {string} proj projection of the coordinates
     * @returns {number} distance of the polyline in meters or 0 if it fails
     * @memberof MapUtil
     */
    static calculatePolylineDistance(coords, proj) {
        try {
            // Reproject from source to EPSG:4326
            let newCoords = coords.map(coord =>
                proj4js(proj, appStrings.PROJECTIONS.latlon.code, coord)
            );
            // Calculate line distance
            return turfLineDistance(
                {
                    type: "Feature",
                    properties: {},
                    geometry: {
                        type: "LineString",
                        coordinates: newCoords
                    }
                },
                "meters"
            );
        } catch (err) {
            console.warn("Error in MapUtil.calculatePolylineDistance: ", err);
            return 0;
        }
    }

    /**
     * Calculates the area of a polyline using turf
     * Reprojects into EPSG-4326 first
     *
     * @static
     * @param {array} coords array of polygon coordintes [ [lon,lat], ... ]
     * @param {string} proj projection of the coordinates
     * @returns {number} area of the polygon in meters or 0 if it fails
     * @memberof MapUtil
     */
    static calculatePolygonArea(coords, proj) {
        // Reproject from source to EPSG:4326
        let newCoords = coords.map(coord =>
            proj4js(proj, appStrings.PROJECTIONS.latlon.code, coord)
        );
        // Calculate line distance
        return turfArea(
            {
                type: "Feature",
                properties: {},
                geometry: {
                    type: "Polygon",
                    coordinates: [newCoords]
                }
            },
            "meters"
        );
    }

    /**
     * Calculates center point of a polygon using turf
     * Reprojects into EPSG-4326 first
     *
     * @static
     * @param {array} coords array of polygon coordinates [ [lon,lat], ... ]
     * @param {string} proj projection of the coordinates
     * @returns {array} center coordinate of the polygon
     * @memberof MapUtil
     */
    static calculatePolygonCenter(coords, proj) {
        // Reproject from source to EPSG:4326
        let newCoords = coords.map(coord =>
            proj4js(proj, appStrings.PROJECTIONS.latlon.code, coord)
        );
        // Calculate center
        return turfCentroid(
            {
                type: "FeatureCollection",
                features: [
                    {
                        type: "Feature",
                        properties: {},
                        geometry: {
                            type: "Polygon",
                            coordinates: [newCoords]
                        }
                    }
                ]
            },
            "meters"
        ).geometry.coordinates;
    }

    /**
     * Generate set of geodesic arc line segments for a polyline
     * assumes EPSG-4326
     *
     * @static
     * @param {array} coords line segment coordinates [[lat, lon], ...]
     * @returns {array} set of line segments [[[lat, lon], ...], ...]
     * @memberof MapUtil
     */
    static generateGeodesicArcsForLineString(coords) {
        let lineCoords = [];
        for (let i = 0; i < coords.length - 1; ++i) {
            let start = coords[i];
            let end = coords[i + 1];

            // arc doesn't play well with two points in the same place
            if (start[0] === end[0] && start[1] === end[1]) {
                continue;
            }

            // generate the arcs
            let generator = new GreatCircle({ x: start[0], y: start[1] }, { x: end[0], y: end[1] });
            let arcLines = generator.Arc(100, { offset: 180 }).geometries;

            // shift all the arcs as part of a polyline
            if (i >= 1 && lineCoords[lineCoords.length - 1][0] !== arcLines[0].coords[0][0]) {
                let initialShift = 1;
                if (lineCoords[lineCoords.length - 1][0] < 0) {
                    initialShift = -1;
                }
                arcLines = arcLines.map(arc => {
                    let refCoord = arc.coords[0];
                    let shift = initialShift;
                    if (refCoord[0] <= 0) {
                        if (initialShift <= 0) {
                            shift = 0;
                        } else {
                            shift = initialShift;
                        }
                    } else {
                        if (initialShift <= 0) {
                            shift = initialShift;
                        } else {
                            shift = 0;
                        }
                    }
                    return arc.coords.map(coord => {
                        coord = coord.slice(0, coord.length);
                        coord[0] += 360 * shift;
                        return coord;
                    });
                });
            } else {
                arcLines = arcLines.map(arc => {
                    return arc.coords;
                });
            }

            // wrap the arcs beyond [-180,180]
            let arcCoords = arcLines[0];
            if (arcLines.length >= 2) {
                arcCoords = this.deconstrainArcCoordinates(arcLines);
            }
            lineCoords = lineCoords.concat(arcCoords.slice(0, arcCoords.length));
        }
        return lineCoords;
    }

    /**
     * takes in a geometry and measurement type and
     * returns a string measurement of that geometry
     *
     * @static
     * @param {object} geometry the geometry to be measured
     * - type - {string} describe the type of geometry (Circle|LineString|Polygon)
     * - coordinates - {array} array of coordinate objects
     *   - [{lon: {number}, lat: {number}}, ...]
     * - proj - {string} projection of the of the coordinates
     *
     * @param {string} measurementType type of measurement (Distance|Area)
     * @returns {string} measurement
     * @memberof MapUtil
     */
    static measureGeometry(geometry, measurementType) {
        if (geometry.type === appStrings.GEOMETRY_CIRCLE) {
            console.warn(
                "Error in MapUtil.measureGeometry: Could not measure geometry, unsupported geometry type: ",
                geometry.type
            );
            return false;
        }
        let coords = geometry.coordinates.map(x => [x.lon, x.lat]);
        coords = this.generateGeodesicArcsForLineString(coords);
        if (measurementType === appStrings.MEASURE_DISTANCE) {
            if (geometry.type === appStrings.GEOMETRY_LINE_STRING) {
                return this.calculatePolylineDistance(coords, geometry.proj);
            } else {
                console.warn(
                    "Error in MapUtil.measureGeometry: Could not measure distance, unsupported geometry type: ",
                    geometry.type
                );
                return false;
            }
        } else if (measurementType === appStrings.MEASURE_AREA) {
            if (geometry.type === appStrings.GEOMETRY_POLYGON) {
                return this.calculatePolygonArea(coords, geometry.proj);
            } else {
                console.warn(
                    "Error in MapUtil.measureGeometry: Could not measure area, unsupported geometry type: ",
                    geometry.type
                );
                return false;
            }
        } else {
            console.warn(
                "Error in MapUtil.measureGeometry: Could not measure geometry, unsupported measurement type: ",
                measurementType
            );
            return false;
        }
    }

    /**
     * format a measurement for distance or area
     *
     * @static
     * @param {number} measurement the value of the measurement
     * @param {string} measurementType (Distance|Area)
     * @param {string} units (metric|imperial|nautical|schoolbus)
     * @returns {string} formatted measurement
     * @memberof MapUtil
     */
    static formatMeasurement(measurement, measurementType, units) {
        if (measurementType === appStrings.MEASURE_DISTANCE) {
            return this.formatDistance(measurement, units);
        } else if (measurementType === appStrings.MEASURE_AREA) {
            return this.formatArea(measurement, units);
        } else {
            console.warn(
                "Error in MapUtil.formatMeasurement: Could not format measurement, unsupported measurement type: ",
                measurementType
            );
            return false;
        }
    }

    // takes in a geometry and returns the coordinates for its label
    /**
     * calculate the position of a label for a given geometry.
     * End point of a polyline, center of a polygon.
     *
     * @static
     * @param {object} geometry to get a label for
     * - type - {string} describe the type of geometry (Circle|LineString|Polygon)
     * - coordinates - {array} array of coordinate objects
     *   - [{lon: {number}, lat: {number}}, ...]
     * - proj - {string} projection of the of the coordinates
     * @returns {array} constrained coordinates of the label position
     * @memberof MapUtil
     */
    static getLabelPosition(geometry) {
        if (geometry.type === appStrings.GEOMETRY_LINE_STRING) {
            let lastCoord = geometry.coordinates[geometry.coordinates.length - 1];
            if (lastCoord) {
                return this.constrainCoordinates([lastCoord.lon, lastCoord.lat]);
            } else {
                console.warn(
                    "Error in MapUtil.getLabelPosition: Could not find label placement, no coordinates in geometry."
                );
                return false;
            }
        } else if (geometry.type === appStrings.GEOMETRY_POLYGON) {
            let coords = geometry.coordinates.map(x => [x.lon, x.lat]);
            coords = this.generateGeodesicArcsForLineString(coords);
            return this.constrainCoordinates(this.calculatePolygonCenter(coords, geometry.proj));
        } else {
            console.warn(
                "Error in MapUtil.getLabelPosition: Could not find label placement, unsupported geometry type: ",
                geometry.type
            );
            return false;
        }
    }

    /**
     * parse an array of strings representing a bounding box into an array of floats
     *
     * @static
     * @param {array} extentStrArr set of floats or float strings
     * @returns {array|boolean} list of floats or false if unable to generate a valid extent from the input
     * @memberof MapUtil
     */
    static parseStringExtent(extentStrArr) {
        // Check extentStrArr type
        if (!extentStrArr || !Array.isArray(extentStrArr) || extentStrArr.length !== 4) {
            return false;
        }

        return extentStrArr.reduce((acc, numStr) => {
            if (typeof acc === "object") {
                let num = parseFloat(numStr);
                if (isNaN(num)) {
                    return false;
                } else {
                    acc.push(num);
                }
            }
            return acc;
        }, []);
    }
}
