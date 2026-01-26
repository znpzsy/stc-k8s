(function () {
    'use strict';

    /* Filters */
    angular.module('Application.filters', []);

    var ApplicationFilters = angular.module('Application.filters');

    ApplicationFilters.filter('LanguageAbbrFilter', function ($translate) {
        return function (lang) {
            var langKey = 'CommonLabels.N/A';
            if (!_.isUndefined(lang) && !_.isEmpty(lang) && lang !== null) {
                langKey = 'Languages.' + lang.toUpperCase();

                if ($translate.instant(langKey) === langKey) {
                    langKey = 'CommonLabels.N/A';
                }
            }

            return langKey;
        };
    });

    ApplicationFilters.filter('PaymentTypeFilter', function () {
        return function (paymentType) {
            return _.isUndefined(paymentType) ? 'CommonLabels.N/A' : 'PaymentTypes.' + s.capitalize(paymentType);
        };
    });

    ApplicationFilters.filter('ProvisioningStatusTypeFilter', function () {
        return function (statusType) {
            var statusTypeKey = 'CommonLabels.N/A';

            if (statusType) {
                if (statusType.toUpperCase() === 'ACTIVE') {
                    statusTypeKey = 'StatusTypes.Active';
                } else if (statusType.toUpperCase() === 'INACTIVE') {
                    statusTypeKey = 'StatusTypes.Inactive';
                }
            }

            return statusTypeKey;
        };
    });

    ApplicationFilters.filter('DateTimeFilter', function (DateTimeConstants) {
        return function (value, format) {
            if (value && value.indexOf('+') > -1) {
                return moment(value).utcOffset(DateTimeConstants.OFFSET).format(format || 'YYYY-MM-DD HH:mm:ss');
            } else {
                return moment(value + DateTimeConstants.OFFSET).utcOffset(DateTimeConstants.OFFSET).format(format || 'YYYY-MM-DD HH:mm:ss');
            }
        };
    });

    ApplicationFilters.filter('TimeAgoFilter', function (DateTimeConstants) {
        return function (value) {
            if (value && value.indexOf('+') > -1) {
                return moment(value).utcOffset(DateTimeConstants.OFFSET).fromNow();
            } else {
                return moment(value + DateTimeConstants.OFFSET).utcOffset(DateTimeConstants.OFFSET).fromNow();
            }
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
            if (enabled) {
                return $translate.instant('StatusTypes.Active');
            } else
                return $translate.instant('StatusTypes.Inactive');
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
            return $translate.instant('ScreeningManagerScopes.' + scopeId);
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

    ApplicationFilters.filter('titleize', function () {
        return function (text) {
            return s.titleize(text);
        };
    });

    ApplicationFilters.filter('humanize', function () {
        return function (text) {
            return s.humanize(text);
        };
    });

    ApplicationFilters.filter('underscored', function () {
        return function (text) {
            return s.underscored(text);
        };
    });

})();
