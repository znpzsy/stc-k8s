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
            return (_.isUndefined(paymentType) || _.isEmpty(paymentType) || paymentType === null) ? 'CommonLabels.N/A' : 'PaymentTypes.' + s.capitalize(paymentType);
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

    ApplicationFilters.filter('ProvisioningStatusTypeFilter', function () {
        return function (statusType) {
            var statusTypeKey = 'CommonLabels.N/A';

            if (statusType) {
                if (statusType.toUpperCase() === 'ACTIVE') {
                    statusTypeKey = 'ProvisioningStatusTypes.ACTIVE';
                } else if (statusType.toUpperCase() === 'INACTIVE') {
                    statusTypeKey = 'ProvisioningStatusTypes.INACTIVE';
                }
            }

            return statusTypeKey;
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

    ApplicationFilters.filter('mcaServiceType', function () {
        return function (key) {
            return key === 'MCN' ? 'Mawjood':'Mawjood (Extra)';
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

    ApplicationFilters.filter('diameterServiceIdentifierFilter', function ($translate, DIAMETER_SERVICE_IDENTIFIER_MAPPING) {
        return function (id) {
            var returnValue = id;

            var diameterServiceIdentifier = _.findWhere(DIAMETER_SERVICE_IDENTIFIER_MAPPING, {id: Number(id)});
            if (diameterServiceIdentifier) {
                returnValue = diameterServiceIdentifier.label;
            } else {
                returnValue = $translate.instant('CommonLabels.N/A');
            }

            return returnValue;
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

    ApplicationFilters.filter('SubscriptionManagementChannelTypeFilter', function (SUBSCRIPTION_MANAGEMENT_CHANNEL_TYPES) {
        return function (value) {
            var channelType = _.findWhere(SUBSCRIPTION_MANAGEMENT_CHANNEL_TYPES, {value: value});

            if (channelType)
                return channelType.text;
            else
                return value;
        };
    });

    ApplicationFilters.filter('SubscriptionManagementChannelTypeRBTFilter', function (SUBSCRIPTION_MANAGEMENT_CHANNEL_TYPES_RBT) {
        return function (value) {
            var channelType = _.findWhere(SUBSCRIPTION_MANAGEMENT_CHANNEL_TYPES_RBT, {value: value});

            if (channelType)
                return channelType.text;
            else
                return value;
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
