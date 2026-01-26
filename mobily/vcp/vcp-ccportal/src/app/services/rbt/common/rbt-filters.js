(function () {
    'use strict';

    /* Filters */
    angular.module('ccportal.services.rbt.filters', []);

    var RBTFilters = angular.module('ccportal.services.rbt.filters');

    RBTFilters.filter('RBTEventTypeFilter', function (RBT_EVENT_TYPE) {
        return function (eventcode) {
            eventcode = s.toNumber(eventcode);

            var type;
            if (!_.isUndefined(eventcode)) {
                type = _.find(RBT_EVENT_TYPE, function (eventType) {
                    return (eventType.key === eventcode);
                });
            }

            if (type)
                return type.text;
            else
                return eventcode;
        };
    });

})();
