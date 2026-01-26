(function () {
    'use strict';

    /* Filters */
    angular.module('adminportal.products.antispamsms.filters', []);

    var AntiSpamSMSFilters = angular.module('adminportal.products.antispamsms.filters');

    AntiSpamSMSFilters.filter('AntiSpamSMSEDRTypeFilter', function (SMS_ANTISPAM_EDR_TYPE) {
        return function (typeKey) {
            typeKey = s.toNumber(typeKey);
            var type;
            if (!_.isUndefined(typeKey)) {
                type = _.find(SMS_ANTISPAM_EDR_TYPE, function (edrType) {
                    return (edrType.type_key === typeKey);
                });
            }

            if (type)
                return type.text;
            else
                return typeKey;
        };
    });

    AntiSpamSMSFilters.filter('AntiSpamSMSTrafficTypeFilter', function (SMS_ANTISPAM_TRAFFIC_TYPES) {
        return function (value) {
            value = s.toNumber(value);
            var type;
            if (!_.isUndefined(value)) {
                type = _.find(SMS_ANTISPAM_TRAFFIC_TYPES, function (edrType) {
                    return (edrType.value === value);
                });
            }

            if (type)
                return type.text;
            else
                return value;
        };
    });

    AntiSpamSMSFilters.filter('AntiSpamSMSOpRejectReasonFilter', function (SMS_ANTISPAM_OP_REJECT_REASONS) {
        return function (value) {
            value = value === null ? undefined : s.toNumber(value);
            var type;
            if (!_.isUndefined(value)) {
                type = _.find(SMS_ANTISPAM_OP_REJECT_REASONS, function (edrType) {
                    return (edrType.value === value);
                });
            }

            if (type)
                return type.text;
            else
                return value;
        };
    });

    AntiSpamSMSFilters.filter('AntiSpamSMSOpRejectMethodFilter', function (SMS_ANTISPAM_OP_REJECT_METHODS) {
        return function (value) {
            value = value === null ? undefined : s.toNumber(value);
            var type;
            if (!_.isUndefined(value)) {
                type = _.find(SMS_ANTISPAM_OP_REJECT_METHODS, function (edrType) {
                    return (edrType.value === value);
                });
            }

            if (type)
                return type.text;
            else
                return value;
        };
    });

    AntiSpamSMSFilters.filter('AntiSpamSMSOpErrorCodeFilter', function (SMS_ANTISPAM_OP_ERROR_CODES) {
        return function (value) {
            value = value === null ? undefined : s.toNumber(value);
            var type;
            if (!_.isUndefined(value)) {
                type = _.find(SMS_ANTISPAM_OP_ERROR_CODES, function (edrType) {
                    return (edrType.value === value);
                });
            }

            if (type)
                return type.text;
            else
                return value;
        };
    });

    AntiSpamSMSFilters.filter('AntiSpamSMSRejectMethodFilter', function (SMS_ANTISPAM_REJECT_METHODS_3) {
        return function (value) {
            value = value === null ? undefined : s.toNumber(value);
            var rejectPolicy;
            if (!_.isUndefined(value)) {
                rejectPolicy = _.find(SMS_ANTISPAM_REJECT_METHODS_3, function (rejectPolicy) {
                    return (rejectPolicy.value === value);
                });
            }

            if (rejectPolicy)
                return rejectPolicy.label;
            else
                return value;
        };
    });

    AntiSpamSMSFilters.filter('AntiSpamSMSContentFilterTypeFilter', function (SMS_ANTISPAM_EVALUATION_TYPES) {
        return function (numericValue) {
            numericValue = s.toNumber(numericValue);
            var type;
            if (!_.isUndefined(numericValue)) {
                type = _.find(SMS_ANTISPAM_EVALUATION_TYPES, function (evalType) {
                    return (evalType.numericValue === numericValue);
                });
            }

            if (type)
                return type.label;
            else
                return numericValue;
        };
    });

    AntiSpamSMSFilters.filter('AntiSpamSMSContentCounterFilterTypeFilter', function (SMS_ANTISPAM_CONTENT_COUNTER_EVALUATION_TYPES) {
        return function (numericValue) {
            numericValue = s.toNumber(numericValue);
            var type;
            if (!_.isUndefined(numericValue)) {
                type = _.find(SMS_ANTISPAM_CONTENT_COUNTER_EVALUATION_TYPES, function (evalType) {
                    return (evalType.numericValue === numericValue);
                });
            }

            if (type)
                return type.label;
            else
                return numericValue;
        };
    });

    AntiSpamSMSFilters.filter('AntiSpamSMSContentCounterFlowFilter', function (SMS_ANTISPAM_CONTENT_COUNTER_FLOWS) {
        return function (value) {
            value = s.toNumber(value);
            var type;
            if (!_.isUndefined(value)) {
                type = _.find(SMS_ANTISPAM_CONTENT_COUNTER_FLOWS, function (evalType) {
                    return (evalType.value === value);
                });
            }

            if (type)
                return type.label;
            else
                return value;
        };
    });


    AntiSpamSMSFilters.filter('AntiSpamSMSStatusFilter', function (SMS_ANTISPAM_SMFIELD_STATUS) {
        return function (numericValue) {
            numericValue = s.toNumber(numericValue);
            var type;
            if (!_.isUndefined(numericValue)) {
                type = _.find(SMS_ANTISPAM_SMFIELD_STATUS, function (evalType) {
                    return (evalType.numericValue === numericValue);
                });
            }

            if (type)
                return type.label;
            else
                return numericValue;
        };
    });

    AntiSpamSMSFilters.filter('AntiSpamRejectReasonDetailInfoFilter', function () {
        return function (record) {

            if (!record) {
                return '';
            }

            var details = [];

            if (record.opRejectMethodText) {
                details.push('<strong>Reject Method:</strong> ' + record.opRejectMethodText);
            }

            if (record.opErrorCodeText) {
                details.push('<strong>Error Code:</strong> ' + record.opErrorCodeText);
            }

            if (record.opScreeningName) {
                details.push('<strong>Screening:</strong> ' + record.opScreeningName);
            }

            if (record.opContentFilter) {
                details.push('<strong>Filter Name:</strong> ' + record.opContentFilter);
            }

            return details.length ? details.join('<br/>') : '';
        };
    });


})();
