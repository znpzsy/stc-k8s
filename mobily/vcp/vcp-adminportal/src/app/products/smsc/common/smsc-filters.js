(function () {
    'use strict';

    /* Filters */
    angular.module('adminportal.products.smsc.filters', []);

    var SmscFiltersModule = angular.module('adminportal.products.smsc.filters');

    SmscFiltersModule.filter('TonNpiCriteriaFilter', function ($translate) {
        return function (val) {
            return (val === -1 ? $translate.instant('CommonLabels.Any') : val);
        };
    });

    SmscFiltersModule.filter('SmscAgentTypeFilter', function (SMSC_AGENT_TYPE) {
        return function (typeKey) {
            var type = _.findWhere(SMSC_AGENT_TYPE, {type_key: typeKey});

            if (type)
                return type.text;
            else
                return typeKey;
        };
    });

    SmscFiltersModule.filter('SmscEDRTypeFilter', function (SMSC_EDR_TYPE) {
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

    SmscFiltersModule.filter('SmscEDRResultReasonFilter', function (SMSC_EDR_RESULT_REASON) {
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
                resultText = resultText + '<br />' + (subReason ? subReason.text + ' ' : '') + '[' + subCode + ']';
            }

            return resultText;
        };
    });

    SmscFiltersModule.filter('SmscPduTypeFilter', function (PDU_TYPES) {
        return function (pduType) {
            if (pduType)
                return PDU_TYPES[pduType].name;

            return PDU_TYPES[0].name;
        };
    });

})();
