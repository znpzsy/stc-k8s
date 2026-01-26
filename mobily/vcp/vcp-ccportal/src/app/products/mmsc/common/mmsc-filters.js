(function () {
    'use strict';

    /* Filters */
    angular.module('ccportal.products.mmsc.filters', []);

    var MmscFilters = angular.module('ccportal.products.mmsc.filters');

    MmscFilters.filter('MmscEDRTypeFilter', function (MMSC_EDR_TYPE) {
        return function (typeKey) {
            var type = _.findWhere(MMSC_EDR_TYPE, {type_key: typeKey});

            if (type)
                return type.text;
            else
                return typeKey;
        };
    });

    MmscFilters.filter('MmscEDRStatusFilter', function (MMSC_EDR_STATUS) {
        return function (typeKey) {
            var type = _.findWhere(MMSC_EDR_STATUS, {type_key: typeKey});
            if (type)
                return type.text;
            else
                return typeKey;
        };
    });

})();
