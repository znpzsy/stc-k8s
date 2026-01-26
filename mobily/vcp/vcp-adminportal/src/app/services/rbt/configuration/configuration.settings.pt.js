(function () {

    'use strict';

    angular.module('adminportal.services.rbt.configuration.settings.pt', []);

    var RBTConfigurationSettingsPTModule = angular.module('adminportal.services.rbt.configuration.settings.pt');

    RBTConfigurationSettingsPTModule.config(function ($stateProvider) {

        $stateProvider.state('services.rbt.configuration.settings.pt', {
            url: "/prayer-times",
            templateUrl: "services/rbt/configuration/configuration.settings.pt.html",
            controller: 'RBTConfigurationSettingsPTCtrl',
            resolve: {
                ptServiceProfiles: function (RBTConfService) {
                    return RBTConfService.getPTServiceProfiles();
                }
            }
        })

    });

    RBTConfigurationSettingsPTModule.controller('RBTConfigurationSettingsPTCtrl', function ($scope, $log, $state, $translate, $filter, notification, RBTConfService, ptServiceProfiles) {
        $log.debug('RBTConfigurationSettingsPTCtrl');

        $scope.serviceProfile = ptServiceProfiles;

        var notificationStartTimeMoment = moment($scope.serviceProfile.notificationStartTime, 'HH:mm:ss');
        if (notificationStartTimeMoment.isValid()) {
            $scope.serviceProfile.notificationStartTime = notificationStartTimeMoment.toDate();
        } else {
            $scope.serviceProfile.notificationStartTime = null;
        }
        var notificationEndTimeMoment = moment($scope.serviceProfile.notificationEndTime, 'HH:mm:ss');
        if (notificationEndTimeMoment.isValid()) {
            $scope.serviceProfile.notificationEndTime = notificationEndTimeMoment.toDate();
        } else {
            $scope.serviceProfile.notificationEndTime = null;
        }

        $scope.originalServiceProfile = angular.copy($scope.serviceProfile);
        $scope.isNotChanged = function () {
            return angular.equals($scope.originalServiceProfile, $scope.serviceProfile);
        };

        $scope.save = function (serviceProfile) {
            var serviceProfileItem = angular.copy(serviceProfile);

            if (serviceProfile.notificationStartTime) {
                serviceProfileItem.notificationStartTime = $filter('date')(serviceProfile.notificationStartTime, 'HH:mm');
            }
            if (serviceProfile.notificationEndTime) {
                serviceProfileItem.notificationEndTime = $filter('date')(serviceProfile.notificationEndTime, 'HH:mm');
            }

            $log.debug('Updating pt service profile: ', serviceProfileItem);

            RBTConfService.updatePTServiceProfiles(serviceProfileItem).then(function (response) {
                $log.debug('Updated pt service profile: ', serviceProfileItem, ', response: ', response);

                $scope.originalServiceProfile = angular.copy(serviceProfile);

                notification({
                    type: 'success',
                    text: $translate.instant('CommonLabels.OperationSuccessful')
                });
            }, function (response) {
                $log.debug('Cannot update pt service profile: ', serviceProfileItem, ', response: ', response);
            });
        };

        $scope.cancel = function () {
            $state.go($state.$current, null, {reload: true});
        };
    });

})();
