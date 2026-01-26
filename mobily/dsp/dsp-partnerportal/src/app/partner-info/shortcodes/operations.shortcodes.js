(function () {

    'use strict';

    angular.module('partnerportal.partner-info.shortcodes', []);

    var PartnerInfoShortCodeOperationsShortCodesModule = angular.module('partnerportal.partner-info.shortcodes');

    PartnerInfoShortCodeOperationsShortCodesModule.config(function ($stateProvider) {

        $stateProvider.state('partner-info.shortcodes', {
            abstract: true,
            url: "/short-code",
            template: "<div ui-view></div>",
            data: {
                permissions: [
                    'PRM__SHORT_CODE_READ'
                ]
            }
        }).state('partner-info.shortcodes.list', {
            url: "",
            templateUrl: "partner-info/shortcodes/operations.shortcodes.html",
            controller: 'PartnerInfoShortCodeOperationsShortCodesCtrl',
            resolve: {
                shortCodesOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_SHORT_CODES_ORGANIZATION_NAME);
                }
            }
        }).state('partner-info.shortcodes.update', {
            url: "/update/:id",
            templateUrl: "partner-info/shortcodes/operations.shortcodes.detail.html",
            controller: 'PartnerInfoShortCodeOperationsShortCodesUpdateCtrl',
            resolve: {
                shortCodesOrganization: function (CMPFService) {
                    return CMPFService.getOrganizationByName(CMPFService.DEFAULT_SHORT_CODES_ORGANIZATION_NAME);
                },
                shortCode: function ($stateParams, CMPFService) {
                    return CMPFService.getProfile($stateParams.id);
                }
            }
        });

    });

    PartnerInfoShortCodeOperationsShortCodesModule.controller('PartnerInfoShortCodeOperationsShortCodesCommonCtrl', function ($scope, $log, $q, $state, $filter, $uibModal, notification, $translate, CMPFService, SessionService,
                                                                                                                              WorkflowsService, SHORT_CODES_STATUS_TYPES) {
        $log.debug('PartnerInfoShortCodeOperationsShortCodesCommonCtrl');

        $scope.sessionOrganization = SessionService.getSessionOrganization();
        $scope.username = SessionService.getUsername();

        $scope.SHORT_CODES_STATUS_TYPES = SHORT_CODES_STATUS_TYPES;

        $scope.startShortCodeStateFlow = function (shortCode, newState) {
            shortCode.rowSelected = true;

            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: function ($scope, $uibModalInstance, $translate, $controller, $sce) {
                    var message = '';
                    if (newState === 'APPLIED') {
                        message = $translate.instant('PartnerInfo.ShortCodes.Messages.ApplyConfirmationMessage');
                    } else if (newState === 'FREE') {
                        message = $translate.instant('PartnerInfo.ShortCodes.Messages.FreeConfirmationMessage');
                    }

                    message = message + ' [' + shortCode.ShortCode + ']';
                    $scope.confirmationMessage = $sce.trustAsHtml(message);

                    $controller('ConfirmationModalInstanceCtrl', {
                        $scope: $scope,
                        $uibModalInstance: $uibModalInstance
                    });
                },
                size: 'sm'
            });

            modalInstance.result.then(function () {
                $log.debug('Change state of short code:', shortCode.ShortCode);

                // Workflows special short code object
                var shortCodeItem = {
                    "from": {
                        "userId": $scope.username,
                        "orgId": $scope.sessionOrganization.name,
                        "groupId": null
                    },
                    "to": {
                        "userId": null,
                        "orgId": null,
                        "groupId": CMPFService.DSP_BUSINESS_ADMIN_GROUP
                    },
                    "shortCodeId": shortCode.profileId,
                    "shortCode": shortCode.ShortCode,
                    "fee": shortCode.Fee,
                    "providerId": shortCode.ProviderID,
                    // Changed values
                    "status": newState
                };

                // Override the providerId with the organization id of the logged in user.
                if (shortCode.Status === 'FREE') {
                    shortCodeItem.providerId = $scope.sessionOrganization.id;
                }

                $log.debug('Trying to update short code: ', shortCodeItem);

                // Short code update method of the flow service.
                WorkflowsService.updateShortCode(shortCodeItem).then(function (response) {
                    if (response && response.code === 2001) {
                        notification.flash({
                            type: 'success',
                            text: $translate.instant('PartnerInfo.ShortCodes.Messages.ShortCodeUpdateFlowStartedSuccessful')
                        });

                        $state.transitionTo($state.current, {}, {reload: true, inherit: true, notify: true});
                    } else {
                        WorkflowsService.showApiError(response);
                    }
                }, function (response) {
                    $log.error('Cannot call the short code update flow. Error: ', response);

                    if (response && response.data && response.data.message) {
                        WorkflowsService.showApiError(response);
                    } else {
                        notification({
                            type: 'warning',
                            text: $translate.instant('PartnerInfo.ShortCodes.Messages.ShortCodeUpdateFlowError')
                        });
                    }
                });

                shortCode.rowSelected = false;
            }, function () {
                shortCode.rowSelected = false;
            });
        };

        $scope.cancel = function () {
            $scope.go('partner-info.shortcodes.list');
        };
    });

    PartnerInfoShortCodeOperationsShortCodesModule.controller('PartnerInfoShortCodeOperationsShortCodesCtrl', function ($scope, $log, $filter, $uibModal, $controller, $translate, notification, NgTableParams, NgTableService, Restangular,
                                                                                                                        DateTimeConstants, CMPFService, SessionService, WorkflowsService, DEFAULT_REST_QUERY_LIMIT, shortCodesOrganization) {
        $log.debug('PartnerInfoShortCodeOperationsShortCodesCtrl');

        $controller('PartnerInfoShortCodeOperationsShortCodesCommonCtrl', {
            $scope: $scope
        });

        $scope.shortCodesOrganization = shortCodesOrganization.organizations[0];

        $scope.shortCodes = CMPFService.getShortCodes($scope.shortCodesOrganization);
        $scope.shortCodes = _.filter($scope.shortCodes, function (shortCode) {
            return shortCode.ProviderID === $scope.sessionOrganization.id || shortCode.Status === 'FREE';
        });
        $scope.shortCodes = $filter('orderBy')($scope.shortCodes, 'profileId');

        $scope.originalShortCodes = angular.copy($scope.shortCodes);

        $scope.stateFilter = 'ALL';
        $scope.stateFilterChange = function (state) {
            if (state !== 'ALL') {
                if (state === 'WAITING') {
                    $scope.shortCodeList.list = [];
                    WorkflowsService.getPendingTasks(0, DEFAULT_REST_QUERY_LIMIT, 'SHORT_CODE').then(function (waitingShortCodeTasks) {
                        if (waitingShortCodeTasks && waitingShortCodeTasks.length > 0) {
                            _.each(waitingShortCodeTasks, function (shortCodeTask) {
                                if (shortCodeTask && shortCodeTask.name && (shortCodeTask.name.toLowerCase() === 'short code update task') &&
                                    (shortCodeTask.objectDetail.status === 'APPLIED')) {
                                    shortCodeTask.objectDetail.taskObjectId = shortCodeTask.shortCodeId || _.uniqueId();
                                    shortCodeTask.objectDetail.parentName = CMPFService.DEFAULT_ORGANIZATION_NAME;
                                    shortCodeTask.objectDetail.state = 'WAITING FOR APPROVAL';
                                    shortCodeTask.objectDetail.taskName = shortCodeTask.name;

                                    shortCodeTask.objectDetail.profileId = shortCodeTask.objectDetail.shortCodeId;
                                    shortCodeTask.objectDetail.ShortCode = shortCodeTask.objectDetail.shortCode;
                                    shortCodeTask.objectDetail.Status = shortCodeTask.objectDetail.status;

                                    $scope.shortCodeList.list.push(shortCodeTask.objectDetail);
                                }
                            });
                        }

                        $scope.shortCodeList.tableParams.page(1);
                        $scope.shortCodeList.tableParams.reload();
                    });
                } else {
                    $scope.shortCodeList.list = _.where($scope.originalShortCodes, {Status: state});
                }
            } else {
                $scope.shortCodeList.list = angular.copy($scope.originalShortCodes);
            }

            $scope.shortCodeList.tableParams.page(1);
            $scope.shortCodeList.tableParams.reload();
        };

        // Task details modal window.
        $scope.showTaskDetails = function (shortCode) {
            shortCode.rowSelected = true;

            var modalInstance = $uibModal.open({
                animation: false,
                templateUrl: 'partials/modal/empty.modal.html',
                controller: function ($scope, $controller, $uibModalInstance, taskDetail) {
                    $controller('WorkflowsOperationsTasksDetailShortCodeCtrl', {
                        $scope: $scope,
                        taskDetail: taskDetail
                    });

                    $scope.isModal = true;
                    $scope.modalTitle = shortCode.taskName;
                    $scope.templateUrl = 'workflows/operations/operations.tasks.shortcodes.detail.html';

                    $scope.close = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                size: 'lg',
                resolve: {
                    taskDetail: function () {
                        return {
                            shortCodeTask: {
                                objectDetail: shortCode
                            }
                        };
                    }
                }
            });

            modalInstance.result.then(function () {
                shortCode.rowSelected = false;
            }, function () {
                shortCode.rowSelected = false;
            });
        };

        // Table export options
        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'profileId',
                    headerKey: 'PartnerInfo.ShortCodes.Id'
                },
                {
                    fieldName: 'ShortCode',
                    headerKey: 'PartnerInfo.ShortCodes.ShortCode'
                },
                {
                    fieldName: 'LastUpdateTime',
                    headerKey: 'CommonLabels.LastUpdateTime',
                    filter: {name: 'date', params: ['yyyy-MM-dd HH:mm:ss', DateTimeConstants.OFFSET]}
                },
                {
                    fieldName: 'Status',
                    headerKey: 'CommonLabels.State'
                },
                {
                    fieldName: 'Fee',
                    headerKey: 'PartnerInfo.ShortCodes.Fee'
                },
                {
                    fieldName: 'CommandHelpEnabled',
                    headerKey: 'PartnerInfo.ShortCodes.CommandHelpEnabled',
                    filter: {name: 'YesNoFilter'}
                },
                {
                    fieldName: 'CommandHelpMessage',
                    headerKey: 'PartnerInfo.ShortCodes.CommandHelpMessage'
                },
                {
                    fieldName: 'CommandHelpMessageOtherLang',
                    headerKey: 'PartnerInfo.ShortCodes.CommandHelpMessageOtherLang'
                }
            ]
        };

        // Short code list
        $scope.shortCodeList = {
            list: $scope.shortCodes,
            tableParams: {}
        };

        $scope.shortCodeList.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "profileId": 'asc'
            }
        }, {
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.shortCodeList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.shortCodeList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - Short code list

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.shortCodeList.tableParams.settings().$scope.filterText = filterText;
            $scope.shortCodeList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.shortCodeList.tableParams.page(1);
            $scope.shortCodeList.tableParams.reload();
        }, 500);
    });

    PartnerInfoShortCodeOperationsShortCodesModule.controller('PartnerInfoShortCodeOperationsShortCodesUpdateCtrl', function ($scope, $log, $controller, $stateParams, $uibModal, $filter, $translate, notification, CMPFService,
                                                                                                                              SessionService, WorkflowsService, shortCodesOrganization, shortCode) {
        $log.debug('PartnerInfoShortCodeOperationsShortCodesUpdateCtrl');

        $controller('PartnerInfoShortCodeOperationsShortCodesCommonCtrl', {
            $scope: $scope,
            shortCodesOrganization: shortCodesOrganization
        });

        var id = $stateParams.id;

        var sessionOrganization = SessionService.getSessionOrganization();
        var username = SessionService.getUsername();

        $scope.shortCodesOrganization = shortCodesOrganization;

        // ShortCodeProfile
        var shortCodeProfiles = CMPFService.getProfileAttributes([shortCode], CMPFService.ORGANIZATION_SHORT_CODE_PROFILE);
        $scope.shortCode = shortCodeProfiles[0];
        $scope.shortCode.Fee = Number($scope.shortCode.Fee);

        $scope.originalShortCode = angular.copy($scope.shortCode);
        $scope.isNotChanged = function () {
            return angular.equals($scope.originalShortCode, $scope.shortCode);
        };

        $scope.save = function (shortCode) {
            // Workflows special short code object
            var shortCodeItem = {
                "from": {
                    "userId": username,
                    "orgId": sessionOrganization.name,
                    "groupId": null
                },
                "to": {
                    "userId": null,
                    "orgId": null,
                    "groupId": CMPFService.DSP_BUSINESS_ADMIN_GROUP
                },
                "shortCodeId": $scope.originalShortCode.profileId,
                "providerId": $scope.originalShortCode.ProviderID,
                "shortCode": $scope.originalShortCode.ShortCode,
                "status": $scope.originalShortCode.Status,
                // Changed values
                "fee": shortCode.Fee
            };

            if (shortCodeItem.status === 'USED') {
                shortCodeItem.commandHelpEnabled = shortCode.CommandHelpEnabled;
                shortCodeItem.commandHelpMessage = shortCode.CommandHelpMessage;
                shortCodeItem.commandHelpMessageOtherLang = shortCode.CommandHelpMessageOtherLang;
            } else {
                shortCodeItem.commandHelpEnabled = true;
                shortCodeItem.commandHelpMessage = '';
                shortCodeItem.commandHelpMessageOtherLang = '';
            }

            $log.debug('Trying to update short code: ', shortCodeItem);

            // Short code update method of the flow service.
            WorkflowsService.updateShortCode(shortCodeItem).then(function (response) {
                if (response && response.code === 2001) {
                    notification.flash({
                        type: 'success',
                        text: $translate.instant('PartnerInfo.ShortCodes.Messages.ShortCodeUpdateFlowStartedSuccessful')
                    });

                    $scope.cancel();
                } else {
                    WorkflowsService.showApiError(response);
                }
            }, function (response) {
                $log.error('Cannot call the short code update flow. Error: ', response);

                if (response && response.data && response.data.message) {
                    WorkflowsService.showApiError(response);
                } else {
                    notification({
                        type: 'warning',
                        text: $translate.instant('PartnerInfo.ShortCodes.Messages.ShortCodeUpdateFlowError')
                    });
                }
            });
        };
    });

})();
