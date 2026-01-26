(function () {

    'use strict';

    angular.module('adminportal.products.bulkmessaging.operations.screeninglists', [
        'adminportal.products.bulkmessaging.operations.screeninglists.global',
        'adminportal.products.bulkmessaging.operations.screeninglists.perorganization',
        'adminportal.products.bulkmessaging.operations.screeninglists.peruser'
    ]);

    var BulkMessagingScreeningListsOperationsModule = angular.module('adminportal.products.bulkmessaging.operations.screeninglists');

    BulkMessagingScreeningListsOperationsModule.config(function ($stateProvider) {

        $stateProvider.state('products.bulkmessaging.operations.screeninglists', {
            abstract: true,
            url: "/screening-lists",
            template: "<div ui-view></div>"
        });

    });

    BulkMessagingScreeningListsOperationsModule.controller('BulkMessagingScreeningListsOrganizationsCtrl', function ($rootScope, $scope, $log, $q, $state, $stateParams, $translate, notification, CMPFService, BulkMessagingOperationsService,
                                                                                                                     organizations) {
        $log.debug("BulkMessagingScreeningListsOrganizationsCtrl");

        if (!$rootScope.isBMSAdminUser) {
            $state.params.doNotResolveEntities = true;
            $state.transitionTo($state.$current,
                {
                    organizationId: $rootScope.systemUserOrganizationId,
                    listName: $stateParams.listName ? $stateParams.listName : undefined
                },
                {
                    reload: false,
                    inherit: false,
                    notify: true
                }
            );
        }

        $scope.organizationId = $stateParams.organizationId ? Number($stateParams.organizationId) : null;

        // Organization list
        if (organizations && organizations.organizations) {
            $scope.organizationList = _.filter(organizations.organizations, function (organization) {
                return CMPFService.getBulkOrganizationProfile(organization) !== undefined;
            });
        }

        var getLists = function (organizationId) {
            var deferred = $q.defer();

            if (organizationId) {
                BulkMessagingOperationsService.getDistributionListsPerOrganization(organizationId, 'USER_BLACKLIST').then(function (organizationResponse) {
                    deferred.resolve(organizationResponse.lists);
                }, function (response) {
                    notification({
                        type: 'warning',
                        text: $translate.instant('Products.BulkMessaging.Operations.Messages.OrganizationNotFound')
                    });
                    deferred.resolve(null);
                });
            } else {
                deferred.resolve(null);
            }

            return deferred.promise;
        };

        var changeStateBySelection = function (organizationId, callback) {
            $state.transitionTo($state.$current,
                {
                    organizationId: organizationId ? organizationId : undefined,
                    listName: $stateParams.listName ? $stateParams.listName : undefined
                },
                {
                    reload: false, inherit: false, notify: false
                }
            ).then(callback || function () {
            });
        };

        // Organization selection.
        $scope.changeOrganization = function (organizationId) {
            $log.debug("Selected organization: ", organizationId);

            $scope.showTable = false;

            $scope.organizationId = organizationId;

            $state.params.doNotResolveEntities = true;
            changeStateBySelection($scope.organizationId, function () {
                if ($scope.organizationId) {
                    getLists($scope.organizationId).then(function (response) {
                        var foundOrganization = _.findWhere($scope.organizationList, {id: $scope.organizationId});
                        $scope.$parent.organizationName = foundOrganization ? foundOrganization.name : 'N/A';

                        $scope.showTable = true;

                        $scope.screeningListsList.list = response;
                        $scope.screeningListsList.tableParams.page(1);
                        $scope.screeningListsList.tableParams.reload();
                    });
                }
            });
        };

        if ($scope.organizationId) {
            $state.params.doNotResolveEntities = true;
            changeStateBySelection($scope.organizationId, function () {
                getLists($scope.organizationId).then(function (response) {
                    if ($rootScope.isBMSAdminUser) {
                        var foundOrganization = _.findWhere($scope.organizationList, {id: $scope.organizationId});
                        $scope.$parent.organizationName = foundOrganization ? foundOrganization.name : 'N/A';
                    } else {
                        $scope.$parent.organizationName = $rootScope.systemUserOrganizationName;
                    }

                    $scope.showTable = true;

                    $scope.screeningListsList.list = response;
                    $scope.screeningListsList.tableParams.page(1);
                    $scope.screeningListsList.tableParams.reload();
                });
            });
        }
    });

    BulkMessagingScreeningListsOperationsModule.controller('BulkMessagingScreeningListsOrganizationsUserAccountsCtrl', function ($rootScope, $scope, $log, $q, $state, $stateParams, $translate, notification, CMPFService, BulkMessagingOperationsService,
                                                                                                                                 organizations, DEFAULT_REST_QUERY_LIMIT) {
        $log.debug("BulkMessagingScreeningListsOrganizationsUserAccountsCtrl");

        if (!$rootScope.isBMSAdminUser) {
            $state.params.doNotResolveEntities = true;
            $state.transitionTo($state.$current,
                {
                    organizationId: $rootScope.systemUserOrganizationId,
                    userId: $rootScope.systemUserId,
                    listName: $stateParams.listName ? $stateParams.listName : undefined
                },
                {
                    reload: false,
                    inherit: false,
                    notify: true
                }
            );
        }

        $scope.organizationId = $stateParams.organizationId ? Number($stateParams.organizationId) : null;
        $scope.userId = $stateParams.userId ? Number($stateParams.userId) : null;

        // Organization list
        if (organizations && organizations.organizations) {
            $scope.organizationList = _.filter(organizations.organizations, function (organization) {
                return CMPFService.getBulkOrganizationProfile(organization) !== undefined;
            });
        }

        var getLists = function (userId) {
            var deferred = $q.defer();

            if (userId) {
                BulkMessagingOperationsService.getDistributionListsPerUser(userId, 'USER_BLACKLIST').then(function (response) {
                    deferred.resolve(response.lists);
                }, function (response) {
                    notification({
                        type: 'warning',
                        text: $translate.instant('Products.BulkMessaging.Operations.Messages.UserNotFound')
                    });

                    deferred.resolve(null);
                });
            } else {
                deferred.resolve(null);
            }

            return deferred.promise;
        };

        $scope.userAccountList = [];
        var getUserAccounts = function (organizationId) {
            // Find out the users of the selected organization.
            return CMPFService.getUserAccountsByOrganizationId(0, DEFAULT_REST_QUERY_LIMIT, false, true, organizationId).then(function (userAccounts) {
                if (userAccounts && userAccounts.userAccounts) {
                    // Filter out the bulk messaging users and whether these are bulk sms users.
                    $scope.userAccountList = _.filter(userAccounts.userAccounts, function (userAccount) {
                        var bulkUserProfile = CMPFService.extractBulkUserProfile(userAccount);
                        if (!_.isEmpty(bulkUserProfile)) {
                            if ($rootScope.isBMSAdminUser) {
                                var foundOrganization = _.findWhere($scope.organizationList, {id: userAccount.organizationId});

                                return foundOrganization && bulkUserProfile.isBulkSmsUser;
                            } else {
                                return bulkUserProfile.isBulkSmsUser;
                            }
                        }

                        return false;
                    });
                }
            });
        }

        var changeStateBySelection = function (organizationId, userId, callback) {
            $state.transitionTo($state.$current,
                {
                    organizationId: organizationId ? organizationId : undefined,
                    userId: userId ? userId : undefined,
                    listName: $stateParams.listName ? $stateParams.listName : undefined
                },
                {
                    reload: false, inherit: false, notify: false
                }
            ).then(callback || function () {
            });
        };

        // Organization selection.
        $scope.changeOrganization = function (organizationId) {
            $log.debug("Selected organization: ", organizationId);

            $scope.showTable = false;

            $scope.organizationId = organizationId;
            $scope.userId = null;
            $scope.userAccountList = [];

            $state.params.doNotResolveEntities = true;
            changeStateBySelection($scope.organizationId, $scope.userId, function () {
                if ($scope.organizationId) {
                    var foundOrganization = _.findWhere($scope.organizationList, {id: $scope.organizationId});
                    $scope.$parent.organizationName = foundOrganization ? foundOrganization.name : 'N/A';

                    getUserAccounts($scope.organizationId);
                }
            });
        };

        // User selection.
        $scope.changeUserAccount = function (userId) {
            $log.debug("Selected user account: ", userId);

            $scope.showTable = false;

            $scope.userId = userId;

            $state.params.doNotResolveEntities = true;
            changeStateBySelection($scope.organizationId, $scope.userId, function () {
                if ($scope.userId) {
                    var foundUserAccount = _.findWhere($scope.userAccountList, {id: $scope.userId});
                    $scope.$parent.userAccountName = foundUserAccount ? foundUserAccount.userName : 'N/A';

                    getLists($scope.userId).then(function (response) {
                        $scope.showTable = true;

                        $scope.screeningListsList.list = response;
                        $scope.screeningListsList.tableParams.page(1);
                        $scope.screeningListsList.tableParams.reload();
                    });
                }
            });
        };

        if ($scope.organizationId && $scope.userId) {
            $state.params.doNotResolveEntities = true;
            changeStateBySelection($scope.organizationId, $scope.userId, function () {
                getUserAccounts($scope.organizationId).then(function () {
                    getLists($scope.userId).then(function (response) {
                        if ($rootScope.isBMSAdminUser) {
                            var foundOrganization = _.findWhere($scope.organizationList, {id: $scope.organizationId});
                            $scope.$parent.organizationName = foundOrganization ? foundOrganization.name : 'N/A';
                        } else {
                            $scope.$parent.organizationName = $rootScope.systemUserOrganizationName;
                        }

                        var foundUserAccount = _.findWhere($scope.userAccountList, {id: $scope.userId});
                        $scope.$parent.userAccountName = foundUserAccount ? foundUserAccount.userName : 'N/A';

                        $scope.showTable = true;

                        $scope.screeningListsList.list = response;
                        $scope.screeningListsList.tableParams.page(1);
                        $scope.screeningListsList.tableParams.reload();
                    });
                });
            });
        }
    });

    BulkMessagingScreeningListsOperationsModule.controller('BulkMessagingScreeningListsOperationsCommonCtrl', function ($scope, $rootScope, $log, $q, $controller, $state, $stateParams, $timeout, notification, $translate, Upload,
                                                                                                                        CMPFService, UtilService, SERVICES_BASE) {
        $log.debug('BulkMessagingScreeningListsOperationsCommonCtrl');

        $scope.action = 'Append';

        if ($state.current.data.listType === 'GLOBAL') {
            $scope.showTable = true;
        }
        $scope.showFilter = false;

        $scope.uploadFile = function (action, file, listName) {
            var deferred = $q.defer();

            var url;
            var dataObj = {
                filename: file.name // this is needed for Flash polyfill IE8-9
            };

            // Change the parameter name according to the value of the action argument.
            if (action === 'Remove') {
                dataObj.removeFromList = file;
                url = '/bms-bulkmsg-operations-gr-rest/v1/dlists/upload/removecontent/' + listName;
            } else {
                dataObj.addToList = file;
                url = '/bms-bulkmsg-operations-gr-rest/v1/dlists/upload/addcontent/' + listName;
            }

            UtilService.addPromiseToTracker(deferred.promise);

            $log.debug('Uploading screening list file: ', file);

            file.upload = Upload.upload({
                method: 'POST',
                url: SERVICES_BASE + url,
                headers: {
                    'ServiceLabel': 'Screening list file upload.',
                    'Content-Type': 'multipart/form-data'
                },
                data: dataObj
            });

            file.upload.then(function (response) {
                $log.debug('Uploaded screening list file. response: ', response);

                $timeout(function () {
                    file.result = response.data;

                    if (response.data && response.data.status !== 200) {
                        notification({
                            type: 'warning',
                            text: response.data.explanation
                        });
                    }

                    deferred.resolve();
                });
            }, function (response) {
                $log.debug('Upload error. response: ', response);

                if (response.data && response.data.status !== 200) {
                    notification({
                        type: 'warning',
                        text: response.data.explanation
                    });
                }

                deferred.resolve();
            }, function (evt) {
                // Math.min is to fix IE which reports 200% sometimes
                file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));

                $log.debug('Upload progress. event: ', evt);
            });

            return deferred.promise;
        };

        $scope.showSuccessMessage = function () {
            notification.flash({
                type: 'success',
                text: $translate.instant('CommonLabels.OperationSuccessful')
            });

            $scope.cancel();
        };

        $scope.removeFileAttachment = function () {
            $scope.screeningList.file = null;
        };

        $scope.cancel = function () {
            $state.transitionTo($state.current.data.listState, {
                organizationId: $stateParams.organizationId ? $stateParams.organizationId : undefined,
                userId: $stateParams.userId ? $stateParams.userId : undefined
            });
        };
    });

    BulkMessagingScreeningListsOperationsModule.controller('BulkMessagingScreeningListsOperationsCtrl', function ($rootScope, $scope, $log, $state, $stateParams, $filter, notification, $translate, $uibModal, NgTableParams, NgTableService,
                                                                                                                  DateTimeConstants, ReportingExportService, BulkMessagingOperationsService, screeningLists) {
        $log.debug("BulkMessagingScreeningListsOperationsCtrl");

        $scope = $scope.$parent;

        $scope.screeningLists = screeningLists;
        if ($state.current.data.listType === 'GLOBAL') {
            $scope.showFilter = false;
            $scope.showTable = true;
        } else {
            $scope.showFilter = true;
        }

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'updateTime',
                    headerKey: 'Products.BulkMessaging.Operations.ScreeningLists.TableColumns.UpdateTime',
                    filter: {name: 'date', params: ['yyyy-MM-dd HH:mm:ss', DateTimeConstants.OFFSET]}
                },
                {
                    fieldName: 'name',
                    headerKey: 'Products.BulkMessaging.Operations.ScreeningLists.TableColumns.Name'
                },
                {
                    fieldName: 'listSize',
                    headerKey: 'Products.BulkMessaging.Operations.ScreeningLists.TableColumns.Size'
                },
                {
                    fieldName: 'ownerId',
                    headerKey: 'Products.BulkMessaging.Operations.ScreeningLists.TableColumns.Owner'
                }
            ]
        };

        // Screening lists table definitions
        $scope.screeningListsList = {
            list: $scope.screeningLists,
            tableParams: {}
        };

        $scope.screeningListsList.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "name": 'asc'
            }
        }, {
            total: $scope.screeningListsList.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.screeningListsList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.screeningListsList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - Screening lists table definitions

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.screeningListsList.tableParams.settings().$scope.filterText = filterText;
            $scope.screeningListsList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.screeningListsList.tableParams.page(1);
            $scope.screeningListsList.tableParams.reload();
        }, 750);

        $scope.remove = function (screeningList) {
            screeningList.rowSelected = true;

            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                $log.debug('Remove the screening list content and list:', screeningList);

                BulkMessagingOperationsService.deleteDistributionListAllContent(screeningList.name).then(function (response) {
                    $log.debug('Deleted the screening list content: ', response);

                    if (response && response.status === 200) {
                        BulkMessagingOperationsService.deleteDistributionList(screeningList.name).then(function (response) {
                            $log.debug('Deleted the screening list: ', response);

                            if (response && response.status && response.status !== 200) {
                                notification({
                                    type: 'warning',
                                    text: response.explanation
                                });
                            } else {
                                var deletedListItem = _.findWhere($scope.screeningListsList.list, {
                                    id: screeningList.id
                                });
                                $scope.screeningListsList.list = _.without($scope.screeningListsList.list, deletedListItem);

                                $scope.screeningListsList.tableParams.reload();

                                notification({
                                    type: 'success',
                                    text: $translate.instant('CommonLabels.OperationSuccessful')
                                });
                            }
                        }, function (response) {
                            $log.debug('Cannot delete screening list: ', response);

                            if (response.data && response.data.status) {
                                notification({
                                    type: 'warning',
                                    text: response.data.explanation
                                });
                            }
                        });
                    } else {
                        notification({
                            type: 'warning',
                            text: response.explanation
                        });
                    }
                }, function (response) {
                    $log.debug('Cannot delete screening list content: ', response);

                    if (response.data && response.data.status) {
                        notification({
                            type: 'warning',
                            text: response.data.explanation
                        });
                    }
                });

                screeningList.rowSelected = false;
            }, function () {
                screeningList.rowSelected = false;
            });
        };

        $scope.downloadListContent = function (screeningList) {
            var srcUrl = '/bms-bulkmsg-operations-gr-rest/v1/dlists/download/' + screeningList.name;

            $log.debug('Downloading screening list content. URL: ', srcUrl);

            ReportingExportService.showReport(srcUrl, 'CSV', screeningList.name);
        };
    });

    BulkMessagingScreeningListsOperationsModule.controller('BulkMessagingScreeningListsOperationsNewCtrl', function ($scope, $log, $controller, $state, $stateParams, notification, $translate,
                                                                                                                     BulkMessagingOperationsService) {
        $log.debug("BulkMessagingScreeningListsOperationsNewCtrl");

        $scope = $scope.$parent;

        $controller('BulkMessagingScreeningListsOperationsCommonCtrl', {
            $scope: $scope
        });

        var organizationId = $stateParams.organizationId;
        var userId = $stateParams.userId;

        $scope.screeningList = {
            file: null
        };

        $scope.save = function (action, screeningList, screeningListFile) {
            $log.debug('Trying to create screening list: ', screeningList);

            var screeningListItem = {
                listType: 'USER_BLACKLIST',
                name: screeningList.name
            };

            var createMethod = BulkMessagingOperationsService.createDistributionListPerOrganization;
            var identifier = organizationId;
            if ($state.current.data.listType === 'USER') {
                createMethod = BulkMessagingOperationsService.createDistributionListPerUser;
                identifier = userId;
            }

            createMethod(identifier, screeningListItem).then(function (response) {
                $log.debug('Screening list created successfully. Response: ', response);

                if (response && response.status) {
                    notification({
                        type: 'warning',
                        text: response.explanation
                    });
                } else {
                    if (screeningListFile && screeningListFile.name &&
                        response && response.name) {
                        $scope.uploadFile(action, screeningListFile, response.name).then(function (response) {
                            $scope.showSuccessMessage();
                        });
                    } else {
                        $scope.showSuccessMessage();
                    }
                }
            }, function (response) {
                $log.debug('Screening list cannot be created. Error: ', response);

                if (response.data && response.data.status) {
                    notification({
                        type: 'warning',
                        text: response.data.explanation
                    });
                }
            });
        };
    });

    BulkMessagingScreeningListsOperationsModule.controller('BulkMessagingScreeningListsOperationsUpdateCtrl', function ($scope, $log, $controller, $stateParams, notification, $translate, Restangular,
                                                                                                                        BulkMessagingOperationsService, screeningList) {
        $log.debug("BulkMessagingScreeningListsOperationsUpdateCtrl");

        $scope = $scope.$parent;

        $controller('BulkMessagingScreeningListsOperationsCommonCtrl', {
            $scope: $scope
        });

        $scope.screeningList = screeningList;

        if (screeningList.fieldNames) {
            if (screeningList.fieldNames.indexOf('‖') > -1) {
                $scope.screeningList.fieldNames = screeningList.fieldNames.split('‖').join(',');
            } else if (screeningList.fieldNames.indexOf('|') > -1) {
                $scope.screeningList.fieldNames = screeningList.fieldNames.split('|').join(',');
            }
        }

        $scope.screeningList.file = null;

        $scope.screeningListOriginal = angular.copy($scope.screeningList);
        $scope.isNotChanged = function () {
            return angular.equals($scope.screeningList, $scope.screeningListOriginal);
        };

        $scope.save = function (action, screeningList, screeningListFile) {
            $log.debug('Trying to update screening list: ', screeningList);

            if (screeningListFile && screeningListFile.name) {
                $scope.uploadFile(action, screeningListFile, screeningList.name).then(function (response) {
                    $scope.showSuccessMessage();
                });
            } else {
                $scope.showSuccessMessage();
            }
        };
    });

})();
