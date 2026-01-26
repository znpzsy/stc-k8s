(function () {

    'use strict';

    angular.module('adminportal.subsystems.businessmanagement.operations.projects', []);

    var BusinessManagementOperationsProjectsModule = angular.module('adminportal.subsystems.businessmanagement.operations.projects');

    BusinessManagementOperationsProjectsModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.businessmanagement.operations.projects', {
            abstract: true,
            url: "/projects",
            template: '<div ui-view></div>',
            data: {
                exportFileName: 'Projects',
                permissions: [
                    'BIZ__OPERATIONS_PROJECT_READ'
                ]
            },
            resolve: {
                defaultOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_ORGANIZATION_NAME);
                },
                projectsOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_PROJECTS_ORGANIZATION_NAME);
                },
                businessTypesOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_BUSINESS_TYPES_ORGANIZATION_NAME);
                }
            }
        }).state('subsystems.businessmanagement.operations.projects.list', {
            url: "",
            templateUrl: "subsystems/businessmanagement/operations/operations.projects.html",
            controller: 'BusinessManagementOperationsProjectsCtrl'
        }).state('subsystems.businessmanagement.operations.projects.new', {
            url: "/new",
            templateUrl: "subsystems/businessmanagement/operations/operations.projects.details.html",
            controller: 'BusinessManagementOperationsProjectsNewCtrl',
            resolve: {
                userAccounts: function (defaultOrganization, CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getUserAccountsByOrganizationId(0, DEFAULT_REST_QUERY_LIMIT, true, false, defaultOrganization.organizations[0].id);
                }
            }
        }).state('subsystems.businessmanagement.operations.projects.update', {
            url: "/update/:id",
            templateUrl: "subsystems/businessmanagement/operations/operations.projects.details.html",
            controller: 'BusinessManagementOperationsProjectsUpdateCtrl',
            resolve: {
                userAccounts: function (defaultOrganization, CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getUserAccountsByOrganizationId(0, DEFAULT_REST_QUERY_LIMIT, true, false, defaultOrganization.organizations[0].id);
                }
            }
        });

    });

    BusinessManagementOperationsProjectsModule.controller('BusinessManagementOperationsProjectsCommonCtrl', function ($scope, $log, $q, $state, $filter, $uibModal, notification, $translate, CMPFService,
                                                                                                                      defaultOrganization, projectsOrganization, businessTypesOrganization, BUSINESS_MANAGEMENT_STATUS_TYPES) {
        $log.debug('BusinessManagementOperationsProjectsCommonCtrl');

        $scope.defaultOrganization = defaultOrganization.organizations[0];
        $scope.projectsOrganization = projectsOrganization.organizations[0];
        $scope.businessTypesOrganization = businessTypesOrganization.organizations[0];

        $scope.BUSINESS_MANAGEMENT_STATUS_TYPES = BUSINESS_MANAGEMENT_STATUS_TYPES;

        $scope.businessTypes = CMPFService.getBusinessTypes($scope.businessTypesOrganization);
        $scope.businessTypes = $filter('orderBy')($scope.businessTypes, 'profileId');

        $scope.updateProject = function (projectsOrganizationOriginal, project, isDelete) {
            var deferred = $q.defer();

            $log.debug('Trying update default organization: ', projectsOrganizationOriginal, project);

            // Update the last update time for create first time or for update everytime.
            project.LastUpdateTime = $filter('date')(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss');

            var organizationItem = {
                id: projectsOrganizationOriginal.id,
                name: projectsOrganizationOriginal.name,
                type: projectsOrganizationOriginal.type,
                orgType: projectsOrganizationOriginal.orgType,
                parentId: projectsOrganizationOriginal.parentId,
                parentName: projectsOrganizationOriginal.parentName,
                state: projectsOrganizationOriginal.state,
                description: projectsOrganizationOriginal.description,
                // Profiles
                profiles: angular.copy(projectsOrganizationOriginal.profiles)
            };

            // Create business type array from the selected business types.
            project.BusinessTypes = _.map($scope.selectedBusinessTypes, function (selectedBusinessType) {
                return {value: selectedBusinessType.profileId};
            });

            // Create user id array from the selected users.
            project.Users = _.map($scope.selectedUserAccounts, function (selectedUserAccount) {
                return {value: selectedUserAccount.id};
            });

            var originalProjectProfiles = CMPFService.findProfilesByName(organizationItem.profiles, CMPFService.ORGANIZATION_PROJECT_PROFILE);

            var updatedProjectProfile = JSON.parse(angular.toJson(project));
            var originalProjectProfile = _.findWhere(originalProjectProfiles, {id: updatedProjectProfile.profileId});

            if (isDelete) {
                organizationItem.profiles = _.without(organizationItem.profiles, originalProjectProfile);
            } else {
                var projectProfileAttrArray = CMPFService.prepareProfile(updatedProjectProfile, originalProjectProfile);
                // ---
                if (originalProjectProfile) {
                    originalProjectProfile.attributes = projectProfileAttrArray;
                } else {
                    var projectProfile = {
                        name: CMPFService.ORGANIZATION_PROJECT_PROFILE,
                        profileDefinitionName: CMPFService.ORGANIZATION_PROJECT_PROFILE,
                        attributes: projectProfileAttrArray
                    };

                    organizationItem.profiles.push(projectProfile);
                }
            }

            CMPFService.updateOperator(organizationItem).then(function (response) {
                $log.debug('Update Success. Response: ', response);

                if (response && response.errorCode) {
                    deferred.reject(response)
                } else {
                    deferred.resolve(response)
                }
            }, function (response) {
                $log.debug('Cannot save the organization. Error: ', response);

                deferred.reject(response)
            });

            return deferred.promise;
        };

        // User Accounts
        $scope.showUserAccounts = function () {
            var modalInstance = $uibModal.open({
                templateUrl: 'subsystems/businessmanagement/operations/operations.projects.useraccounts.modal.html',
                controller: 'BusinessManagementOperationsProjectsUserAccountsModalCtrl',
                size: 'lg',
                resolve: {
                    userAccountsParameter: function () {
                        return angular.copy($scope.selectedUserAccounts);
                    },
                    projectNameParameter: function () {
                        return $scope.project.Name;
                    },
                    userAccounts: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                        return CMPFService.getUserAccountsByOrganizationId(0, DEFAULT_REST_QUERY_LIMIT, true, false, $scope.defaultOrganization.id);
                    }
                }
            });

            modalInstance.result.then(function (selectedItems) {
                $scope.selectedUserAccounts = selectedItems;
            }, function () {
            });
        };

        $scope.removeUserAccount = function (user) {
            var index = _.indexOf($scope.selectedUserAccounts, user);
            if (index != -1) {
                $scope.selectedUserAccounts.splice(index, 1);
            }
        };

        // Business Types
        $scope.showBusinessTypes = function () {
            var modalInstance = $uibModal.open({
                templateUrl: 'subsystems/businessmanagement/operations/operations.projects.businesstypes.modal.html',
                controller: 'BusinessManagementOperationsProjectsBusinessTypesModalCtrl',
                size: 'lg',
                resolve: {
                    businessTypesParameter: function () {
                        return angular.copy($scope.selectedBusinessTypes);
                    },
                    projectNameParameter: function () {
                        return $scope.project.Name;
                    },
                    businessTypesOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                        return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_BUSINESS_TYPES_ORGANIZATION_NAME);
                    }
                }
            });

            modalInstance.result.then(function (selectedItems) {
                $scope.selectedBusinessTypes = selectedItems;
            }, function () {
            });
        };

        $scope.removeBusinessType = function (project) {
            var index = _.indexOf($scope.selectedBusinessTypes, project);
            if (index != -1) {
                $scope.selectedBusinessTypes.splice(index, 1);
            }
        };

        $scope.cancel = function () {
            $state.go('subsystems.businessmanagement.operations.projects.list');
        };
    });

    BusinessManagementOperationsProjectsModule.controller('BusinessManagementOperationsProjectsCtrl', function ($scope, $log, $controller, $state, $uibModal, $filter, $translate, notification, NgTableParams, NgTableService,
                                                                                                                defaultOrganization, projectsOrganization, businessTypesOrganization, DateTimeConstants, CMPFService) {
        $log.debug('BusinessManagementOperationsProjectsCtrl');

        $controller('BusinessManagementOperationsProjectsCommonCtrl', {
            $scope: $scope,
            defaultOrganization: defaultOrganization,
            projectsOrganization: projectsOrganization,
            businessTypesOrganization: businessTypesOrganization
        });

        $scope.projects = CMPFService.getProjects($scope.projectsOrganization);
        $scope.projects = $filter('orderBy')($scope.projects, 'profileId');

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'profileId',
                    headerKey: 'Subsystems.BusinessManagement.Operations.Projects.Id'
                },
                {
                    fieldName: 'Name',
                    headerKey: 'Subsystems.BusinessManagement.Operations.Projects.Name'
                },
                {
                    fieldName: 'LastUpdateTime',
                    headerKey: 'CommonLabels.LastUpdateTime',
                    filter: {name: 'date', params: ['yyyy-MM-dd HH:mm:ss', DateTimeConstants.OFFSET]}
                },
                {
                    fieldName: 'LegacyID',
                    headerKey: 'CommonLabels.LegacyID'
                },
                {
                    fieldName: 'Description',
                    headerKey: 'CommonLabels.Description'
                },
                {
                    fieldName: 'Status',
                    headerKey: 'CommonLabels.State'
                }
            ]
        };

        // Project list
        $scope.projectList = {
            list: $scope.projects,
            tableParams: {}
        };

        $scope.projectList.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "profileId": 'asc'
            }
        }, {
            total: $scope.projectList.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.projectList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.projectList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - Project list

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.projectList.tableParams.settings().$scope.filterText = filterText;
            $scope.projectList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.projectList.tableParams.page(1);
            $scope.projectList.tableParams.reload();
        }, 750);

        // UserAccounts
        $scope.viewUserAccounts = function (project) {
            $uibModal.open({
                templateUrl: 'subsystems/provisioning/operations/users/operations.users.useraccounts.view.modal.html',
                controller: function ($scope, $uibModalInstance, userAccounts) {
                    $scope.pageHeaderKey = 'Subsystems.BusinessManagement.Operations.Projects.UserAccountsModalTitle';
                    $scope.itemName = project.Name;

                    var allUserAccounts = $filter('orderBy')(userAccounts.userAccounts, 'id');

                    $scope.userAccounts = [];
                    _.each(project.Users, function (userAccountId) {
                        var foundUserAccount = _.findWhere(allUserAccounts, {id: Number(userAccountId.value)});
                        if (foundUserAccount) {
                            $scope.userAccounts.push(foundUserAccount);
                        }
                    });

                    $scope.tableParams = new NgTableParams({
                        page: 1,
                        count: 10,
                        sorting: {
                            "id": 'asc'
                        }
                    }, {
                        $scope: $scope,
                        total: 0,
                        getData: function ($defer, params) {
                            var filterText = params.settings().$scope.filterText;
                            var filterColumns = params.settings().$scope.filterColumns;
                            var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.userAccounts);
                            var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.userAccounts;
                            params.total(orderedData.length); // set total for recalc pagination
                            if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                                params.page(params.page() - 1);
                            }

                            $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                        }
                    });

                    $scope.filterTable = _.debounce(function (filterText, filterColumns) {
                        $scope.tableParams.settings().$scope.filterText = filterText;
                        $scope.tableParams.settings().$scope.filterColumns = filterColumns;
                        $scope.tableParams.page(1);
                        $scope.tableParams.reload();
                    }, 500);

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                size: 'lg',
                resolve: {
                    userAccounts: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                        return CMPFService.getUserAccounts(0, DEFAULT_REST_QUERY_LIMIT, true, true);
                    }
                }
            });
        };

        $scope.remove = function (project) {
            project.rowSelected = true;

            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                project.rowSelected = false;

                $scope.updateProject($scope.projectsOrganization, project, true).then(function (response) {
                    var deletedListItem = _.findWhere($scope.projectList.list, {profileId: project.profileId});
                    $scope.projectList.list = _.without($scope.projectList.list, deletedListItem);

                    $scope.projectList.tableParams.reload();

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                }, function (response) {
                    CMPFService.showApiError(response);
                });
            }, function () {
                project.rowSelected = false;
            });
        };
    });

    BusinessManagementOperationsProjectsModule.controller('BusinessManagementOperationsProjectsNewCtrl', function ($scope, $log, $controller, $filter, $translate, notification, CMPFService,
                                                                                                                   defaultOrganization, projectsOrganization, businessTypesOrganization, userAccounts) {
        $log.debug('BusinessManagementOperationsProjectsNewCtrl');

        $controller('BusinessManagementOperationsProjectsCommonCtrl', {
            $scope: $scope,
            defaultOrganization: defaultOrganization,
            projectsOrganization: projectsOrganization,
            businessTypesOrganization: businessTypesOrganization
        });

        $scope.userAccounts = $filter('orderBy')(userAccounts.userAccounts, 'userName');

        $scope.project = {
            Name: '',
            Description: '',
            Status: null,
            LastUpdateTime: null
        };

        $scope.save = function (project) {
            $scope.updateProject($scope.projectsOrganization, project).then(function (response) {
                notification.flash({
                    type: 'success',
                    text: $translate.instant('CommonLabels.OperationSuccessful')
                });

                $scope.go('subsystems.businessmanagement.operations.projects.list');
            }, function (response) {
                CMPFService.showApiError(response);
            });
        };
    });

    BusinessManagementOperationsProjectsModule.controller('BusinessManagementOperationsProjectsUpdateCtrl', function ($scope, $log, $controller, $stateParams, $filter, $translate, notification, CMPFService,
                                                                                                                      defaultOrganization, projectsOrganization, businessTypesOrganization, userAccounts) {
        $log.debug('BusinessManagementOperationsProjectsUpdateCtrl');

        $controller('BusinessManagementOperationsProjectsCommonCtrl', {
            $scope: $scope,
            defaultOrganization: defaultOrganization,
            projectsOrganization: projectsOrganization,
            businessTypesOrganization: businessTypesOrganization
        });

        var id = $stateParams.id;

        $scope.userAccounts = $filter('orderBy')(userAccounts.userAccounts, 'userName');

        $scope.selectedUserAccounts = [];
        $scope.selectedBusinessTypes = [];

        // ProjectProfile
        var projectProfiles = CMPFService.getProjects($scope.projectsOrganization);
        if (projectProfiles.length > 0) {
            var foundProject = _.findWhere(projectProfiles, {"profileId": Number(id)});
            $scope.project = angular.copy(foundProject);

            var businessTypes = CMPFService.getBusinessTypes($scope.businessTypesOrganization);
            _.each($scope.project.BusinessTypes, function (businessType) {
                var foundBusinessType = _.findWhere(businessTypes, {profileId: Number(businessType.value)});
                if (foundBusinessType) {
                    $scope.selectedBusinessTypes.push(foundBusinessType);
                }
            });

            var foundAdminAccount = _.findWhere($scope.userAccounts, {id: Number($scope.project.AdminAccount)});
            if (foundAdminAccount) {
                $scope.project.AdminAccount = Number($scope.project.AdminAccount);
            } else {
                $scope.project.AdminAccount = null;
            }

            _.each($scope.project.Users, function (user) {
                var foundUser = _.findWhere($scope.userAccounts, {id: Number(user.value)});
                if (foundUser) {
                    $scope.selectedUserAccounts.push(foundUser);
                }
            });
        }

        $scope.originalProject = angular.copy($scope.project);
        $scope.originalSelectedUserAccounts = angular.copy($scope.selectedUserAccounts);
        $scope.originalSelectedUserAccounts = $filter('orderBy')($scope.originalSelectedUserAccounts, 'id');
        $scope.originalSelectedBusinessTypes = angular.copy($scope.selectedBusinessTypes);
        $scope.originalSelectedBusinessTypes = $filter('orderBy')($scope.originalSelectedBusinessTypes, 'profileId');
        $scope.isNotChanged = function () {
            var selectedUserAccounts = $filter('orderBy')($scope.selectedUserAccounts, 'id');

            return angular.equals($scope.originalProject, $scope.project) &&
                angular.equals($scope.originalSelectedUserAccounts, $scope.selectedUserAccounts) &&
                angular.equals($scope.originalSelectedBusinessTypes, $scope.selectedBusinessTypes);
        };

        $scope.save = function (project) {
            $scope.updateProject($scope.projectsOrganization, project).then(function (response) {
                notification.flash({
                    type: 'success',
                    text: $translate.instant('CommonLabels.OperationSuccessful')
                });

                $scope.go('subsystems.businessmanagement.operations.projects.list');
            }, function (response) {
                CMPFService.showApiError(response);
            });
        };
    });

    BusinessManagementOperationsProjectsModule.controller('BusinessManagementOperationsProjectsUserAccountsModalCtrl', function ($scope, $uibModalInstance, $log, $filter, NgTableParams, NgTableService, Restangular,
                                                                                                                                 userAccountsParameter, projectNameParameter, userAccounts) {
        $log.debug('BusinessManagementOperationsProjectsUserAccountsModalCtrl');

        $scope.selectedItems = userAccountsParameter ? userAccountsParameter : [];

        $scope.projectName = projectNameParameter;

        $scope.userAccounts = Restangular.stripRestangular(userAccounts);

        _.each($scope.userAccounts.userAccounts, function (userAccount) {
            userAccount.id = Number(userAccount.id);
        });

        $scope.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "id": 'asc'
            }
        }, {
            $scope: $scope,
            total: 0,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.userAccounts.userAccounts);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.userAccounts.userAccounts;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.tableParams.settings().$scope.filterText = filterText;
            $scope.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.tableParams.page(1);
            $scope.tableParams.reload();
        }, 500);

        $scope.addToSelection = function (item) {
            var user = _.findWhere($scope.selectedItems, {userName: item.userName});
            if (!user) {
                $scope.selectedItems.push(item);
            }
        };

        $scope.removeFromSelection = function (item) {
            var index = _.indexOf($scope.selectedItems, item);
            if (index !== -1) {
                $scope.selectedItems.splice(index, 1);
            }
        };

        $scope.ok = function () {
            $uibModalInstance.close($scope.selectedItems);
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });

    BusinessManagementOperationsProjectsModule.controller('BusinessManagementOperationsProjectsBusinessTypesModalCtrl', function ($scope, $uibModalInstance, $log, $filter, NgTableParams, NgTableService, Restangular,
                                                                                                                                  businessTypesParameter, projectNameParameter, businessTypesOrganization, CMPFService) {
        $log.debug('BusinessManagementOperationsProjectsBusinessTypesModalCtrl');

        $scope.selectedItems = businessTypesParameter ? businessTypesParameter : [];

        $scope.projectName = projectNameParameter;

        $scope.businessTypesOrganization = businessTypesOrganization.organizations[0];
        $scope.businessTypes = CMPFService.getBusinessTypes($scope.businessTypesOrganization);
        $scope.businessTypes = $filter('orderBy')($scope.businessTypes, 'profileId');

        $scope.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "profileId": 'asc'
            }
        }, {
            $scope: $scope,
            total: 0,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.businessTypes);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.businessTypes;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.tableParams.settings().$scope.filterText = filterText;
            $scope.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.tableParams.page(1);
            $scope.tableParams.reload();
        }, 500);

        $scope.addToSelection = function (item) {
            var businessType = _.findWhere($scope.selectedItems, {profileId: item.profileId});
            if (!businessType) {
                $scope.selectedItems.push(item);
            }
        };

        $scope.removeFromSelection = function (item) {
            var index = _.indexOf($scope.selectedItems, item);
            if (index !== -1) {
                $scope.selectedItems.splice(index, 1);
            }
        };

        $scope.ok = function () {
            $uibModalInstance.close($scope.selectedItems);
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });

})();
