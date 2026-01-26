/**
 * Created by tayfuno on 7/24/14.
 */
(function () {

    'use strict';

    angular.module('adminportal.services.cmb.configuration', []);

    var P4MConfigurationModule = angular.module('adminportal.services.cmb.configuration');

    P4MConfigurationModule.config(function ($stateProvider) {

        $stateProvider.state('services.cmb.configuration', {
            abstract: true,
            url: "/configurations",
            templateUrl: "services/cmb/configuration/configuration.html"
        }).state('services.cmb.configuration.settings', {
            abstract: true,
            url: "/settings",
            templateUrl: "partials/simple.abstract.html"
        }).state('services.cmb.configuration.settings.callmeback', {
            url: "/callmeback",
            templateUrl: "services/cmb/configuration/configuration.callmeback.serviceprofile.html",
            controller: 'CallMeBackConfigurationCtrl',
            resolve: {
                cmbServiceProfile: function (P4MService) {
                    return P4MService.getCmbServiceProfile();
                }
            }
        });

    });

    P4MConfigurationModule.controller('CallMeBackConfigurationCtrl', function ($scope, $log, $state, $translate, notification, Restangular, P4MService,
                                                                               ScreeningManagerService, cmbServiceProfile) {
        $log.debug("CallMeBackConfigurationCtrl");

        $scope.serviceProfile = Restangular.stripRestangular(cmbServiceProfile);
        $scope.originalServiceProfile = angular.copy($scope.serviceProfile);


        $scope.isConfigurationNotChanged = function () {
            return angular.equals($scope.originalServiceProfile, $scope.serviceProfile);
        };

        $scope.save = function (serviceProfile) {
            $log.debug('Save CMB service configuration: ', serviceProfile);

            P4MService.updateCmbServiceProfile(serviceProfile).then(function (response) {
                $log.debug('Success. Response: ', response);

                $scope.serviceProfile = Restangular.stripRestangular(response);

                $scope.originalServiceProfile = angular.copy($scope.serviceProfile);

                notification({
                    type: 'success',
                    text: $translate.instant('CommonLabels.OperationSuccessful')
                });
            }, function (response) {
                $log.debug('Cannot update CMB Service Profile. Error: ', response);
            });
        };

        $scope.cancel = function () {
            $state.go($state.$current, null, {reload: true});
        };
    });

})();
