(function () {
    'use strict';

    /* Filters */
    angular.module('ccportal.products.smsc.filters', []);

    var SmscFilters = angular.module('ccportal.products.smsc.filters');

    SmscFilters.filter('smscAddresNpiFilter', function (SMSC_ADDRESS_NPI) {
        return function (val) {
            return _.findWhere(SMSC_ADDRESS_NPI, {value: val}).text;
        };
    });

    SmscFilters.filter('smscAddresTonFilter', function (SMSC_ADDRESS_TON) {
        return function (val) {
            return _.findWhere(SMSC_ADDRESS_TON, {value: val}).text;
        };
    });

    SmscFilters.filter('smscAgentTypeFilter', function (SMSC_AGENT_TYPE) {
        return function (typeKey) {
            var type = _.findWhere(SMSC_AGENT_TYPE, {type_key: typeKey});

            if (type)
                return type.text;
            else
                return typeKey;
        };
    });

    SmscFilters.filter('SmscEDRTypeFilter', function (SMSC_EDR_TYPE) {
        return function (typeKey, smsTypeKey) {
            var type = _.find(SMSC_EDR_TYPE, function (edrType) {
                if (!_.isUndefined(edrType.sms_type_key) && !_.isUndefined(smsTypeKey))
                    return ((edrType.type_key === typeKey) && (edrType.sms_type_key === smsTypeKey));
                else
                    return (edrType.type_key === typeKey);
            });

            if (type)
                return type.text;
            else
                return typeKey;
        };
    });

    SmscFilters.filter('SmscEDRResultReasonFilter', function (SMSC_EDR_RESULT_REASON) {
        return function (context, code, subCode) {
            var reason = _.findWhere(SMSC_EDR_RESULT_REASON, {reason_context: context, reason_code: code});

            var resultText;
            if (reason)
                resultText = reason.text + ' [' + context + '-' + code + ']';
            else
                resultText = context + '-' + code;

            var subReason;
            if (reason && reason.subReasons && reason.subReasons.length > 0 && !_.isUndefined(subCode)) {
                subReason = _.findWhere(reason.subReasons, {reason_code: Number(subCode)});
                resultText = resultText + '<br />' +  (subReason ? subReason.text + ' ' : '')  + '[' + subCode + ']';
            }

            return resultText;
        };
    });

    SmscFilters.filter('smscDcsFilter', function (SMSC_DCS) {
        return function (val) {
            var dcs = _.findWhere(SMSC_DCS, {value: val});

            if (dcs)
                return dcs.text;
            else
                return val;
        };
    });

})();
