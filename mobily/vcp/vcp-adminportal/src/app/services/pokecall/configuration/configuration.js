(function () {

    'use strict';

    angular.module('adminportal.services.pokecall.configuration', []);

    var PokeCallConfigurationModule = angular.module('adminportal.services.pokecall.configuration');

    PokeCallConfigurationModule.config(function ($stateProvider) {

        $stateProvider.state('services.pokecall.configuration', {
            abstract: true,
            url: "/configurations",
            templateUrl: "services/pokecall/configuration/configuration.html"
        }).state('services.pokecall.configuration.settings', {
            url: "/settings",
            templateUrl: "services/pokecall/configuration/configuration.settings.html",
            controller: 'PokeCallConfigurationSettingsCtrl',
            resolve: {
                serviceConfiguration: function (P4MService) {
                    return P4MService.getPokeCallServiceConfiguration();
                }
            }
        });

    });

    PokeCallConfigurationModule.controller('PokeCallConfigurationSettingsCtrl', function ($scope, $log, $state, $translate, notification, Restangular,
                                                                                          serviceConfiguration, P4MService) {
        $log.debug("PokeCallConfigurationSettingsCtrl");

        $scope.serviceConfiguration = serviceConfiguration;

        $scope.originalServiceConfiguration = angular.copy($scope.serviceConfiguration);
        $scope.isConfigurationNotChanged = function () {
            return angular.equals($scope.originalServiceConfiguration, $scope.serviceConfiguration);
        };

        $scope.save = function (serviceConfiguration) {
            $log.debug('Save Poke Call service configuration: ', serviceConfiguration);

            P4MService.updatePokeCallServiceConfiguration(serviceConfiguration).then(function (response) {
                $log.debug('Success. Response: ', response);

                $scope.serviceConfiguration = Restangular.stripRestangular(response);

                $scope.originalServiceConfiguration = angular.copy($scope.serviceConfiguration);

                notification({
                    type: 'success',
                    text: $translate.instant('CommonLabels.OperationSuccessful')
                });
            }, function (response) {
                $log.debug('Cannot update Save Poke Call service configuration. Error: ', response);
            });
        };

        $scope.cancel = function () {
            $state.go($state.$current, null, {reload: true});
        };

    });

})();
