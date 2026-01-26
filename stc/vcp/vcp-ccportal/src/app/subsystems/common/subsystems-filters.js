(function () {
    'use strict';

    /* Filters */
    angular.module('ccportal.subsystems.filters', []);

    var SubsystemsFilters = angular.module('ccportal.subsystems.filters');

    SubsystemsFilters.filter('RuleItemParamListFormatFilter', function () {
        return function (paramList) {
            var parametersMap = _.map(paramList, function (parameter) {
                var parameterName = s(parameter.name).humanize().titleize().value();

                // Add the original name if it contains "id" keyword.
                if (parameter.name.toLowerCase().indexOf('id') > -1) {
                    parameterName += ' (' + parameter.name + ')';
                }

                return '<tr><th>' + parameterName + '</th><td>' + parameter.value + '</td></tr>';
            });

            return '<table class="table"><tbody>' + parametersMap.join('') + '</tbody></table>';
        };
    });

    SubsystemsFilters.filter('SubscriptionManagementErrorCodeFilter', function (SUBSCRIPTION_MANAGEMENT_ERROR_CODES) {
        return function (key) {
            var errorCode = _.findWhere(SUBSCRIPTION_MANAGEMENT_ERROR_CODES, {key: Number(key)});

            if (errorCode)
                return errorCode.text;
            else
                return key;
        };
    });

    SubsystemsFilters.filter('SubscriptionManagementEventTypeFilter', function (SUBSCRIPTION_MANAGEMENT_EVENT_TYPES) {
        return function (key) {
            var eventType = _.findWhere(SUBSCRIPTION_MANAGEMENT_EVENT_TYPES, {key: Number(key)});

            if (eventType)
                return eventType.text;
            else
                return key;
        };
    });

    SubsystemsFilters.filter('SubscriptionManagementChannelTypeFilter', function (SUBSCRIPTION_MANAGEMENT_CHANNEL_TYPES) {
        return function (value) {
            var channelType = _.findWhere(SUBSCRIPTION_MANAGEMENT_CHANNEL_TYPES, {value: value});

            if (channelType)
                return channelType.text;
            else
                return value;
        };
    });

    SubsystemsFilters.filter('SubscriptionManagementChannelTypeRBTFilter', function (SUBSCRIPTION_MANAGEMENT_CHANNEL_TYPES_RBT) {
        return function (value) {
            var channelType = _.findWhere(SUBSCRIPTION_MANAGEMENT_CHANNEL_TYPES_RBT, {value: value});

            if (channelType)
                return channelType.text;
            else
                return value;
        };
    });

    // Extras
    SubsystemsFilters.filter('ServiceByOrganizationFilter', function () {
        return function (serviceList, organizationId) {
            if (organizationId) {
                return _.where(serviceList, {organizationId: organizationId});
            } else {
                return serviceList;
            }
        };
    });

    SubsystemsFilters.filter('OfferByOrganizationFilter', function () {
        return function (offerList, organizationId) {
            if (organizationId) {
                return _.where(offerList, {organizationId: organizationId});
            } else {
                return offerList;
            }
        };
    });

    SubsystemsFilters.filter('ServiceByServiceProviderFilter', function () {
        return function (serviceList, organizationId) {
            if (organizationId) {
                return _.where(serviceList, {spId: organizationId});
            } else {
                return serviceList;
            }
        };
    });

    SubsystemsFilters.filter('ServiceTypeFilter', function (SERVICE_TYPES) {
        return function (serviceType) {
            var serviceTypeItem = _.findWhere(SERVICE_TYPES, {value: serviceType});

            if (serviceTypeItem)
                return serviceTypeItem.text;
            else
                return serviceType;
        };
    });

    SubsystemsFilters.filter('OperatorsOfOrganizationsFilter', function () {
        return function (organizationList) {
            return _.where(organizationList, {orgType: 'NetworkOperator'});
        };
    });

    SubsystemsFilters.filter('UsersByOrganizationName', function () {
        return function (userList, organizationName) {
            if (organizationName) {
                return _.filter(userList, function (user) {
                    return (user.organization && (user.organization.name === organizationName));
                });
            } else {
                return userList;
            }
        };
    });

    // Provisioning filters
    SubsystemsFilters.filter('SubscriptionManagementProvisioningGenderFilter', function (PROVISIONING_GENDERS) {
        return function (value) {
            var gender = _.findWhere(PROVISIONING_GENDERS, {value: Number(value)});

            if (gender)
                return gender.label;
            else
                return 'CommonLabels.N/A';
        };
    });

    SubsystemsFilters.filter('SubscriptionManagementProvisioningStatusFilter', function (PROVISIONING_STATUSES) {
        return function (value) {
            var status = _.findWhere(PROVISIONING_STATUSES, {value: Number(value)});

            if (status)
                return status.label;
            else
                return 'CommonLabels.N/A';
        };
    });

    SubsystemsFilters.filter('SubscriptionManagementProvisioningTypeFilter', function (PROVISIONING_TYPES) {
        return function (value) {
            var type = _.findWhere(PROVISIONING_TYPES, {value: Number(value)});

            if (type)
                return type.label;
            else
                return 'CommonLabels.N/A';
        };
    });

    SubsystemsFilters.filter('SubscriptionManagementCreditSegmentFilter', function (PROVISIONING_CREDIT_SEGMENTS) {
        return function (value) {
            var creditSegment = _.findWhere(PROVISIONING_CREDIT_SEGMENTS, {value: Number(value)});

            if (creditSegment)
                return creditSegment.text;
            else
                return 'N/A';
        };
    });

    SubsystemsFilters.filter('SubscriptionManagementVipCategoryFilter', function (PROVISIONING_VIP_CATEGORIES) {
        return function (value) {
            var vipCategory = _.findWhere(PROVISIONING_VIP_CATEGORIES, {value: Number(value)});

            if (vipCategory)
                return vipCategory.label;
            else
                return 'CommonLabels.N/A';
        };
    });

    SubsystemsFilters.filter('SubscriptionManagementVipSubCategoryFilter', function (PROVISIONING_VIP_SUB_CATEGORIES) {
        return function (value) {
            var vipSubCategory = _.findWhere(PROVISIONING_VIP_SUB_CATEGORIES, {value: Number(value)});

            if (vipSubCategory)
                return vipSubCategory.label;
            else
                return 'CommonLabels.N/A';
        };
    });

    SubsystemsFilters.filter('SubscriptionManagementCustomerCategoryFilter', function (PROVISIONING_CUSTOMER_CATEGORIES) {
        return function (value) {
            var customerCategory = _.findWhere(PROVISIONING_CUSTOMER_CATEGORIES, {value: Number(value)});

            if (customerCategory)
                return customerCategory.label;
            else
                return 'CommonLabels.N/A';
        };
    });

    SubsystemsFilters.filter('SubscriptionManagementPackageCategoryFilter', function (PROVISIONING_PACKAGE_CATEGORIES) {
        return function (value) {
            var packageCategory = _.findWhere(PROVISIONING_PACKAGE_CATEGORIES, {value: Number(value)});

            if (packageCategory)
                return packageCategory.label;
            else
                return 'CommonLabels.N/A';
        };
    });

    SubsystemsFilters.filter('ChggwServiceByOrganizationAndCarrierBilling', function () {
        return function (serviceList, organizationId, carrierBilling) {
            if (organizationId) {
                serviceList = _.where(serviceList, {organizationId: organizationId.toString()});
            }

            if (carrierBilling) {
                return _.filter(serviceList, function (service) {
                    return service.carrierBilling;
                });
            } else {
                return serviceList;
            }
        };
    });

    SubsystemsFilters.filter('StatusTypeFilterIfNotPending', function () {
        return function (statusTypes, state) {
            if (state !== 'PENDING') {
                return _.filter(statusTypes, function (statusType) {
                    return statusType !== 'PENDING';
                });
            } else {
                return statusTypes
            }
        };
    });

    SubsystemsFilters.filter('TimeConstraintViewFilter', function ($translate, DAYS_OF_WEEK) {
        var convertToDayAndTime = function (durationInMinutes) {
            var minutes = durationInMinutes % 60;
            var hours = ((durationInMinutes - minutes) / 60) % 24;
            var days = Math.floor(((durationInMinutes - minutes) / 60) / 24);

            return {days: days, hours: hours, minutes: minutes};
        };

        return function (timeConstraintStr) {
            if (timeConstraintStr && timeConstraintStr.split('-').length > 0) {
                var timeConstraints = timeConstraintStr.split('-');

                var startTimeInMinutes = Number(timeConstraints[0]);
                var startDayTime = convertToDayAndTime(startTimeInMinutes);
                var startStr = $translate.instant(DAYS_OF_WEEK[startDayTime.days].text) + ', ' + moment().hour(startDayTime.hours).minute(startDayTime.minutes).format('HH:mm');

                var endTimeInMinutes = Number(timeConstraints[1]);
                var endDayTime = convertToDayAndTime(endTimeInMinutes);
                var endStr = $translate.instant(DAYS_OF_WEEK[endDayTime.days].text) + ', ' + moment().hour(endDayTime.hours).minute(endDayTime.minutes).format('HH:mm');

                return startStr + ' - ' + endStr;
            }

            return 'N/A';
        };
    });

})();
