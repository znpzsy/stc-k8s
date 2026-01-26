(function () {

    'use strict';

    angular.module('adminportal.services.vsms.operations.subscriptions', [
        'adminportal.services.vsms.operations.subscriptions.preferences'
    ]);

    var VSMSOperationsSubscriptionsModule = angular.module('adminportal.services.vsms.operations.subscriptions');

    VSMSOperationsSubscriptionsModule.config(function ($stateProvider) {

        $stateProvider.state('services.vsms.operations.subscriptions', {
            abstract: true,
            url: "/subscriptions",
            templateUrl: 'partials/simple.abstract.html',
            resolve: {
                searchPreferences: function ($q, $log, notification, $translate, VSMSProvisioningService) {
                    var searchPreferences = _.debounce(function (msisdn) {
                        var deferred = $q.defer();

                        VSMSProvisioningService.getServicePreferences(msisdn).then(function (response) {
                            if (_.isUndefined(response)) {
                                notification({
                                    type: 'warning',
                                    text: $translate.instant('CommonMessages.SubscriberNotFound')
                                });

                                deferred.reject(response);
                            } else {
                                if (response.errorCode) {
                                    notification({
                                        type: 'warning',
                                        text: response.detail
                                    });

                                    deferred.reject(response);
                                } else {
                                    deferred.resolve(response);
                                }
                            }
                        }, function (response) {
                            if (response.data.errorCode) {
                                var message;
                                if (response.data.errorCode === 2102) {
                                    message = $translate.instant('CommonMessages.SubscriptionDoesNotExist')
                                } else {
                                    message = response.data.detail
                                }

                                notification({
                                    type: 'warning',
                                    text: message
                                });
                            }
                        });

                        return deferred.promise;
                    }, 750, {immediate: true});

                    return searchPreferences;
                }
            }
        });

    });

    VSMSOperationsSubscriptionsModule.controller('VSMSOperationsSubscriptionsCtrl', function ($scope, $log, searchPreferences) {
        $log.debug('VSMSOperationsSubscriptionsCtrl');

        $scope.showPreferences = false;

        $scope.search = function (msisdn) {
            if (msisdn) {
                $scope.showPreferences = false;

                searchPreferences(msisdn).then(function (response) {
                    $scope.showPreferences = true;

                    $scope.subscriptionPreferences = response;

                    var elm = angular.element(document.querySelector('[id=msisdn]'));
                    elm.scope().msisdn = '';
                    elm.scope().searchForm.$setPristine();
                });
            }
        };
    });

})();
