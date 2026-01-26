(function () {

    'use strict';

    angular.module('ccportal.subsystems.subscriptionmanagement.content.contentoffers', []);

    var SISubscriptionsContentOffersModule = angular.module('ccportal.subsystems.subscriptionmanagement.content.contentoffers');

    SISubscriptionsContentOffersModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.subscriptionmanagement.content.contentoffers', {
            url: "/subscribed-content-offers",
            templateUrl: 'subsystems/subscriptionmanagement/content/contentsubscription.html',
            controller: 'SISubscriptionsContentOffersCtrl'
        });

    });

    SISubscriptionsContentOffersModule.controller('SISubscriptionsContentOffersBaseCtrl', function ($scope, $log, $q, $state, $timeout, $filter, $uibModal, $translate, NgTableService, UtilService, SessionService,
                                                                                                    ContentManagementService, CMPFService, SSMSubscribersService, CMS_RBT_CONTENT_TYPES_REVERSED) {
        $log.debug('SISubscriptionsContentOffersBaseCtrl');

        var msisdn = SessionService.getMsisdn();

        $scope.CMS_RBT_CONTENT_TYPES = CMS_RBT_CONTENT_TYPES_REVERSED;

        // Initialize the in scope variables.
        $scope.currentPage = {};
        $scope.pageCount = {};
        $scope.offers = {};
        $scope.metaData = {};
        $scope.originalOffers = {};
        $scope.filteredOffers = {};
        $scope.filteredOriginalOffers = {};
        $scope.offerSubscriptionFilter = {};
        $scope.isFirst = {};
        $scope.isLast = {};
        $scope.filterText = {};

        _.each($scope.CMS_RBT_CONTENT_TYPES, function (contentType) {
            $scope.currentPage[contentType] = 1;
            $scope.pageCount[contentType] = 5;
            $scope.offers[contentType] = [];
            $scope.metaData[contentType] = {
                page: 0,
                size: 0,
                totalCount: 0,
                totalPageCount: 0
            };
            $scope.originalOffers[contentType] = [];
            $scope.filteredOffers[contentType] = undefined;
            $scope.filteredOriginalOffers[contentType] = undefined;
            $scope.offerSubscriptionFilter[contentType] = 'SUBSCRIBED';
            $scope.isFirst[contentType] = true;
            $scope.isLast[contentType] = false;
            $scope.filterText[contentType] = '';
        });

        var getSearchMethodByType = function (contentType) {
            if (contentType === 'CATEGORY') {
                return ContentManagementService.searchContentCategoriesRBT;
            } else if (contentType === 'MOOD') {
                return ContentManagementService.searchMoods;
            } else if (contentType === 'ARTIST') {
                return ContentManagementService.searchArtists;
            } else if (contentType === 'ALBUM') {
                return ContentManagementService.searchAlbums;
            } else if (contentType === 'TONE') {
                return ContentManagementService.searchTones;
            } else {
                return null;
            }
        };

        var getContentDetailMethodByType = function (contentType) {
            if (contentType === 'CATEGORY') {
                return ContentManagementService.getContentCategoryRBT;
            } else if (contentType === 'MOOD') {
                return ContentManagementService.getMood;
            } else if (contentType === 'ARTIST') {
                return ContentManagementService.getArtist;
            } else if (contentType === 'ALBUM') {
                return ContentManagementService.getAlbum;
            } else if (contentType === 'TONE') {
                return ContentManagementService.getTone;
            } else {
                return null;
            }
        };

        var getContentDetailItemByType = function (contentType, contentItem) {
            if (contentType === 'CATEGORY') {
                return contentItem.category;
            } else if (contentType === 'MOOD') {
                return contentItem.mood;
            } else if (contentType === 'ARTIST') {
                return contentItem.artist;
            } else if (contentType === 'ALBUM') {
                return contentItem.album;
            } else if (contentType === 'TONE') {
                return contentItem.tone;
            } else {
                return null;
            }
        };

        // Subscribes a subscriber to a specified SSM offer.
        $scope.subscribeContentOfferSubscription = function (offer) {
            subscribeConfirmation(msisdn, offer, true);
        };

        // Subscribes a subscriber to a specified SSM offer.
        $scope.activateContentOfferSubscription = function (offer) {
            subscribeConfirmation(msisdn, offer, false);
        };

        var subscribeConfirmation = function (msisdn, offer, isSubscribe) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: function ($scope, $uibModalInstance, $translate, $sce) {
                    var message;

                    if (isSubscribe) {
                        message = $translate.instant('SubscriberInfo.Offers.CurrentSubscriptions.Messages.SubscribeConfirmationMessage', {name: offer.contentName});
                    } else {
                        message = $translate.instant('SubscriberInfo.Offers.CurrentSubscriptions.Messages.ActivationConfirmationMessage', {name: offer.contentName});
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
                var subscriptionItem = {
                    "msisdn": msisdn,
                    "subscriptionCode": offer.subscriptionCode,
                    "language": $scope.subscriber.lang,
                    "payerMsisdn": msisdn,
                    "paymentShape": "None",
                    "skipTrialPeriod": true
                };

                var createOfferSubscriptionProm = SSMSubscribersService.createCSSMContentSubscription(subscriptionItem);
                createOfferSubscriptionProm.then(function (response) {
                    if (response && response.errorCode) {
                        SSMSubscribersService.showApiError(response);
                    } else {
                        $state.params.doNotQuerySubscriberAtStateChange = true;
                        $state.transitionTo($state.current, {}, {reload: true, inherit: true, notify: true});

                        notification.flash({
                            type: 'success',
                            text: $translate.instant('SubscriberInfo.Offers.CurrentSubscriptions.Messages.SubscribedSuccessfully', {name: offer.contentName})
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
        $scope.unsubscribeContentOfferSubscription = function (offer) {
            unsubscribeConfirmation(msisdn, offer);
        };

        var unsubscribeConfirmation = function (msisdn, offer) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: function ($scope, $uibModalInstance, $translate, $sce) {
                    var message = $translate.instant('SubscriberInfo.Offers.CurrentSubscriptions.Messages.UnsubscribeConfirmationMessage', {name: offer.contentName});
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
                var stateItem = {
                    "msisdn": msisdn,
                    "subscriptionCode": offer.subscriptionCode,
                    "state": "INACTIVE",
                    "inactivationReason": "InactivatedByCC",
                };

                SSMSubscribersService.updateCSSMContentSubscriptionBySubscriptionId(offer.subscription.id, stateItem).then(function (response) {
                    if (response && response.errorCode) {
                        SSMSubscribersService.showApiError(response);
                    } else {
                        $log.debug('User has been unsubscribed from [', offer.contentName, '] offer.');

                        $state.params.doNotQuerySubscriberAtStateChange = true;
                        $state.transitionTo($state.current, {}, {reload: true, inherit: true, notify: true});

                        notification.flash({
                            type: 'success',
                            text: $translate.instant('SubscriberInfo.Offers.CurrentSubscriptions.Messages.UnsubscribedSuccessfully', {name: offer.contentName})
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

        var prepareContentOfferI18NAttributes = function (offer, contentItem) {
            offer.name = contentItem.contentName ? contentItem.contentName : 'N/A';

            var entityARI18NNameAttr = _.findWhere(contentItem.names, {lang: 'ar'});
            if (entityARI18NNameAttr) {
                offer.arI18NName = entityARI18NNameAttr.name ? entityARI18NNameAttr.name : 'N/A';
            } else {
                offer.arI18NName = 'N/A';
            }
            var entityARI18NDescriptionAttr = _.findWhere(contentItem.descriptions, {lang: 'ar'});
            if (entityARI18NDescriptionAttr) {
                offer.arI18NDescription = entityARI18NDescriptionAttr.description ? entityARI18NDescriptionAttr.description : 'N/A';
            } else {
                offer.arI18NDescription = 'N/A';
            }

            var entityENI18NNameAttr = _.findWhere(contentItem.names, {lang: 'en'});
            if (entityENI18NNameAttr) {
                offer.enI18NName = entityENI18NNameAttr.name ? entityENI18NNameAttr.name : 'N/A';
            } else {
                offer.enI18NName = 'N/A';
            }
            var entityENI18NDescriptionAttr = _.findWhere(contentItem.descriptions, {lang: 'en'});
            if (entityENI18NDescriptionAttr) {
                offer.enI18NDescription = entityENI18NDescriptionAttr.description ? entityENI18NDescriptionAttr.description : 'N/A';
            } else {
                offer.enI18NDescription = 'N/A';
            }

            return offer;
        };

        $scope.prepareAccordionEvents = function (contentType, offerList, isWithSubscription) {
            if (!isWithSubscription) {
                _.each($scope.subscriber.contentSubscriptions, function (subscription) {
                    var foundOffer = _.findWhere(offerList, {id: subscription.contentId});
                    if (foundOffer) {
                        foundOffer.subscription = subscription;
                    }
                });
            }

            _.each(offerList, function (offer) {
                if (isWithSubscription) {
                    offer.subscription = angular.copy(offer);
                } else {
                    offer.contentId = offer.id;
                    offer.contentName = offer.name ? offer.name : 'N/A';
                }

                var isAccordionOpen = false;
                if (_.isUndefined(offer.isAccordionOpen)) {
                    Object.defineProperty(offer, 'isAccordionOpen', {
                        get: function () {
                            return isAccordionOpen;
                        },
                        set: function (newValue) {
                            offer.showContent = false;

                            if (newValue && !offer.chargingPeriodDetailText) {
                                var method = getContentDetailMethodByType(contentType);

                                if (method) {
                                    method.call(ContentManagementService, offer.contentId).then(function (contentResponse) {
                                        var contentItem = getContentDetailItemByType(contentType, contentResponse);

                                        if (contentItem) {
                                            // Offers' i18n definitions
                                            offer = prepareContentOfferI18NAttributes(offer, contentItem);

                                            // Get offer of the content item
                                            offer.offer = contentItem.offers ? contentItem.offers[0] : null;
                                            offer.subscriptionCode = offer.offer.subscriptionCode;
                                            offer.price = offer.offer.price;

                                            // ChargingDetails
                                            if (offer.offer && offer.offer.chargingPeriodDetail && (offer.offer.chargingPeriod !== offer.offer.chargingPeriodDetail)) {
                                                offer.chargingPeriodDetailText = UtilService.convertPeriodStringToHumanReadable(offer.offer.chargingPeriodDetail).toLowerCase();
                                            } else {
                                                offer.chargingPeriodDetailText = 'N/A';
                                            }

                                            offer.showContent = true;
                                        } else {
                                            ContentManagementService.showApiError();
                                        }
                                    }, function (response) {
                                        $log.debug('Cannot get content offer. Error: ', response);

                                        ContentManagementService.showApiError(response);
                                    });
                                }
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

        var prepareCSMOffers = function (contentType, from, size, text) {
            var deferred = $q.defer();

            var method = getSearchMethodByType(contentType);

            if (method) {
                method.call(ContentManagementService, from, size, text).then(function (response) {
                    $scope.offers[contentType] = response ? response.items : [];
                    $scope.metaData[contentType].page = response ? response.page : 0;
                    $scope.metaData[contentType].size = response ? response.size : 0;
                    $scope.metaData[contentType].totalCount = response ? response.totalCount : 0;
                    $scope.metaData[contentType].totalPageCount = response ? response.totalPageCount : 0;

                    $scope.offers[contentType] = $filter('orderBy')($scope.offers[contentType], 'name');

                    $scope.prepareAccordionEvents(contentType, $scope.offers[contentType], false);

                    if (text === '' || text === undefined  || text === null) {
                        $scope.originalOffers[contentType] = $scope.offers[contentType];
                        $scope.filteredOffers[contentType] = $scope.originalOffers[contentType];
                    }

                    deferred.resolve();
                }, function (response) {
                    $log.debug('Cannot get content offer list. Error: ', response);

                    ContentManagementService.showApiError(response);
                });
            }

            return deferred.promise;
        }

        var prepareSubscriber = function (contentType) {
            var deferred = $q.defer();

            var msisdn = SessionService.getMsisdn();

            SSMSubscribersService.getSubscriberByMsisdn(msisdn).then(function (subscriber) {
                $scope.subscriber = subscriber;

                $scope.offers[contentType] = _.filter($scope.subscriber.contentSubscriptions, function (contentSubscription) {
                    contentSubscription.subscription = contentSubscription;
                    return contentSubscription.subscriptionType === contentType;
                });
                $scope.offers[contentType] = $filter('orderBy')($scope.offers[contentType], 'contentName');

                $scope.prepareAccordionEvents(contentType, $scope.offers[contentType], true);

                $scope.originalOffers[contentType] = $scope.offers[contentType];
                $scope.filteredOffers[contentType] = $scope.originalOffers[contentType];

                deferred.resolve();
            });

            return deferred.promise;
        }

        $scope.getNavigatorDescriptionText = function (contentType, currentPage, pageCount, entryCount, totalEntryCount) {
            var page = (currentPage - 1) * pageCount;
            var from = page + 1;
            var to = page + entryCount;

            var total = totalEntryCount;

            $scope.isFirst[contentType] = from === 1;
            $scope.isLast[contentType] = to === totalEntryCount;

            return $translate.instant('TableFooter.Info', {from: from, to: to, total: total});
        };

        $scope.preparePagination = function (contentType, currentPage) {
            if (currentPage) {
                $scope.currentPage[contentType] = currentPage;
            }

            if ($scope.filteredOffers[contentType] && $scope.filteredOffers[contentType].length > 0) {
                $scope.offers[contentType] = $scope.filteredOffers[contentType].slice(($scope.currentPage[contentType] - 1) * $scope.pageCount[contentType], $scope.currentPage[contentType] * $scope.pageCount[contentType]);
            } else {
                $scope.offers[contentType] = [];
            }
        };

        // Subscription page navigator
        $scope.previousSubscription = function (contentType) {
            if ($scope.currentPage[contentType] > 1) {
                $scope.currentPage[contentType] -= 1;
            }

            $scope.preparePagination(contentType);
        };

        $scope.nextSubscription = function (contentType) {
            if (($scope.currentPage[contentType] * $scope.pageCount[contentType]) < $scope.filteredOffers[contentType].length) {
                $scope.currentPage[contentType] += 1;
            }

            $scope.preparePagination(contentType);
        };

        $scope.filterSubscriptions = _.debounce(function (contentType, text, columns) {
            UtilService.showDummySpinner();
            $timeout(function () {
                if (text) {
                    $scope.filteredOffers[contentType] = NgTableService.filterList(text, columns, $scope.originalOffers[contentType]);
                } else {
                    $scope.filteredOffers[contentType] = angular.copy($scope.originalOffers[contentType]);
                }

                $scope.preparePagination(contentType, 1);
                UtilService.hideDummySpinner();
            });
        }, 500);

        // Offer page navigator
        $scope.previousOffer = function (contentType) {
            var currentPage = $scope.currentPage[contentType] > 1 ? $scope.currentPage[contentType] - 1 : 1;

            UtilService.showDummySpinner();

            prepareCSMOffers(contentType, currentPage - 1, $scope.pageCount[contentType], $scope.filterText[contentType]).then(function (response) {
                $scope.currentPage[contentType] = currentPage;
                UtilService.hideDummySpinner();
            });
        };

        $scope.nextOffer = function (contentType) {
            var currentPage = ($scope.currentPage[contentType] * $scope.pageCount[contentType]) < $scope.metaData[contentType].totalCount ? $scope.currentPage[contentType] + 1 : $scope.currentPage[contentType];

            UtilService.showDummySpinner();

            prepareCSMOffers(contentType, currentPage - 1, $scope.pageCount[contentType], $scope.filterText[contentType]).then(function (response) {
                $scope.currentPage[contentType] = currentPage;
                UtilService.hideDummySpinner();
            });
        };

        $scope.filterOffers = _.debounce(function (contentType, text) {
            UtilService.showDummySpinner();
            prepareCSMOffers(contentType, 0, $scope.pageCount[contentType], text).then(function (response) {
                $scope.currentPage[contentType] = 1;
                UtilService.hideDummySpinner();
            });
        }, 500);

        $scope.offerSubscriptionFilterChange = function (contentType, newState) {
            if ($scope.offerSubscriptionFilter[contentType] !== newState) {
                UtilService.showDummySpinner();

                $scope.offerSubscriptionFilter[contentType] = newState;

                if ($scope.offerSubscriptionFilter[contentType] === 'AVAILABLE') {
                    prepareCSMOffers(contentType, 0, $scope.pageCount[contentType], $scope.filterText[contentType]).then(function (response) {
                        $scope.currentPage[contentType] = 1;
                        UtilService.hideDummySpinner();
                    });
                } else {
                    prepareSubscriber(contentType).then(function (response) {
                        $scope.preparePagination(contentType, 1);

                        UtilService.hideDummySpinner();
                    });
                }
            }
        };
    });

    SISubscriptionsContentOffersModule.controller('SISubscriptionsContentOffersCtrl', function ($scope, $log, $controller, $filter, UtilService, SessionService, subscriber) {
        $log.debug('SISubscriptionsContentOffersCtrl');

        $controller('SISubscriptionsContentOffersBaseCtrl', {
            $scope: $scope
        });

        var msisdn = SessionService.getMsisdn();

        $scope.subscriber = subscriber;
        if (!$scope.subscriber.contentSubscriptions) {
            $scope.subscriber.contentSubscriptions = [];
        }

        $scope.offers = {};
        _.each($scope.CMS_RBT_CONTENT_TYPES, function (contentType) {
            $scope.offers[contentType] = _.filter($scope.subscriber.contentSubscriptions, function (contentSubscription) {
                contentSubscription.subscription = contentSubscription;
                return contentSubscription.subscriptionType === contentType;
            });
            $scope.offers[contentType] = $filter('orderBy')($scope.offers[contentType], 'contentName');

            $scope.prepareAccordionEvents(contentType, $scope.offers[contentType], true);

            $scope.originalOffers[contentType] = $scope.offers[contentType];
            $scope.filteredOffers[contentType] = $scope.originalOffers[contentType];

            $scope.preparePagination(contentType);
        });
    });

})();
