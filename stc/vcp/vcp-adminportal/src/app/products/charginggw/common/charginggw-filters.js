(function () {
    'use strict';

    /* Filters */
    angular.module('adminportal.products.charginggw.filters', []);

    var ChargingGwFilters = angular.module('adminportal.products.charginggw.filters');

    ChargingGwFilters.filter('ChargingGwUnitFilter', function (CHGGW_UNITS) {
        return function (key) {
            var unit = _.findWhere(CHGGW_UNITS, {key: Number(key)});

            if (unit)
                return unit.value;
            else
                return key;
        };
    });

    ChargingGwFilters.filter('ChargingGwErrorCodeFilter', function (CHGGW_ERROR_CODES) {
        return function (key) {
            var errorCode = _.findWhere(CHGGW_ERROR_CODES, {key: Number(key)});

            if (errorCode)
                return errorCode.value;
            else
                return key;
        };
    });

    ChargingGwFilters.filter('ChargingGwEventFilter', function (CHGGW_EVENTS) {
        return function (key) {
            var event = _.findWhere(CHGGW_EVENTS, {key: Number(key)});

            if (event)
                return event.value;
            else
                return key;
        };
    });

    ChargingGwFilters.filter('ChargingGwPriceUnitFilter', function (CHGGW_PRICE_UNITS) {
        return function (key) {
            var priceUnit = _.findWhere(CHGGW_PRICE_UNITS, {key: Number(key)});

            if (priceUnit)
                return priceUnit.value;
            else
                return '';
        };
    });

})();
