(function () {

    'use strict';

    angular.module('adminportal.products.smsc.configuration.settings.applicationgateway', []);

    var SmscApplicationGatewayOperationsModule = angular.module('adminportal.products.smsc.configuration.settings.applicationgateway');

    SmscApplicationGatewayOperationsModule.config(function ($stateProvider) {

        $stateProvider.state('products.smsc.configuration.settings.applicationgateway', {
            url: "/applicationgateway",
            templateUrl: "products/smsc/configuration/configuration.settings.applicationgateway.html",
            controller: 'SmscApplicationGatewayOperationsCtrl',
            resolve: {
                applicationGateway: function (SmscConfService) {
                    return SmscConfService.getApplicationGateway();
                }
            }
        });

    });

    SmscApplicationGatewayOperationsModule.controller('SmscApplicationGatewayOperationsCtrl', function ($scope, $state, $log, notification, $translate, Restangular, SmscConfService,
                                                                                                              applicationGateway, APPLICATION_GATEWAY_POLICIES) {
        $log.debug('SmscApplicationGatewayOperationsCtrl');

        $scope.policies = APPLICATION_GATEWAY_POLICIES;

        $scope.applicationGateway = Restangular.stripRestangular(applicationGateway);

        $scope.applicationGatewayOriginal = angular.copy($scope.applicationGateway);

        $scope.isApplicationGatewayNotChanged = function () {
            return angular.equals($scope.applicationGateway, $scope.applicationGatewayOriginal);
        };

        $scope.save = function (applicationGateway) {
            SmscConfService.updateApplicationGateway(applicationGateway).then(function (response) {

                $log.debug('Updated SMSC Application Gateway config api: ', response);

                $scope.applicationGateway = Restangular.stripRestangular(response);
                $scope.applicationGatewayOriginal = angular.copy($scope.applicationGateway);

                if ($scope.applicationGateway.errorCode) {
                    notification({
                        type: 'danger',
                        text: $translate.instant('CommonMessages.ApiError', {
                            errorCode: $scope.applicationGateway.errorCode,
                            errorText: $scope.applicationGateway.errorText
                        })
                    });
                } else {
                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                }
            }, function (response) {
                $log.debug('Cannot update SMSC Application Gateway! Response: ', response);
            });
        };

        $scope.cancel = function () {
            $state.go($state.$current, null, {reload: true});
        };

    });

})();
