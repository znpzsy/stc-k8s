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

    ApplicationFilters.filter('ProvisioningStatusTypeFilter', function () {
        return function (status) {
            return (_.isUndefined(status) || _.isEmpty(status) || status === null) ? 'CommonLabels.N/A' : 'ProvisioningStatusTypes.' + s.capitalize(status);
        };
    });


    ApplicationFilters.filter('PriceFormatterFilter', function() {
        return function(input) {

            if (input === null || input === undefined || input === '' || isNaN(input)) {
                return 'N/A';
            }
            var formattedInput = input.toString().replace(',', '.');
            return parseFloat(formattedInput).toFixed(2); // Format to 2 decimal places
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

    ApplicationFilters.filter('ChargingDetailsFilter', function ($translate, $filter, DURATION_UNITS) {
        return function (value) {

            var periodAndTime = s.words(s.words(value, 'P'), 'T');

            var period = periodAndTime[0];
            var year = s.toNumber(s.strLeft(period, 'Y'));
            if (year) {
                //return {unit: DURATION_UNITS[3].key, duration: year};
                return year + ' ' + DURATION_UNITS[3].key;
            }
            var month = s.toNumber(s.strLeft(s.strRight(period, 'Y'), 'M'));
            if (month) {
                //return {unit: DURATION_UNITS[2].key, duration: month};
                return month + ' ' + DURATION_UNITS[2].key;
            }
            var day = s.toNumber(s.strLeft(s.strRight(period, 'M'), 'D'));
            if (day) {
                return day + ' ' + DURATION_UNITS[0].key;
            }

            var time = periodAndTime[1];
            var hour = s.toNumber(s.strLeft(time, 'H'));
            if (hour) {
                return hour + ' ' + DURATION_UNITS[4].key;
            }
            var minute = s.toNumber(s.strLeft(s.strRight(time, 'H'), 'M'));
            if (minute) {
                return minute + ' ' + DURATION_UNITS[5].key;
            }
            var second = s.toNumber(s.strLeft(s.strRight(time, 'M'), 'S'));
            if (second) {
                return second + ' ' + DURATION_UNITS[6].key;
            }

            return '1 ' + DURATION_UNITS[0].key;
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


    ApplicationFilters.filter('humanizeAndTitleize', function () {
        return function (text) {
            return s(text).humanize().titleize().value();
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
