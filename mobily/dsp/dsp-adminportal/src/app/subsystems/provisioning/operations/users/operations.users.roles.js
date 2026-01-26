(function () {

    'use strict';

    angular.module('adminportal.subsystems.provisioning.operations.users.roles', []);

    var ProvisioningUsersRolesOperationsModule = angular.module('adminportal.subsystems.provisioning.operations.users.roles');

    ProvisioningUsersRolesOperationsModule.config(function ($stateProvider) {

        // Roles states
        $stateProvider.state('subsystems.provisioning.operations.users.roles', {
            abstract: true,
            url: "/roles",
            template: "<div ui-view></div>",
            data: {
                permissions: [
                    'CMPF__OPERATIONS_ROLE_READ'
                ]
            }
        }).state('subsystems.provisioning.operations.users.roles.list', {
            url: "",
            templateUrl: "subsystems/provisioning/operations/users/operations.users.roles.html",
            controller: 'ProvisioningOperationsUsersRolesCtrl',
            resolve: {
                roles: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getRoles(0, DEFAULT_REST_QUERY_LIMIT);
                },
                userAccounts: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getUserAccounts(0, DEFAULT_REST_QUERY_LIMIT, true, true);
                },
                teamsOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_TEAMS_ORGANIZATION_NAME);
                }
            }
        }).state('subsystems.provisioning.operations.users.roles.update', {
            url: "/update/:id",
            templateUrl: "subsystems/provisioning/operations/users/operations.users.roles.details.html",
            controller: 'ProvisioningOperationsUsersRolesUpdateCtrl',
            resolve: {
                role: function ($stateParams, CMPFService) {
                    return CMPFService.getRole($stateParams.id);
                }
            }
        }).state('subsystems.provisioning.operations.users.roles.new', {
            url: "/new",
            templateUrl: "subsystems/provisioning/operations/users/operations.users.roles.details.html",
            controller: 'ProvisioningOperationsUsersRolesNewCtrl'
        });

    });

    // Roles controllers
    ProvisioningUsersRolesOperationsModule.controller('ProvisioningOperationsUsersRolesCommonCtrl', function ($scope, $log, $uibModal, notification, $translate, CMPFService, STATUS_TYPES) {
        $log.debug('ProvisioningOperationsUsersRolesCommonCtrl');

        $scope.STATUS_TYPES = STATUS_TYPES;

        // Users
        $scope.selectedUsers = [];

        $scope.showUserAccounts = function () {
            var modalInstance = $uibModal.open({
                templateUrl: 'subsystems/provisioning/operations/users/operations.users.modal.accounts.html',
                controller: 'ProvisioningOperationsModalsUserAccountsModalInstanceCtrl',
                size: 'lg',
                resolve: {
                    userAccountsParameter: function () {
                        return angular.copy($scope.selectedUsers);
                    },
                    itemNameParameter: function () {
                        return $scope.role.name;
                    },
                    userAccounts: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                        return CMPFService.getUserAccounts(0, DEFAULT_REST_QUERY_LIMIT, true);
                    },
                    titleKey: function () {
                        return 'Subsystems.Provisioning.Roles.UserAccountsModalTitle';
                    }
                }
            });

            modalInstance.result.then(function (selectedItems) {
                $scope.selectedUsers = selectedItems;
            }, function () {
            });
        };

        $scope.removeUserAccount = function (user) {
            var index = _.indexOf($scope.selectedUsers, user);
            if (index != -1) {
                $scope.selectedUsers.splice(index, 1);
            }
        };

        $scope.addUsers = function (role) {
            if ($scope.selectedUsers.length) {
                $log.debug('Add user accounts to the role.');

                var addedUsers = [];
                angular.forEach($scope.selectedUsers, function (user) {
                    addedUsers.push({
                        id: user.id,
                        userName: user.userName
                    })
                });

                return CMPFService.addNewAccountsToRole(role, addedUsers).then(function (response) {
                    $log.debug('Users added to role. Response: ', response);
                    return role;
                }, function (response) {
                    $log.error('Cannot add user to role. Error: ', response);
                    return role;
                });
            } else {
                return role;
            }
        };

        // Privileges
        $scope.privileges = [];
        $scope.permissions = [];
        $scope.constraints = [];
        $scope.ungrantResources = [];
        $scope.undenyResources = [];

        var addToList = function (list, isResource, privilege, item) {
            var resourceId = privilege.resourceId, operationId = privilege.operationId;
            if (isResource) {
                operationId = 0;
            }

            if (!_.findWhere(list, {resourceId: resourceId, operationId: operationId})) {
                if (item) {
                    list.push(item);
                } else {
                    list.push({
                        resourceId: resourceId,
                        operationId: operationId
                    });
                }
            }
        };

        var preparePermissionOrConstraint = function (permissionTag, roleName, isResource, privilege) {
            var permission = {
                name: roleName + ':' + permissionTag + ':' + privilege.resourceName,
                operationId: privilege.operationId,
                resourceId: privilege.resourceId,
                resourceName: privilege.resourceName
            };

            if (isResource) {
                permission.operationId = 0;
            } else {
                permission.name = permission.name + ':' + privilege.operationId;
                permission.operationName = privilege.operationName;
            }

            return permission;
        };

        $scope.openPermissions = function () {
            var modalInstance = $uibModal.open({
                templateUrl: 'subsystems/provisioning/operations/users/operations.users.modal.permissions.html',
                controller: 'ProvisioningOperationsModalsPrivilegesModalInstanceCtrl',
                size: 'lg',
                resolve: {
                    resources: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                        return CMPFService.getResources(0, DEFAULT_REST_QUERY_LIMIT);
                    },
                    itemNameParameter: function () {
                        return $scope.role.name;
                    },
                    permissionsParameter: function () {
                        return angular.copy($scope.permissions);
                    },
                    constraintsParameter: function () {
                        return angular.copy($scope.constraints);
                    },
                    titleKey: function () {
                        return 'Subsystems.Provisioning.Roles.PrivilegesModalTitle';
                    }
                }
            });

            modalInstance.result.then(function (privileges) {
                $scope.privileges = privileges;

                $scope.permissions = [];
                $scope.constraints = [];
                $scope.ungrantResources = [];
                $scope.undenyResources = [];
                angular.forEach($scope.privileges, function (privilege) {
                    if (privilege.operationGranted || privilege.resourceGranted) {
                        addToList($scope.permissions, privilege.resourceGranted, privilege, preparePermissionOrConstraint('G', $scope.role.name, privilege.resourceGranted, privilege));
                    } else if (privilege.operationDenied || privilege.resourceDenied) {
                        addToList($scope.constraints, privilege.resourceDenied, privilege, preparePermissionOrConstraint('D', $scope.role.name, privilege.resourceDenied, privilege));
                    }

                    addToList($scope.ungrantResources, true, privilege);
                    addToList($scope.undenyResources, true, privilege);
                });
            }, function () {
            });
        };

        $scope.addPermissions = function (role) {
            $log.debug('Trying to add resurce permissions: ', $scope.permissions);

            angular.forEach($scope.permissions, function (permission) {
                permission.name = role.name + ':G:' + permission.resourceName;
                if (permission.operationId > 0) {
                    permission.name += ':' + permission.operationId
                }
            });

            return CMPFService.addPermissionsToRole(role, $scope.permissions).then(function (response) {
                $log.debug('Add Permissions to role response: ', response);
                return role;
            }, function (response) {
                $log.error('Cannot add permissions to role. Error: ', response);
                return role;
            });
        };

        $scope.addConstraints = function (role) {
            $log.debug('Trying to add resource constraints: ', $scope.constraints);

            angular.forEach($scope.constraints, function (constraint) {
                constraint.name = role.name + ':D:' + constraint.resourceName;
                if (constraint.operationId > 0) {
                    constraint.name += ':' + constraint.operationId
                }
            });

            return CMPFService.addConstraintsToRole(role, $scope.constraints).then(function (response) {
                $log.debug('Add constraints to role. Response: ', response);
                return $scope;
            }, function (response) {
                $log.error('Cannot add constraints to role. Error: ', response);
                return $scope;
            });
        };

        $scope.cancel = function () {
            $scope.go('subsystems.provisioning.operations.users.roles.list');
        };

        $scope.goToList = function () {
            notification.flash({
                type: 'success',
                text: $translate.instant('CommonLabels.OperationSuccessful')
            });

            $scope.cancel();
        };
    });

    ProvisioningUsersRolesOperationsModule.controller('ProvisioningOperationsUsersRolesCtrl', function ($scope, $state, $log, $filter, $uibModal, NgTableParams, NgTableService,
                                                                                                        $translate, notification, CMPFService, Restangular, roles, userAccounts,
                                                                                                        teamsOrganization) {
        $log.debug('ProvisioningOperationsUsersRolesCtrl');

        $scope.roles = $filter('orderBy')(roles.roles, 'id');

        $scope.userAccounts = Restangular.stripRestangular(userAccounts).userAccounts;
        $scope.userAccounts = $filter('orderBy')($scope.userAccounts, 'id');

        $scope.teamsOrganization = teamsOrganization.organizations[0];
        $scope.teams = CMPFService.getTeams($scope.teamsOrganization);
        $scope.teams = $filter('orderBy')($scope.teams, 'profileId');

        _.each($scope.roles, function (role) {
            // TODO -
            /*
            _.each($scope.userAccounts, function(userAccount) {
                var userProfiles = CMPFService.getProfileAttributes(userAccount.profiles, CMPFService.USER_PROFILE_NAME);
                if (userProfiles.length > 0) {
                    userAccount.userProfile = angular.copy(userProfiles[0]);

                    var foundRole = _.findWhere(userAccount.selectedRoles, {value: Number(role.profileId)});
                }
            });
            */

            role.teams = [];
            _.each($scope.teams, function (team) {
                var foundRole = _.findWhere(team.Roles, {value: role.id.toString()});
                if (foundRole) {
                    role.teams.push(team)
                }
            });
        });

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'id',
                    headerKey: 'Subsystems.Provisioning.Roles.Id'
                },
                {
                    fieldName: 'name',
                    headerKey: 'Subsystems.Provisioning.Roles.Name'
                },
                {
                    fieldName: 'description',
                    headerKey: 'Subsystems.Provisioning.Roles.Description'
                },
                {
                    fieldName: 'state',
                    headerKey: 'Subsystems.Provisioning.Roles.State'
                }
            ]
        };

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

        // Teams
        $scope.viewTeams = function (role) {
            $uibModal.open({
                templateUrl: 'subsystems/provisioning/operations/users/operations.users.teams.view.modal.html',
                controller: function ($scope, $uibModalInstance, teamsOrganization) {
                    $scope.pageHeaderKey = 'Subsystems.Provisioning.Roles.TeamsModalTitle';
                    $scope.itemName = role.name;

                    $scope.teamsOrganization = teamsOrganization.organizations[0];
                    var allTeams = CMPFService.getTeams($scope.teamsOrganization);
                    allTeams = $filter('orderBy')(allTeams, 'profileId');

                    $scope.teams = [];
                    _.each(allTeams, function (team) {
                        var isRoleExists = _.findWhere(team.Roles, {value: role.id.toString()});
                        if (isRoleExists) {
                            $scope.teams.push(team);
                        }
                    });

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
                            var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.teams);
                            var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.teams;
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
                    teamsOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                        return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_TEAMS_ORGANIZATION_NAME);
                    }
                }
            });
        };

        // UserAccounts
        $scope.viewUserAccounts = function (role) {
            $uibModal.open({
                templateUrl: 'subsystems/provisioning/operations/users/operations.users.useraccounts.view.modal.html',
                controller: function ($scope, $uibModalInstance, userAccounts) {
                    $scope.pageHeaderKey = 'Subsystems.Provisioning.Roles.UserAccountsModalTitle';
                    $scope.itemName = role.name;

                    var allUserAccounts = $filter('orderBy')(userAccounts.userAccounts, 'id');

                    $scope.userAccounts = [];
                    _.each(allUserAccounts, function (userAccount) {
                        var userProfiles = CMPFService.getProfileAttributes(userAccount.profiles, CMPFService.USER_PROFILE_NAME);
                        if (userProfiles.length > 0) {
                            userAccount.userProfile = userProfiles[0];

                            var isRoleExists = _.findWhere(userAccount.selectedRoles, {value: role.id.toString()});
                            if (isRoleExists) {
                                $scope.userAccounts.push(userAccount);
                            }
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

        $scope.remove = function (role) {
            role.rowSelected = true;

            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                role.rowSelected = false;

                $log.debug('remove', role.name);

                CMPFService.deleteRole(role).then(function (response) {
                    $log.debug('Removed. Response: ', response);

                    var deletedListItem = _.findWhere($scope.roles, {id: role.id});
                    $scope.roles = _.without($scope.roles, deletedListItem);

                    $scope.tableParams.reload();

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                }, function (response) {
                    $log.debug('Cannot remove role. Error: ', response);
                    var res = Restangular.stripRestangular(response);
                    notification({
                        type: 'warning',
                        text: $translate.instant('CommonMessages.ApiError', {
                            errorCode: res.data.errorCode,
                            errorText: res.data.errorDescription
                        })
                    });
                });
            }, function () {
                role.rowSelected = false;
            });
        };
    });

    ProvisioningUsersRolesOperationsModule.controller('ProvisioningOperationsUsersRolesNewCtrl', function ($scope, $state, $log, $controller, $uibModal, notification, $translate, Restangular,
                                                                                                           CMPFService) {
        $log.debug('ProvisioningOperationsUsersRolesNewCtrl');

        $controller('ProvisioningOperationsUsersRolesCommonCtrl', {$scope: $scope});

        $scope.role = {
            name: '',
            description: '',
            state: $scope.STATUS_TYPES[0].value
        };

        $scope.save = function (role) {
            var roleItem = {
                name: role.name,
                description: role.description,
                state: role.state
            };

            var createRole = function (newRoleItems) {
                return CMPFService.createRole(newRoleItems).then(function (response) {
                    $log.debug('Role created. Response: ', response);

                    return Restangular.stripRestangular(response)[0];
                }, function (response) {
                    $log.debug('Cannot create new role. Error: ', response);
                });
            };

            createRole([roleItem]).then($scope.goToList);
        };
    });

    ProvisioningUsersRolesOperationsModule.controller('ProvisioningOperationsUsersRolesUpdateCtrl', function ($scope, $state, $log, $q, $stateParams, $controller, notification, $translate, $uibModal, CMPFService, Restangular,
                                                                                                              STATUS_TYPES, role) {
        $log.debug('ProvisioningOperationsUsersRolesUpdateCtrl');

        $controller('ProvisioningOperationsUsersRolesCommonCtrl', {$scope: $scope});

        $log.debug('Get Role Response: ', role);
        $scope.role = Restangular.stripRestangular(role);

        /*
        $log.debug('Get Role Permissions Response: ', rolePermissions);
        $scope.rolePermissions = Restangular.stripRestangular(rolePermissions);
        if ($scope.rolePermissions.metaData.totalCount > 0) {
            $scope.permissions = $scope.rolePermissions.permissions;
        }
        */

        /*
        $log.debug('Get Role Constraints Response: ', roleConstraints);
        $scope.roleConstraints = Restangular.stripRestangular(roleConstraints);
        if ($scope.roleConstraints.metaData.totalCount > 0) {
            $scope.constraints = $scope.roleConstraints.constraints;
        }
        */

        /*
        $log.debug('Get Role Members Response: ', roleMembers);
        $scope.selectedUsers = Restangular.stripRestangular(roleMembers).userAccounts;
        */

        $scope.roleOriginal = angular.copy($scope.role);
        //$scope.privilegesOriginal = angular.copy($scope.privileges);
        //$scope.selectedUsersOriginal = angular.copy($scope.selectedUsers);
        $scope.isNotChanged = function () {
            return angular.equals($scope.role, $scope.roleOriginal);
            //&& angular.equals($scope.privileges, $scope.privilegesOriginal) && angular.equals($scope.selectedUsers, $scope.selectedUsersOriginal);
        };

        $scope.save = function (role) {
            var roleItem = {
                id: role.id,
                name: role.name,
                description: role.description,
                state: role.state
            };

            var updateRole = function (role) {
                return CMPFService.updateRole(role).then(function (response) {
                    $log.debug('Update role. Response: ', response);

                    $scope.role = Restangular.stripRestangular(response);

                    return $scope.role;
                }, function (response) {
                    $log.error('Cannot update role. Error: ', response);
                });
            };

            /*
            var removeUsers = function (role) {
                var removedUsers = _.filter($scope.selectedUsersOriginal, function (user) {
                    return !_.findWhere($scope.selectedUsers, {id: user.id});
                });

                if (removedUsers.length === 0) {
                    return role;
                }

                var deferred = $q.defer();

                var removeUser = function (index) {
                    if (removedUsers[index]) {
                        return CMPFService.removeAccountFromRole(role, removedUsers[index]).then(function (response) {
                            $log.debug('User removed from role. Response: ', response);
                            removeUser(index + 1);
                        }, function (response) {
                            $log.error('Cannot remove user from role. Error: ', response);

                            notification({
                                type: 'warning',
                                text: 'Cannot remove user from role: ' + removedUsers[index].name
                            });

                            removeUser(index + 1);
                        });
                    } else {
                        deferred.resolve(role);
                    }
                };

                removeUser(0);

                return deferred.promise;
            };

            var removePermissions = function () {
                if ($scope.ungrantResources.length === 0) {
                    return role;
                }

                var deferred = $q.defer();

                var promises = [];
                angular.forEach($scope.ungrantResources, function (permission) {
                    $log.debug('Trying to remove resource permission: ', permission);
                    promises.push(CMPFService.removeResourcePermissionFromRole($scope.role, permission.resourceId));
                });

                return $q.all(promises).then(function (response) {
                    $log.debug('Removed resource permission from role. Response: ', response);
                    return role;
                }, function (response) {
                    $log.error('Cannot remove resource permission form role. Error: ', response);
                    return role;
                });
            };

            var removeConstraints = function () {
                if ($scope.undenyResources.length === 0) {
                    return role;
                }

                var deferred = $q.defer();

                var promises = [];
                angular.forEach($scope.undenyResources, function (constraint) {
                    $log.debug('Trying to remove resource constraint: ', constraint);
                    promises.push(CMPFService.removeResourceConstraintFromRole($scope.role, constraint.resourceId));
                });

                return $q.all(promises).then(function (response) {
                    $log.debug('Removed resource constraint from role. Response: ', response);
                    return role;
                }, function (response) {
                    $log.error('Cannot remove resource constraint form role. Error: ', response);
                    return role;
                });
            };
            */

            //updateRole(roleItem).then(removeUsers).then($scope.addUsers).then(removePermissions).then(removeConstraints).then($scope.addPermissions).then($scope.addConstraints).then($scope.goToList);
            updateRole(roleItem).then($scope.goToList);
        };

    });

})();