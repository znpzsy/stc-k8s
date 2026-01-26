(function () {
    'use strict';

    /* Filters */
    angular.module('partnerportal.partner-info.filters', []);

    var PartnerInfoFilters = angular.module('partnerportal.partner-info.filters');

    PartnerInfoFilters.filter('MessagingGwEDRTypeFilter', function (MSGGW_EDR_TYPES) {
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

    PartnerInfoFilters.filter('MessagingGwEDRResultReasonFilter', function (MSGGW_EDR_RESULT_REASONS) {
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

    PartnerInfoFilters.filter('MessagingGwAgentTypeFilter', function (MSGGW_SMSC_AGENT_TYPES) {
        return function (typeKey) {
            var type = _.findWhere(MSGGW_SMSC_AGENT_TYPES, {type_key: Number(typeKey)});

            if (type)
                return type.text;
            else
                return typeKey;
        };
    });

    PartnerInfoFilters.filter('MessagingGwSMSDeliveryReportFilter', function (MSGGW_SMS_DELIVERY_STATES) {
        return function (state) {
            var deliveryState = _.findWhere(MSGGW_SMS_DELIVERY_STATES, {state: Number(state)});

            if (deliveryState)
                return deliveryState.text;
            else
                return state;
        };
    });

    PartnerInfoFilters.filter('ChargingGwEventTypeFilter', function (CHARGING_GW_EVENT_TYPES) {
        return function (typeKey) {
            var type = _.find(CHARGING_GW_EVENT_TYPES, function (edrType) {
                return (edrType.type_key === typeKey);
            });

            if (type)
                return type.text + ' [' + typeKey + ']';
            else
                return typeKey;
        };
    });

    PartnerInfoFilters.filter('ChargingGwEventTypeErrorFilter', function (CHARGING_GW_EVENT_ERROR_TYPES) {
        return function (typeKey) {
            var type = _.find(CHARGING_GW_EVENT_ERROR_TYPES, function (edrType) {
                return (edrType.type_key === typeKey);
            });

            if (type)
                return type.text;
            else
                return typeKey;
        };
    });

    PartnerInfoFilters.filter('ChargingGwUnitFilter', function (CHGGW_UNITS) {
        return function (key) {
            var unit = _.findWhere(CHGGW_UNITS, {key: Number(key)});

            if (unit)
                return unit.value;
            else
                return key;
        };
    });

    PartnerInfoFilters.filter('ChargingGwErrorCodeFilter', function (CHGGW_ERROR_CODES) {
        return function (key) {
            var errorCode = _.findWhere(CHGGW_ERROR_CODES, {key: Number(key)});

            if (errorCode)
                return errorCode.value;
            else
                return key;
        };
    });

    PartnerInfoFilters.filter('ChargingGwEventFilter', function (CHGGW_EVENTS) {
        return function (key) {
            var event = _.findWhere(CHGGW_EVENTS, {key: Number(key)});

            if (event)
                return event.value;
            else
                return key;
        };
    });

    PartnerInfoFilters.filter('ChargingGwPriceUnitFilter', function (CHGGW_PRICE_UNITS) {
        return function (key) {
            var priceUnit = _.findWhere(CHGGW_PRICE_UNITS, {key: Number(key)});

            if (priceUnit)
                return priceUnit.value;
            else
                return '';
        };
    });

})();
