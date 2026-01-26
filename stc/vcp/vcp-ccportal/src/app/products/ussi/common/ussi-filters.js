(function () {
    'use strict';

    /* Filters */
    angular.module('ccportal.products.ussi.filters', []);

    var UssiFilters = angular.module('ccportal.products.ussi.filters');


    UssiFilters.filter('UssiEDRReasonFilter', function (USSI_EDR_REASON) {
        return function (value) {
            var reason = _.findWhere(USSI_EDR_REASON, {reason_code: value});
            var resultText;
            if (reason)
                resultText = reason.text + ' [' + value + ']';
            else
                resultText = value;

            return resultText;
        }
    });

    UssiFilters.filter('UssiEDRReasonContextFilter', function (USSI_EDR_REASON_CONTEXT) {
        return function (context) {
            var reason = _.findWhere(USSI_EDR_REASON_CONTEXT, {reason_context: context});
            var resultText;
            if (reason)
                resultText = reason.text + ' [' + context + ']';
            else
                resultText = context;

            return resultText;
        };
    });

    UssiFilters.filter('UssiEDRResultReasonFilter', function (USSI_EDR_RESULT_REASON) {
        return function (context, code, subCode) {
            var reason = _.findWhere(USSI_EDR_RESULT_REASON, {reason_context: context, reason_code: code});

            var resultText;
            if (reason)
                resultText = reason.text + ' [' + context + '-' + code + ']';
            else
                resultText = context + '-' + code;

            var subReason;
            if (reason && reason.subReasons && reason.subReasons.length > 0 && !_.isUndefined(subCode)) {
                subReason = _.findWhere(reason.subReasons, {reason_code: Number(subCode)});
                resultText = resultText + '<br />' + (subReason ? subReason.text + ' ' : '') + '[' + subCode + ']';
            }

            return resultText;
        };
    });

    UssiFilters.filter('UssiEDRTypeFilter', function (USSI_EDR_TYPE) {
        return function (typeKey) {
            var type = _.find(USSI_EDR_TYPE, function (edrType) {
                return (edrType.type_key === typeKey);
            });

            if (type)
                return type.text;
            else
                return typeKey;
        };
    });

})();
