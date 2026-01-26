(function () {

    'use strict';

    angular.module('ccportal.services.vsms.preferences', [
        'ccportal.services.vsms.preferences.details'
    ]);

    var VSMSPreferencesModule = angular.module('ccportal.services.vsms.preferences');

    VSMSPreferencesModule.config(function ($stateProvider) {

        $stateProvider.state('services.vsms.preferences', {
            abstract: true,
            url: "/preferences",
            templateUrl: 'services/vsms/preferences/vsms-preferences.html',
            resolve: {
                searchPreferences: function ($q, UtilService, $log, VSMSProvisioningService) {
                    var searchPreferences = _.debounce(function (msisdn) {
                        var subscription = {
                            state: false,
                            preferences: undefined
                        };

                        var deferred = $q.defer();
                        var msisdn = UtilService.getSubscriberMsisdn();

                        VSMSProvisioningService.getServiceSubscriberPreferences(msisdn).then(function (response) {
                            subscription.preferences = response;

                            if (subscription.preferences && subscription.preferences.errorCode) {
                                if (subscription.preferences.errorCode === 2102) {
                                    subscription.error_message = 'Services.VSMS.Messages.SubscriptionNotExists';
                                } else {
                                    subscription.error_message = subscription.preferences.detail;
                                }
                            } else {
                                subscription.state = true;
                            }

                            deferred.resolve(subscription);
                        }, function (response) {
                            subscription.error_message = 'Services.VSMS.Messages.SubscriptionNotExists';
                            deferred.resolve(subscription);
                        });

                        return deferred.promise;
                    }, 750, {immediate: true});

                    return searchPreferences;
                }
            }
        });

    });

    VSMSPreferencesModule.controller('VSMSPreferencesCtrl', function ($scope, $log, $state, $uibModal, notification, $translate, Restangular, UtilService, VSMSProvisioningService,
                                                                      SUBSCRIBER_LANGUAGES, preferences, updateMethod) {
        $log.debug('VSMSPreferencesCtrl');

        if (preferences && preferences.error_message) {
            $scope.$parent.$parent.error_message = preferences.error_message;
            return;
        }

        var msisdn = UtilService.getSubscriberMsisdn();

        $scope.subscriberLanguages = SUBSCRIBER_LANGUAGES;

        var subscriptionPreferences = preferences.preferences;
        $scope.subscriptionPreferences = _.defaults(subscriptionPreferences, {msisdn: msisdn});

        $scope.originalSubscriptionPreferences = angular.copy($scope.subscriptionPreferences);
        $scope.isNotChanged = function () {
            return angular.equals($scope.originalSubscriptionPreferences, $scope.subscriptionPreferences);
        };

        $scope.save = function (subscriptionPreferences) {
            var subscriptionPreferencesItem = angular.copy(subscriptionPreferences);

            updateMethod(msisdn, subscriptionPreferencesItem).then(function (response) {
                $log.debug('Update Success. Response: ', response);

                if (response && response.errorCode) {
                    notification({
                        type: 'warning',
                        text: response.detail
                    });
                } else {
                    $scope.originalSubscriptionPreferences = angular.copy(subscriptionPreferences);

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                }
            }, function (response) {
                $log.debug('Cannot update service. Error: ', response);
            });
        };

        $scope.cancel = function () {
            $state.reload();
        };
    });

})();
