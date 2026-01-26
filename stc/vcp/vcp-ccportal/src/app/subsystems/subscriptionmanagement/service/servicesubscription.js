(function () {

    'use strict';


    
    angular.module('ccportal.subsystems.subscriptionmanagement.service.serviceoffers', []);

    var SISubscriptionsServiceOffersModule = angular.module('ccportal.subsystems.subscriptionmanagement.service.serviceoffers');

    SISubscriptionsServiceOffersModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.subscriptionmanagement.service.serviceoffers', {
            url: "/subscribed-service-offers",
            templateUrl: 'subsystems/subscriptionmanagement/service/servicesubscription.html',
            controller: 'SISubscriptionsServiceOffersCtrl'
        });

    });

    SISubscriptionsServiceOffersModule.controller('SISubscriptionsServiceOffersBaseCtrl', function ($scope, $log, $q, $state, $timeout, $filter, $translate, $uibModal, NgTableService, UtilService, SessionService,
                                                                                                    CMPFService, SSMSubscribersService) {
        $log.debug('SISubscriptionsServiceOffersBaseCtrl');

        var msisdn = SessionService.getMsisdn();

        // Subscribes a subscriber to a specified SSM offer.
        $scope.subscribeOfferSubscription = function (offer) {
            subscribeConfirmation(msisdn, offer, true);
        };

        // Subscribes a subscriber to a specified SSM offer.
        $scope.activateOfferSubscription = function (offer) {
            subscribeConfirmation(msisdn, offer, false);
        };

        var subscribeConfirmation = function (msisdn, offer, isSubscribe) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: function ($scope, $uibModalInstance, $translate, $sce) {
                    var message;

                    if (isSubscribe) {
                        message = $translate.instant('SubscriberInfo.Offers.CurrentSubscriptions.Messages.SubscribeConfirmationMessage', {name: offer.offerName});
                    } else {
                        message = $translate.instant('SubscriberInfo.Offers.CurrentSubscriptions.Messages.ActivationConfirmationMessage', {name: offer.offerName});
                    }

                    $scope.confirmationMessage = $sce.trustAsHtml(message);

                    $scope.ok = function () {
                        $uibModalInstance.close();
                    };

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                }
            });

            modalInstance.result.then(function () {
                var createOfferSubscriptionProm = null;

                // DO NOT CHECK THIS CONDITION, use the regular endpoint of subscriptions
                if ((offer.subscription && offer.subscription.isRbt) || offer.xsmOfferProfile.IsRbt) {
                    var subscriptionItem = {
                        "msisdn": msisdn,
                        "language": $scope.subscriber.lang,
                        "offerId": offer.offerId || offer.id,
                        "skipTrialPeriod": true
                    };

                    createOfferSubscriptionProm = SSMSubscribersService.createCSSMServiceOfferSubscription(subscriptionItem);
                } else {
                    var subscriptionItem = {
                        "offerInfo": {
                            "offerName": offer.offerName
                        },
                        "language": $scope.subscriber.lang,
                        "msisdn": msisdn,
                        "channel": "CCPORTAL"
                    };

                    if (offer.name == 'MawjoodExtra') {
                        subscriptionItem.additionalParams = {
                            "annStatus": "false"
                        };
                    }


                    createOfferSubscriptionProm = SSMSubscribersService.createSubscription(subscriptionItem);
                }

                createOfferSubscriptionProm.then(function (response) {
                    if (response && response.errorCode) {
                        SSMSubscribersService.showApiError(response);
                    } else {
                        $state.params.doNotQuerySubscriberAtStateChange = true;
                        $state.transitionTo($state.current, {}, {reload: true, inherit: true, notify: true});

                        notification.flash({
                            type: 'success',
                            text: $translate.instant('SubscriberInfo.Offers.CurrentSubscriptions.Messages.SubscribedSuccessfully', {name: offer.offerName})
                        });
                    }
                }, function (response) {
                    $log.debug('Error: ', response);

                    SSMSubscribersService.showApiError(response);
                });
            }, function () {
                // Dismissed
            });
        };

        // Unsubscribes a subscriber from specified SSM offer.
        $scope.unsubscribeOfferSubscription = function (offer) {
            unsubscribeConfirmation(msisdn, offer);
        };

        var unsubscribeConfirmation = function (msisdn, offer) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: function ($scope, $uibModalInstance, $translate, $sce) {
                    var message = $translate.instant('SubscriberInfo.Offers.CurrentSubscriptions.Messages.UnsubscribeConfirmationMessage', {name: offer.offerName});
                    $scope.confirmationMessage = $sce.trustAsHtml(message);

                    $scope.ok = function () {
                        $uibModalInstance.close();
                    };

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                }
            });

            modalInstance.result.then(function () {
                var updatePromise = null;

                if ((offer.subscription && offer.subscription.isRbt) || offer.xsmOfferProfile.IsRbt) {
                    var stateItem = {
                        "msisdn": msisdn,
                        "offerName": offer.offerName,
                        "state": "INACTIVE",
                        "inactivationReason": "InactivatedByCC"
                    };
                    updatePromise = SSMSubscribersService.updateCSSMServiceOfferSubscriptionBySubscriptionId(offer.subscription.id, stateItem);

                } else {
                    var stateItem = {
                        "msisdn": msisdn,
                        "offerInfo": {
                            "offerName": offer.offerName
                        },
                        "channel": "CCPORTAL",
                        "subscriptionUpdateType": "INACTIVATE",
                        "inactivationReason": "InactivatedByCC"
                    };

                    updatePromise = SSMSubscribersService.updateSubscription(stateItem);
                }

                updatePromise.then(function (response) {
                    if (response && response.errorCode) {
                        SSMSubscribersService.showApiError(response);
                    } else {
                        $log.debug('User has been unsubscribed from [', offer.offerName, '] offer.');

                        $state.params.doNotQuerySubscriberAtStateChange = true;
                        $state.transitionTo($state.current, {}, {reload: true, inherit: true, notify: true});

                        notification.flash({
                            type: 'success',
                            text: $translate.instant('SubscriberInfo.Offers.CurrentSubscriptions.Messages.UnsubscribedSuccessfully', {name: offer.offerName})
                        });
                    }
                }, function (response) {
                    $log.debug('Error: ', response);

                    SSMSubscribersService.showApiError(response);
                });
            }, function () {
                // Dismissed
            });
        };

        $scope.prepareAccordionEvents = function (offerList, isWithSubscription) {
            if (!isWithSubscription) {
                _.each($scope.subscriber.subscriptions, function (subscription) {
                    var foundOffer = _.findWhere(offerList, {id: subscription.offerId});
                    if (foundOffer) {
                        foundOffer.subscription = subscription;
                    }
                });
            }

            _.each(offerList, function (offer) {
                if (isWithSubscription) {
                    offer.subscription = angular.copy(offer);
                } else {
                    offer.offerName = offer.name ? offer.name : 'N/A';
                }

                var isAccordionOpen = false;
                if (_.isUndefined(offer.isAccordionOpen)) {
                    Object.defineProperty(offer, 'isAccordionOpen', {
                        get: function () {
                            return isAccordionOpen;
                        },
                        set: function (newValue) {
                            offer.eligibility = {
                                eligible: true
                            };

                            if (newValue && !offer.xsmOfferProfile) {
                                // Call offer
                                CMPFService.getOffer(offer.offerId || offer.id).then(function (offerResponse) {
                                    if (offerResponse) {

                                        offer.organization = offerResponse.organization;
                                        offer.services = offerResponse.services;

                                        // XsmOfferProfile
                                        var xsmOfferProfiles = CMPFService.getProfileAttributes(offerResponse.profiles, CMPFService.XSM_OFFER_PROFILE);
                                        if (xsmOfferProfiles.length > 0) {
                                            offer.xsmOfferProfile = {
                                                IsInternal: xsmOfferProfiles[0].IsInternal,
                                                IsRbt: xsmOfferProfiles[0].IsRbt,
                                                description: xsmOfferProfiles[0].Description
                                            };
                                        } else {
                                            offer.xsmOfferProfile = {
                                                IsInternal: false,
                                                IsRbt: false,
                                                description: 'N/A'
                                            };
                                        }

                                        // Offers' i18n definitions
                                        var offerI18NProfiles = CMPFService.getProfileAttributes(offerResponse.profiles, CMPFService.OFFER_I18N_PROFILE);
                                        if (offerI18NProfiles.length > 0) {
                                            var entityARI18NProfileAttr = _.findWhere(offerI18NProfiles, {Language: 'AR'});
                                            if (entityARI18NProfileAttr) {
                                                offer.arI18NName = entityARI18NProfileAttr.Name;
                                                offer.arI18NDescription = entityARI18NProfileAttr.Description;
                                                offer.arI18NSubscriptionDescription = entityARI18NProfileAttr.SubscriptionDescription;
                                                offer.arI18NUnsubscriptionDescription = entityARI18NProfileAttr.UnsubscriptionDescription;
                                            }

                                            var entityENI18NProfileAttr = _.findWhere(offerI18NProfiles, {Language: 'EN'});
                                            if (entityENI18NProfileAttr) {
                                                offer.enI18NName = entityENI18NProfileAttr.Name;
                                                offer.enI18NDescription = entityENI18NProfileAttr.Description;
                                                offer.enI18NSubscriptionDescription = entityENI18NProfileAttr.SubscriptionDescription;
                                                offer.enI18NUnsubscriptionDescription = entityENI18NProfileAttr.UnsubscriptionDescription;
                                            }
                                        }

                                        // XsmChargingProfiles
                                        var xsmChargingProfiles = CMPFService.getProfileAttributes(offerResponse.profiles, CMPFService.XSM_CHARGING_PROFILE);
                                        if (xsmChargingProfiles.length > 0) {
                                            offer.xsmChargingModel = {
                                                mainPrice: xsmChargingProfiles[0].MainPrice,
                                                chargingPeriodText: UtilService.convertPeriodStringToHumanReadable(xsmChargingProfiles[0].ChargingPeriod), // e.g. P00Y01M00DT00H00M00S
                                                microChargingPeriodText: UtilService.convertPeriodStringToHumanReadable(xsmChargingProfiles[0].MicroChargingPeriod) // e.g. P00Y01M00DT00H00M00S
                                            };
                                        }

                                        // OfferEligibilityProfile
                                        var offerEligibilityProfiles = CMPFService.getProfileAttributes(offerResponse.profiles, CMPFService.OFFER_ELIGIBILITY_PROFILE);
                                        if (offerEligibilityProfiles.length > 0) {
                                            offer.offerEligibilityProfile = offerEligibilityProfiles[0];
                                        }

                                        // SMSPortali18nProfile
                                        var smsPortali18nProfiles = CMPFService.getProfileAttributes(offerResponse.profiles, CMPFService.SMS_PORTAL_I18N_PROFILE);
                                        if (smsPortali18nProfiles && smsPortali18nProfiles.length > 0) {
                                            var smsPortalARI18NProfileAttr = _.findWhere(smsPortali18nProfiles, {Language: 'AR'});
                                            if (smsPortalARI18NProfileAttr) {
                                                offer.arI18NSubUnsubShortCode = smsPortalARI18NProfileAttr.SubUnsubShortCode;
                                                offer.arI18NSubCommands = s.replaceAll(smsPortalARI18NProfileAttr.SubCommands, ';', ', ');
                                                offer.arI18NUnsubCommands = s.replaceAll(smsPortalARI18NProfileAttr.UnsubCommands, ';', ', ');
                                            }

                                            var smsPortalENI18NProfileAttr = _.findWhere(smsPortali18nProfiles, {Language: 'EN'});
                                            if (smsPortalENI18NProfileAttr) {
                                                offer.enI18NSubUnsubShortCode = smsPortalENI18NProfileAttr.SubUnsubShortCode;
                                                offer.enI18NSubCommands = s.replaceAll(smsPortalENI18NProfileAttr.SubCommands, ';', ', ');
                                                offer.enI18NUnsubCommands = s.replaceAll(smsPortalENI18NProfileAttr.UnsubCommands, ';', ', ');
                                            }
                                        }
                                    }

                                    offer.showContent = true;
                                }, function (response) {
                                    $log.debug('Cannot get offer. Error: ', response);

                                    CMPFService.showApiError(response);
                                });
                            } else {
                                offer.showContent = newValue;
                            }

                            isAccordionOpen = newValue;
                        },
                        configurable: true
                    });
                }
            });
        };

        var prepareCMPFOffers = function (from, size, text) {
            var deferred = $q.defer();

            CMPFService.getOffersCustom(from, size, false, false, false, null, null, text).then(function (offers) {
                // Mawjood and MawjoodExtra offers should not be included in the available offers list.
                $scope.offers = _.filter(offers.offers, function (offer) {
                    console.log(offer);
                    return offer.name.includes('Mawjood') === false;
                });
                $scope.metaData = offers.metaData;
                $scope.offers = $filter('orderBy')($scope.offers, 'name');

                $scope.prepareAccordionEvents($scope.offers, false);

                if (text === '' || text === undefined  || text === null) {
                    $scope.originalOffers = $scope.offers;
                    $scope.filteredOffers = $scope.originalOffers;
                }

                deferred.resolve();
            }, function (response) {
                $log.debug('Cannot get offer list. Error: ', response);

                CMPFService.showApiError(response);
            });

            return deferred.promise;
        }

        var prepareSubscriber = function () {
            var deferred = $q.defer();

            var msisdn = SessionService.getMsisdn();

            SSMSubscribersService.getSubscriberByMsisdn(msisdn).then(function (subscriber) {
                $scope.subscriber = subscriber;

                $scope.offers = $scope.subscriber.subscriptions;
                $scope.offers = $filter('orderBy')($scope.offers, 'offerName');

                $scope.prepareAccordionEvents($scope.offers, true);

                $scope.originalOffers = $scope.offers;
                $scope.filteredOffers = $scope.originalOffers;

                deferred.resolve();
            });

            return deferred.promise;
        }

        // Navigator related implementations.
        $scope.currentPage = 1;
        $scope.pageCount = 10;

        $scope.getNavigatorDescriptionText = function (currentPage, pageCount, entryCount, totalEntryCount) {
            var page = (currentPage - 1) * pageCount;
            var from = page + 1;
            var to = page + entryCount;

            var total = totalEntryCount;

            $scope.isFirst = from === 1;
            $scope.isLast = to === totalEntryCount;

            return $translate.instant('TableFooter.Info', {from: from, to: to, total: total});
        };

        $scope.preparePagination = function (currentPage) {
            if (currentPage) {
                $scope.currentPage = currentPage;
            }

            if ($scope.filteredOffers && $scope.filteredOffers.length > 0) {
                $scope.offers = $scope.filteredOffers.slice(($scope.currentPage - 1) * $scope.pageCount, $scope.currentPage * $scope.pageCount);
            } else {
                $scope.offers = [];
            }
        };

        // Subscription page navigator
        $scope.previousSubscription = function () {
            if ($scope.currentPage > 1) {
                $scope.currentPage -= 1;
            }

            $scope.preparePagination();
        };

        $scope.nextSubscription = function (isQuery) {
            if (($scope.currentPage * $scope.pageCount) < $scope.filteredOffers.length) {
                $scope.currentPage += 1;
            }

            $scope.preparePagination();
        };

        $scope.filterSubscriptions = _.debounce(function (text, columns) {
            UtilService.showDummySpinner();
            $timeout(function () {
                if (text) {
                    $scope.filteredOffers = NgTableService.filterList(text, columns, $scope.originalOffers);
                } else {
                    $scope.filteredOffers = angular.copy($scope.originalOffers);
                }

                $scope.preparePagination(1);
                UtilService.hideDummySpinner();
            });
        }, 500);

        // Offer page navigator
        $scope.previousOffer = function () {
            var currentPage = $scope.currentPage > 1 ? $scope.currentPage - 1 : 1;

            UtilService.showDummySpinner();

            var offset = (currentPage - 1) * $scope.pageCount;
            var limit = $scope.pageCount;

            prepareCMPFOffers(offset, limit, $scope.filterText).then(function (response) {
                $scope.currentPage = currentPage;
                UtilService.hideDummySpinner();
            });
        };

        $scope.nextOffer = function () {
            var currentPage = ($scope.currentPage * $scope.pageCount) < $scope.metaData.totalCount ? $scope.currentPage + 1 : $scope.currentPage;

            UtilService.showDummySpinner();

            var offset = (currentPage - 1) * $scope.pageCount;
            var limit = $scope.pageCount;

            prepareCMPFOffers(offset, limit, $scope.filterText).then(function (response) {
                $scope.currentPage = currentPage;
                UtilService.hideDummySpinner();
            });
        };

        $scope.filterOffers = _.debounce(function (text) {
            UtilService.showDummySpinner();
            prepareCMPFOffers(0, $scope.pageCount, text).then(function (response) {
                $scope.currentPage = 1;
                UtilService.hideDummySpinner();
            });
        }, 500);

        $scope.offerSubscriptionFilter = 'SUBSCRIBED';
        $scope.offerSubscriptionFilterChange = function (newState) {
            if ($scope.offerSubscriptionFilter !== newState) {
                UtilService.showDummySpinner();

                $scope.offerSubscriptionFilter = newState;

                if ($scope.offerSubscriptionFilter === 'AVAILABLE') {
                    prepareCMPFOffers(0, $scope.pageCount).then(function (response) {
                        $scope.currentPage = 1;
                        UtilService.hideDummySpinner();
                    });
                } else {
                    prepareSubscriber().then(function (response) {
                        $scope.preparePagination(1);

                        UtilService.hideDummySpinner();
                    });
                }
            }
        };
    });

    SISubscriptionsServiceOffersModule.controller('SISubscriptionsServiceOffersCtrl', function ($scope, $log, $controller, $filter, UtilService, subscriber) {
        $log.debug('SISubscriptionsServiceOffersCtrl');

        $controller('SISubscriptionsServiceOffersBaseCtrl', {
            $scope: $scope
        });

        $scope.subscriber = subscriber;
        if (!$scope.subscriber.subscriptions) {
            $scope.subscriber.subscriptions = [];
        }

        $scope.offers = $scope.subscriber.subscriptions;
        $scope.offers = $filter('orderBy')($scope.offers, 'offerName');

        $scope.prepareAccordionEvents($scope.offers, true);

        $scope.originalOffers = $scope.offers;
        $scope.filteredOffers = $scope.originalOffers;

        $scope.preparePagination();
    });

})();
