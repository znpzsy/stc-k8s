(function () {
    'use strict';

    /* Constants */
    angular.module('ccportal.products.charginggw.constants', []);

    var ChargingGwConstants = angular.module('ccportal.products.charginggw.constants');

    ChargingGwConstants.constant('CHGGW_EVENTS', [
        {key: 0, value: 'UNSET'},
        {key: 100, value: 'DIRECT_DEBIT_ATTEMPTED'},
        {key: 101, value: 'DIRECT_DEBIT_ACCEPTED'},
        {key: 102, value: 'DIRECT_DEBIT_SUCCESS'},
        {key: 103, value: 'DIRECT_DEBIT_FAIL'},
        {key: 110, value: 'DIRECT_REFUND_ATTEMPTED'},
        {key: 111, value: 'DIRECT_REFUND_ACCEPTED'},
        {key: 112, value: 'DIRECT_REFUND_SUCCESS'},
        {key: 113, value: 'DIRECT_REFUND_FAIL'},
        {key: 200, value: 'RESERVATION_RESERVE_ATTEMPTED'},
        {key: 201, value: 'RESERVATION_RESERVE_ACCEPTED'},
        {key: 202, value: 'RESERVATION_RESERVE_SUCCESS'},
        {key: 203, value: 'RESERVATION_RESERVE_FAIL'},
        {key: 210, value: 'RESERVATION_COMMIT_ATTEMPTED'},
        {key: 211, value: 'RESERVATION_COMMIT_ACCEPTED'},
        {key: 212, value: 'RESERVATION_COMMIT_SUCCESS'},
        {key: 213, value: 'RESERVATION_COMMIT_FAIL'},
        {key: 220, value: 'RESERVATION_CANCEL_ATTEMPTED'},
        {key: 221, value: 'RESERVATION_CANCEL_ACCEPTED'},
        {key: 222, value: 'RESERVATION_CANCEL_SUCCESS'},
        {key: 223, value: 'RESERVATION_CANCEL_FAIL'},
        {key: 300, value: 'DURATION_START_ATTEMPTED'},
        {key: 301, value: 'DURATION_START_ACCEPTED'},
        {key: 302, value: 'DURATION_START_SUCCESS'},
        {key: 303, value: 'DURATION_START_FAIL'},
        {key: 310, value: 'DURATION_STOP_ATTEMPTED'},
        {key: 311, value: 'DURATION_STOP_ACCEPTED'},
        {key: 312, value: 'DURATION_STOP_SUCCESS'},
        {key: 313, value: 'DURATION_STOP_FAIL'},
        {key: 400, value: 'DURATION_NOTIFICATION_CHARGING_EXCEPTION_ATTEMPTED'},
        {key: 401, value: 'DURATION_NOTIFICATION_CHARGING_EXCEPTION_SUCCESS'},
        {key: 402, value: 'DURATION_NOTIFICATION_CHARGING_EXCEPTION_FAIL'},
        {key: 410, value: 'DURATION_NOTIFICATION_LOW_CREDIT_ATTEMPTED'},
        {key: 411, value: 'DURATION_NOTIFICATION_LOW_CREDIT_SUCCESS'},
        {key: 412, value: 'DURATION_NOTIFICATION_LOW_CREDIT_FAIL'},
        {key: 420, value: 'DURATION_NOTIFICATION_NO_CREDIT_ATTEMPTED'},
        {key: 421, value: 'DURATION_NOTIFICATION_NO_CREDIT_SUCCESS'},
        {key: 422, value: 'DURATION_NOTIFICATION_NO_CREDIT_FAIL'},
        {key: 430, value: 'DURATION_NOTIFICATION_PING_CLIENT_ATTEMPTED'},
        {key: 431, value: 'DURATION_NOTIFICATION_PING_TRANSACTION_ATTEMPTED'},
        {key: 432, value: 'DURATION_NOTIFICATION_PING_SUCCESS'},
        {key: 433, value: 'DURATION_NOTIFICATION_PING_FAIL'},
        {key: 434, value: 'DURATION_NOTIFICATION_PING_FAIL_STOP_CHARGING'},
    ]);

    ChargingGwConstants.constant('CHGGW_ERROR_CODES', [
        {key: -1, value: 'UNKNOWN_ERROR'},
        {key: 0, value: 'SUCCESS'},
        {key: 1, value: 'GENERAL_ERROR'},
        {key: 2, value: 'INVALID_REQUEST'},
        {key: 3, value: 'LICENSE_ERROR'},
        {key: 4, value: 'INSUFFICIENT_CREDIT'},
        {key: 5, value: 'CHARGING_ERROR'},
        {key: 6, value: 'SUBSCRIBER_IS_NOT_PROVISIONED'},
        {key: 7, value: 'SUBSCRIBER_IS_NOT_ALLOWED'},
        {key: 8, value: 'NO_DEBIT_TRANSACTION'},
        {key: 9, value: 'REFUND_EXCEEDS_DEBIT'},
        {key: 10, value: 'UNKNOWN_SERVICE'},
        {key: 11, value: 'UNKNOWN_OFFER'}
    ]);

    ChargingGwConstants.constant('CHGGW_UNITS', [
        {key: 1, value: 'MONEY'},
        {key: 2, value: 'PIECES'},
        {key: 3, value: 'BYTES'},
        {key: 4, value: 'SECONDS'}
    ]);

    ChargingGwConstants.factory('CHGGW_PRICE_UNITS', function (CURRENCY) {
        return [
            {key: 1, value: CURRENCY.abbr},
            {key: 2, value: 'pieces'},
            {key: 3, value: 'bytes'},
            {key: 4, value: 'sec'}
        ];
    });

})();
