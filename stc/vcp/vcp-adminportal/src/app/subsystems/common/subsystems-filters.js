(function () {
    'use strict';

    /* Filters */
    angular.module('adminportal.subsystems.filters', []);

    var SubsystemsFilters = angular.module('adminportal.subsystems.filters');

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

    SubsystemsFilters.filter('TimeConstraintViewFilter', function (DAYS_OF_WEEK) {
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
                var startStr = DAYS_OF_WEEK[startDayTime.days].text + ', ' + moment().hour(startDayTime.hours).minute(startDayTime.minutes).format('HH:mm');

                var endTimeInMinutes = Number(timeConstraints[1]);
                var endDayTime = convertToDayAndTime(endTimeInMinutes);
                var endStr = DAYS_OF_WEEK[endDayTime.days].text + ', ' + moment().hour(endDayTime.hours).minute(endDayTime.minutes).format('HH:mm');

                return startStr + ' - ' + endStr;
            }

            return 'N/A';
        };
    });

    SubsystemsFilters.filter('AccessChannelsFilter', function (CMS_ACCESS_CHANNELS) {
        return function (accessChannels) {
            if (!accessChannels || !Array.isArray(accessChannels) || accessChannels.length === 0) {
                return 'N/A';
            }

            // Find the first matching channel group
            var matchingGroup = _.find(CMS_ACCESS_CHANNELS, function (channelGroup) {
                return _.isEqual(_.sortBy(channelGroup.value), _.sortBy(accessChannels));
            });

            return matchingGroup ? matchingGroup.label : 'GENERAL';
        };
    });


    // DSP Related
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

})();
