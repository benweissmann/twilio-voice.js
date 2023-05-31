"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @packageDocumentation
 * @module Voice
 * @preferred
 * @publicapi
 */
var events_1 = require("events");
var call_1 = require("../call");
var device_1 = require("../device");
var errors_1 = require("../errors");
var stats_1 = require("../rtc/stats");
var constants_1 = require("../constants");
/**
 * Runs some tests to identify issues, if any, prohibiting successful calling.
 */
var PreflightTest = /** @class */ (function (_super) {
    __extends(PreflightTest, _super);
    /**
     * Construct a {@link PreflightTest} instance.
     * @constructor
     * @param token - A Twilio JWT token string.
     * @param options
     */
    function PreflightTest(token, options) {
        var _this = _super.call(this) || this;
        /**
         * Whether this test has already logged an insights-connection-warning.
         */
        _this._hasInsightsErrored = false;
        /**
         * Network related timing measurements for this test
         */
        _this._networkTiming = {};
        /**
         * The options passed to {@link PreflightTest} constructor
         */
        _this._options = {
            codecPreferences: [call_1.default.Codec.PCMU, call_1.default.Codec.Opus],
            edge: 'roaming',
            fakeMicInput: false,
            logLevel: 'error',
            signalingTimeoutMs: 10000,
        };
        /**
         * Current status of this test
         */
        _this._status = PreflightTest.Status.Connecting;
        Object.assign(_this._options, options);
        _this._samples = [];
        _this._warnings = [];
        _this._startTime = Date.now();
        _this._initDevice(token, __assign(__assign({}, _this._options), { fileInputStream: _this._options.fakeMicInput ?
                _this._getStreamFromFile() : undefined }));
        return _this;
    }
    /**
     * Stops the current test and raises a failed event.
     */
    PreflightTest.prototype.stop = function () {
        var _this = this;
        var error = new errors_1.GeneralErrors.CallCancelledError();
        if (this._device) {
            this._device.once(device_1.default.EventName.Unregistered, function () { return _this._onFailed(error); });
            this._device.destroy();
        }
        else {
            this._onFailed(error);
        }
    };
    /**
     * Emit a {PreflightTest.Warning}
     */
    PreflightTest.prototype._emitWarning = function (name, description, rtcWarning) {
        var warning = { name: name, description: description };
        if (rtcWarning) {
            warning.rtcWarning = rtcWarning;
        }
        this._warnings.push(warning);
        this.emit(PreflightTest.Events.Warning, warning);
    };
    /**
     * Returns call quality base on the RTC Stats
     */
    PreflightTest.prototype._getCallQuality = function (mos) {
        if (mos > 4.2) {
            return PreflightTest.CallQuality.Excellent;
        }
        else if (mos >= 4.1 && mos <= 4.2) {
            return PreflightTest.CallQuality.Great;
        }
        else if (mos >= 3.7 && mos <= 4) {
            return PreflightTest.CallQuality.Good;
        }
        else if (mos >= 3.1 && mos <= 3.6) {
            return PreflightTest.CallQuality.Fair;
        }
        else {
            return PreflightTest.CallQuality.Degraded;
        }
    };
    /**
     * Returns the report for this test.
     */
    PreflightTest.prototype._getReport = function () {
        var stats = this._getRTCStats();
        var testTiming = { start: this._startTime };
        if (this._endTime) {
            testTiming.end = this._endTime;
            testTiming.duration = this._endTime - this._startTime;
        }
        var report = {
            callSid: this._callSid,
            edge: this._edge,
            iceCandidateStats: this._rtcIceCandidateStatsReport.iceCandidateStats,
            networkTiming: this._networkTiming,
            samples: this._samples,
            selectedEdge: this._options.edge,
            stats: stats,
            testTiming: testTiming,
            totals: this._getRTCSampleTotals(),
            warnings: this._warnings,
        };
        var selectedIceCandidatePairStats = this._rtcIceCandidateStatsReport.selectedIceCandidatePairStats;
        if (selectedIceCandidatePairStats) {
            report.selectedIceCandidatePairStats = selectedIceCandidatePairStats;
            report.isTurnRequired = selectedIceCandidatePairStats.localCandidate.candidateType === 'relay'
                || selectedIceCandidatePairStats.remoteCandidate.candidateType === 'relay';
        }
        if (stats) {
            report.callQuality = this._getCallQuality(stats.mos.average);
        }
        return report;
    };
    /**
     * Returns RTC stats totals for this test
     */
    PreflightTest.prototype._getRTCSampleTotals = function () {
        if (!this._latestSample) {
            return;
        }
        return __assign({}, this._latestSample.totals);
    };
    /**
     * Returns RTC related stats captured during the test call
     */
    PreflightTest.prototype._getRTCStats = function () {
        var firstMosSampleIdx = this._samples.findIndex(function (sample) { return typeof sample.mos === 'number' && sample.mos > 0; });
        var samples = firstMosSampleIdx >= 0
            ? this._samples.slice(firstMosSampleIdx)
            : [];
        if (!samples || !samples.length) {
            return;
        }
        return ['jitter', 'mos', 'rtt'].reduce(function (statObj, stat) {
            var _a;
            var values = samples.map(function (s) { return s[stat]; });
            return __assign(__assign({}, statObj), (_a = {}, _a[stat] = {
                average: Number((values.reduce(function (total, value) { return total + value; }) / values.length).toPrecision(5)),
                max: Math.max.apply(Math, values),
                min: Math.min.apply(Math, values),
            }, _a));
        }, {});
    };
    /**
     * Returns a MediaStream from a media file
     */
    PreflightTest.prototype._getStreamFromFile = function () {
        var audioContext = this._options.audioContext;
        if (!audioContext) {
            throw new errors_1.NotSupportedError('Cannot fake input audio stream: AudioContext is not supported by this browser.');
        }
        var audioEl = new Audio(constants_1.COWBELL_AUDIO_URL);
        audioEl.addEventListener('canplaythrough', function () { return audioEl.play(); });
        if (typeof audioEl.setAttribute === 'function') {
            audioEl.setAttribute('crossorigin', 'anonymous');
        }
        var src = audioContext.createMediaElementSource(audioEl);
        var dest = audioContext.createMediaStreamDestination();
        src.connect(dest);
        return dest.stream;
    };
    /**
     * Initialize the device
     */
    PreflightTest.prototype._initDevice = function (token, options) {
        var _this = this;
        try {
            this._device = new (options.deviceFactory || device_1.default)(token, {
                codecPreferences: options.codecPreferences,
                edge: options.edge,
                fileInputStream: options.fileInputStream,
                logLevel: options.logLevel,
                preflight: true,
            });
            this._device.once(device_1.default.EventName.Registered, function () {
                _this._onDeviceRegistered();
            });
            this._device.once(device_1.default.EventName.Error, function (error) {
                _this._onDeviceError(error);
            });
            this._device.register();
        }
        catch (error) {
            // We want to return before failing so the consumer can capture the event
            setTimeout(function () {
                _this._onFailed(error);
            });
            return;
        }
        this._signalingTimeoutTimer = setTimeout(function () {
            _this._onDeviceError(new errors_1.SignalingErrors.ConnectionError('WebSocket Connection Timeout'));
        }, options.signalingTimeoutMs);
    };
    /**
     * Called on {@link Device} error event
     * @param error
     */
    PreflightTest.prototype._onDeviceError = function (error) {
        this._device.destroy();
        this._onFailed(error);
    };
    /**
     * Called on {@link Device} ready event
     */
    PreflightTest.prototype._onDeviceRegistered = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, audio, publisher;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        clearTimeout(this._echoTimer);
                        clearTimeout(this._signalingTimeoutTimer);
                        _a = this;
                        return [4 /*yield*/, this._device.connect({
                                rtcConfiguration: this._options.rtcConfiguration,
                            })];
                    case 1:
                        _a._call = _b.sent();
                        this._networkTiming.signaling = { start: Date.now() };
                        this._setupCallHandlers(this._call);
                        this._edge = this._device.edge || undefined;
                        if (this._options.fakeMicInput) {
                            this._echoTimer = setTimeout(function () { return _this._device.disconnectAll(); }, constants_1.ECHO_TEST_DURATION);
                            audio = this._device.audio;
                            if (audio) {
                                audio.disconnect(false);
                                audio.outgoing(false);
                            }
                        }
                        this._call.once('disconnect', function () {
                            _this._device.once(device_1.default.EventName.Unregistered, function () { return _this._onUnregistered(); });
                            _this._device.destroy();
                        });
                        publisher = this._call['_publisher'];
                        publisher.on('error', function () {
                            if (!_this._hasInsightsErrored) {
                                _this._emitWarning('insights-connection-error', 'Received an error when attempting to connect to Insights gateway');
                            }
                            _this._hasInsightsErrored = true;
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Called when there is a fatal error
     * @param error
     */
    PreflightTest.prototype._onFailed = function (error) {
        clearTimeout(this._echoTimer);
        clearTimeout(this._signalingTimeoutTimer);
        this._releaseHandlers();
        this._endTime = Date.now();
        this._status = PreflightTest.Status.Failed;
        this.emit(PreflightTest.Events.Failed, error);
    };
    /**
     * Called when the device goes offline.
     * This indicates that the test has been completed, but we won't know if it failed or not.
     * The onError event will be the indicator whether the test failed.
     */
    PreflightTest.prototype._onUnregistered = function () {
        var _this = this;
        // We need to make sure we always execute preflight.on('completed') last
        // as client SDK sometimes emits 'offline' event before emitting fatal errors.
        setTimeout(function () {
            if (_this._status === PreflightTest.Status.Failed) {
                return;
            }
            clearTimeout(_this._echoTimer);
            clearTimeout(_this._signalingTimeoutTimer);
            _this._releaseHandlers();
            _this._endTime = Date.now();
            _this._status = PreflightTest.Status.Completed;
            _this._report = _this._getReport();
            _this.emit(PreflightTest.Events.Completed, _this._report);
        }, 10);
    };
    /**
     * Clean up all handlers for device and call
     */
    PreflightTest.prototype._releaseHandlers = function () {
        [this._device, this._call].forEach(function (emitter) {
            if (emitter) {
                emitter.eventNames().forEach(function (name) { return emitter.removeAllListeners(name); });
            }
        });
    };
    /**
     * Setup the event handlers for the {@link Call} of the test call
     * @param call
     */
    PreflightTest.prototype._setupCallHandlers = function (call) {
        var _this = this;
        if (this._options.fakeMicInput) {
            // When volume events start emitting, it means all audio outputs have been created.
            // Let's mute them if we're using fake mic input.
            call.once('volume', function () {
                call['_mediaHandler'].outputs
                    .forEach(function (output) { return output.audio.muted = true; });
            });
        }
        call.on('warning', function (name, data) {
            _this._emitWarning(name, 'Received an RTCWarning. See .rtcWarning for the RTCWarning', data);
        });
        call.once('accept', function () {
            _this._callSid = call['_mediaHandler'].callSid;
            _this._status = PreflightTest.Status.Connected;
            _this.emit(PreflightTest.Events.Connected);
        });
        call.on('sample', function (sample) { return __awaiter(_this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!!this._latestSample) return [3 /*break*/, 2];
                        _a = this;
                        return [4 /*yield*/, (this._options.getRTCIceCandidateStatsReport || stats_1.getRTCIceCandidateStatsReport)(call['_mediaHandler'].version.pc)];
                    case 1:
                        _a._rtcIceCandidateStatsReport = _b.sent();
                        _b.label = 2;
                    case 2:
                        this._latestSample = sample;
                        this._samples.push(sample);
                        this.emit(PreflightTest.Events.Sample, sample);
                        return [2 /*return*/];
                }
            });
        }); });
        // TODO: Update the following once the SDK supports emitting these events
        // Let's shim for now
        [{
                reportLabel: 'peerConnection',
                type: 'pcconnection',
            }, {
                reportLabel: 'ice',
                type: 'iceconnection',
            }, {
                reportLabel: 'dtls',
                type: 'dtlstransport',
            }, {
                reportLabel: 'signaling',
                type: 'signaling',
            }].forEach(function (_a) {
            var type = _a.type, reportLabel = _a.reportLabel;
            var handlerName = "on" + type + "statechange";
            var originalHandler = call['_mediaHandler'][handlerName];
            call['_mediaHandler'][handlerName] = function (state) {
                var timing = _this._networkTiming[reportLabel]
                    = _this._networkTiming[reportLabel] || { start: 0 };
                if (state === 'connecting' || state === 'checking') {
                    timing.start = Date.now();
                }
                else if ((state === 'connected' || state === 'stable') && !timing.duration) {
                    timing.end = Date.now();
                    timing.duration = timing.end - timing.start;
                }
                originalHandler(state);
            };
        });
    };
    Object.defineProperty(PreflightTest.prototype, "callSid", {
        /**
         * The callsid generated for the test call.
         */
        get: function () {
            return this._callSid;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PreflightTest.prototype, "endTime", {
        /**
         * A timestamp in milliseconds of when the test ended.
         */
        get: function () {
            return this._endTime;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PreflightTest.prototype, "latestSample", {
        /**
         * The latest WebRTC sample collected.
         */
        get: function () {
            return this._latestSample;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PreflightTest.prototype, "report", {
        /**
         * The report for this test.
         */
        get: function () {
            return this._report;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PreflightTest.prototype, "startTime", {
        /**
         * A timestamp in milliseconds of when the test started.
         */
        get: function () {
            return this._startTime;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PreflightTest.prototype, "status", {
        /**
         * The status of the test.
         */
        get: function () {
            return this._status;
        },
        enumerable: true,
        configurable: true
    });
    return PreflightTest;
}(events_1.EventEmitter));
exports.PreflightTest = PreflightTest;
(function (PreflightTest) {
    /**
     * The quality of the call determined by different mos ranges.
     * Mos is calculated base on the WebRTC stats - rtt, jitter, and packet lost.
     */
    var CallQuality;
    (function (CallQuality) {
        /**
         * If the average mos is over 4.2.
         */
        CallQuality["Excellent"] = "excellent";
        /**
         * If the average mos is between 4.1 and 4.2 both inclusive.
         */
        CallQuality["Great"] = "great";
        /**
         * If the average mos is between 3.7 and 4.0 both inclusive.
         */
        CallQuality["Good"] = "good";
        /**
         * If the average mos is between 3.1 and 3.6 both inclusive.
         */
        CallQuality["Fair"] = "fair";
        /**
         * If the average mos is 3.0 or below.
         */
        CallQuality["Degraded"] = "degraded";
    })(CallQuality = PreflightTest.CallQuality || (PreflightTest.CallQuality = {}));
    /**
     * Possible events that a [[PreflightTest]] might emit.
     */
    var Events;
    (function (Events) {
        /**
         * See [[PreflightTest.completedEvent]]
         */
        Events["Completed"] = "completed";
        /**
         * See [[PreflightTest.connectedEvent]]
         */
        Events["Connected"] = "connected";
        /**
         * See [[PreflightTest.failedEvent]]
         */
        Events["Failed"] = "failed";
        /**
         * See [[PreflightTest.sampleEvent]]
         */
        Events["Sample"] = "sample";
        /**
         * See [[PreflightTest.warningEvent]]
         */
        Events["Warning"] = "warning";
    })(Events = PreflightTest.Events || (PreflightTest.Events = {}));
    /**
     * Possible status of the test.
     */
    var Status;
    (function (Status) {
        /**
         * Call to Twilio has initiated.
         */
        Status["Connecting"] = "connecting";
        /**
         * Call to Twilio has been established.
         */
        Status["Connected"] = "connected";
        /**
         * The connection to Twilio has been disconnected and the test call has completed.
         */
        Status["Completed"] = "completed";
        /**
         * The test has stopped and failed.
         */
        Status["Failed"] = "failed";
    })(Status = PreflightTest.Status || (PreflightTest.Status = {}));
})(PreflightTest = exports.PreflightTest || (exports.PreflightTest = {}));
exports.PreflightTest = PreflightTest;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlZmxpZ2h0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vbGliL3R3aWxpby9wcmVmbGlnaHQvcHJlZmxpZ2h0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7Ozs7O0dBS0c7QUFDSCxpQ0FBc0M7QUFDdEMsZ0NBQTJCO0FBQzNCLG9DQUEyRDtBQUMzRCxvQ0FLbUI7QUFHbkIsc0NBQTZEO0FBSzdELDBDQUFxRTtBQTREckU7O0dBRUc7QUFDSDtJQUFtQyxpQ0FBWTtJQTZGN0M7Ozs7O09BS0c7SUFDSCx1QkFBWSxLQUFhLEVBQUUsT0FBc0M7UUFBakUsWUFDRSxpQkFBTyxTQWFSO1FBakZEOztXQUVHO1FBQ0sseUJBQW1CLEdBQVksS0FBSyxDQUFDO1FBTzdDOztXQUVHO1FBQ0ssb0JBQWMsR0FBa0IsRUFBRSxDQUFDO1FBRTNDOztXQUVHO1FBQ0ssY0FBUSxHQUFrQztZQUNoRCxnQkFBZ0IsRUFBRSxDQUFDLGNBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLGNBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDO1lBQ3BELElBQUksRUFBRSxTQUFTO1lBQ2YsWUFBWSxFQUFFLEtBQUs7WUFDbkIsUUFBUSxFQUFFLE9BQU87WUFDakIsa0JBQWtCLEVBQUUsS0FBSztTQUMxQixDQUFDO1FBMkJGOztXQUVHO1FBQ0ssYUFBTyxHQUF5QixhQUFhLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQztRQWdCdEUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFJLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBRXRDLEtBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO1FBQ25CLEtBQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO1FBQ3BCLEtBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFB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