(function () {

    'use strict';

    angular.module('adminportal.products.smsc.operations.trafficcontrols.subscribers', []);

    var SmscTrafficControlsSubscribersOperationsModule = angular.module('adminportal.products.smsc.operations.trafficcontrols.subscribers');

    SmscTrafficControlsSubscribersOperationsModule.config(function ($stateProvider) {

        $stateProvider.state('products.smsc.operations.trafficcontrols.subscribers', {
            url: "/subscribers",
            templateUrl: "products/smsc/operations/operations.trafficcontrols.subscribers.html",
            controller: 'SmscTrafficControlsSubscribersOperationsCtrl',
            resolve: {
                thresholds: function (SmscOperationService) {
                    return SmscOperationService.getSS7InputRates();
                }
            }
        });

    });

    SmscTrafficControlsSubscribersOperationsModule.controller('SmscTrafficControlsSubscribersOperationsCtrl', function ($scope, $state, $log, $translate, notification, thresholds,
                                                                                                                                      SmscOperationService) {
        $log.debug('SmscTrafficControlsSubscribersOperationsCtrl');

        $scope.subscribersOptions = {
            incomingTrafficAgentId: thresholds[0].agentId,
            incomingTrafficAgentName: thresholds[0].agentName,
            incomingTrafficControlEnabled: thresholds[0].intputRate > -1,
            incomingTrafficThreshold: (thresholds[0].intputRate === -1 ? undefined : thresholds[0].intputRate),
            name: thresholds[0].agentName
        };

        $scope.originalSubscribersOptions = angular.copy($scope.subscribersOptions);
        $scope.isUnchanged = function () {
            return angular.equals($scope.originalSubscribersOptions, $scope.subscribersOptions);
        };

        $scope.save = function (subscribersOptions) {
            $log.debug('Save User Agents thresholds: ', subscribersOptions);

            if (subscribersOptions.incomingTrafficControlEnabled) {
                var requestBody = {
                    "agentId": subscribersOptions.incomingTrafficAgentId,
                    "agentName": subscribersOptions.incomingTrafficAgentName,
                    "intputRate": subscribersOptions.incomingTrafficThreshold
                };

                SmscOperationService.updateSS7InputRates(requestBody).then(function (response) {
                    $log.debug('Subscribers traffic threshold (SS7 input rates) updated successfully. Response: ', response);

                    $scope.originalSubscribersOptions = angular.copy($scope.subscribersOptions);

                    notification({
                        type: 'success',
                        text: $translate.instant('Products.SMSC.Operations.TrafficControls.Messages.SubscriberBasedUpdatedSuccessfully')
                    });
                }, function (response) {
                    $log.debug('Cannot update subscribers traffic threshold (SS7 input rates). Error: ', response);
                });
            } else {
                SmscOperationService.removeSS7InputRates(subscribersOptions.incomingTrafficAgentName).then(function (response) {
                    $log.debug('Subscribers traffic threshold (SS7 input rates) deleted successfully. Response: ', response);

                    $scope.subscribersOptions.incomingTrafficThreshold = undefined;
                    $scope.originalSubscribersOptions = angular.copy($scope.subscribersOptions);

                    notification({
                        type: 'success',
                        text: $translate.instant('Products.SMSC.Operations.TrafficControls.Messages.SubscriberBasedUpdatedSuccessfully')
                    });
                }, function (response) {
                    $log.debug('Cannot delete subscribers traffic threshold (SS7 input rates). Error: ', response);
                });
            }
        };

        $scope.cancel = function () {
            $state.go($state.$current, null, {reload: true});
        };

    });

})();
