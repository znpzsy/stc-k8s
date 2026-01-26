(function () {

    'use strict';

    angular.module('ccportal.subscriber-info.subscriber-profile', []);

    var SISubscriberProfileModule = angular.module('ccportal.subscriber-info.subscriber-profile');

    SISubscriberProfileModule.config(function ($stateProvider) {

        $stateProvider.state('subscriber-info.subscriber-profile', {
            url: "/subscriber-profile",
            templateUrl: "subscriber-info/subscriber-profile/subscriber-profile.html",
            controller: 'SISubscriberProfileCtrl',
            data: {
                statePrefix: 'subscriber-info.',
                doNotQuerySubscriberAtStateChange: true
            },
            resolve: {
                subscriber: function ($state, UtilService, SSMSubscribersService) {
                    var msisdn = UtilService.getSubscriberMsisdn();

                    return SSMSubscribersService.getSubscriberByMsisdn(msisdn, true);
                },
                subscriberDcbSettings: function ($q, notification, UtilService, DCBService) {
                    var san = UtilService.getSubscriberSan();
                    var msisdn = UtilService.getSubscriberMsisdn();

                    var deferred = $q.defer();

                    DCBService.getSubscriberSettings(msisdn, san).then(function (response) {
                        deferred.resolve(response);
                    }, function (response) {
                        if (response.data) {
                            var serviceLabel = response.config ? response.config.headers.ServiceLabel : 'N/A';
                            var message = response.data.message + (serviceLabel ? ' (' + serviceLabel + ')' : '')

                            notification({
                                type: 'warning',
                                text: message
                            });
                        }

                        deferred.resolve({});
                    });

                    UtilService.addPromiseToTracker(deferred.promise);

                    return deferred.promise;
                },
                genericDCBSettings: function (UtilService, ScreeningManagerV2Service, DCBService) {
                    var msisdn = UtilService.getSubscriberMsisdn();

                    return ScreeningManagerV2Service.getAllowance(ScreeningManagerV2Service.serviceNames.SUBSCRIBER, msisdn, ScreeningManagerV2Service.scopes.SERVICE_SCOPE_KEY, DCBService.GENERIC_DCB_SERVICE_ID)
                },
                smsScreeningList: function ($q, UtilService, BulkMessagingOperationsService) {
                    var msisdn = UtilService.getSubscriberMsisdn();

                    var deferred = $q.defer();

                    BulkMessagingOperationsService.getGlobalSMSBlackLists().then(function (responseSMS) {
                        if (responseSMS && responseSMS.lists && responseSMS.lists.length > 0) {
                            var smsGbl = responseSMS.lists[0];

                            BulkMessagingOperationsService.getGlobalScreeningListByMsisdn('sms', smsGbl.name, msisdn).then(function (response) {
                                smsGbl.subscriberScreening = response;

                                deferred.resolve(smsGbl);
                            }, function (response) {
                                deferred.resolve(smsGbl);
                            });
                        } else {
                            deferred.resolve();
                        }
                    }, function (response) {
                        deferred.resolve();
                    });

                    UtilService.addPromiseToTracker(deferred.promise);

                    return deferred.promise;
                },
                mmsScreeningList: function ($q, UtilService, BulkMessagingOperationsService) {
                    var msisdn = UtilService.getSubscriberMsisdn();

                    var deferred = $q.defer();

                    BulkMessagingOperationsService.getGlobalMMSBlackLists().then(function (responseMMS) {
                        if (responseMMS && responseMMS.lists && responseMMS.lists.length > 0) {
                            var mmsGbl = responseMMS.lists[0];

                            BulkMessagingOperationsService.getGlobalScreeningListByMsisdn('mms', mmsGbl.name, msisdn).then(function (response) {
                                mmsGbl.subscriberScreening = response;

                                deferred.resolve(mmsGbl);
                            }, function (response) {
                                deferred.resolve(mmsGbl);
                            });
                        } else {
                            deferred.resolve();
                        }
                    }, function (response) {
                        deferred.resolve();
                    });

                    UtilService.addPromiseToTracker(deferred.promise);

                    return deferred.promise;
                },
                ivrScreeningList: function ($q, UtilService, BulkMessagingOperationsService) {
                    var msisdn = UtilService.getSubscriberMsisdn();

                    var deferred = $q.defer();

                    BulkMessagingOperationsService.getGlobalIVRBlackLists().then(function (responseIVR) {
                        if (responseIVR && responseIVR.lists && responseIVR.lists.length > 0) {
                            var ivrGbl = responseIVR.lists[0];

                            BulkMessagingOperationsService.getGlobalScreeningListByMsisdn('ivr', ivrGbl.name, msisdn).then(function (response) {
                                ivrGbl.subscriberScreening = response;

                                deferred.resolve(ivrGbl);
                            }, function (response) {
                                deferred.resolve(ivrGbl);
                            });
                        } else {
                            deferred.resolve();
                        }
                    }, function (response) {
                        deferred.resolve();
                    });

                    UtilService.addPromiseToTracker(deferred.promise);

                    return deferred.promise;
                }
            }
        });

    });

    // Subscriber Profile Controller
    SISubscriberProfileModule.controller('SISubscriberProfileCtrl', function ($scope, $log, $q, $state, $uibModal, $translate, notification, Restangular, UtilService, DCBService,
                                                                              SSMSubscribersService, BulkMessagingOperationsService, ScreeningManagerV2Service, subscriber,
                                                                              subscriberDcbSettings, genericDCBSettings, smsScreeningList, mmsScreeningList, ivrScreeningList) {
        $log.debug('SISubscriberProfileCtrl');

        var msisdn = UtilService.getSubscriberMsisdn();

        $scope.originalSubscriberData = angular.copy(Restangular.stripRestangular(subscriber));
        $scope.subscriber = UtilService.getFromSessionStore(UtilService.SUBSCRIBER_PROFILE_KEY);
        $scope.subscriber.canUseDCB = $scope.originalSubscriberData.canUseDCB;

        $scope.subscriber.genericDCBSettings = Restangular.stripRestangular(genericDCBSettings);
        if ($scope.subscriber.genericDCBSettings && $scope.subscriber.genericDCBSettings.allowanceResponse) {
            $scope.subscriber.genericDCBSettings.enabled = $scope.subscriber.genericDCBSettings.allowanceResponse.allowed;
        } else {
            $scope.subscriber.genericDCBSettings.enabled = false;
        }

        $scope.smsScreeningList = Restangular.stripRestangular(smsScreeningList);
        $scope.subscriber.bulkSMSSettings = {
            optOut: !_.isUndefined($scope.smsScreeningList.subscriberScreening)
        };
        $scope.mmsScreeningList = Restangular.stripRestangular(mmsScreeningList);
        $scope.subscriber.bulkMMSSettings = {
            optOut: !_.isUndefined($scope.mmsScreeningList.subscriberScreening)
        };
        $scope.ivrScreeningList = Restangular.stripRestangular(ivrScreeningList);
        $scope.subscriber.bulkIVRSettings = {
            optOut: !_.isUndefined($scope.ivrScreeningList.subscriberScreening)
        };

        var prepareOriginals = function () {
            $scope.subscriber.originalCanUseDCB = angular.copy($scope.subscriber.canUseDCB);
            $scope.subscriber.originalGenericDCBSettings = angular.copy($scope.subscriber.genericDCBSettings);
            $scope.subscriber.originalBulkSMSSettings = angular.copy($scope.subscriber.bulkSMSSettings);
            $scope.subscriber.originalBulkMMSSettings = angular.copy($scope.subscriber.bulkMMSSettings);
            $scope.subscriber.originalBulkIVRSettings = angular.copy($scope.subscriber.bulkIVRSettings);
        }
        prepareOriginals();

        $scope.isDcbOptOutNotChanged = function () {
            return angular.equals($scope.subscriber.canUseDCB, $scope.subscriber.originalCanUseDCB) &&
                angular.equals($scope.subscriber.genericDCBSettings, $scope.subscriber.originalGenericDCBSettings) &&
                angular.equals($scope.subscriber.bulkSMSSettings, $scope.subscriber.originalBulkSMSSettings) &&
                angular.equals($scope.subscriber.bulkMMSSettings, $scope.subscriber.originalBulkMMSSettings) &&
                angular.equals($scope.subscriber.bulkIVRSettings, $scope.subscriber.originalBulkIVRSettings);
        };

        $scope.saveDcbOptOut = function (subscriber) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                size: 'sm',
                controller: function ($scope, $uibModalInstance, $controller, $sce, $translate) {
                    var message = $translate.instant('SubscriberInfo.SubscriberProfile.UpdateConfirmationMessage');
                    $scope.confirmationMessage = $sce.trustAsHtml(message);

                    $controller('ConfirmationModalInstanceCtrl', {
                        $scope: $scope,
                        $uibModalInstance: $uibModalInstance
                    });
                }
            });

            modalInstance.result.then(function () {
                $log.debug('Change the subscriber opt-opt choice for direct carrier billing:', subscriber);

                // DCB Opt-Out
                if (!angular.equals($scope.subscriber.canUseDCB, $scope.subscriber.originalCanUseDCB)) {
                    var subscriberItem = _.extend($scope.originalSubscriberData, {
                        canUseDCB: subscriber.canUseDCB
                    });

                    // Update Subscriber's DCB Settings
                    SSMSubscribersService.updateSubscriber(subscriberItem).then(function (response) {
                        $log.debug('Updated subscriber dcb settings: ', response);

                        notification.flash({
                            type: 'success',
                            text: $translate.instant('SubscriberInfo.DCB.SubscriberSettingsUpdated')
                        });

                        $state.reload();
                    }, function (response) {
                        $log.debug('Cannot update the subscriber dcb settings. Error: ', response);

                        if (!_.isUndefined(response.data) && !_.isUndefined(response.data.message)) {
                            notification({
                                type: 'warning',
                                text: response.data.message
                            });
                        } else {
                            notification({
                                type: 'warning',
                                text: $translate.instant('SubscriberInfo.DCB.SubscriberSettingsUpdatingError')
                            });
                        }
                    });
                }

                // Set the Generic DCB Enabled flag as false if the the DCB opt-out flag set as true.
                if (!$scope.subscriber.canUseDCB) {
                    $scope.subscriber.genericDCBSettings.enabled = false;
                }

                // Generic DCB Enabled
                if (!angular.equals($scope.subscriber.genericDCBSettings, $scope.subscriber.originalGenericDCBSettings)) {
                    var genericDCBSettingsDeferred = $q.defer()
                    if ($scope.subscriber.genericDCBSettings.enabled) {
                        ScreeningManagerV2Service.deleteListItem(ScreeningManagerV2Service.serviceNames.SUBSCRIBER, msisdn, ScreeningManagerV2Service.scopes.SERVICE_SCOPE_KEY, 'blacklist', DCBService.GENERIC_DCB_SERVICE_ID).then(function (response) {
                            genericDCBSettingsDeferred.resolve(response);
                        }, function (response) {
                            genericDCBSettingsDeferred.reject(response);
                        });
                    } else {
                        var screenableEntry = {
                            screenableEntryId: DCBService.GENERIC_DCB_SERVICE_ID,
                            screenableCorrelator: 'Generic DCB Service'
                        };

                        ScreeningManagerV2Service.addNewListItem(ScreeningManagerV2Service.serviceNames.SUBSCRIBER, msisdn, ScreeningManagerV2Service.scopes.SERVICE_SCOPE_KEY, 'blacklist', screenableEntry).then(function (response) {
                            genericDCBSettingsDeferred.resolve(response);
                        }, function (response) {
                            genericDCBSettingsDeferred.reject(response);
                        });
                    }

                    // Listen the above operations results.
                    genericDCBSettingsDeferred.promise.then(function (response) {
                        if (!_.isUndefined(response) && !_.isUndefined(response.errorCode)) {
                            var text = response.errorCode + ' - ' + response.message;

                            notification({
                                type: 'warning',
                                text: text
                            });
                        } else {
                            notification({
                                type: 'success',
                                text: $translate.instant('SubscriberInfo.DCB.SubscriberGenericDCBSettingsUpdated')
                            });

                            $scope.subscriber.originalGenericDCBSettings = angular.copy($scope.subscriber.genericDCBSettings);
                        }
                    }, function (response) {
                        $log.debug('Cannot update subscriber Generic DCB Enabled settings. Error: ', response);

                        if (response && response.data && response.data.errorCode) {
                            var text = response.data.errorCode + ' - ' + response.data.message;

                            notification({
                                type: 'warning',
                                text: text
                            });
                        } else {
                            notification({
                                type: 'warning',
                                text: $translate.instant('SubscriberInfo.DCB.SubscriberGenericDCBSettingsUpdatingError')
                            });
                        }
                    });
                }

                // Bulk SMS Opt-Out
                if (!angular.equals($scope.subscriber.bulkSMSSettings, $scope.subscriber.originalBulkSMSSettings)) {
                    if ($scope.subscriber.bulkSMSSettings.optOut) {
                        // Update Subscriber's Bulk SMS Opt-Out Settings
                        BulkMessagingOperationsService.createGlobalScreeningListByMsisdn('sms', $scope.smsScreeningList.name, msisdn).then(function (response) {
                            $log.debug('Bulk SMS opt-out settings updated successfully: ', response);

                            notification({
                                type: 'success',
                                text: $translate.instant('SubscriberInfo.DCB.SubscriberBulkSmsSettingsUpdated')
                            });

                            $scope.subscriber.originalBulkSMSSettings = angular.copy($scope.subscriber.bulkSMSSettings);
                        }, function (response) {
                            $log.debug('Cannot update subscriber Bulk SMS opt-out settings. Error: ', response);

                            notification({
                                type: 'warning',
                                text: $translate.instant('SubscriberInfo.DCB.SubscriberBulkSmsSettingsUpdatingError')
                            });
                        });
                    } else {
                        // Delete Subscriber's Bulk SMS Opt-Out Settings
                        BulkMessagingOperationsService.deleteGlobalScreeningListByMsisdn('sms', $scope.smsScreeningList.name, msisdn).then(function (response) {
                            $log.debug('Bulk SMS opt-out settings deleted successfully: ', response);

                            notification({
                                type: 'success',
                                text: $translate.instant('SubscriberInfo.DCB.SubscriberBulkSmsSettingsUpdated')
                            });

                            $scope.subscriber.originalBulkSMSSettings = angular.copy($scope.subscriber.bulkSMSSettings);
                        }, function (response) {
                            $log.debug('Cannot delete subscriber Bulk SMS opt-out settings. Error: ', response);

                            notification({
                                type: 'warning',
                                text: $translate.instant('SubscriberInfo.DCB.SubscriberBulkSmsSettingsUpdatingError')
                            });
                        });
                    }
                }

                // Bulk MMS Opt-Out
                if (!angular.equals($scope.subscriber.bulkMMSSettings, $scope.subscriber.originalBulkMMSSettings)) {
                    if ($scope.subscriber.bulkMMSSettings.optOut) {
                        // Update Subscriber's Bulk MMS Opt-Out Settings
                        BulkMessagingOperationsService.createGlobalScreeningListByMsisdn('mms', $scope.mmsScreeningList.name, msisdn).then(function (response) {
                            $log.debug('Bulk MMS opt-out settings updated successfully: ', response);

                            notification({
                                type: 'success',
                                text: $translate.instant('SubscriberInfo.DCB.SubscriberBulkMmsSettingsUpdated')
                            });

                            $scope.subscriber.originalBulkMMSSettings = angular.copy($scope.subscriber.bulkMMSSettings);
                        }, function (response) {
                            $log.debug('Cannot update subscriber Bulk MMS opt-out settings. Error: ', response);

                            notification({
                                type: 'warning',
                                text: $translate.instant('SubscriberInfo.DCB.SubscriberBulkMmsSettingsUpdatingError')
                            });
                        });
                    } else {
                        // Delete Subscriber's Bulk MMS Opt-Out Settings
                        BulkMessagingOperationsService.deleteGlobalScreeningListByMsisdn('mms', $scope.mmsScreeningList.name, msisdn).then(function (response) {
                            $log.debug('Bulk MMS opt-out settings deleted successfully: ', response);

                            notification({
                                type: 'success',
                                text: $translate.instant('SubscriberInfo.DCB.SubscriberBulkMmsSettingsUpdated')
                            });

                            $scope.subscriber.originalBulkMMSSettings = angular.copy($scope.subscriber.bulkMMSSettings);
                        }, function (response) {
                            $log.debug('Cannot delete subscriber Bulk MMS opt-out settings. Error: ', response);

                            notification({
                                type: 'warning',
                                text: $translate.instant('SubscriberInfo.DCB.SubscriberBulkMmsSettingsUpdatingError')
                            });
                        });
                    }
                }

                // Bulk IVR Opt-Out
                if (!angular.equals($scope.subscriber.bulkIVRSettings, $scope.subscriber.originalBulkIVRSettings)) {
                    if ($scope.subscriber.bulkIVRSettings.optOut) {
                        // Update Subscriber's Bulk IVR Opt-Out Settings
                        BulkMessagingOperationsService.createGlobalScreeningListByMsisdn('ivr', $scope.ivrScreeningList.name, msisdn).then(function (response) {
                            $log.debug('Bulk IVR opt-out settings updated successfully: ', response);

                            notification({
                                type: 'success',
                                text: $translate.instant('SubscriberInfo.DCB.SubscriberBulkIvrSettingsUpdated')
                            });

                            $scope.subscriber.originalBulkIVRSettings = angular.copy($scope.subscriber.bulkIVRSettings);
                        }, function (response) {
                            $log.debug('Cannot update subscriber Bulk IVR opt-out settings. Error: ', response);

                            notification({
                                type: 'warning',
                                text: $translate.instant('SubscriberInfo.DCB.SubscriberBulkIvrSettingsUpdatingError')
                            });
                        });
                    } else {
                        // Delete Subscriber's Bulk IVR Opt-Out Settings
                        BulkMessagingOperationsService.deleteGlobalScreeningListByMsisdn('ivr', $scope.ivrScreeningList.name, msisdn).then(function (response) {
                            $log.debug('Bulk IVR opt-out settings deleted successfully: ', response);

                            notification({
                                type: 'success',
                                text: $translate.instant('SubscriberInfo.DCB.SubscriberBulkIvrSettingsUpdated')
                            });

                            $scope.subscriber.originalBulkIVRSettings = angular.copy($scope.subscriber.bulkIVRSettings);
                        }, function (response) {
                            $log.debug('Cannot delete subscriber Bulk IVR opt-out settings. Error: ', response);

                            notification({
                                type: 'warning',
                                text: $translate.instant('SubscriberInfo.DCB.SubscriberBulkIvrSettingsUpdatingError')
                            });
                        });
                    }
                }
            }, function () {
            });
        };

        $scope.cancel = function () {
            $state.reload();
        };
    });

})();
