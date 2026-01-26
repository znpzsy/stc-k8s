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

    ApplicationFilters.filter('PriceFormatterFilter', function() {
        return function(input) {

            if (input === null || input === undefined || input === '' || isNaN(input)) {
                return 'N/A';
            }
            var formattedInput = input.toString().replace(',', '.');
            return parseFloat(formattedInput).toFixed(2); // Format to 2 decimal places
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

    ApplicationFilters.filter('humanizeAndTitleize', function () {
        return function (text) {
            return s(text).humanize().titleize().value();
        };
    });

    ApplicationFilters.filter('activeDirectoryAuthFilter', function (CMPF_USER_KEYS) {
        return function (password) {
            return angular.equals(password, CMPF_USER_KEYS[1]);
        };
    });

    // DSP Filters 
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

    ApplicationFilters.filter('SipNumberFilter', function() {
        return function(value) {
            if (!value) return '';
            var match = value.match(/sip:(\d+)@/);
            return match ? match[1] : value;
        };
    });

    ApplicationFilters.filter('Divide', function() {
        return function(value, divisor, fractionSize) {
            if (isNaN(value) || isNaN(divisor) || divisor == 0) return value;
            fractionSize = (fractionSize === undefined) ? 2 : fractionSize;
            return (value / divisor).toFixed(fractionSize);
        };
    });


})();
