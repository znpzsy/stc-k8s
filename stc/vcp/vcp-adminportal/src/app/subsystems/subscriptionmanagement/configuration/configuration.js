(function () {

    'use strict';

    angular.module('adminportal.subsystems.subscriptionmanagement.configuration', []);

    var SubscriptionManagementConfigurationModule = angular.module('adminportal.subsystems.subscriptionmanagement.configuration');

    SubscriptionManagementConfigurationModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.subscriptionmanagement.configuration', {
            url: "/configurations",
            templateUrl: 'subsystems/subscriptionmanagement/configuration/configuration.html',
            controller: 'SubscriptionManagementConfigurationCtrl',
            resolve: {
                contentOffer: function (CMPFService) {
                    return CMPFService.getRbtContentOffer();
                },
                cmsVatConfig: function (RBTContentManagementService) {
                    return RBTContentManagementService.getConfig();
                }
            }
        });

    });

    SubscriptionManagementConfigurationModule.controller('SubscriptionManagementConfigurationCtrl', function ($q, $scope, $state, $log, $translate, notification, CMPFService, RBTContentManagementService, Restangular, contentOffer, cmsVatConfig) {

        $log.debug('SubscriptionManagementConfigurationCtrl');

        // CMS VAT Configuration Related
        $scope.config = cmsVatConfig;
        $scope.originalConfig = angular.copy($scope.config);

        // CMPF Max Allowed Subscriptions Count Related
        var contentSubsPolicyProfile = CMPFService.findProfileByName(contentOffer.profiles, CMPFService.OFFER_CONTENT_SUBSCRIPTION_POLICY_PROFILE);
        $scope.contentSubsPolicyProfileOriginal = angular.copy(contentSubsPolicyProfile);
        contentSubsPolicyProfile = CMPFService.getProfileAttributesArray(contentSubsPolicyProfile);

        $scope.subsPolicyProfile = {
            profileId: contentSubsPolicyProfile ? contentSubsPolicyProfile.profileId: 0,
            MaxAllowedSubscriptionsCount: contentSubsPolicyProfile? contentSubsPolicyProfile.MaxAllowedSubscriptionsCount:10
        }
        $scope.originalSubsPolicyProfile = angular.copy($scope.subsPolicyProfile);


        $scope.isNotChanged = function () {
            return angular.equals($scope.originalSubsPolicyProfile, $scope.subsPolicyProfile) && angular.equals($scope.originalConfig, $scope.config);
        };

        var updateMaxAllowedSubscriptionsCount = function () {
            $log.debug('updateMaxAllowedSubscriptionsCount, contentSubsPolicyProfile: ', contentSubsPolicyProfile, '$scope.subsPolicyProfile: ', $scope.subsPolicyProfile);
            var updatedPolicyProfile = $scope.subsPolicyProfile; //JSON.parse(angular.toJson(contentSubsPolicyProfile));
            var originalContentSubsPolicyProfile =  $scope.contentSubsPolicyProfileOriginal;
            var policyProfileArray = CMPFService.prepareProfile(updatedPolicyProfile, originalContentSubsPolicyProfile);
            originalContentSubsPolicyProfile.attributes = policyProfileArray;

            $log.debug('updateMaxAllowedSubscriptionsCount, originalContentSubsPolicyProfile: ', originalContentSubsPolicyProfile, 'contentSubsPolicyProfile.profileId: ', contentSubsPolicyProfile.profileId);
            return CMPFService.updateRbtContentOfferProfile(originalContentSubsPolicyProfile, contentSubsPolicyProfile.profileId);
        };

        var updateVatRate = function () {
            var body = {
                vatRate: $scope.config.vatRate
            };

            return RBTContentManagementService.updateConfig(body);
        };

        $scope.saveConfiguration = function () {
            var promises = [];

            if (!angular.equals($scope.originalSubsPolicyProfile, $scope.subsPolicyProfile)) {
                promises.push(updateMaxAllowedSubscriptionsCount());
            }
            if (!angular.equals($scope.originalConfig, $scope.config)) {
                promises.push(updateVatRate());
            }

            $q.all(promises).then(function (responses) {
                $log.debug('Updated configuration: ', responses);
                if(responses && responses.length > 0){
                    // Check if the first response is an error
                    // (CMPF Max Allowed Subscriptions Count might return 200 with an error response in the body)
                    if(responses[0].errorCode){
                        notification({
                            type: 'danger',
                            text: $translate.instant('CommonMessages.ApiError', {
                                errorCode: responses[0].data.errorCode,
                                errorText: responses[0].data.errorDescription
                            })
                        });

                    } else {

                        notification({
                            type: 'success',
                            text: $translate.instant('CommonLabels.OperationSuccessful')
                        });

                        $state.go($state.$current, null, {reload: true});
                        // $scope.originalSubsPolicyProfile = angular.copy($scope.subsPolicyProfile);
                        // $scope.originalConfig = angular.copy($scope.config);
                    }
                }

            }, function (error) {
                $log.debug('Cannot update configuration: ', error);
                notification({
                    type: 'warning',
                    text: $translate.instant('CommonMessages.GenericServerError')
                });
            });
        };

        $scope.cancel = function () {
            $state.go($state.$current, null, {reload: true});
        };
    });

})();
