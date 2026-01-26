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

            return  langKey;
        };
    });

    ApplicationFilters.filter('PaymentTypeFilter', function () {
        return function (paymentType) {
            return _.isUndefined(paymentType) ? 'CommonLabels.N/A' : 'PaymentTypes.' + s.capitalize(paymentType);
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

    ApplicationFilters.filter('YesNoFilter', function ($translate, $filter) {
        return function (value) {
            value = (typeof value === 'string' ? (value === 'true' || value === '1' || value === 'yes') : value);
            var retVal = value ? $translate.instant('CommonLabels.Yes') : (value === false ? $translate.instant('CommonLabels.No') : $translate.instant('CommonLabels.N/A'));
            retVal = $filter('uppercase')(retVal);

            return retVal;
        };
    });

    ApplicationFilters.filter('unsafe', function ($sce) {
        return function (val) {
            return $sce.trustAsHtml(val);
        };
    });

    ApplicationFilters.filter('cdpEnums', function ($translate) {
        return function (value, fieldName) {
            if (_.isUndefined(value)) {
                return '';
            } else {
                return 'CommonLabels.' + fieldName + '.' + value;
            }
        };
    });

    ApplicationFilters.filter('applicationStateFilter', function ($translate) {
        return function (value) {
            return value ? $translate.instant('CommonLabels.Active') : $translate.instant('CommonLabels.Inactive');
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

    ApplicationFilters.filter('requestedFilter', function ($translate) {
        return function (value) {
            return value ? $translate.instant('CommonLabels.Requested') : $translate.instant('CommonLabels.NotRequested');
        };
    });

    ApplicationFilters.filter('titleize', function () {
        return function (text) {
            return s.titleize(text);
        };
    });

    ApplicationFilters.directive('includeReplace', function () {
        return {
            require: 'ngInclude',
            restrict: 'A',
            link: function (scope, el, attrs) {
                el.replaceWith(el.children());
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

    ApplicationFilters.filter('ServiceTypeFilter', function (SERVICE_TYPES) {
        return function (serviceType) {
            var serviceTypeItem = _.findWhere(SERVICE_TYPES, {value: serviceType});

            if (serviceTypeItem)
                return serviceTypeItem.text;
            else
                return serviceType;
        };
    });

    ApplicationFilters.filter('activeDirectoryAuthFilter', function (CMPF_USER_KEYS) {
        return function (password) {
            return angular.equals(password, CMPF_USER_KEYS[1]);
        };
    });

})();
