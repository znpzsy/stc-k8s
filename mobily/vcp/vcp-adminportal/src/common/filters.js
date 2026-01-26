(function () {
    'use strict';

    /* Filters */
    angular.module('Application.filters', []);

    var ApplicationFilters = angular.module('Application.filters');

    ApplicationFilters.filter('LanguageAbbrFilter', function () {
        return function (language) {
            return (_.isUndefined(language) || _.isEmpty(language) || language === null) ? 'CommonLabels.N/A' : 'Languages.' + language.toUpperCase();
        };
    });

    ApplicationFilters.filter('ProvisioningPaymentTypeFilter', function () {
        return function (paymentType) {
            return (_.isUndefined(paymentType) || paymentType === null) ? 'CommonLabels.N/A' : 'PaymentTypes.' + paymentType;
        };
    });

    ApplicationFilters.filter('ProvisioningStatusTypeFilter', function () {
        return function (status) {
            return (_.isUndefined(status) || _.isEmpty(status) || status === null) ? 'CommonLabels.N/A' : 'ProvisioningStatusTypes.' + s.capitalize(status);
        };
    });

    ApplicationFilters.filter('LocalUppercaseFilter', function () {
        return function (value) {
            return value.toLocaleUpperCase('tr-TR');
        };
    });

    ApplicationFilters.filter('LanguageCodeFilter', function () {
        return function (value) {
            var key = 'CommonLabels.N/A';

            if (value) {
                key = 'Languages.' + value.toUpperCase();
            }

            return key;
        };
    });

    ApplicationFilters.filter('DecimalPointFormatFilter', function () {
        return function (number, decimalPoint) {
            var decimalNumber = new Decimal(number);

            var decimalPlaces = decimalNumber.decimalPlaces();

            return decimalNumber.toFixed(decimalPlaces > decimalPoint ? decimalPlaces : decimalPoint);
        };
    });

    ApplicationFilters.filter('NewlineToHtmlNewlineFilter', function () {
        return function (text) {
            if (text) {
                text = text.replace(/\\n/g, '<br\>');
            }

            return text;
        };
    });

    ApplicationFilters.filter('GeneralEDRResultFilter', function ($translate) {
        return function (value) {
            if (value > 0) {
                return $translate.instant('CommonLabels.Failure');
            } else
                return $translate.instant('CommonLabels.Success');
        };
    });

    ApplicationFilters.filter('StatusTypeFilter', function ($translate) {
        return function (enabled) {
            if (angular.isString(enabled)) {
                enabled = enabled.toUpperCase() === 'ENABLED';
            }

            if (enabled) {
                return $translate.instant('StatusTypes.ACTIVE');
            } else
                return $translate.instant('StatusTypes.INACTIVE');
        };
    });

    ApplicationFilters.filter('ValidityFilter', function ($translate) {
        return function (valid) {
            if (valid) {
                return $translate.instant('CommonLabels.Translate');
            } else
                return $translate.instant('CommonLabels.Reject');
        };
    });

    ApplicationFilters.filter('EqualityFilter', function ($translate) {
        return function (valid) {
            if (valid) {
                return $translate.instant('CommonLabels.Equal');
            } else
                return $translate.instant('CommonLabels.NotEqual');
        };
    });

    ApplicationFilters.filter('NotAvailableFilter', function ($translate) {
        return function (value) {
            var label = $translate.instant('CommonLabels.N/A');

            return _.isUndefined(value) || s.isBlank(value) ? label : value;
        };
    });

    ApplicationFilters.filter('RedirectionReasonsFilter', function () {
        return function (redirectionReason) {
            if (redirectionReason || !_.isEmpty(redirectionReason)) {
                return 'RedirectionReasons.' + redirectionReason.toUpperCase();
            } else {
                return '';
            }
        };
    });

    ApplicationFilters.filter('YesNoFilter', function ($translate, $filter) {
        return function (value) {
            value = (typeof value === 'string' ? (value === 'true' || value === '1' || value === 'yes') : value);
            var retVal = value ? $translate.instant('CommonLabels.Yes') : (value === false ? $translate.instant('CommonLabels.No') : $translate.instant('CommonLabels.N/A'));
            retVal = $filter('uppercase')(retVal);

            return retVal;
        };
    });

    ApplicationFilters.filter('requestedFilter', function ($translate) {
        return function (value) {
            return value ? $translate.instant('CommonLabels.Requested') : $translate.instant('CommonLabels.NotRequested');
        };
    });

    ApplicationFilters.filter('ScreeningScopeFilter', function ($translate) {
        return function (scopeId) {
            var translatedText = $translate.instant('ScreeningManagerScopes.' + scopeId);
            if ('ScreeningManagerScopes.' + scopeId === translatedText) {
                return scopeId;
            } else {
                return translatedText;
            }
        };
    });

    ApplicationFilters.filter('UssdCorporateCodeUssdCodeStatusTypeFilter', function ($translate) {
        return function (code) {
            var label = $translate.instant('CommonLabels.N/A');
            if (code) {
                if (code.state === 1) {
                    label = code.ussdCode + ' - ' + $translate.instant('UssdCorporateCodeStatusTypes.ACTIVE');
                } else if (code.state === 2) {
                    label = code.ussdCode + ' - ' + $translate.instant('UssdCorporateCodeStatusTypes.BLOCKED');
                }
            }

            return label;
        };
    });

    ApplicationFilters.filter('unsafe', function ($sce) {
        return function (val) {
            return $sce.trustAsHtml(val);
        };
    });

    ApplicationFilters.filter('reportFormatFilter', function () {
        return function (val, type) {
            return _.where(val, {type: type});
        };
    });

    ApplicationFilters.filter('textPruneFilter', function () {
        return function (text, length) {
            return s.prune(text, length);
        };
    });

    ApplicationFilters.filter('capitalize', function () {
        return function (text) {
            return s.capitalize(text);
        };
    });

    ApplicationFilters.filter('activeDirectoryAuthFilter', function (CMPF_USER_KEYS) {
        return function (password) {
            return angular.equals(password, CMPF_USER_KEYS[1]);
        };
    });

})();
