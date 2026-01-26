(function () {

    'use strict';

    angular.module('ccportal.services.vm.preferences', [
        'ccportal.services.vm.preferences.details'
    ]);

    var VMPreferencesModule = angular.module('ccportal.services.vm.preferences');

    VMPreferencesModule.config(function ($stateProvider) {

        $stateProvider.state('services.vm.preferences', {
            abstract: true,
            url: "/preferences",
            templateUrl: 'services/vm/preferences/vm-preferences.html',
            resolve: {
                searchPreferences: function ($q, UtilService, VMProvisioningService) {
                    var msisdn = UtilService.getSubscriberMsisdn();

                    var searchPreferences = _.debounce(function () {
                        var subscription = {
                            state: false,
                            preferences: undefined
                        };

                        var deferred = $q.defer();

                        VMProvisioningService.getServiceSubscriberPreferences(msisdn).then(function (response) {
                            subscription.preferences = response;

                            if (subscription.preferences && subscription.preferences.errorCode) {
                                if (subscription.preferences.errorCode === 5021) {
                                    subscription.error_message = 'Services.VM.Messages.SubscriptionNotExists';
                                } else {
                                    subscription.error_message = subscription.preferences.detail;
                                }
                            } else {
                                subscription.state = true;
                            }

                            deferred.resolve(subscription);

                        }, function (response) {
                            subscription.error_message = 'Services.VM.Messages.SubscriptionNotExists';
                            deferred.resolve(subscription);
                        });

                        return deferred.promise;
                    }, 750, {immediate: true});

                    return searchPreferences;
                }
            }
        });

    });

    VMPreferencesModule.controller('VMPreferencesCtrl', function ($scope, $log, $state, $uibModal, notification, $translate, Restangular, UtilService, VMProvisioningService,
                                                                  SUBSCRIBER_LANGUAGES, preferences, classOfServiceProfiles, updateMethod) {
        $log.debug('VMPreferencesCtrl');

        if (preferences && preferences.error_message) {
            $scope.$parent.$parent.error_message = preferences.error_message;
            return;
        }

        var msisdn = UtilService.getSubscriberMsisdn();

        $scope.subscriberLanguages = SUBSCRIBER_LANGUAGES;

        $scope.classOfServiceProfiles = classOfServiceProfiles;

        var subscriptionPreferences = preferences.preferences;
        $scope.subscriptionPreferences = _.defaults(subscriptionPreferences, {msisdn: msisdn});

        if (!$scope.subscriptionPreferences.pincode) {
            $scope.subscriptionPreferences.pincode = '000000';
        }
        $scope.subscriptionPreferences.confirmpincode = $scope.subscriptionPreferences.pincode;

        $scope.originalSubscriptionPreferences = angular.copy($scope.subscriptionPreferences);
        $scope.isNotChanged = function () {
            return angular.equals($scope.originalSubscriptionPreferences, $scope.subscriptionPreferences);
        };

        $scope.save = function (subscriptionPreferences) {
            var subscriptionPreferencesItem = angular.copy(subscriptionPreferences);
            if (subscriptionPreferencesItem.pincode === '000000') {
                delete subscriptionPreferencesItem.pincode;
                delete subscriptionPreferencesItem.confirmpincode;
            }

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
