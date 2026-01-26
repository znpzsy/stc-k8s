(function () {
    'use strict';

    /* Constants */
    angular.module('ccportal.products.usc.constants', []);

    var UscConstants = angular.module('ccportal.products.usc.constants');

    UscConstants.constant('USC_APPS_DIRECTIONS', ['TRANSCEIVER', 'TRANSMITTER', 'RECEIVER']);

    UscConstants.constant('MSISDN_TYPES', ['MSISDN', 'STATIC_OPAQUEID', 'DYNAMIC_OPAQUEID']);

    UscConstants.constant('ACCESS_PROTOCOLS', ['REST', 'SOAP']);

    UscConstants.constant('POINT_TYPES', ['SUCCESS', 'FAILURE']);

})();
