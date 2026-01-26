(function () {

    'use strict';

    angular.module('adminportal.subsystems.provisioning.operations.users.teams', []);

    var ProvisioningUsersTeamsOperationsModule = angular.module('adminportal.subsystems.provisioning.operations.users.teams');

    ProvisioningUsersTeamsOperationsModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.provisioning.operations.users.teams', {
            abstract: true,
            url: "/teams",
            template: '<div ui-view></div>',
            data: {
                exportFileName: 'Teams',
                permissions: [
                    'CMPF__OPERATIONS_TEAM_READ'
                ]
            },
            resolve: {
                defaultOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_ORGANIZATION_NAME);
                },
                teamsOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_TEAMS_ORGANIZATION_NAME);
                },
                departmentsOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_DEPARTMENTS_ORGANIZATION_NAME);
                }
            }
        }).state('subsystems.provisioning.operations.users.teams.list', {
            url: "",
            templateUrl: "subsystems/provisioning/operations/users/operations.users.teams.html",
            controller: 'ProvisioningOperationsUsersTeamsCtrl'
        }).state('subsystems.provisioning.operations.users.teams.new', {
            url: "/new",
            templateUrl: "subsystems/provisioning/operations/users/operations.users.teams.details.html",
            controller: 'ProvisioningOperationsUsersTeamsNewCtrl',
            resolve: {
                userAccounts: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getUserAccounts(0, DEFAULT_REST_QUERY_LIMIT, true);
                },
                roles: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getRoles(0, DEFAULT_REST_QUERY_LIMIT);
                }
            }
        }).state('subsystems.provisioning.operations.users.teams.update', {
            url: "/update/:id",
            templateUrl: "subsystems/provisioning/operations/users/operations.users.teams.details.html",
            controller: 'ProvisioningOperationsUsersTeamsUpdateCtrl',
            resolve: {
                userAccounts: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getUserAccounts(0, DEFAULT_REST_QUERY_LIMIT, true);
                },
                roles: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getRoles(0, DEFAULT_REST_QUERY_LIMIT);
                }
            }
        });

    });

    ProvisioningUsersTeamsOperationsModule.controller('ProvisioningOperationsUsersTeamsCommonCtrl', function ($scope, $log, $q, $state, $filter, $uibModal, notification, $translate, CMPFService,
                                                                                                              defaultOrganization, teamsOrganization, departmentsOrganization, STATUS_TYPES) {
        $log.debug('ProvisioningOperationsUsersTeamsCommonCtrl');

        $scope.defaultOrganization = defaultOrganization.organizations[0];
        $scope.teamsOrganization = teamsOrganization.organizations[0];
        $scope.departmentsOrganization = departmentsOrganization.organizations[0];

        $scope.STATUS_TYPES = STATUS_TYPES;

        $scope.selectedDepartment = {};

        $scope.updateTeam = function (teamsOrganizationOriginal, team, isDelete) {
            var deferred = $q.defer();

            $log.debug('Trying update default organization: ', teamsOrganizationOriginal, team);

            // Update the last update time for create first time or for update everytime.
            team.LastUpdateTime = $filter('date')(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss');

            var organizationItem = {
                id: teamsOrganizationOriginal.id,
                name: teamsOrganizationOriginal.name,
                type: teamsOrganizationOriginal.type,
                orgType: teamsOrganizationOriginal.orgType,
                parentId: teamsOrganizationOriginal.parentId,
                parentName: teamsOrganizationOriginal.parentName,
                state: teamsOrganizationOriginal.state,
                description: teamsOrganizationOriginal.description,
                // Profiles
                profiles: angular.copy(teamsOrganizationOriginal.profiles)
            };

            // Set the department selection.
            team.DepartmentID = $scope.selectedDepartment ? $scope.selectedDepartment.profileId : undefined;

            // Create user array from the selected user accounts.
            team.Users = _.map($scope.selectedUserAccounts, function (selectedUserAccount) {
                return {value: selectedUserAccount.id};
            });

            // Create role array from the selected roles.
            team.Roles = _.map($scope.selectedRoles, function (selectedRole) {
                return {value: selectedRole.id};
            });

            var originalTeamProfiles = CMPFService.findProfilesByName(organizationItem.profiles, CMPFService.ORGANIZATION_TEAM_PROFILE);

            var updatedTeamProfile = JSON.parse(angular.toJson(team));
            var originalTeamProfile = _.findWhere(originalTeamProfiles, {id: updatedTeamProfile.profileId});

            if (isDelete) {
                organizationItem.profiles = _.without(organizationItem.profiles, originalTeamProfile);
            } else {
                var teamProfileAttrArray = CMPFService.prepareProfile(updatedTeamProfile, originalTeamProfile);
                // ---
                if (originalTeamProfile) {
                    originalTeamProfile.attributes = teamProfileAttrArray;
                } else {
                    var teamProfile = {
                        name: CMPFService.ORGANIZATION_TEAM_PROFILE,
                        profileDefinitionName: CMPFService.ORGANIZATION_TEAM_PROFILE,
                        attributes: teamProfileAttrArray
                    };

                    organizationItem.profiles.push(teamProfile);
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

        // Departments
        $scope.showDepartments = function () {
            var modalInstance = $uibModal.open({
                templateUrl: "subsystems/provisioning/operations/users/operations.users.teams.departments.modal.html",
                controller: 'ProvisioningOperationsUsersTeamsDepartmentsModalCtrl',
                size: 'lg',
                resolve: {
                    departmentParameter: function () {
                        return angular.copy($scope.selectedDepartment);
                    },
                    teamNameParameter: function () {
                        return $scope.team.Name;
                    },
                    departmentsOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                        return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_DEPARTMENTS_ORGANIZATION_NAME);
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
                $scope.selectedDepartment = selectedItem;
            }, function () {
            });
        };

        $scope.removeDepartment = function () {
            $scope.selectedDepartment = {};
        };

        // User Accounts
        $scope.showUserAccounts = function () {
            var modalInstance = $uibModal.open({
                templateUrl: 'subsystems/provisioning/operations/users/operations.users.teams.useraccouts.modal.html',
                controller: 'ProvisioningOperationsUsersTeamsUserAccountsModalCtrl',
                size: 'lg',
                resolve: {
                    userAccountsParameter: function () {
                        return angular.copy($scope.selectedUserAccounts);
                    },
                    teamNameParameter: function () {
                        return $scope.team.Name;
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

        // Roles
        $scope.showRoles = function () {
            var modalInstance = $uibModal.open({
                templateUrl: 'subsystems/provisioning/operations/users/operations.users.teams.roles.modal.html',
                controller: 'ProvisioningOperationsUsersTeamsRolesModalCtrl',
                size: 'lg',
                resolve: {
                    rolesParameter: function () {
                        return angular.copy($scope.selectedRoles);
                    },
                    teamNameParameter: function () {
                        return $scope.team.Name;
                    },
                    roles: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                        return CMPFService.getRoles(0, DEFAULT_REST_QUERY_LIMIT);
                    }
                }
            });

            modalInstance.result.then(function (selectedItems) {
                $scope.selectedRoles = selectedItems;
            }, function () {
            });
        };

        $scope.removeRole = function (user) {
            var index = _.indexOf($scope.selectedRoles, user);
            if (index != -1) {
                $scope.selectedRoles.splice(index, 1);
            }
        };

        $scope.cancel = function () {
            $state.go('subsystems.provisioning.operations.users.teams.list');
        };
    });

    ProvisioningUsersTeamsOperationsModule.controller('ProvisioningOperationsUsersTeamsCtrl', function ($scope, $log, $controller, $state, $uibModal, $filter, $translate, notification, NgTableParams, NgTableService,
                                                                                                        defaultOrganization, teamsOrganization, departmentsOrganization, DateTimeConstants, CMPFService) {
        $log.debug('ProvisioningOperationsUsersTeamsCtrl');

        $controller('ProvisioningOperationsUsersTeamsCommonCtrl', {
            $scope: $scope,
            defaultOrganization: defaultOrganization,
            teamsOrganization: teamsOrganization,
            departmentsOrganization: departmentsOrganization
        });

        $scope.teams = CMPFService.getTeams($scope.teamsOrganization);
        $scope.teams = $filter('orderBy')($scope.teams, 'profileId');

        var departments = CMPFService.getDepartments($scope.departmentsOrganization);
        _.each($scope.teams, function (team) {
            var foundDepartment = _.findWhere(departments, {profileId: Number(team.DepartmentID)});
            if (foundDepartment) {
                team.Department = foundDepartment
            } else {
                team.Department = {
                    Name: 'N/A'
                };
            }
        });

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'profileId',
                    headerKey: 'Subsystems.Provisioning.Teams.Id'
                },
                {
                    fieldName: 'Name',
                    headerKey: 'Subsystems.Provisioning.Teams.Name'
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

        // Team list
        $scope.teamList = {
            list: $scope.teams,
            tableParams: {}
        };

        $scope.teamList.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "profileId": 'asc'
            }
        }, {
            total: $scope.teamList.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.teamList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.teamList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - Team list

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.teamList.tableParams.settings().$scope.filterText = filterText;
            $scope.teamList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.teamList.tableParams.page(1);
            $scope.teamList.tableParams.reload();
        }, 750);

        // UserAccounts
        $scope.viewUserAccounts = function (team) {
            $uibModal.open({
                templateUrl: 'subsystems/provisioning/operations/users/operations.users.useraccounts.view.modal.html',
                controller: function ($scope, $uibModalInstance, userAccounts) {
                    $scope.pageHeaderKey = 'Subsystems.Provisioning.Teams.UserAccountsModalTitle';
                    $scope.itemName = team.Name;

                    var allUserAccounts = $filter('orderBy')(userAccounts.userAccounts, 'id');

                    $scope.userAccounts = [];
                    _.each(team.Users, function (userAccount) {
                        var foundUserAccount = _.findWhere(allUserAccounts, {id: Number(userAccount.value)});
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

        // Roles
        $scope.viewRoles = function (team) {
            $uibModal.open({
                templateUrl: 'subsystems/provisioning/operations/users/operations.users.roles.view.modal.html',
                controller: function ($scope, $uibModalInstance, roles) {
                    $scope.pageHeaderKey = 'Subsystems.Provisioning.Teams.RolesModalTitle';
                    $scope.itemName = team.Name;

                    var allRoles = $filter('orderBy')(roles.roles, 'id');

                    $scope.roles = [];
                    _.each(team.Roles, function (role) {
                        var foundRole = _.findWhere(allRoles, {id: Number(role.value)});
                        if (foundRole) {
                            $scope.roles.push(foundRole);
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
                            var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.roles);
                            var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.roles;
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
                    roles: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                        return CMPFService.getRoles(0, DEFAULT_REST_QUERY_LIMIT);
                    }
                }
            });
        };

        $scope.remove = function (team) {
            team.rowSelected = true;

            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                team.rowSelected = false;

                $scope.updateTeam($scope.teamsOrganization, team, true).then(function (response) {
                    var deletedListItem = _.findWhere($scope.teamList.list, {profileId: team.profileId});
                    $scope.teamList.list = _.without($scope.teamList.list, deletedListItem);

                    $scope.teamList.tableParams.reload();

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                }, function (response) {
                    CMPFService.showApiError(response);
                });
            }, function () {
                team.rowSelected = false;
            });
        };
    });

    ProvisioningUsersTeamsOperationsModule.controller('ProvisioningOperationsUsersTeamsNewCtrl', function ($scope, $log, $controller, $filter, $translate, notification, CMPFService,
                                                                                                           defaultOrganization, teamsOrganization, departmentsOrganization) {
        $log.debug('ProvisioningOperationsUsersTeamsNewCtrl');

        $controller('ProvisioningOperationsUsersTeamsCommonCtrl', {
            $scope: $scope,
            defaultOrganization: defaultOrganization,
            teamsOrganization: teamsOrganization,
            departmentsOrganization: departmentsOrganization
        });

        $scope.team = {
            Name: '',
            Description: '',
            Status: 'ACTIVE',
            LastUpdateTime: null
        };

        $scope.save = function (team) {
            $scope.updateTeam($scope.teamsOrganization, team).then(function (response) {
                notification.flash({
                    type: 'success',
                    text: $translate.instant('CommonLabels.OperationSuccessful')
                });

                $scope.go('subsystems.provisioning.operations.users.teams.list');
            }, function (response) {
                CMPFService.showApiError(response);
            });
        };
    });

    ProvisioningUsersTeamsOperationsModule.controller('ProvisioningOperationsUsersTeamsUpdateCtrl', function ($scope, $log, $controller, $stateParams, $filter, $translate, notification, CMPFService,
                                                                                                              defaultOrganization, teamsOrganization, departmentsOrganization, userAccounts, roles) {
        $log.debug('ProvisioningOperationsUsersTeamsUpdateCtrl');

        $controller('ProvisioningOperationsUsersTeamsCommonCtrl', {
            $scope: $scope,
            defaultOrganization: defaultOrganization,
            teamsOrganization: teamsOrganization,
            departmentsOrganization: departmentsOrganization
        });

        var id = $stateParams.id;

        $scope.selectedUserAccounts = [];
        $scope.selectedRoles = [];

        // TeamProfile
        var teamProfiles = CMPFService.getTeams($scope.teamsOrganization);
        if (teamProfiles.length > 0) {
            var foundTeam = _.findWhere(teamProfiles, {"profileId": Number(id)});
            $scope.team = angular.copy(foundTeam);

            $scope.team.DepartmentID = Number($scope.team.DepartmentID);
            var departments = CMPFService.getDepartments($scope.departmentsOrganization);
            $scope.selectedDepartment = _.findWhere(departments, {profileId: Number($scope.team.DepartmentID)});

            var userAccounts = userAccounts.userAccounts;
            _.each($scope.team.Users, function (userAccount) {
                var foundUserAccount = _.findWhere(userAccounts, {id: Number(userAccount.value)});
                if (foundUserAccount) {
                    $scope.selectedUserAccounts.push(foundUserAccount);
                }
            });

            var roles = roles.roles;
            _.each($scope.team.Roles, function (role) {
                var foundRole = _.findWhere(roles, {id: Number(role.value)});
                if (foundRole) {
                    $scope.selectedRoles.push(foundRole);
                }
            });
        }

        $scope.originalTeam = angular.copy($scope.team);
        $scope.originalSelectedDepartment = angular.copy($scope.selectedDepartment);
        $scope.originalSelectedUserAccounts = angular.copy($scope.selectedUserAccounts);
        $scope.originalSelectedRoles = angular.copy($scope.selectedRoles);
        $scope.isNotChanged = function () {
            return angular.equals($scope.originalTeam, $scope.team) &&
                angular.equals($scope.originalSelectedDepartment, $scope.selectedDepartment) &&
                angular.equals($scope.originalSelectedUserAccounts, $scope.selectedUserAccounts) &&
                angular.equals($scope.originalSelectedRoles, $scope.selectedRoles);
        };

        $scope.save = function (team) {
            $scope.updateTeam($scope.teamsOrganization, team).then(function (response) {
                notification.flash({
                    type: 'success',
                    text: $translate.instant('CommonLabels.OperationSuccessful')
                });

                $scope.go('subsystems.provisioning.operations.users.teams.list');
            }, function (response) {
                CMPFService.showApiError(response);
            });
        };
    });

    ProvisioningUsersTeamsOperationsModule.controller('ProvisioningOperationsUsersTeamsDepartmentsModalCtrl', function ($scope, $uibModalInstance, $log, $filter, NgTableParams, NgTableService, Restangular,
                                                                                                                        departmentParameter, teamNameParameter, departmentsOrganization, CMPFService) {
        $log.debug('ProvisioningOperationsUsersTeamsDepartmentsModalCtrl');

        $scope.selectedItem = departmentParameter ? departmentParameter : {};

        $scope.teamName = teamNameParameter;

        $scope.departmentsOrganization = departmentsOrganization.organizations[0];
        $scope.departments = CMPFService.getDepartments($scope.departmentsOrganization);
        $scope.departments = $filter('orderBy')($scope.departments, 'profileId');

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
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.departments);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.departments;
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

        $scope.selectItem = function (selectedItem) {
            $scope.selectedItem = selectedItem;
        };

        $scope.removeSelection = function () {
            $scope.selectedItem = {};
        };

        $scope.ok = function () {
            $uibModalInstance.close($scope.selectedItem);
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });

    ProvisioningUsersTeamsOperationsModule.controller('ProvisioningOperationsUsersTeamsUserAccountsModalCtrl', function ($scope, $uibModalInstance, $log, $filter, NgTableParams, NgTableService, Restangular,
                                                                                                                         userAccountsParameter, teamNameParameter, userAccounts) {
        $log.debug('ProvisioningOperationsUsersTeamsUserAccountsModalCtrl');

        $scope.selectedItems = userAccountsParameter ? userAccountsParameter : [];

        $scope.teamNameParameter = teamNameParameter;

        $scope.userAccounts = userAccounts.userAccounts;
        $scope.userAccounts = $filter('orderBy')($scope.userAccounts, 'id');

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

        $scope.addToSelection = function (item) {
            var team = _.findWhere($scope.selectedItems, {id: item.id});
            if (!team) {
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

    ProvisioningUsersTeamsOperationsModule.controller('ProvisioningOperationsUsersTeamsRolesModalCtrl', function ($scope, $uibModalInstance, $log, $filter, NgTableParams, NgTableService, Restangular,
                                                                                                                  rolesParameter, teamNameParameter, roles) {
        $log.debug('ProvisioningOperationsUsersTeamsRolesModalCtrl');

        $scope.selectedItems = rolesParameter ? rolesParameter : [];

        $scope.teamNameParameter = teamNameParameter;

        $scope.roles = roles.roles;
        $scope.roles = $filter('orderBy')($scope.roles, 'id');

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
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.roles);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.roles;
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
            var team = _.findWhere($scope.selectedItems, {id: item.id});
            if (!team) {
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
