(function () {

    'use strict';

    angular.module('adminportal.subsystems.provisioning.operations.shortcodes', []);

    var ProvisioningOperationsShortCodesModule = angular.module('adminportal.subsystems.provisioning.operations.shortcodes');

    ProvisioningOperationsShortCodesModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.provisioning.operations.shortcodes', {
            abstract: true,
            url: "/short-codes",
            template: '<div ui-view></div>',
            data: {
                exportFileName: 'ShortCodes',
                permissions: [
                    'CMPF__OPERATIONS_SHORTCODE_READ'
                ]
            }
        }).state('subsystems.provisioning.operations.shortcodes.list', {
            url: "",
            templateUrl: "subsystems/provisioning/operations/shortcodes/operations.shortcodes.html",
            controller: 'ProvisioningOperationsShortCodesCtrl',
            resolve: {
                shortCodesOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_SHORT_CODES_ORGANIZATION_NAME);
                },
                allOrganizations: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizations(false, true, [CMPFService.OPERATOR_PROFILE]);
                }
            }
        }).state('subsystems.provisioning.operations.shortcodes.new', {
            url: "/new",
            templateUrl: "subsystems/provisioning/operations/shortcodes/operations.shortcodes.details.html",
            controller: 'ProvisioningOperationsShortCodesNewCtrl',
            resolve: {
                shortCodesOrganization: function (CMPFService) {
                    return CMPFService.getOrganizationByName(CMPFService.DEFAULT_SHORT_CODES_ORGANIZATION_NAME);
                }
            }
        }).state('subsystems.provisioning.operations.shortcodes.update', {
            url: "/update/:id",
            templateUrl: "subsystems/provisioning/operations/shortcodes/operations.shortcodes.details.html",
            controller: 'ProvisioningOperationsShortCodesUpdateCtrl',
            resolve: {
                shortCodesOrganization: function (CMPFService) {
                    return CMPFService.getOrganizationByName(CMPFService.DEFAULT_SHORT_CODES_ORGANIZATION_NAME);
                },
                shortCode: function ($stateParams, CMPFService) {
                    return CMPFService.getProfile($stateParams.id);
                },
                allOrganizations: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizations(false, true, [CMPFService.OPERATOR_PROFILE]);
                }
            }
        });

    });

    ProvisioningOperationsShortCodesModule.controller('ProvisioningOperationsShortCodesCommonCtrl', function ($rootScope, $scope, $log, $q, $state, $filter, $uibModal, notification, $translate, CMPFService, SessionService,
                                                                                                              WorkflowsService, SHORT_CODES_STATUS_TYPES) {
        $log.debug('ProvisioningOperationsShortCodesCommonCtrl');

        var sessionOrganization = SessionService.getSessionOrganization();
        var username = SessionService.getUsername();

        $scope.SHORT_CODES_STATUS_TYPES = SHORT_CODES_STATUS_TYPES;

        $scope.selectedOrganization = {};

        $scope.openOrganizations = function (shortCode) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.organizations.html',
                controller: 'OrganizationsModalInstanceCtrl',
                size: 'lg',
                resolve: {
                    organizationParameter: function () {
                        return angular.copy($scope.selectedOrganization);
                    },
                    itemName: function () {
                        return shortCode.ShortCode;
                    },
                    allOrganizations: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                        return CMPFService.getAllOrganizations(false, true, [CMPFService.OPERATOR_PROFILE]);
                    },
                    organizationsModalTitleKey: function () {
                        return 'Subsystems.Provisioning.ShortCodes.OrganizationsModalTitle';
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
                $scope.selectedOrganization = selectedItem.organization;
                shortCode.ProviderID = $scope.selectedOrganization.id;
            }, function () {
            });
        };

        $scope.removeSelectedOrganization = function () {
            $scope.selectedOrganization = {};
        };

        $scope.startShortCodeStateFlow = function (shortCode, newState) {
            shortCode.rowSelected = true;

            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: function ($scope, $uibModalInstance, $translate, $controller, $sce) {
                    var message = '';
                    if (newState === 'IN_REVIEW') {
                        message = $translate.instant('Subsystems.Provisioning.ShortCodes.Messages.ReviewConfirmationMessage');
                    } else if (newState === 'USED') {
                        message = $translate.instant('Subsystems.Provisioning.ShortCodes.Messages.AcceptConfirmationMessage');
                    } else if (newState === 'FREE') {
                        message = $translate.instant('Subsystems.Provisioning.ShortCodes.Messages.RejectConfirmationMessage');
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
                        "isAdmin": $rootScope.isAdminUser,
                        "userId": username,
                        "orgId": sessionOrganization.name,
                        "groupId": null
                    },
                    "to": {
                        "userId": null,
                        "orgId": null,
                        "groupId": CMPFService.DSP_ADMIN_GROUP
                    },
                    "shortCodeId": shortCode.profileId,
                    "shortCode": shortCode.ShortCode,
                    "fee": shortCode.Fee,
                    "providerId": shortCode.ProviderID,
                    // Changed values
                    "status": newState
                };

                $log.debug('Trying to update short code: ', shortCodeItem);

                // Short code update method of the flow service.
                WorkflowsService.updateShortCode(shortCodeItem).then(function (response) {
                    if (response && response.code === 2001) {
                        notification.flash({
                            type: 'success',
                            text: $translate.instant('Subsystems.Provisioning.ShortCodes.Messages.ShortCodeUpdateFlowStartedSuccessful' + ($rootScope.isAdminUser ? 'ForAdmin' : ''))
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
                            text: $translate.instant('Subsystems.Provisioning.ShortCodes.Messages.ShortCodeUpdateFlowError')
                        });
                    }
                });

                shortCode.rowSelected = false;
            }, function () {
                shortCode.rowSelected = false;
            });
        };

        var tempCommandFields = {};
        $scope.$watch('shortCode.Status', function (newValue, oldValue) {
            if ((newValue !== oldValue) && newValue) {
                if (newValue !== 'USED') {
                    tempCommandFields.CommandHelpEnabled = angular.copy($scope.shortCode.CommandHelpEnabled);
                    $scope.shortCode.CommandHelpEnabled = true;

                    tempCommandFields.CommandHelpMessage = angular.copy($scope.shortCode.CommandHelpMessage);
                    $scope.shortCode.CommandHelpMessage = '';

                    tempCommandFields.CommandHelpMessageOtherLang = angular.copy($scope.shortCode.CommandHelpMessageOtherLang);
                    $scope.shortCode.CommandHelpMessageOtherLang = '';
                } else {
                    $scope.shortCode.CommandHelpEnabled = angular.copy(tempCommandFields.CommandHelpEnabled);
                    $scope.shortCode.CommandHelpMessage = angular.copy(tempCommandFields.CommandHelpMessage);
                    $scope.shortCode.CommandHelpMessageOtherLang = angular.copy(tempCommandFields.CommandHelpMessageOtherLang);
                }
            }
        });

        $scope.cancel = function () {
            $state.go('subsystems.provisioning.operations.shortcodes.list');
        };
    });

    ProvisioningOperationsShortCodesModule.controller('ProvisioningOperationsShortCodesCtrl', function ($scope, $log, $controller, $state, $uibModal, $filter, $translate, notification, NgTableParams, NgTableService,
                                                                                                        DEFAULT_REST_QUERY_LIMIT, DateTimeConstants, CMPFService, WorkflowsService, shortCodesOrganization,
                                                                                                        allOrganizations) {
        $log.debug('ProvisioningOperationsShortCodesCtrl');

        $controller('ProvisioningOperationsShortCodesCommonCtrl', {
            $scope: $scope
        });

        $scope.shortCodesOrganization = shortCodesOrganization.organizations[0];
        $scope.shortCodes = CMPFService.getShortCodes($scope.shortCodesOrganization);
        $scope.shortCodes = $filter('orderBy')($scope.shortCodes, 'profileId');

        _.each($scope.shortCodes, function (shortCode) {
            var foundOrganization = _.findWhere(allOrganizations.organizations, {id: Number(shortCode.ProviderID)});
            if (foundOrganization) {
                shortCode.Provider = foundOrganization;
            } else {
                shortCode.Provider = {
                    name: 'N/A'
                }
            }
        });
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

                                    var foundOrganization = _.findWhere(allOrganizations.organizations, {id: Number(shortCodeTask.objectDetail.providerId)});
                                    if (foundOrganization) {
                                        shortCodeTask.objectDetail.Provider = foundOrganization;
                                    } else {
                                        shortCodeTask.objectDetail.Provider = {
                                            name: 'N/A'
                                        };
                                    }

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
                controller: function ($scope, $controller, $uibModalInstance, allOrganizations, taskDetail) {
                    $controller('WorkflowsOperationsTasksDetailShortCodeCtrl', {
                        $scope: $scope,
                        allOrganizations: allOrganizations,
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
                    allOrganizations: function (CMPFService, DEFAULT_REST_QUERY_LIMIT, UtilService) {
                        return CMPFService.getAllOrganizations(false, true, [CMPFService.OPERATOR_PROFILE]);
                    },
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

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'profileId',
                    headerKey: 'Subsystems.Provisioning.ShortCodes.Id'
                },
                {
                    fieldName: 'ShortCode',
                    headerKey: 'Subsystems.Provisioning.ShortCodes.ShortCode'
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
                    fieldName: 'Provider.name',
                    headerKey: 'GenericFormFields.Organization.Label'
                },
                {
                    fieldName: 'Fee',
                    headerKey: 'Subsystems.Provisioning.ShortCodes.Fee'
                },
                {
                    fieldName: 'CommandHelpEnabled',
                    headerKey: 'Subsystems.Provisioning.ShortCodes.CommandHelpEnabled',
                    filter: {name: 'YesNoFilter'}
                },
                {
                    fieldName: 'CommandHelpMessage',
                    headerKey: 'Subsystems.Provisioning.ShortCodes.CommandHelpMessage'
                },
                {
                    fieldName: 'CommandHelpMessageOtherLang',
                    headerKey: 'Subsystems.Provisioning.ShortCodes.CommandHelpMessageOtherLang'
                }
            ]
        };

        // ShortCode list
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
            total: $scope.shortCodeList.list.length, // length of data
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
        // END - ShortCode list

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.shortCodeList.tableParams.settings().$scope.filterText = filterText;
            $scope.shortCodeList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.shortCodeList.tableParams.page(1);
            $scope.shortCodeList.tableParams.reload();
        }, 750);

        $scope.remove = function (shortCode) {
            shortCode.rowSelected = true;

            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                shortCode.rowSelected = false;

                CMPFService.deleteOrganizationProfile($scope.shortCodesOrganization.id, shortCode).then(function (response) {
                    var deletedListItem = _.findWhere($scope.shortCodeList.list, {profileId: shortCode.profileId});
                    $scope.shortCodeList.list = _.without($scope.shortCodeList.list, deletedListItem);
                    $scope.originalShortCodes = angular.copy($scope.shortCodeList.list);

                    $scope.shortCodeList.tableParams.reload();

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                }, function (response) {
                    CMPFService.showApiError(response);
                });
            }, function () {
                shortCode.rowSelected = false;
            });
        };
    });

    ProvisioningOperationsShortCodesModule.controller('ProvisioningOperationsShortCodesNewCtrl', function ($scope, $log, $controller, $filter, $translate, notification, UtilService, CMPFService,
                                                                                                           shortCodesOrganization) {
        $log.debug('ProvisioningOperationsShortCodesNewCtrl');

        $controller('ProvisioningOperationsShortCodesCommonCtrl', {
            $scope: $scope
        });

        $scope.shortCodesOrganization = shortCodesOrganization;

        $scope.SHORT_CODES_STATUS_TYPES = _.filter($scope.SHORT_CODES_STATUS_TYPES, function (statusType) {
            return statusType !== 'PENDING';
        });

        $scope.shortCode = {
            ShortCode: '',
            Status: 'FREE',
            Fee: 0.0,
            LastUpdateTime: null,
            CommandHelpEnabled: false,
            CommandHelpMessage: '',
            CommandHelpMessageOtherLang: ''
        };

        $scope.$watch('shortCode.ShortCode', function (newVal, oldVal) {
            if (newVal !== oldVal) {
                UtilService.setError($scope.form, 'ShortCode', 'availabilityCheck', true);
            }
        });

        $scope.save = function (shortCode) {
            CMPFService.getOrganizationByShortCode(shortCode.ShortCode).then(function (response) {
                if (response && response.organizations && response.organizations.length > 0) {
                    UtilService.setError($scope.form, 'ShortCode', 'availabilityCheck', false);
                } else {
                    UtilService.setError($scope.form, 'ShortCode', 'availabilityCheck', true);

                    // Update the last update time for create first time or for update everytime.
                    shortCode.LastUpdateTime = $filter('date')(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss');

                    var shortCodeProfileAttrArray = CMPFService.prepareProfile(shortCode, null);
                    var newShortCodeProfile = {
                        name: CMPFService.ORGANIZATION_SHORT_CODE_PROFILE,
                        profileDefinitionName: CMPFService.ORGANIZATION_SHORT_CODE_PROFILE,
                        attributes: shortCodeProfileAttrArray
                    };

                    CMPFService.createOrganizationProfile($scope.shortCodesOrganization.id, newShortCodeProfile).then(function (response) {
                        notification.flash({
                            type: 'success',
                            text: $translate.instant('CommonLabels.OperationSuccessful')
                        });

                        $scope.go('subsystems.provisioning.operations.shortcodes.list');
                    }, function (response) {
                        CMPFService.showApiError(response);
                    });
                }
            });
        };
    });

    ProvisioningOperationsShortCodesModule.controller('ProvisioningOperationsShortCodesUpdateCtrl', function ($rootScope, $scope, $log, $controller, $stateParams, $uibModal, $filter, $translate, notification,
                                                                                                              CMPFService, SessionService, WorkflowsService, shortCodesOrganization, shortCode, allOrganizations) {
        $log.debug('ProvisioningOperationsShortCodesUpdateCtrl');

        $controller('ProvisioningOperationsShortCodesCommonCtrl', {
            $scope: $scope
        });

        var sessionOrganization = SessionService.getSessionOrganization();
        var username = SessionService.getUsername();

        $scope.shortCodesOrganization = shortCodesOrganization;

        // ShortCodeProfile
        var shortCodeProfiles = CMPFService.getProfileAttributes([shortCode], CMPFService.ORGANIZATION_SHORT_CODE_PROFILE);
        $scope.shortCode = shortCodeProfiles[0];
        $scope.shortCode.Fee = Number($scope.shortCode.Fee);

        $scope.selectedOrganization = _.findWhere(allOrganizations.organizations, {id: Number($scope.shortCode.ProviderID)});

        $scope.originalShortCode = angular.copy($scope.shortCode);
        $scope.originalSelectedOrganization = angular.copy($scope.selectedOrganization);
        $scope.isNotChanged = function () {
            return angular.equals($scope.originalShortCode, $scope.shortCode) &&
                angular.equals($scope.originalSelectedOrganization, $scope.selectedOrganization);
        };

        $scope.saveOnCMPF = function (shortCode) {
            $scope.updateShortCode($scope.shortCodesOrganization, shortCode).then(function (response) {
                notification.flash({
                    type: 'success',
                    text: $translate.instant('CommonLabels.OperationSuccessful')
                });

                $scope.go('subsystems.provisioning.operations.shortcodes.list');
            }, function (response) {
                CMPFService.showApiError(response);
            });
        };

        var saveShortCode = function (shortCode) {
            // Workflows special short code object
            var shortCodeItem = {
                "from": {
                    "isAdmin": $rootScope.isAdminUser,
                    "userId": username,
                    "orgId": sessionOrganization.name,
                    "groupId": null
                },
                "to": {
                    "userId": null,
                    "orgId": null,
                    "groupId": CMPFService.DSP_ADMIN_GROUP
                },
                "shortCodeId": $scope.originalShortCode.profileId,
                "shortCode": $scope.originalShortCode.ShortCode,
                // Changed values
                "status": shortCode.Status,
                "providerId": shortCode.ProviderID,
                "fee": shortCode.Fee,
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
                        text: $translate.instant('Subsystems.Provisioning.ShortCodes.Messages.ShortCodeUpdateFlowStartedSuccessful' + ($rootScope.isAdminUser ? 'ForAdmin' : ''))
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
                        text: $translate.instant('Subsystems.Provisioning.ShortCodes.Messages.ShortCodeUpdateFlowError')
                    });
                }
            });
        };

        $scope.save = function (shortCode) {
            shortCode.rowSelected = true;

            $log.debug('Updating short code:', shortCode);

            if (shortCode.Status !== $scope.originalShortCode.Status &&
                (shortCode.Status === 'IN_REVIEW' || shortCode.Status === 'USED' || shortCode.Status === 'FREE')) {
                var modalInstance = $uibModal.open({
                    templateUrl: 'partials/modal/modal.confirmation.html',
                    controller: function ($scope, $uibModalInstance, $translate, $controller, $sce) {
                        var message = '';
                        if (shortCode.Status === 'IN_REVIEW') {
                            message = $translate.instant('Subsystems.Provisioning.ShortCodes.Messages.ReviewConfirmationMessage');
                        } else if (shortCode.Status === 'USED') {
                            message = $translate.instant('Subsystems.Provisioning.ShortCodes.Messages.AcceptConfirmationMessage');
                        } else if (shortCode.Status === 'FREE') {
                            message = $translate.instant('Subsystems.Provisioning.ShortCodes.Messages.RejectConfirmationMessage');
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
                    shortCode.rowSelected = false;

                    saveShortCode(shortCode);
                }, function () {
                    shortCode.rowSelected = false;
                });
            } else {
                saveShortCode(shortCode);
            }
        };
    });

})();
