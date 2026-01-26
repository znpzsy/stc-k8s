(function () {

    'use strict';

    angular.module('adminportal.products.bulkmessaging.operations.distributionlists', [
        'adminportal.products.bulkmessaging.operations.distributionlists.global',
        'adminportal.products.bulkmessaging.operations.distributionlists.perorganization',
        'adminportal.products.bulkmessaging.operations.distributionlists.peruser'
    ]);

    var BulkMessagingDistributionListsOperationsModule = angular.module('adminportal.products.bulkmessaging.operations.distributionlists');

    BulkMessagingDistributionListsOperationsModule.config(function ($stateProvider) {

        $stateProvider.state('products.bulkmessaging.operations.distributionlists', {
            abstract: true,
            url: "/distribution-lists",
            template: "<div ui-view></div>"
        });

    });

    BulkMessagingDistributionListsOperationsModule.controller('BulkMessagingDistributionListsOrganizationsCtrl', function ($rootScope, $scope, $log, $q, $state, $stateParams, $translate, notification, CMPFService, BulkMessagingOperationsService,
                                                                                                                           organizations) {
        $log.debug("BulkMessagingDistributionListsOrganizationsCtrl");

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
                BulkMessagingOperationsService.getDistributionListsPerOrganization(organizationId, 'USER_LIST').then(function (organizationResponse) {
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

                        $scope.distributionListsList.list = response;
                        $scope.distributionListsList.tableParams.page(1);
                        $scope.distributionListsList.tableParams.reload();
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

                    $scope.distributionListsList.list = response;
                    $scope.distributionListsList.tableParams.page(1);
                    $scope.distributionListsList.tableParams.reload();
                });
            });
        }
    });

    BulkMessagingDistributionListsOperationsModule.controller('BulkMessagingDistributionListsOrganizationsUserAccountsCtrl', function ($rootScope, $scope, $log, $q, $state, $stateParams, $translate, notification, CMPFService, BulkMessagingOperationsService,
                                                                                                                                       organizations, DEFAULT_REST_QUERY_LIMIT) {
        $log.debug("BulkMessagingDistributionListsOrganizationsUserAccountsCtrl");

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
                BulkMessagingOperationsService.getDistributionListsPerUser(userId, 'USER_LIST').then(function (response) {
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

                        $scope.distributionListsList.list = response;
                        $scope.distributionListsList.tableParams.page(1);
                        $scope.distributionListsList.tableParams.reload();
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

                        $scope.distributionListsList.list = response;
                        $scope.distributionListsList.tableParams.page(1);
                        $scope.distributionListsList.tableParams.reload();
                    });
                });
            });
        }
    });

    BulkMessagingDistributionListsOperationsModule.controller('BulkMessagingDistributionListsOperationsCommonCtrl', function ($scope, $rootScope, $log, $q, $controller, $state, $stateParams, $timeout, notification, $translate, Upload,
                                                                                                                              CMPFService, UtilService, SERVICES_BASE) {
        $log.debug('BulkMessagingDistributionListsOperationsCommonCtrl');

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

            $log.debug('Uploading distribution list file: ', file);

            file.upload = Upload.upload({
                method: 'POST',
                url: SERVICES_BASE + url,
                headers: {
                    'ServiceLabel': 'Distribution list file upload.',
                    'Content-Type': 'multipart/form-data'
                },
                data: dataObj
            });

            file.upload.then(function (response) {
                $log.debug('Uploaded distribution list file. response: ', response);

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
            $scope.distributionList.file = null;
        };

        $scope.cancel = function () {
            $state.transitionTo($state.current.data.listState, {
                organizationId: $stateParams.organizationId ? $stateParams.organizationId : undefined,
                userId: $stateParams.userId ? $stateParams.userId : undefined
            });
        };
    });

    BulkMessagingDistributionListsOperationsModule.controller('BulkMessagingDistributionListsOperationsCtrl', function ($rootScope, $scope, $log, $state, $stateParams, $filter, notification, $translate, $uibModal, NgTableParams, NgTableService,
                                                                                                                        DateTimeConstants, ReportingExportService, BulkMessagingOperationsService, distributionLists) {
        $log.debug("BulkMessagingDistributionListsOperationsCtrl");

        $scope = $scope.$parent;

        $scope.distributionLists = distributionLists;
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

        // Distribution lists table definitions
        $scope.distributionListsList = {
            list: $scope.distributionLists,
            tableParams: {}
        };

        $scope.distributionListsList.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "name": 'asc'
            }
        }, {
            total: $scope.distributionListsList.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.distributionListsList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.distributionListsList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - Distribution lists table definitions

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.distributionListsList.tableParams.settings().$scope.filterText = filterText;
            $scope.distributionListsList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.distributionListsList.tableParams.page(1);
            $scope.distributionListsList.tableParams.reload();
        }, 750);

        $scope.remove = function (distributionList) {
            distributionList.rowSelected = true;

            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                $log.debug('Remove the distribution list content and list:', distributionList);

                BulkMessagingOperationsService.deleteDistributionListAllContent(distributionList.name).then(function (response) {
                    $log.debug('Deleted the distribution list content: ', response);

                    if (response && response.status === 200) {
                        BulkMessagingOperationsService.deleteDistributionList(distributionList.name).then(function (response) {
                            $log.debug('Deleted the distribution list: ', response);

                            if (response && response.status && response.status !== 200) {
                                notification({
                                    type: 'warning',
                                    text: response.explanation
                                });
                            } else {
                                var deletedListItem = _.findWhere($scope.distributionListsList.list, {
                                    id: distributionList.id
                                });
                                $scope.distributionListsList.list = _.without($scope.distributionListsList.list, deletedListItem);

                                $scope.distributionListsList.tableParams.reload();

                                notification({
                                    type: 'success',
                                    text: $translate.instant('CommonLabels.OperationSuccessful')
                                });
                            }
                        }, function (response) {
                            $log.debug('Cannot delete distribution list: ', response);

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
                    $log.debug('Cannot delete distribution list content: ', response);

                    if (response.data && response.data.status) {
                        notification({
                            type: 'warning',
                            text: response.data.explanation
                        });
                    }
                });

                distributionList.rowSelected = false;
            }, function () {
                distributionList.rowSelected = false;
            });
        };

        $scope.downloadListContent = function (screeningList) {
            var srcUrl = '/bms-bulkmsg-operations-gr-rest/v1/dlists/download/' + screeningList.name;

            $log.debug('Downloading distribution list content. URL: ', srcUrl);

            ReportingExportService.showReport(srcUrl, 'CSV', screeningList.name);
        };
    });

    BulkMessagingDistributionListsOperationsModule.controller('BulkMessagingDistributionListsOperationsNewCtrl', function ($scope, $log, $controller, $state, $stateParams, notification, $translate,
                                                                                                                           BulkMessagingOperationsService) {
        $log.debug("BulkMessagingDistributionListsOperationsNewCtrl");

        $scope = $scope.$parent;

        $controller('BulkMessagingDistributionListsOperationsCommonCtrl', {
            $scope: $scope
        });

        var organizationId = $stateParams.organizationId;
        var userId = $stateParams.userId;

        $scope.distributionList = {
            file: null
        };

        $scope.save = function (action, distributionList, distributionListFile) {
            $log.debug('Trying to create distribution list: ', distributionList);

            var distributionListItem = {
                listType: 'USER_LIST',
                name: distributionList.name,
                fieldNames: ((distributionList && distributionList.fieldNames) ? distributionList.fieldNames : '')
            };

            var createMethod = BulkMessagingOperationsService.createGlobalWhiteList;
            var identifier = null;
            if ($state.current.data.listType === 'ORGANIZATION') {
                createMethod = BulkMessagingOperationsService.createDistributionListPerOrganization;
                identifier = organizationId;
            } else if ($state.current.data.listType === 'USER') {
                createMethod = BulkMessagingOperationsService.createDistributionListPerUser;
                identifier = userId;
            }

            createMethod(identifier, distributionListItem).then(function (response) {
                $log.debug('Distribution list created successfully. Response: ', response);

                if (response && response.status) {
                    notification({
                        type: 'warning',
                        text: response.explanation
                    });
                } else {
                    if (distributionListFile && distributionListFile.name &&
                        response && response.id) {
                        $scope.uploadFile(action, distributionListFile, response.name).then(function (response) {
                            $scope.showSuccessMessage();
                        });
                    } else {
                        $scope.showSuccessMessage();
                    }
                }
            }, function (response) {
                $log.debug('Distribution list cannot be created. Error: ', response);

                if (response.data && response.data.status) {
                    notification({
                        type: 'warning',
                        text: response.data.explanation
                    });
                }
            });
        };
    });

    BulkMessagingDistributionListsOperationsModule.controller('BulkMessagingDistributionListsOperationsUpdateCtrl', function ($scope, $log, $controller, $stateParams, notification, $translate, Restangular,
                                                                                                                              BulkMessagingOperationsService, distributionList) {
        $log.debug("BulkMessagingDistributionListsOperationsUpdateCtrl");

        $scope = $scope.$parent;

        $controller('BulkMessagingDistributionListsOperationsCommonCtrl', {
            $scope: $scope
        });

        $scope.distributionList = distributionList;

        if (distributionList.fieldNames) {
            if (distributionList.fieldNames.indexOf('‖') > -1) {
                $scope.distributionList.fieldNames = distributionList.fieldNames.split('‖').join(',');
            } else if (distributionList.fieldNames.indexOf('|') > -1) {
                $scope.distributionList.fieldNames = distributionList.fieldNames.split('|').join(',');
            }
        }

        $scope.distributionList.file = null;

        $scope.distributionListOriginal = angular.copy($scope.distributionList);
        $scope.isNotChanged = function () {
            return angular.equals($scope.distributionList, $scope.distributionListOriginal);
        };

        $scope.save = function (action, distributionList, distributionListFile) {
            $log.debug('Trying to update distribution list: ', distributionList);

            if (distributionListFile && distributionListFile.name) {
                $scope.uploadFile(action, distributionListFile, distributionList.name).then(function (response) {
                    $scope.showSuccessMessage();
                });
            } else {
                $scope.showSuccessMessage();
            }
        };
    });

})();
