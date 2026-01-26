(function () {

    'use strict';

    angular.module('ccportal.services.vsms.messages', []);

    var VSMSMessagesModule = angular.module('ccportal.services.vsms.messages');

    VSMSMessagesModule.config(function ($stateProvider) {

        $stateProvider.state('services.vsms.messages', {
            url: "/messages",
            templateUrl: "services/vsms/messages/vsms-messages.html",
            controller: 'VSMSMessagesTableCtrl',
            resolve: {
                subscription: function ($q, UtilService, VSMSProvisioningService) {
                    var subscription = {
                        state: false,
                        messages: undefined
                    };

                    var deferred = $q.defer();

                    var msisdn = UtilService.getSubscriberMsisdn();

                    VSMSProvisioningService.getAllMessages(msisdn).then(function (response) {
                        subscription.messages = response.messages;

                        if (subscription.messages && subscription.messages.errorCode) {
                            if (subscription.messages.errorCode === 5021) {
                                subscription.error_message = 'Services.VSMS.Messages.SubscriptionNotExists';
                            } else {
                                subscription.error_message = subscription.messages.detail;
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
                }
            }
        });

    });

    VSMSMessagesModule.controller('VSMSMessagesTableCtrl', function ($scope, $log, $q, $filter, notification, $translate, UtilService, NgTableParams, NgTableService,
                                                                     VSMSProvisioningService, subscription) {
        $log.debug('VSMSMessagesTableCtrl');

        var msisdn = UtilService.getSubscriberMsisdn();

        if (subscription && subscription.error_message) {
            $scope.error_message = subscription.error_message;
            return;
        }

        $scope.messageList = subscription.messages;
        $scope.dataType = 'ALL';

        // Messages list of current scope definitions
        $scope.messages = {
            list: $scope.messageList,
            tableParams: {}
        };

        $scope.messages.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "date": 'desc'
            }
        }, {
            total: $scope.messages.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var orderedData = params.sorting() ? $filter('orderBy')($scope.messages.list, params.orderBy()) : $scope.messages.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - Messages list definitions

        var updateList = function (dataType) {
            if (dataType === 'ALL') {
                $scope.messages.list = $scope.messageList;
            } else {
                $scope.messages.list = _.where($scope.messageList, {"isRead": dataType === 'READ_MESSAGES'});
            }

            $scope.messages.tableParams.page(1);
            $scope.messages.tableParams.reload();
        }

        // this watcher listens the buttons for filtering records by type according to selection.
        $scope.$watch('dataType', updateList);

        $scope.toggleStatus = function (item) {
            var messagePreferences = {
                'isRead': !item.isRead
            };

            $log.debug('Updating message. messageId: ', item.messageId, ', isRead: ', messagePreferences.isRead);

            VSMSProvisioningService.updateMessageWithId(msisdn, item.messageId, messagePreferences).then(function (response) {
                $log.debug('Updated message: ', response);

                var updatedListItem = _.findWhere($scope.messages.list, {messageId: item.messageId});
                updatedListItem.isRead = messagePreferences.isRead;

                $scope.messages.tableParams.reload();

                notification({
                    type: 'success',
                    text: $translate.instant('CommonLabels.OperationSuccessful')
                });
            }, function (response) {
                $log.debug('Cannot update message: ', response);
            });
        };
    });

})();
