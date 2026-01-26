(function () {

    'use strict';

    angular.module('adminportal.services.rbt.configuration.settings.rbt', []);

    var RBTConfigurationSettingsRBTModule = angular.module('adminportal.services.rbt.configuration.settings.rbt');

    RBTConfigurationSettingsRBTModule.config(function ($stateProvider) {

        $stateProvider.state('services.rbt.configuration.settings.rbt', {
            url: "/ring-back-tone",
            templateUrl: "services/rbt/configuration/configuration.settings.rbt.html",
            controller: 'RBTConfigurationSettingsRBTCtrl',
            resolve: {
                rbtServiceProfiles: function (RBTConfService) {
                    return RBTConfService.getRBTServiceProfiles();
                }
            }
        })

    });

    RBTConfigurationSettingsRBTModule.controller('RBTConfigurationSettingsRBTCtrl', function ($scope, $log, $state, $translate, notification, RBTConfService, rbtServiceProfiles) {
        $log.debug('RBTConfigurationSettingsRBTCtrl');

        $scope.serviceProfile = rbtServiceProfiles;

        $scope.originalServiceProfile = angular.copy($scope.serviceProfile);
        $scope.isNotChanged = function () {
            return angular.equals($scope.originalServiceProfile, $scope.serviceProfile);
        };

        $scope.save = function (serviceProfile) {
            var serviceProfileItem = angular.copy(serviceProfile);

            $log.debug('Updating rbt service profile: ', serviceProfileItem);

            RBTConfService.updateRBTServiceProfiles(serviceProfileItem).then(function (response) {
                $log.debug('Updated rbt service profile: ', serviceProfileItem, ', response: ', response);

                $scope.originalServiceProfile = angular.copy(serviceProfile);

                notification({
                    type: 'success',
                    text: $translate.instant('CommonLabels.OperationSuccessful')
                });
            }, function (response) {
                $log.debug('Cannot update rbt service profile: ', serviceProfileItem, ', response: ', response);
            });
        };

        $scope.cancel = function () {
            $state.go($state.$current, null, {reload: true});
        };
    });

})();
