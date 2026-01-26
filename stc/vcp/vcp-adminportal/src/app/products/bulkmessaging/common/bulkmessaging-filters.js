(function () {
    'use strict';

    /* Filters */
    angular.module('adminportal.products.bulkmessaging.filters', []);

    var BulkMessagingFilters = angular.module('adminportal.products.bulkmessaging.filters');

    BulkMessagingFilters.filter('UserByOrganizationFilter', function () {
        return function (userAccountList, organizationId) {
            if (organizationId) {
                return _.where(userAccountList, {organizationId: organizationId});
            } else {
                return userAccountList;
            }
        };
    });

    BulkMessagingFilters.filter('DistributionListByListTypeFilter', function () {
        return function (distributionListArray, listType) {
            if (listType) {
                return _.findWhere(distributionListArray, {type: listType}).list;
            } else {
                return [];
            }
        };
    });

    BulkMessagingFilters.filter('BMSJobStatusFilter', function (BMS_CAMPAIGN_STATUS_LIST) {
        return function (jobStatus) {
            var statusItem = _.findWhere(BMS_CAMPAIGN_STATUS_LIST, {value: Number(jobStatus)});
            if (statusItem) {
                return statusItem.text;
            } else {
                return 'N/A';
            }
        };
    });

    BulkMessagingFilters.filter('BMSChannelFilter', function (BMS_EDR_CHANNELS) {
        return function (channel) {
            if (channel) {
                return _.findWhere(BMS_EDR_CHANNELS, {value: Number(channel)}).text;
            } else {
                return 'N/A';
            }
        };
    });

})();
