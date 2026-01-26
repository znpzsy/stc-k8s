(function () {

    'use strict';

    angular.module('adminportal.products.usc.configuration', []);

    var USCConfigurationModule = angular.module('adminportal.products.usc.configuration');

    USCConfigurationModule.config(function ($stateProvider) {

        $stateProvider.state('products.usc.configuration', {
            url: "/configurations",
            abstract: true,
            templateUrl: "products/usc/configuration/configuration.html"
        }).state('products.usc.configuration.gateway', {
            url: "/gateway",
            templateUrl: "products/usc/configuration/configuration.gateway.html",
            controller: 'USCGatewayConfigurationCtrl',
            resolve: {
                applicationGateway: function (UssdGwConfService) {
                    return UssdGwConfService.getApplicationGateway();
                }
            }
        }).state('products.usc.configuration.menubrowser', {
            url: "/browser",
            templateUrl: "products/usc/configuration/configuration.menubrowser.html",
            controller: 'USCMenuBrowserConfigurationCtrl',
            resolve: {
                ussdBrowser: function (UssdBrowserService) {
                    return UssdBrowserService.getConfiguration();
                }
            }
        });

    });

    USCConfigurationModule.controller('USCGatewayConfigurationCtrl', function ($scope, $log, $state, notification, $translate, Restangular,
                                                                               UssdGwConfService, applicationGateway, USC_APPLICATION_GATEWAY_POLICIES) {
        $log.debug("USCGatewayConfigurationCtrl");

        $scope.policies = USC_APPLICATION_GATEWAY_POLICIES;

        $scope.appGw = Restangular.stripRestangular(applicationGateway);

        $scope.appGwOriginal = angular.copy($scope.appGw);

        $scope.isApplicationGatewayNotChanged = function () {
            return angular.equals($scope.appGw, $scope.appGwOriginal);
        };

        $scope.save = function (applicationGateway) {
            UssdGwConfService.updateApplicationGateway(applicationGateway).then(function (response) {

                $log.debug('Updated UssdGw Application Gw config api: ', response);

                $scope.appGw = Restangular.stripRestangular(response);
                $scope.appGwOriginal = angular.copy($scope.appGw);

                if ($scope.appGw.errorCode) {
                    notification({
                        type: 'warning',
                        text: $translate.instant('CommonMessages.ApiError', {
                            errorCode: $scope.appGw.errorCode,
                            errorText: $scope.appGw.errorText
                        })
                    });
                } else {
                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                }
            }, function (response) {
                $log.debug('Cannot update UssdGw Application Gw! Response: ', response);
            });
        };

        $scope.cancel = function () {
            $state.go($state.$current, null, {reload: true});
        };

    });

    USCConfigurationModule.controller('USCMenuBrowserConfigurationCtrl', function ($scope, $log, $state, notification, $translate, UssdBrowserService,
                                                                                   Restangular, ussdBrowser) {
        $log.debug("USCMenuBrowserConfigurationCtrl");

        $scope.ussdBrowser = Restangular.stripRestangular(ussdBrowser);

        $scope.originalUssdBrowser = angular.copy($scope.ussdBrowser);
        $scope.isConfigurationNotChanged = function () {
            return angular.equals($scope.originalUssdBrowser, $scope.ussdBrowser);
        };

        $scope.save = function () {
            UssdBrowserService.setConfiguration($scope.ussdBrowser).then(function (response) {
                $log.debug('Update Ussd Browser config:', response);

                $scope.ussdBrowser = Restangular.stripRestangular(response);

                $scope.originalUssdBrowser = angular.copy($scope.ussdBrowser);

                if ($scope.ussdBrowser.errorCode) {
                    notification({
                        type: 'warning',
                        text: $translate.instant('CommonMessages.ApiError', {
                            errorCode: $scope.ussdBrowser.errorCode,
                            errorText: $scope.ussdBrowser.errorText
                        })
                    });
                } else {
                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                }
            }, function (response) {
                $log.debug('Cannot update Ussd Browser Configuration');
            });
        };
        $scope.cancel = function () {
            $state.go($state.$current, null, {reload: true});
        };
    });

})();
