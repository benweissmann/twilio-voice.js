"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @packageDocumentation
 * @module Voice
 * This module describes valid and deprecated regions.
 */
var errors_1 = require("./errors");
/**
 * Valid edges.
 * @private
 */
var Edge;
(function (Edge) {
    /**
     * Public edges
     */
    Edge["Sydney"] = "sydney";
    Edge["SaoPaulo"] = "sao-paulo";
    Edge["Dublin"] = "dublin";
    Edge["Frankfurt"] = "frankfurt";
    Edge["Tokyo"] = "tokyo";
    Edge["Singapore"] = "singapore";
    Edge["Ashburn"] = "ashburn";
    Edge["Umatilla"] = "umatilla";
    Edge["Roaming"] = "roaming";
    /**
     * Interconnect edges
     */
    Edge["AshburnIx"] = "ashburn-ix";
    Edge["SanJoseIx"] = "san-jose-ix";
    Edge["LondonIx"] = "london-ix";
    Edge["FrankfurtIx"] = "frankfurt-ix";
    Edge["SingaporeIx"] = "singapore-ix";
    Edge["SydneyIx"] = "sydney-ix";
    Edge["TokyoIx"] = "tokyo-ix";
})(Edge = exports.Edge || (exports.Edge = {}));
/**
 * Valid current regions.
 *
 * @deprecated
 *
 * CLIENT-6831
 * This is no longer used or updated for checking validity of regions in the
 * SDK. We now allow any string to be passed for region. Invalid regions won't
 * be able to connect, and won't throw an exception.
 *
 * CLIENT-7519
 * This is used again to temporarily convert edge values to regions as part of
 * Phase 1 Regional. This is still considered deprecated.
 *
 * @private
 */
var Region;
(function (Region) {
    Region["Au1"] = "au1";
    Region["Au1Ix"] = "au1-ix";
    Region["Br1"] = "br1";
    Region["De1"] = "de1";
    Region["De1Ix"] = "de1-ix";
    Region["Gll"] = "gll";
    Region["Ie1"] = "ie1";
    Region["Ie1Ix"] = "ie1-ix";
    Region["Ie1Tnx"] = "ie1-tnx";
    Region["Jp1"] = "jp1";
    Region["Jp1Ix"] = "jp1-ix";
    Region["Sg1"] = "sg1";
    Region["Sg1Ix"] = "sg1-ix";
    Region["Sg1Tnx"] = "sg1-tnx";
    Region["Us1"] = "us1";
    Region["Us1Ix"] = "us1-ix";
    Region["Us1Tnx"] = "us1-tnx";
    Region["Us2"] = "us2";
    Region["Us2Ix"] = "us2-ix";
    Region["Us2Tnx"] = "us2-tnx";
})(Region = exports.Region || (exports.Region = {}));
/**
 * Region shortcodes. Maps the full region name from AWS to the Twilio shortcode.
 * @private
 */
exports.regionShortcodes = {
    ASIAPAC_SINGAPORE: Region.Sg1,
    ASIAPAC_SYDNEY: Region.Au1,
    ASIAPAC_TOKYO: Region.Jp1,
    EU_FRANKFURT: Region.De1,
    EU_IRELAND: Region.Ie1,
    SOUTH_AMERICA_SAO_PAULO: Region.Br1,
    US_EAST_VIRGINIA: Region.Us1,
    US_WEST_OREGON: Region.Us2,
};
/**
 * Region to edge mapping, as part of Phase 1 Regional (CLIENT-7519).
 * Temporary.
 * @private
 */
exports.regionToEdge = (_a = {},
    _a[Region.Au1] = Edge.Sydney,
    _a[Region.Br1] = Edge.SaoPaulo,
    _a[Region.Ie1] = Edge.Dublin,
    _a[Region.De1] = Edge.Frankfurt,
    _a[Region.Jp1] = Edge.Tokyo,
    _a[Region.Sg1] = Edge.Singapore,
    _a[Region.Us1] = Edge.Ashburn,
    _a[Region.Us2] = Edge.Umatilla,
    _a[Region.Gll] = Edge.Roaming,
    /**
     * Interconnect edges
     */
    _a[Region.Us1Ix] = Edge.AshburnIx,
    _a[Region.Us2Ix] = Edge.SanJoseIx,
    _a[Region.Ie1Ix] = Edge.LondonIx,
    _a[Region.De1Ix] = Edge.FrankfurtIx,
    _a[Region.Sg1Ix] = Edge.SingaporeIx,
    _a[Region.Au1Ix] = Edge.SydneyIx,
    _a[Region.Jp1Ix] = Edge.TokyoIx,
    /**
     * Tnx regions
     */
    _a[Region.Us1Tnx] = Edge.AshburnIx,
    _a[Region.Us2Tnx] = Edge.AshburnIx,
    _a[Region.Ie1Tnx] = Edge.LondonIx,
    _a[Region.Sg1Tnx] = Edge.SingaporeIx,
    _a);
/**
 * The default edge to connect to and create a chunder uri from, if the edge
 * parameter is not specified during setup in `Device`.
 * @constant
 */
exports.defaultEdge = Edge.Roaming;
/**
 * The default event gateway URI to publish to.
 * @constant
 * @private
 */
var defaultEventGatewayURI = 'eventgw.twilio.com';
/**
 * String template for an edge chunder URI
 * @param edge - The edge.
 */
function createChunderEdgeURI(edge) {
    return "voice-js." + edge + ".twilio.com";
}
/**
 * String template for a region insights URI
 * @param region - The region.
 */
function createEventGatewayURI(region) {
    return region
        ? "eventgw." + region + ".twilio.com"
        : defaultEventGatewayURI;
}
exports.createEventGatewayURI = createEventGatewayURI;
/**
 * Create a signaling endpoint URL to connect a websocket to from a chunder URI.
 * @param uri the chunder URI to create a signaling endpoint URL for
 */
function createSignalingEndpointURL(uri) {
    return "wss://" + uri + "/signal";
}
exports.createSignalingEndpointURL = createSignalingEndpointURL;
/**
 * Get the URI associated with the passed edge.
 * @private
 * @param edge - A string or an array of edge values
 * @returns An array of chunder URIs
 */
function getChunderURIs(edge) {
    if (!!edge && typeof edge !== 'string' && !Array.isArray(edge)) {
        throw new errors_1.InvalidArgumentError('If `edge` is provided, it must be of type `string` or an array of strings.');
    }
    var uris;
    if (edge) {
        var edgeParams = Array.isArray(edge) ? edge : [edge];
        uris = edgeParams.map(function (param) { return createChunderEdgeURI(param); });
    }
    else {
        uris = [createChunderEdgeURI(exports.defaultEdge)];
    }
    return uris;
}
exports.getChunderURIs = getChunderURIs;
/**
 * Get the region shortcode by its full AWS region string.
 *
 * @private
 * @param region - The region's full AWS string.
 */
function getRegionShortcode(region) {
    return exports.regionShortcodes[region] || null;
}
exports.getRegionShortcode = getRegionShortcode;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVnaW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi90d2lsaW8vcmVnaW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQTs7OztHQUlHO0FBQ0gsbUNBQWdEO0FBRWhEOzs7R0FHRztBQUNILElBQVksSUF1Qlg7QUF2QkQsV0FBWSxJQUFJO0lBQ2Q7O09BRUc7SUFDSCx5QkFBaUIsQ0FBQTtJQUNqQiw4QkFBc0IsQ0FBQTtJQUN0Qix5QkFBaUIsQ0FBQTtJQUNqQiwrQkFBdUIsQ0FBQTtJQUN2Qix1QkFBZSxDQUFBO0lBQ2YsK0JBQXVCLENBQUE7SUFDdkIsMkJBQW1CLENBQUE7SUFDbkIsNkJBQXFCLENBQUE7SUFDckIsMkJBQW1CLENBQUE7SUFDbkI7O09BRUc7SUFDSCxnQ0FBd0IsQ0FBQTtJQUN4QixpQ0FBeUIsQ0FBQTtJQUN6Qiw4QkFBc0IsQ0FBQTtJQUN0QixvQ0FBNEIsQ0FBQTtJQUM1QixvQ0FBNEIsQ0FBQTtJQUM1Qiw4QkFBc0IsQ0FBQTtJQUN0Qiw0QkFBb0IsQ0FBQTtBQUN0QixDQUFDLEVBdkJXLElBQUksR0FBSixZQUFJLEtBQUosWUFBSSxRQXVCZjtBQUVEOzs7Ozs7Ozs7Ozs7Ozs7R0FlRztBQUNILElBQVksTUFxQlg7QUFyQkQsV0FBWSxNQUFNO0lBQ2hCLHFCQUFXLENBQUE7SUFDWCwwQkFBZ0IsQ0FBQTtJQUNoQixxQkFBVyxDQUFBO0lBQ1gscUJBQVcsQ0FBQTtJQUNYLDBCQUFnQixDQUFBO0lBQ2hCLHFCQUFXLENBQUE7SUFDWCxxQkFBVyxDQUFBO0lBQ1gsMEJBQWdCLENBQUE7SUFDaEIsNEJBQWtCLENBQUE7SUFDbEIscUJBQVcsQ0FBQTtJQUNYLDBCQUFnQixDQUFBO0lBQ2hCLHFCQUFXLENBQUE7SUFDWCwwQkFBZ0IsQ0FBQTtJQUNoQiw0QkFBa0IsQ0FBQTtJQUNsQixxQkFBVyxDQUFBO0lBQ1gsMEJBQWdCLENBQUE7SUFDaEIsNEJBQWtCLENBQUE7SUFDbEIscUJBQVcs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