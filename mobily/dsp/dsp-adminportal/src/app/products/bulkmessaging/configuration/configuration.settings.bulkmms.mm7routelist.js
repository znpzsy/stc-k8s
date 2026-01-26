(function () {

    'use strict';

    angular.module('adminportal.products.bulkmessaging.configuration.settings.bulkmms.mm7routelist', []);

    var BulkMessagingConfigurationSettingsBulkMMSMM7RouteListModule = angular.module('adminportal.products.bulkmessaging.configuration.settings.bulkmms.mm7routelist');

    BulkMessagingConfigurationSettingsBulkMMSMM7RouteListModule.controller('BulkMessagingConfigurationSettingsBulkMMSMM7RouteListCtrl', function ($scope, $log, $uibModal, $uibModalInstance) {
        $log.debug('BulkMessagingConfigurationSettingsBulkMMSMM7RouteListCtrl');

        $scope.close = function () {
            $uibModalInstance.close();
        };
    });

})();
