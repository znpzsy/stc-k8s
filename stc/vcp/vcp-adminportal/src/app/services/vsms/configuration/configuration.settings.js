(function () {

    'use strict';

    angular.module('adminportal.services.vsms.configuration.settings', []);

    var VSMSConfigurationSettingsModule = angular.module('adminportal.services.vsms.configuration.settings');

    VSMSConfigurationSettingsModule.config(function ($stateProvider) {

        $stateProvider.state('services.vsms.configuration.settings', {
            url: "/settings",
            templateUrl: "services/vsms/configuration/configuration.settings.html",
            controller: 'VSMSConfigurationSettingsCtrl',
            resolve: {
                serviceProfile: function (VSMSConfigurationService) {
                    return VSMSConfigurationService.getServiceProfile();
                },
                classOfServiceProfiles: function (VSMSConfigurationService) {
                    return VSMSConfigurationService.getSubscriberProfiles();
                }
            }
        })

    });

    VSMSConfigurationSettingsModule.controller('VSMSConfigurationSettingsCtrl', function ($scope, $log, $state, $translate, notification, VSMSConfigurationService,
                                                                                          serviceProfile, classOfServiceProfiles, SUBSCRIBER_LANGUAGES) {
        $log.debug('VSMSConfigurationSettingsCtrl');

        $scope.classOfServiceProfiles = classOfServiceProfiles;
        $scope.subscriberLanguages = SUBSCRIBER_LANGUAGES;

        $scope.serviceProfile = serviceProfile;
        $scope.confirmpassword = $scope.serviceProfile.defaultPassword;

        $scope.originalServiceProfile = angular.copy($scope.serviceProfile);
        $scope.isNotChanged = function () {
            return angular.equals($scope.originalServiceProfile, $scope.serviceProfile);
        };

        $scope.save = function (serviceProfile) {
            $log.debug('Updating service profile: ', serviceProfile);

            VSMSConfigurationService.updateServiceProfile(serviceProfile).then(function (response) {
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
