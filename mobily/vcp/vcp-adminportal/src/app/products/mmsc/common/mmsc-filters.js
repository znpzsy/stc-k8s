(function () {
    'use strict';

    /* Filters */
    angular.module('adminportal.products.mmsc.filters', []);

    var MmscFilters = angular.module('adminportal.products.mmsc.filters');

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

    MmscFilters.filter('MmscDeliveryReportPolicyFilter', function (MMSC_DELIVERY_REPORT_POLICY) {
        return function (typeKey) {
            var type = _.findWhere(MMSC_DELIVERY_REPORT_POLICY, {type_key: typeKey});

            if (type)
                return type.text;
            else
                return typeKey;
        };
    });

    MmscFilters.filter('OperatorStatusTypeFilter', function (STATUS_TYPES) {
        return function (interworking) {
            return (interworking === 'ENABLED') ? STATUS_TYPES[0].name : STATUS_TYPES[1].name;
        };
    });

})();
