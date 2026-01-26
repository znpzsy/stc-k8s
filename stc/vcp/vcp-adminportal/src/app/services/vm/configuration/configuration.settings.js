(function () {

    'use strict';

    angular.module('adminportal.services.vm.configuration.settings', []);

    var VMConfigurationSettingsModule = angular.module('adminportal.services.vm.configuration.settings');

    VMConfigurationSettingsModule.config(function ($stateProvider) {

        $stateProvider.state('services.vm.configuration.settings', {
            url: "/settings",
            templateUrl: "services/vm/configuration/configuration.settings.html",
            controller: 'VMConfigurationSettingsCtrl',
            resolve: {
                serviceProfile: function (VMConfigurationService) {
                    return VMConfigurationService.getServiceProfile();
                },
                classOfServiceProfiles: function (VMConfigurationService) {
                    return VMConfigurationService.getCoSProfiles();
                }
            }
        })

    });

    VMConfigurationSettingsModule.controller('VMConfigurationSettingsCtrl', function ($scope, $log, $state, $translate, notification, VMConfigurationService,
                                                                                      serviceProfile, classOfServiceProfiles, SUBSCRIBER_LANGUAGES) {
        $log.debug('VMConfigurationSettingsCtrl');

        $scope.classOfServiceProfiles = classOfServiceProfiles;
        $scope.subscriberLanguages = SUBSCRIBER_LANGUAGES;

        $scope.serviceProfile = serviceProfile;

        $scope.originalServiceProfile = angular.copy($scope.serviceProfile);
        $scope.isNotChanged = function () {
            return angular.equals($scope.originalServiceProfile, $scope.serviceProfile);
        };

        $scope.save = function (serviceProfile) {
            $log.debug('Updating service profile: ', serviceProfile);

            VMConfigurationService.updateServiceProfile(serviceProfile).then(function (response) {
                $log.debug('Updated service profile: ', serviceProfile, ', response: ', response);

                $scope.originalServiceProfile = angular.copy(serviceProfile);

                notification({
                    type: 'success',
                    text: $translate.instant('CommonLabels.OperationSuccessful')
                });
            }, function (response) {
                $log.debug('Cannot update service profile: ', serviceProfile, ', response: ', response);
            });
        };

        $scope.cancel = function () {
            $state.go($state.$current, null, {reload: true});
        };
    });

})();
