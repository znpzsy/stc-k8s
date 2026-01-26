(function () {

    'use strict';

    angular.module('adminportal.subsystems.subscriptionmanagement.operations.subscribers.update', []);

    var SubscriptionManagementOperationsSubscribersUpdateModule = angular.module('adminportal.subsystems.subscriptionmanagement.operations.subscribers.update');

    SubscriptionManagementOperationsSubscribersUpdateModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.subscriptionmanagement.operations.subscribers.update', {
            url: "/:msisdn",
            templateUrl: "subsystems/subscriptionmanagement/operations/subscribers/operations.subscribers.detail.html",
            controller: 'SubscriptionManagementOperationsSubscribersUpdateCtrl',
            resolve: {
                subscriber: function ($stateParams, SSMSubscribersService) {
                    var msisdn = $stateParams.msisdn;

                    return SSMSubscribersService.getSubscriberByMsisdn(msisdn);
                }
            }
        });

    });

    SubscriptionManagementOperationsSubscribersUpdateModule.controller('SubscriptionManagementOperationsSubscribersUpdateCtrl', function ($scope, $rootScope, $log, $filter, $controller, $timeout, $translate, notification, Restangular, DateTimeConstants,
                                                                                                                                          SSMSubscribersService, subscriber, PROVISIONING_PAYMENT_TYPES, PROVISIONING_LANGUAGES, PROVISIONING_STATES,
                                                                                                                                          PROVISIONING_STATUSES, PROVISIONING_STATUSES_FTTH, PROVISIONING_TYPES, PROVISIONING_GENDERS, PROVISIONING_CUSTOMER_CATEGORIES,
                                                                                                                                          PROVISIONING_CREDIT_SEGMENTS, PROVISIONING_VIP_CATEGORIES, PROVISIONING_VIP_SUB_CATEGORIES,
                                                                                                                                          PROVISIONING_PACKAGE_CATEGORIES, PROVISIONING_PACKAGE_CATEGORIES_FTTH) {
        $log.debug('SubscriptionManagementOperationsSubscribersUpdateCtrl');

        // Calling screening management controllers for using black listing functionality.
        $controller('ScreeningManagementOperationsScreeningListsGlobalMsisdnCtrl', {$scope: $scope});

        $scope.subscriber = Restangular.stripRestangular(subscriber);
        $scope.subscriber.lang = ((_.isUndefined($scope.subscriber.lang) || _.isEmpty($scope.subscriber.lang)) ? null : $scope.subscriber.lang);

        $scope.PROVISIONING_PAYMENT_TYPES = PROVISIONING_PAYMENT_TYPES;
        $scope.PROVISIONING_LANGUAGES = PROVISIONING_LANGUAGES;
        $scope.PROVISIONING_STATES = PROVISIONING_STATES;
        $scope.PROVISIONING_STATUSES = PROVISIONING_STATUSES;
        $scope.PROVISIONING_TYPES = PROVISIONING_TYPES;
        $scope.PROVISIONING_GENDERS = PROVISIONING_GENDERS;
        $scope.PROVISIONING_CUSTOMER_CATEGORIES = PROVISIONING_CUSTOMER_CATEGORIES;
        $scope.PROVISIONING_CREDIT_SEGMENTS = PROVISIONING_CREDIT_SEGMENTS;
        $scope.PROVISIONING_VIP_CATEGORIES = PROVISIONING_VIP_CATEGORIES;
        $scope.PROVISIONING_VIP_SUB_CATEGORIES = PROVISIONING_VIP_SUB_CATEGORIES;
        $scope.PROVISIONING_PACKAGE_CATEGORIES = PROVISIONING_PACKAGE_CATEGORIES;

        // 3 means the category is FTTH
        if ($scope.subscriber.packageInfo && $scope.subscriber.packageInfo.category === 3) {
            $scope.PROVISIONING_STATUSES = PROVISIONING_STATUSES_FTTH;
            $scope.PROVISIONING_PACKAGE_CATEGORIES = PROVISIONING_PACKAGE_CATEGORIES_FTTH;
        }

        if ($scope.subscriber.birthDate) {
            $scope.subscriber.birthDate = new Date($scope.subscriber.birthDate);
        }
        if ($scope.subscriber.activationDate) {
            $scope.subscriber.activationDate = new Date($scope.subscriber.activationDate);
        }
        if ($scope.subscriber.firstCallDate) {
            $scope.subscriber.firstCallDate = new Date($scope.subscriber.firstCallDate);
        }
        if ($scope.subscriber.packageInfo) {
            if ($scope.subscriber.packageInfo.creationTime) {
                $scope.subscriber.packageInfo.creationTime = new Date($scope.subscriber.packageInfo.creationTime);
            }

            if ($scope.subscriber.packageInfo.speedSubDate) {
                $scope.subscriber.packageInfo.speedSubDate = new Date($scope.subscriber.packageInfo.speedSubDate);
            }
        }

        $scope.dateFormat = 'MMMM d, y';
        $scope.dateOptions = {
            formatYear: 'yy',
            startingDay: 1,
            showWeeks: false
        };

        $scope.birthDatePicker = {opened: false};
        $scope.activationDatePicker = {opened: false};
        $scope.firstCallDatePicker = {opened: false};
        $scope.creationTimePicker = {opened: false};
        $scope.speedSubDatePicker = {opened: false};
        $scope.openDatePicker = function (datePicker, $event) {
            $event.preventDefault();
            $event.stopPropagation();

            datePicker.opened = true;
        };

        $scope.addNewDealInfo = function () {
            if (!$scope.subscriber.dealInfoList) {
                $scope.subscriber.dealInfoList = [];
            }

            $scope.subscriber.dealInfoList.push({id: '', name: ''});
        };
        $scope.removeDealInfo = function (index) {
            if ($scope.subscriber.dealInfoList && $scope.subscriber.dealInfoList.length > 0) {
                $scope.subscriber.dealInfoList.splice(index, 1);
            }
        };

        $scope.addNewExtensionAttribute = function () {
            if (!$scope.subscriber.extensionAttributeList) {
                $scope.subscriber.extensionAttributeList = [];
            }

            $scope.subscriber.extensionAttributeList.push({name: '', value: ''});
        };
        $scope.removeExtensionAttribute = function (index) {
            if ($scope.subscriber.extensionAttributeList && $scope.subscriber.extensionAttributeList.length > 0) {
                $scope.subscriber.extensionAttributeList.splice(index, 1);
            }
        };

        $scope.subscriberOriginal = angular.copy($scope.subscriber);
        $scope.isNotChanged = function () {
            return angular.equals($scope.subscriber, $scope.subscriberOriginal);
        };

        $scope.save = function (subscriber) {
            $log.debug('Updating subscriber: ', subscriber);

            var subscriberItem = angular.copy(subscriber);

            subscriberItem.id = $scope.subscriberOriginal.id;
            subscriberItem.msisdn = $scope.subscriberOriginal.msisdn;

            // Check the status and set the state value according to this selection.
            if (subscriberItem.status === 0) {
                subscriberItem.state.currentState = 'ACTIVE';
            } else {
                subscriberItem.state.currentState = 'INACTIVE';
            }

            // Format the date time objects
            if (subscriber.birthDate) {
                subscriberItem.birthDate = $filter('date')(subscriber.birthDate, 'yyyy-MM-dd', DateTimeConstants.OFFSET) + 'T00:00:00.000' + DateTimeConstants.OFFSET;
            }
            if (subscriber.activationDate) {
                subscriberItem.activationDate = $filter('date')(subscriber.activationDate, 'yyyy-MM-dd\'T\'HH:mm:ss.sss' + DateTimeConstants.OFFSET);
            }
            if (subscriber.firstCallDate) {
                subscriberItem.firstCallDate = $filter('date')(subscriber.firstCallDate, 'yyyy-MM-dd\'T\'HH:mm:ss.sss' + DateTimeConstants.OFFSET);
            }
            if (subscriber.packageInfo) {
                if (subscriber.packageInfo.creationTime) {
                    subscriberItem.packageInfo.creationTime = $filter('date')(subscriber.packageInfo.creationTime, 'yyyy-MM-dd\'T\'HH:mm:ss.sss' + DateTimeConstants.OFFSET);
                }

                if (subscriber.packageInfo.speedSubDate) {
                    subscriberItem.packageInfo.speedSubDate = $filter('date')(subscriber.packageInfo.speedSubDate, 'yyyy-MM-dd\'T\'HH:mm:ss.sss' + DateTimeConstants.OFFSET);
                }
            }

            // Update subscriber.
            SSMSubscribersService.updateSubscriber(subscriberItem).then(function (response) {
                $log.debug('Updated subscriber: ', response);

                notification.flash({
                    type: 'success',
                    text: $translate.instant('Subsystems.SubscriptionManagement.Operations.Subscribers.Messages.SubscriberUpdatingSucceded')
                });

                $scope.go('subsystems.subscriptionmanagement.operations.subscribers.list');

                return response;
            }, function (response) {
                $log.debug('Cannot update the subscriber. Error: ', response);

                if (!_.isUndefined(response.data) && !_.isUndefined(response.data.message)) {
                    notification({
                        type: 'danger',
                        text: response.data.message
                    });
                } else {
                    notification({
                        type: 'danger',
                        text: $translate.instant('Subsystems.SubscriptionManagement.Operations.Subscribers.Messages.SubscriberUpdatingError')
                    });
                }
            });
        };

        $scope.cancel = function () {
            $scope.go('subsystems.subscriptionmanagement.operations.subscribers.list');
        };

    })
    ;

})();
