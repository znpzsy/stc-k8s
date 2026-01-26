(function () {

    'use strict';

    angular.module('adminportal.services.rbt.configuration.settings.hangup', []);

    var RBTConfigurationSettingsHangupModule = angular.module('adminportal.services.rbt.configuration.settings.hangup');

    RBTConfigurationSettingsHangupModule.config(function ($stateProvider) {

        $stateProvider.state('services.rbt.configuration.settings.hangup', {
            url: "/hang-up",
            templateUrl: "services/rbt/configuration/configuration.settings.hangup.html",
            controller: 'RBTConfigurationSettingsHangupCtrl',
            resolve: {
                hangupServiceProfiles: function (RBTConfService) {
                    return RBTConfService.getHangupServiceProfiles();
                }
            }
        })

    });

    RBTConfigurationSettingsHangupModule.controller('RBTConfigurationSettingsHangupCtrl', function ($scope, $log, $state, $translate, notification, RBTConfService, hangupServiceProfiles) {
        $log.debug('RBTConfigurationSettingsHangupCtrl');

        $scope.serviceProfile = hangupServiceProfiles;

        $scope.originalServiceProfile = angular.copy($scope.serviceProfile);
        $scope.isNotChanged = function () {
            return angular.equals($scope.originalServiceProfile, $scope.serviceProfile);
        };

        $scope.save = function (serviceProfile) {
            var serviceProfileItem = angular.copy(serviceProfile);

            $log.debug('Updating hangup service profile: ', serviceProfileItem);

            RBTConfService.updateHangupServiceProfiles(serviceProfileItem).then(function (response) {
                $log.debug('Updated hangup service profile: ', serviceProfileItem, ', response: ', response);

                $scope.originalServiceProfile = angular.copy(serviceProfile);

                notification({
                    type: 'success',
                    text: $translate.instant('CommonLabels.OperationSuccessful')
                });
            }, function (response) {
                $log.debug('Cannot update hangup service profile: ', serviceProfileItem, ', response: ', response);
            });
        };

        $scope.cancel = function () {
            $state.go($state.$current, null, {reload: true});
        };
    });

})();
