(function () {
    'use strict';

    /* Filters */
    angular.module('ccportal.products.mmsc.filters', []);

    var MmscFilters = angular.module('ccportal.products.mmsc.filters');

    MmscFilters.filter('MmscEDRTypeFilter', function (MMSC_EDR_TYPE) {
        return function (typeKey) {
            var type = _.find(MMSC_EDR_TYPE, function(entry) {
                return entry.type_key == typeKey; // Loose equality (==) allows matching "36" with 36
            });

            if (type)
                return type.text;
            else
                return typeKey;
        };
    });

    MmscFilters.filter('MmscEDRStatusFilter', function (MMSC_EDR_STATUS) {
        return function (typeKey) {
            var type = _.find(MMSC_EDR_STATUS, function(entry) {
                return entry.type_key == typeKey;
            });

            if (type)
                return type.text;
            else
                return typeKey;
        };
    });

})();
