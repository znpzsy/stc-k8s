(function () {

    'use strict';

    /* Constants */
    angular.module('ccportal.products.mmsc.constants', []);

    var MmscConstants = angular.module('ccportal.products.mmsc.constants');

    MmscConstants.constant('MMSC_SCREENING_IDENTIFIERS', [
        {value: 'MSISDN', label: 'ScreeningLists.Identifiers.MSISDN'},
        {value: 'IP', label: 'ScreeningLists.Identifiers.IP'},
        {value: 'DOMAIN', label: 'ScreeningLists.Identifiers.Domain'},
        {value: 'VAS', label: 'ScreeningLists.Identifiers.Vas'}
    ]);

    // MMSC EDR record constants
    MmscConstants.constant('MMSC_EDR_TYPE', [
        {type_key: 29, text: 'USER AGENT SUBMISSION'},
        {type_key: 30, text: 'INTERCONNECT FORWARDING'},
        {type_key: 31, text: 'INTERCONNECT FORWARDING RESPONSE'},
        {type_key: 32, text: 'INTERCONNECT DELIVERY REPORT'},
        {type_key: 33, text: 'USER AGENT DELIVERY REPORT'},
        {type_key: 34, text: 'INTERCONNECT READ REPORT'},
        {type_key: 35, text: 'USER AGENT READ REPORT'},
        {type_key: 36, text: 'MM DELETION'},
        {type_key: 37, text: 'INTERCONNECT SUBMISSION'},
        {type_key: 38, text: 'USER AGENT NOTIFICATION'},
        {type_key: 39, text: 'USER AGENT NOTIFICATION RESPONSE'},
        {type_key: 40, text: 'USER AGENT RETRIEVAL'},
        {type_key: 42, text: 'USER AGENT ACKNOWLEDGEMENT'},
        {type_key: 43, text: 'INTERCONNECT DELIVERY REPORT - SENT'},
        {type_key: 44, text: 'INTERCONNECT DELIVERY REPORT RESPONSE - RECEIVED'},
        {type_key: 45, text: 'USER AGENT READ REPORT - RECEIVED'},
        {type_key: 46, text: 'INTERCONNECT READ REPORT - SENT'},
        {type_key: 47, text: 'INTERCONNECT READ REPORT RESPONSE- RECEIVED'},
        {type_key: 48, text: 'MM DELETION'},
        {type_key: 49, text: 'USER AGENT FORWARDING'},
        {type_key: 54, text: 'VAS SUBMISSION'},
        {type_key: 55, text: 'VAS DELIVERY'},
        {type_key: 56, text: 'VAS DELIVERY RESPONSE'},
        {type_key: 57, text: 'VAS CANCELLATION'},
        {type_key: 58, text: 'VAS REPLACEMENT'},
        {type_key: 59, text: 'VAS DELIVERY REPORT'},
        {type_key: 60, text: 'VAS DELIVERY REPORT RESPONSE'},
        {type_key: 61, text: 'VAS READ REPORT'},
        {type_key: 62, text: 'VAS READ REPORT RESPONSE'},
        {type_key: 70, text: 'MAIL SUBMISSION'},
        {type_key: 71, text: 'MAIL FORWARDING'},
        {type_key: 72, text: 'MAIL FORWARDING RESPONSE'},
        {type_key: 73, text: 'USER AGENT SMS NOTIFICATION'},
        {type_key: 74, text: 'INTERCONNECT SMS NOTIFICATION'},
        {type_key: 76, text: 'CANCELLED BY ADMIN'},
        {type_key: 77, text: 'RETRIED BY ADMIN'}
    ]);

    MmscConstants.constant('MMSC_EDR_STATUS', [
        {type_key: 0, text: 'SUCCESS'},
        {type_key: 1, text: 'DELIVERED'},
        {type_key: 2, text: 'FAILURE'},
        {type_key: 3, text: 'REJECTED'},
        {type_key: 4, text: 'EXPIRED'},
        {type_key: 5, text: 'CANCELED'},
        {type_key: 6, text: 'FORWARDED'},
        {type_key: 7, text: 'RETRY'},
        {type_key: 8, text: 'SUBMISSION REJECTED'},
        {type_key: 9, text: 'SUCCESS'}
    ]);

})();
