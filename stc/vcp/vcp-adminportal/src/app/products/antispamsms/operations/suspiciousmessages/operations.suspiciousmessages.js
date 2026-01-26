(function () {

    'use strict';

    angular.module('adminportal.products.antispamsms.operations.suspiciousmessages', [
        "adminportal.products.antispamsms.operations.suspiciousmessages.frauddetection",
        "adminportal.products.antispamsms.operations.suspiciousmessages.counters",
        "adminportal.products.antispamsms.operations.suspiciousmessages.contentcounters",
        "adminportal.products.antispamsms.operations.suspiciousmessages.contentfilters",
        "adminportal.products.antispamsms.operations.suspiciousmessages.screenings"
    ]);

    var AntiSpamSMSOperationsSuspiciousMessagesModule = angular.module('adminportal.products.antispamsms.operations.suspiciousmessages');

    AntiSpamSMSOperationsSuspiciousMessagesModule.config(function ($stateProvider) {

        $stateProvider.state('products.antispamsms.operations.suspiciousmessages', {
            abstract: true,
            url: "/suspiciousmessages",
            templateUrl: "products/antispamsms/operations/suspiciousmessages/operations.suspiciousmessages.html",
            controller: 'AntiSpamSuspiciousMessagesCommonCtrl',
        });
    });

    AntiSpamSMSOperationsSuspiciousMessagesModule.controller('AntiSpamSuspiciousMessagesCommonCtrl', function ($scope, $log, $q, $state, $controller, $uibModal, $filter, UtilService, SessionService, ContentManagementService, CMPFService,
                                                                                                               GeneralESService, SMSAntiSpamConfigService) {

        // Edr Records For Suspicious Messages
        $scope.viewTroubleshootingRecords = function (titleKey, cdrType, entityName, filterFieldName) {
            $uibModal.open({
                templateUrl: 'products/antispamsms/operations/suspiciousmessages/operations.suspiciousmessages.troubleshooting.modal.html',
                controller: function ($scope, $log, $filter, $uibModalInstance, Restangular, NgTableParams, NgTableService, cdrType, entityName, filterFieldName, titleKey, DateTimeConstants, idFilterTimespans) {

                    $log.debug('AntiSpamSuspiciousMessagesCommonCtrl');

                    $controller('AntiSpamSMSTroubleshootingCommonCtrl', {$scope: $scope, idFilterTimespans: idFilterTimespans});
                    $scope.objectName = entityName;

                    $scope.titleKey = titleKey;
                    $scope.askService = true;

                    // AntiSpamSMS edr list
                    $scope.edrList = {
                        list: [],
                        showTable: false,
                        tableParams: {}
                    };

                    $scope.dateFilter = {
                        startDate: new Date(moment().utcOffset(DateTimeConstants.OFFSET).subtract(90, 'days')),
                        endDate: new Date()
                    };

                    //$scope.additionalFilterFields.opContentFilter = "smsAntiSpamSuspiciousMessageEdr";

                    $scope.edrList.tableParams = new NgTableParams({
                        page: 1,
                        count: 10,
                        sorting: {
                            "date": 'desc'
                        }
                    }, {
                        $scope: $scope,
                        getData: function ($defer, params) {
                            var preparedFilter = $scope.prepareFilter($scope.dateFilter, params);

                            var filter = preparedFilter.filter;
                            var additionalFilterFields = preparedFilter.additionalFilterFields;

                            if (!params.settings().$scope.askService) {
                                params.total(0);
                                $defer.resolve([]);
                                return;
                            }

                            function updateUIState(showTable) {
                                // Hide the filter form.
                                $scope.filterFormLayer.isFilterFormOpen = false;
                                $scope.edrList.showTable = showTable;
                            }

                            function handleSuccessResponse(response) {
                                if (response && response.hits && response.hits.hits) {
                                    $scope.edrList.list = $scope.filterFields(response.hits.hits);
                                    var total = response.hits.total.value || response.hits.total || 0;
                                    params.total(total);
                                    $defer.resolve($scope.edrList.list);
                                } else {
                                    params.total(0);
                                    $defer.resolve([]);
                                }
                            }

                            function handleError(error) {
                                $log.debug('Error: ', error);
                                params.total(0);
                                $defer.resolve([]);
                            }

                            // Helper function to decrypt message content
                            function decryptMessageContent(response) {
                                var requestBody = response.hits.hits.map(function(hit, index) {
                                    return {
                                        part: index,
                                        content: hit._source.msgContent || ""
                                    };
                                });

                                return SMSAntiSpamConfigService.getDecryptedMessageContent(requestBody)
                                    .then(function (decryptedResponse) {
                                        // Update message content with decrypted data
                                        response.hits.hits.forEach(function(hit, index) {
                                            if (decryptedResponse &&
                                                decryptedResponse[index] &&
                                                decryptedResponse[index].content) {
                                                hit._source.decryptedMsgContent = decryptedResponse[index].content;
                                            }
                                        });
                                        return response;
                                    });
                            }

                            // Main execution
                            GeneralESService.findSMSAntiSpamSuspiciousMessageEdrs(filter, additionalFilterFields, cdrType, entityName, filterFieldName)
                                .then(function (response) {
                                    $log.debug("Found records: ", response);
                                    updateUIState(true);

                                    // Decrypt content and handle response
                                    return decryptMessageContent(response);
                                })
                                .then(handleSuccessResponse)
                                .catch(handleError);
                        }
                    });


                    $scope.close = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                size: 'xlg',
                resolve: {
                    cdrType: function () {
                        return cdrType;
                    },
                    entityName: function () {
                        return entityName;
                    },
                    titleKey: function () {
                        return titleKey;
                    },
                    filterFieldName: function () {
                        return filterFieldName;
                    },
                    idFilterTimespans: function () {
                        // This will be called from the sms antispam api later on
                        var spans = {
                            reputationId: { unit: "hours", value: 48 },
                            counterId: { unit: "hours", value: 4 },
                            filterId: { unit: "hours", value: 4 }
                        }
                        return spans;
                    }
                }
            });
        };

    });


})();
