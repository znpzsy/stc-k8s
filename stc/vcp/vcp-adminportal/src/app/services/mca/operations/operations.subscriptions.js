(function () {

    'use strict';

    angular.module('adminportal.services.mca.operations.subscriptions', []);

    var MCAOperationsSubscriptionsModule = angular.module('adminportal.services.mca.operations.subscriptions');

    MCAOperationsSubscriptionsModule.config(function ($stateProvider) {

        $stateProvider.state('services.mca.operations.subscriptions', {
            url: "/subscriptions",
            templateUrl: "services/mca/operations/operations.subscriptions.html",
            controller: 'MCAOperationsSubscriptionsCtrl'
        });

    });

    MCAOperationsSubscriptionsModule.controller('MCAOperationsSubscriptionsCtrl', function ($scope, $state, $log, $translate, notification, Restangular, SSMSubscribersService) {
        $log.debug("MCAOperationsSubscriptionsCtrl");

        $scope.search = _.debounce(function (msisdn) {
            if (msisdn) {
                $scope.subscriberNumber = null;
                SSMSubscribersService.getMCNSubscriptionDetailByMsisdn(msisdn).then(function (response) {
                    $scope.subscriptionDetail = null;
                    $scope.error_message = null;
                    var apiResponse = Restangular.stripRestangular(response);

                    $log.debug('Get MCA Subscription. Response: ', apiResponse);

                    var notifySubscriptionNotFound = function () {
                        // notification({
                        //     type: 'warning',
                        //     text: $translate.instant('CommonMessages.SubscriptionDoesNotExist')
                        // });

                        $scope.error_message = $translate.instant('Services.MCA.Operations.Subscriptions.SubscriptionNotFound', {msisdn: msisdn})
                    }

                    if (!apiResponse) {
                        notifySubscriptionNotFound();

                    } else if (apiResponse.errorCode) {
                        notification({
                            type: 'warning',
                            text: $translate.instant('CommonMessages.ApiError', {
                                errorCode: apiResponse.errorCode,
                                errorText: apiResponse.message
                            })
                        });
                    } else {
                        // Check if the response contains an offer subscription named MawjoodExtra
                        if(apiResponse.serviceOfferSubscriptions && apiResponse.serviceOfferSubscriptions.length > 0){
                            var mawjoodExtraOffer = _.find(apiResponse.serviceOfferSubscriptions, function(subscription){
                                return subscription.offerName === 'MawjoodExtra';
                            });
                            if (mawjoodExtraOffer) {

                                var language = mawjoodExtraOffer.language ? mawjoodExtraOffer.language : '';
                                var attributes = mawjoodExtraOffer.attributes ? mawjoodExtraOffer.attributes : []
                                var annStatus = _.find(attributes, function(attribute){ return attribute.name === 'annStatus' || attribute.name === 'ANN_STATUS' });
                                var annNumber = _.find(attributes, function(attribute){ return attribute.name === 'annNumber' || attribute.name === 'ANN_NUMBER' });
                                var mobilePhone = _.find(attributes, function(attribute){ return attribute.name === 'MOBILE_PHONE' });
                                var svcType = _.find(attributes, function(attribute){ return attribute.name === 'SVC_TYPE' });
                                // var isFixedLine = _.find(attributes, function(attribute){ return attribute.name === 'IS_FIXED_LINE' });
                                // SVC_TYPE=00100 (Fixed)
                                // SVC_TYPE=00001 (Mobile)

                                $scope.originalResponse = angular.copy(response);
                                $scope.subscriptionDetail = {
                                    language: language,
                                    annNumber: annNumber ? annNumber.value : '',
                                    annStatus: annStatus ? annStatus.value === "true" : false,
                                    mobilePhone: mobilePhone ? mobilePhone.value : '',
                                    isFixedLine: svcType.value === '00100', //isFixedLine ? isFixedLine.value : '',
                                    attributes: attributes
                                };
                                $scope.originalSubscriptionDetail = angular.copy($scope.subscriptionDetail);
                                $scope.subscriberNumber = msisdn;
                                $scope.msisdn = '';
                            } else {
                                notifySubscriptionNotFound();
                            }

                        } else {
                            notifySubscriptionNotFound();
                        }
                    }

                }, function (response) {
                    $log.error('Cannot read subscriptions. Error: ', response);
                    if (response && response.data && response.data.errorCode) {
                        notification({
                            type: 'warning',
                            text: $translate.instant('CommonMessages.ApiError', {
                                errorCode: response.data.errorCode,
                                errorText: response.data.message
                            })
                        });
                    } else {
                        notification({
                            type: 'warning',
                            text: $translate.instant('CommonMessages.GenericServerError')
                        });
                    }
                    $scope.subscriptionDetail = null;
                });
            }
        }, 750, {immediate: true});


        // $scope.save = function (subscriptionDetail) {
        //     var subscriptionItem = {
        //         additionalParams: {
        //             annStatus: subscriptionDetail.annStatus,
        //             annNumber: subscriptionDetail.annNumber ? subscriptionDetail.annNumber : ''
        //         },
        //         channel: "ADMINPORTAL",
        //         msisdn: $scope.subscriberNumber,
        //         offerInfo: {
        //             offerName: "MawjoodExtra"
        //         },
        //         subscriptionUpdateType: "UPDATE"
        //     }
        //     // subscriptionItem.attributes = _.map(subscriptionItem.attributes, function(attribute){   });
        //     SSMSubscribersService.updateMCNSubscriptionDetailByMsisdn($scope.subscriberNumber, subscriptionItem).then(function (response) {
        //         $log.debug('Updated subscription: ', response);
        //
        //         notification.flash({
        //             type: 'success',
        //             text: $translate.instant('CommonLabels.OperationSuccessful')
        //         });
        //
        //         $state.go($state.$current, null, {reload: true});
        //
        //         return response;
        //     }, function (response) {
        //         $log.debug('Cannot update the subscription. Error: ', response);
        //
        //         if (!_.isUndefined(response.data) && !_.isUndefined(response.data.message)) {
        //
        //             text: $translate.instant('CommonMessages.ApiError', {
        //                 errorCode: response.errorCode,
        //                 errorText: response.message
        //             });
        //
        //         } else {
        //             notification({
        //                 type: 'danger',
        //                 text: $translate.instant('CommonMessages.GenericServerError')
        //             });
        //         }
        //     });
        //
        // };

        $scope.cancel = function () {
            $state.go($state.$current, null, {reload: true});

        }

        // $scope.isNotChanged = function(){
        //     return angular.equals($scope.subscriptionDetail, $scope.originalSubscriptionDetail);
        // }

    });

})();
