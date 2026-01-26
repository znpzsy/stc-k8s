/**
 * Compatibility shims for running Brackets in various environments, browsers.
 */
(function () {
    "use strict";

    // [IE10] String.prototype missing trimRight() and trimLeft()
    if (!String.prototype.trimRight) {
        String.prototype.trimRight = function () {
            return this.replace(/\s+$/, "");
        };
    }
    if (!String.prototype.trimLeft) {
        String.prototype.trimLeft = function () {
            return this.replace(/^\s+/, "");
        };
    }

    // Support for Math.log10 [IE11]
    Math.log10 = Math.log10 || function (x) {
        return Math.log(x) * Math.LOG10E;
    };

    // [IE] Number.isFinite() is missing
    Number.isFinite = Number.isFinite || function (value) {
        return typeof value === 'number' && isFinite(value);
    };

    // Feature detection for Error.stack. Not all browsers expose it
    // and Brackets assumes it will be a non-null string.
    if (typeof (new Error()).stack === "undefined") {
        Error.prototype.stack = "";
    }

})();