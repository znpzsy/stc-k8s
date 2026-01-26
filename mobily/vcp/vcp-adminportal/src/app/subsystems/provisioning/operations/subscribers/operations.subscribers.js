(function () {

    'use strict';

    angular.module('adminportal.subsystems.provisioning.operations.subscribers', []);

    var ProvisioningOperationsSubscribersModule = angular.module('adminportal.subsystems.provisioning.operations.subscribers');

    ProvisioningOperationsSubscribersModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.provisioning.operations.subscribers', {
            abstract: true,
            url: "/subscribers",
            template: "<div ui-view></div>"
        }).state('subsystems.provisioning.operations.subscribers.list', {
            url: "/list",
            templateUrl: "subsystems/provisioning/operations/subscribers/operations.subscribers.html",
            controller: 'ProvisioningOperationsSubscribersCtrl'
        }).state('subsystems.provisioning.operations.subscribers.new', {
            url: "/new",
            templateUrl: "subsystems/provisioning/operations/subscribers/operations.subscribers.detail.html",
            controller: 'ProvisioningOperationsSubscribersNewCtrl'
        }).state('subsystems.provisioning.operations.subscribers.update', {
            url: "/:id",
            templateUrl: "subsystems/provisioning/operations/subscribers/operations.subscribers.detail.html",
            controller: 'ProvisioningOperationsSubscribersUpdateCtrl',
            resolve: {
                subscriber: function ($stateParams, CMPFService) {
                    return CMPFService.getSubscriber($stateParams.id);
                }
            }
        });

    });

    ProvisioningOperationsSubscribersModule.controller('ProvisioningOperationsSubscribersCommonCtrl', function ($scope, $log, $q, notification, $translate, $uibModal, CMPFService) {
        $log.debug('ProvisioningOperationsSubscribersCommonCtrl');

        $scope.showOperators = function (subscriber) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.organizations.html',
                controller: 'OrganizationsModalInstanceCtrl',
                size: 'lg',
                resolve: {
                    organizationParameter: function () {
                        return angular.copy($scope.selectedOrganization);
                    },
                    itemName: function () {
                        return subscriber.subscriberProfile ? subscriber.subscriberProfile.msisdn : '';
                    },
                    allOrganizations: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                        return CMPFService.getAllOrganizations(0, DEFAULT_REST_QUERY_LIMIT);
                    },
                    organizationsModalTitleKey: function () {
                        return 'Subsystems.Provisioning.Subscribers.OperatorsModalTitle';
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
                $scope.subscriber.organization = selectedItem.organization;
                $scope.subscriber.organizationId = selectedItem.organization.id;
            }, function () {
                //
            });
        };

        $scope.showSuccessMessage = function () {
            notification.flash({
                type: 'success',
                text: $translate.instant('CommonLabels.OperationSuccessful')
            });

            $scope.cancel();
        };

        $scope.cancel = function () {
            $scope.go('subsystems.provisioning.operations.subscribers.list');
        };
    });

    ProvisioningOperationsSubscribersModule.controller('ProvisioningOperationsSubscribersCtrl', function ($scope, $state, $log, $filter, $uibModal, $translate, notification, Restangular,
                                                                                                          NgTableParams, NgTableService, CMPFService) {
        $log.debug('ProvisioningOperationsSubscribersCtrl');

        $scope.subscriberList = {
            list: [],
            tableParams: {}
        };

        $scope.subscriberList.tableParams = new NgTableParams({
            page: 1,
            count: 10
        }, {
            total: 0,
            $scope: $scope,
            getData: function ($defer, params) {
                var msisdnFilterText = params.settings().$scope.msisdnFilterText;

                CMPFService.getSubscribersByFilter((params.page() - 1) * params.count(), params.count(), msisdnFilterText).then(function (response) {
                    $log.debug('getSubscribers Success : ', response);
                    $scope.subscribersResponse = Restangular.stripRestangular(response);

                    if ($scope.subscribersResponse && $scope.subscribersResponse.subscribers) {
                        _.each($scope.subscribersResponse.subscribers, function (subscriber) {
                            var subscriberProfile = CMPFService.extractSubscriberProfile(subscriber);
                            subscriber.subscriberProfile = subscriberProfile;

                            subscriber.subscriberProfile.LanguageText = $translate.instant($filter('LanguageAbbrFilter')(subscriber.subscriberProfile.Language));
                            subscriber.subscriberProfile.PaymentTypeText = $translate.instant($filter('ProvisioningPaymentTypeFilter')(subscriber.subscriberProfile.PaymentType));
                            subscriber.subscriberProfile.StatusText = $translate.instant($filter('ProvisioningStatusTypeFilter')(subscriber.subscriberProfile.Status));
                        });

                        params.total($scope.subscribersResponse.metaData.totalCount); // set total for recalc pagination
                        $defer.resolve($scope.subscribersResponse.subscribers);
                    } else {
                        params.total(0);
                        $defer.resolve([]);
                    }

                }, function (response) {
                    $log.debug('Cannot read subscribers. Error: ', response);
                });
            }
        });

        $scope.filterTableByMsisdn = _.throttle(function (msisdnFilterText) {
            $scope.subscriberList.tableParams.settings().$scope.msisdnFilterText = msisdnFilterText;
            $scope.subscriberList.tableParams.page(1);
            $scope.subscriberList.tableParams.reload();
        }, 2000);
        $scope.filterTableByMsisdnChange = function (msisdnFilterText) {
            if (!msisdnFilterText) {
                $scope.filterTableByMsisdn(null);
            }
        };

        $scope.remove = function (subscriber) {
            subscriber.rowSelected = true;

            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                subscriber.rowSelected = false;

                CMPFService.deleteSubscriber(subscriber).then(function (response) {
                    $log.debug('Removed. Response: ', response);

                    if (response && response.errorCode) {
                        CMPFService.showApiError(response);
                    } else {
                        $scope.subscriberList.tableParams.reload();

                        notification({
                            type: 'success',
                            text: $translate.instant('Subsystems.Provisioning.Subscribers.Messages.SubscriberDeletingSucceded')
                        });
                    }
                }, function (response) {
                    $log.debug('Cannot remove subscriber. Error: ', response);

                    if (!_.isUndefined(response.data) && !_.isUndefined(response.data.message)) {
                        notification({
                            type: 'warning',
                            text: response.data.message
                        });
                    } else {
                        notification({
                            type: 'danger',
                            text: $translate.instant('Subsystems.Provisioning.Subscribers.Messages.SubscriberDeletingError')
                        });
                    }
                });

            }, function () {
                subscriber.rowSelected = false;
            });
        };
    });

    ProvisioningOperationsSubscribersModule.controller('ProvisioningOperationsSubscribersNewCtrl', function ($scope, $controller, $state, $log, $uibModal, $translate, notification, CMPFService,
                                                                                                             PROVISIONING_PAYMENT_TYPES, PROVISIONING_LANGUAGES, PROVISIONING_STATUSES) {
        $log.debug('ProvisioningOperationsSubscribersNewCtrl');

        $controller('ProvisioningOperationsSubscribersCommonCtrl', {$scope: $scope});

        $scope.PROVISIONING_PAYMENT_TYPES = PROVISIONING_PAYMENT_TYPES;
        $scope.PROVISIONING_LANGUAGES = PROVISIONING_LANGUAGES;
        $scope.PROVISIONING_STATUSES = PROVISIONING_STATUSES;

        $scope.subscriber = {
            organization: null,
            subscriberProfile: {
                MSISDN: '',
                PaymentType: null,
                Language: null,
                Status: 'Active'
            }
        };

        $scope.save = function (subscriber) {
            CMPFService.getSubscriberByMsisdn(subscriber.subscriberProfile.MSISDN).then(function(response) {
               if (response.subscribers && response.subscribers.length > 0) {
                   notification({
                       type: 'warning',
                       text: $translate.instant('Subsystems.Provisioning.Subscribers.Messages.SubscriberNumberDuplicate')
                   });
               } else {
                   // The subscriber is eligible to creating because of there is no subscriber with the same MSISDN.
                   var subscriberItem = {
                       state: subscriber.subscriberProfile.Status.toUpperCase(),
                       organizationId: subscriber.organizationId,
                       profiles: []
                   };

                   subscriberItem.profiles.push({
                       name: CMPFService.SUBSCRIBER_PROFILE_NAME,
                       profileDefinitionName: CMPFService.SUBSCRIBER_PROFILE_NAME,
                       attributes: [
                           {
                               "name": "MSISDN",
                               "value": subscriber.subscriberProfile.MSISDN
                           },
                           {
                               "name": "PaymentType",
                               "value": subscriber.subscriberProfile.PaymentType
                           },
                           {
                               "name": "Language",
                               "value": subscriber.subscriberProfile.Language
                           },
                           {
                               "name": "Status",
                               "value": subscriber.subscriberProfile.Status
                           }
                       ]
                   });

                   $log.debug('Trying to create subscriber: ', subscriberItem);

                   CMPFService.createSubscriber(subscriberItem).then(function (response) {
                       $log.debug('Save Success. Response: ', response);

                       if (response && response.errorCode) {
                           CMPFService.showApiError(response);
                       } else {
                           notification.flash({
                               type: 'success',
                               text: $translate.instant('Subsystems.Provisioning.Subscribers.Messages.SubscriberCreatingSucceded')
                           });

                           $scope.go('subsystems.provisioning.operations.subscribers.list');
                       }
                   }, function (response) {
                       $log.debug('Cannot save subscriber. Error: ', response);

                       if (!_.isUndefined(response.data) && !_.isUndefined(response.data.message)) {
                           notification({
                               type: 'warning',
                               text: response.data.message
                           });
                       } else {
                           notification({
                               type: 'danger',
                               text: $translate.instant('Subsystems.Provisioning.Subscribers.Messages.SubscriberCreatingError')
                           });
                       }
                   });
               }
            });
        };
    });

    ProvisioningOperationsSubscribersModule.controller('ProvisioningOperationsSubscribersUpdateCtrl', function ($scope, $controller, $state, $log, $uibModal, $translate, notification, CMPFService, Restangular,
                                                                                                                PROVISIONING_PAYMENT_TYPES, PROVISIONING_LANGUAGES, PROVISIONING_STATUSES, subscriber) {
        $log.debug('ProvisioningOperationsSubscribersUpdateCtrl');

        $controller('ProvisioningOperationsSubscribersCommonCtrl', {$scope: $scope});

        $scope.PROVISIONING_PAYMENT_TYPES = PROVISIONING_PAYMENT_TYPES;
        $scope.PROVISIONING_LANGUAGES = PROVISIONING_LANGUAGES;
        $scope.PROVISIONING_STATUSES = PROVISIONING_STATUSES;

        $scope.subscriber = Restangular.stripRestangular(subscriber);
        var subscriberProfile = CMPFService.extractSubscriberProfile($scope.subscriber);
        $scope.subscriber.subscriberProfile = subscriberProfile;

        $scope.subscriberOriginal = angular.copy($scope.subscriber);
        $scope.isNotChanged = function () {
            return angular.equals($scope.subscriberOriginal, $scope.subscriber);
        };

        $scope.save = function (subscriber) {
            var subscriberItem = {
                // Set originals
                id: $scope.subscriberOriginal.id,
                // Editable fields on the update mode
                organizationId: subscriber.organizationId,
                state: subscriber.subscriberProfile.Status.toUpperCase(),
                profiles: $scope.subscriberOriginal.profiles
            };

            // SubscriberProfile related steps
            var originalSubscriberProfileDef = CMPFService.getSubscriberProfile(subscriberItem);
            if (!_.isEmpty(originalSubscriberProfileDef) && !_.isUndefined(originalSubscriberProfileDef)) {
                _.each(subscriber.subscriberProfile, function (originalSubscriberProfileValue, key) {
                    var originalSubscriberProfileAttr = _.findWhere(originalSubscriberProfileDef.attributes, {name: key});
                    if (originalSubscriberProfileAttr) {
                        originalSubscriberProfileAttr.value = originalSubscriberProfileValue;
                    }
                });
            } else {
                var originalSubscriberProfile = $scope.prepareNewSubscriberProfile(subscriber.originalSubscriberProfile);

                // If there is no profile definition in the profiles array then put in it the new one.
                subscriberItem.profiles.push(originalSubscriberProfile);
            }

            CMPFService.updateSubscriber(subscriberItem).then(function (response) {
                $log.debug('Update Success. Response: ', response);

                if (response && response.errorCode) {
                    CMPFService.showApiError(response);
                } else {
                    notification.flash({
                        type: 'success',
                        text: $translate.instant('Subsystems.Provisioning.Subscribers.Messages.SubscriberUpdatingSucceded')
                    });

                    $scope.go('subsystems.provisioning.operations.subscribers.list');
                }
            }, function (response) {
                $log.debug('Cannot update subscriber. Error: ', response);

                if (!_.isUndefined(response.data) && !_.isUndefined(response.data.message)) {
                    notification({
                        type: 'warning',
                        text: response.data.message
                    });
                } else {
                    notification({
                        type: 'danger',
                        text: $translate.instant('Subsystems.Provisioning.Subscribers.Messages.SubscriberUpdatingError')
                    });
                }
            });
        };
    });

})();