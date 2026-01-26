(function () {
    'use strict';

    /* Filters */
    angular.module('Application.filters', []);

    var ApplicationFilters = angular.module('Application.filters');

    ApplicationFilters.filter('LanguageAbbrFilter', function () {
        return function (lang) {
            return _.isUndefined(lang) ? 'CommonLabels.N/A' : 'Languages.' + lang.toUpperCase();
        };
    });

    ApplicationFilters.filter('PaymentTypeFilter', function () {
        return function (paymentType) {
            return (_.isUndefined(paymentType) || _.isEmpty(paymentType) || paymentType === null) ? 'CommonLabels.N/A' : 'PaymentTypes.' + s.capitalize(paymentType);
        };
    });

    ApplicationFilters.filter('DecimalPointFormatFilter', function () {
        return function (number, decimalPoint) {
            if (number) {
                var decimalNumber = new Decimal(number);

                var decimalPlaces = decimalNumber.decimalPlaces();

                return decimalNumber.toFixed(decimalPlaces > decimalPoint ? decimalPlaces : decimalPoint);
            } else {
                return '';
            }
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

    ApplicationFilters.filter('iconName', function () {
        return function (faName) {
            return String(faName).slice(3);
        };
    });

    ApplicationFilters.filter('screeningListName', function ($translate) {
        return function (key) {
            return key === 'blacklist' ? $translate.instant('ScreeningLists.BlackList') : $translate.instant('ScreeningLists.WhiteList');
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

    ApplicationFilters.filter('ReadUndreadFilter', function () {
        return function (value) {
            var retVal = value ? 'CommonLabels.Read' : 'CommonLabels.Unread';

            return retVal;
        };
    });

    ApplicationFilters.filter('priorityLevelFilter', function () {
        return function (val) {
            var key = ((val === '0' || val === 0) ? 'Normal' : 'Vip');
            return 'PriorityLevels.' + key;
        };
    });

    ApplicationFilters.filter('unsafe', function ($sce) {
        return function (val) {
            return $sce.trustAsHtml(val);
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

    ApplicationFilters.filter('SubscriptionManagementErrorCodeFilter', function (SUBSCRIPTION_MANAGEMENT_ERROR_CODES) {
        return function (key) {
            var errorCode = _.findWhere(SUBSCRIPTION_MANAGEMENT_ERROR_CODES, {key: Number(key)});

            if (errorCode)
                return errorCode.text;
            else
                return errorCode;
        };
    });

    ApplicationFilters.filter('SubscriptionManagementEventTypeFilter', function (SUBSCRIPTION_MANAGEMENT_EVENT_TYPES) {
        return function (key) {
            var eventType = _.findWhere(SUBSCRIPTION_MANAGEMENT_EVENT_TYPES, {key: Number(key)});

            if (eventType)
                return eventType.text;
            else
                return eventType;
        };
    });

    // Extras
    ApplicationFilters.filter('ServiceByOrganizationFilter', function () {
        return function (serviceList, organizationId) {
            if (organizationId) {
                return _.where(serviceList, {organizationId: organizationId});
            } else {
                return serviceList;
            }
        };
    });

})();
