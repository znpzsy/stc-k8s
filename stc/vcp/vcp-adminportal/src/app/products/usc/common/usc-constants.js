(function () {
    'use strict';

    /* Constants */
    angular.module('adminportal.products.usc.constants', []);

    var UscConstants = angular.module('adminportal.products.usc.constants');

    UscConstants.constant('USC_APPS_DIRECTIONS', ['TRANSCEIVER', 'TRANSMITTER', 'RECEIVER']);

    UscConstants.constant('USC_MSISDN_TYPES', ['MSISDN', 'STATIC_OPAQUEID', 'DYNAMIC_OPAQUEID']);

    UscConstants.constant('USC_ACCESS_PROTOCOLS', ['REST', 'SOAP']);

    UscConstants.constant('USC_POINT_TYPES', ['SUCCESS', 'FAILURE']);

    UscConstants.constant('USC_STATUS_TYPES', ['ACTIVE', 'INACTIVE', 'PENDING']);

    UscConstants.constant('USC_APPLICATION_GATEWAY_POLICIES', ['TRUNCATE', 'REJECT']);

})();
