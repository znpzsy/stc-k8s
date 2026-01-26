// TODO: These are originally MSGGW Filters / Understand the business logic and modify these definitions
(function () {
    'use strict';

    /* Filters */
    angular.module('adminportal.products.otp.filters', []);

    var MessagingGwFilters = angular.module('adminportal.products.otp.filters');

    MessagingGwFilters.filter('MessagingGwEDRTypeFilter', function (MSGGW_EDR_TYPES) {
        return function (typeKey) {
            var type = _.find(MSGGW_EDR_TYPES, function (edrType) {
                return (edrType.type_key === Number(typeKey));
            });

            if (type)
                return type.text + ' [' + typeKey + ']';
            else
                return typeKey;
        };
    });

    MessagingGwFilters.filter('MessagingGwEDRResultReasonFilter', function (MSGGW_EDR_RESULT_REASONS) {
        return function (context, code) {
            var reason = _.findWhere(MSGGW_EDR_RESULT_REASONS, {
                reason_context: Number(context),
                reason_code: Number(code)
            });

            if (reason)
                return reason.text + ' [' + context + '-' + code + ']';
            else
                return context + '-' + code;
        };
    });

    MessagingGwFilters.filter('MessagingGwAgentTypeFilter', function (MSGGW_SMSC_AGENT_TYPES) {
        return function (typeKey) {
            var type = _.findWhere(MSGGW_SMSC_AGENT_TYPES, {type_key: Number(typeKey)});

            if (type)
                return type.text;
            else
                return typeKey;
        };
    });

    MessagingGwFilters.filter('MessagingGwSMSDeliveryReportFilter', function (MSGGW_SMS_DELIVERY_STATES) {
        return function (state) {
            var deliveryState = _.findWhere(MSGGW_SMS_DELIVERY_STATES, {state: Number(state)});

            if (deliveryState)
                return deliveryState.text;
            else
                return state;
        };
    });

})();
