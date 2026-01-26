(function () {

    'use strict';

    angular.module('adminportal.services.vm.operations.subscriptions', [
        'adminportal.services.vm.operations.subscriptions.preferences'
    ]);

    var VMOperationsSubscriptionsModule = angular.module('adminportal.services.vm.operations.subscriptions');

    VMOperationsSubscriptionsModule.config(function ($stateProvider) {

        $stateProvider.state('services.vm.operations.subscriptions', {
            abstract: true,
            url: "/subscriptions",
            template: '<div ui-view></div>',
            resolve: {
                searchPreferences: function ($q, $log, notification, $translate, VMProvisioningService) {
                    var searchPreferences = _.debounce(function (msisdn) {
                        var deferred = $q.defer();

                        VMProvisioningService.getServicePreferences(msisdn).then(function (response) {
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

    VMOperationsSubscriptionsModule.controller('VMOperationsSubscriptionsCtrl', function ($scope, $log, searchPreferences) {
        $log.debug('VMOperationsSubscriptionsCtrl');

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
