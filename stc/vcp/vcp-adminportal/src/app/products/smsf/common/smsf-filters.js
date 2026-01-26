(function () {
    'use strict';

    /* Filters */
    angular.module('adminportal.products.smsf.filters', []);

    var SmsfFilters = angular.module('adminportal.products.smsf.filters');

    SmsfFilters.filter('SmsfEDRTypeFilter', function (SMSF_EDR_TYPE) {
        return function (typeKey) {
            var type = _.find(SMSF_EDR_TYPE, function (edrType) {
                return (edrType.type_key === typeKey);
            });

            if (type)
                return type.text;
            else
                return typeKey;
        };
    });

    SmsfFilters.filter('SmsfEDRReasonFilter', function (SMSF_EDR_REASON) {
        return function (value) {
            var reason = _.findWhere(SMSF_EDR_REASON, {reason_code: value});
            var resultText;
            if (reason)
                resultText = reason.text + ' [' + value + ']';
            else
                resultText = value;

            return resultText;
        }
    });

    SmsfFilters.filter('SmsfEDRReasonContextFilter', function (SMSF_EDR_REASON_CONTEXT) {
        return function (context) {
            var reason = _.findWhere(SMSF_EDR_REASON_CONTEXT, {reason_context: context});
            var resultText;
            if (reason)
                resultText = reason.text + ' [' + context + ']';
            else
                resultText = context;

            return resultText;
        };
    });

    SmsfFilters.filter('SmsfEDRResultReasonFilter', function (SMSF_EDR_RESULT_REASON) {
        return function (context, code, subCode) {
            var reason = _.findWhere(SMSF_EDR_RESULT_REASON, {reason_context: context, reason_code: code});

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
    
})();
