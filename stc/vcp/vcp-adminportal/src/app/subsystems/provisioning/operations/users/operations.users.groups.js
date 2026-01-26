(function () {

    'use strict';

    angular.module('adminportal.subsystems.provisioning.operations.users.groups', []);

    var ProvisioningUsersGroupsOperationsModule = angular.module('adminportal.subsystems.provisioning.operations.users.groups');

    ProvisioningUsersGroupsOperationsModule.config(function ($stateProvider) {

        // Groups states
        $stateProvider.state('subsystems.provisioning.operations.users.groups', {
            abstract: true,
            url: "",
            template: "<div ui-view></div>"
        }).state('subsystems.provisioning.operations.users.groups.list', {
            url: "/usergroups",
            templateUrl: "subsystems/provisioning/operations/users/operations.users.groups.html",
            controller: 'ProvisioningOperationsUserGroupsCtrl',
            resolve: {
                userGroups: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getUserGroups(0, DEFAULT_REST_QUERY_LIMIT);
                }
            }
        }).state('subsystems.provisioning.operations.users.groups.groupsupdate', {
            url: "/usergroups/:id",
            templateUrl: "subsystems/provisioning/operations/users/operations.users.groups.details.html",
            controller: 'ProvisioningOperationsUserGroupUpdateCtrl',
            resolve: {
                userGroup: function ($stateParams, CMPFService) {
                    return CMPFService.getUserGroup($stateParams.id);
                },
                userGroupPermissions: function ($stateParams, CMPFService) {
                    return CMPFService.getUserGroupPermissions($stateParams.id);
                },
                userGroupConstraints: function ($stateParams, CMPFService) {
                    return CMPFService.getUserGroupConstraints($stateParams.id);
                },
                userGroupMembers: function ($stateParams, CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getUserGroupMembers($stateParams.id, 0, DEFAULT_REST_QUERY_LIMIT);
                }
            }
        }).state('subsystems.provisioning.operations.users.groups.groupsnew', {
            url: "/newusergroup",
            templateUrl: "subsystems/provisioning/operations/users/operations.users.groups.details.html",
            controller: 'ProvisioningOperationsNewUserGroupCtrl'
        });

    });

    // Groups controllers
    ProvisioningUsersGroupsOperationsModule.controller('ProvisioningOperationsUserGroupsCommonCtrl', function ($scope, $log, $uibModal, notification, $translate, CMPFService) {
        $log.debug('ProvisioningOperationsUserGroupsCommonCtrl');

        $scope.selectedUsers = [];

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

        var preparePermissionOrConstraint = function (permissionTag, groupName, isResource, privilege) {
            var permission = {
                name: groupName + ':' + permissionTag + ':' + privilege.resourceName,
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
                templateUrl: 'subsystems/provisioning/operations/users/operations.users.groups.new.modal.permissions.html',
                controller: PrivilegesModalInstanceCtrl,
                size: 'lg',
                resolve: {
                    resources: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                        return CMPFService.getResources(0, DEFAULT_REST_QUERY_LIMIT);
                    },
                    groupNameParameter: function () {
                        return $scope.userGroup.name;
                    },
                    permissionsParameter: function () {
                        return angular.copy($scope.permissions);
                    },
                    constraintsParameter: function () {
                        return angular.copy($scope.constraints);
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
                        addToList($scope.permissions, privilege.resourceGranted, privilege, preparePermissionOrConstraint('G', $scope.userGroup.name, privilege.resourceGranted, privilege));
                    } else if (privilege.operationDenied || privilege.resourceDenied) {
                        addToList($scope.constraints, privilege.resourceDenied, privilege, preparePermissionOrConstraint('D', $scope.userGroup.name, privilege.resourceDenied, privilege));
                    }

                    addToList($scope.ungrantResources, true, privilege);
                    addToList($scope.undenyResources, true, privilege);
                });
            }, function () {
            });
        };

        $scope.showUserAccounts = function () {
            var modalInstance = $uibModal.open({
                templateUrl: 'subsystems/provisioning/operations/users/operations.users.groups.new.modal.accounts.html',
                controller: UserAccountsModalInstanceCtrl,
                size: 'lg',
                resolve: {
                    userAccountsParameter: function () {
                        return angular.copy($scope.selectedUsers);
                    },
                    groupNameParameter: function () {
                        return $scope.userGroup.name;
                    },
                    userAccounts: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                        return CMPFService.getUserAccounts(0, DEFAULT_REST_QUERY_LIMIT);
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

        $scope.cancel = function () {
            $scope.go('subsystems.provisioning.operations.users.groups.list');
        };

        $scope.goToList = function () {
            notification.flash({
                type: 'success',
                text: $translate.instant('CommonLabels.OperationSuccessful')
            });

            $scope.cancel();
        };

        $scope.addUsers = function (userGroup) {
            if ($scope.selectedUsers.length) {
                $log.debug('Add user accounts to the group.');

                var addedUsers = [];
                angular.forEach($scope.selectedUsers, function (user) {
                    addedUsers.push({
                        id: user.id,
                        userName: user.userName
                    })
                });

                return CMPFService.addNewAccountsToUserGroup(userGroup, addedUsers).then(function (response) {
                    $log.debug('Users added to group. Response: ', response);
                    return userGroup;
                }, function (response) {
                    $log.error('Cannot add user to user group. Error: ', response);
                    return userGroup;
                });
            } else {
                return userGroup;
            }
        };

        $scope.addPermissions = function (userGroup) {
            $log.debug('Trying to add resurce permissions: ', $scope.permissions);

            angular.forEach($scope.permissions, function (permission) {
                permission.name = userGroup.name + ':G:' + permission.resourceName;
                if (permission.operationId > 0) {
                    permission.name += ':' + permission.operationId
                }
            });

            return CMPFService.addPermissionsToUserGroup(userGroup, $scope.permissions).then(function (response) {
                $log.debug('Add Permissions to user group response: ', response);
                return userGroup;
            }, function (response) {
                $log.error('Cannot add permissions to user group. Error: ', response);
                return userGroup;
            });
        };

        $scope.addConstraints = function (userGroup) {
            $log.debug('Trying to add resource constraints: ', $scope.constraints);

            angular.forEach($scope.constraints, function (constraint) {
                constraint.name = userGroup.name + ':D:' + constraint.resourceName;
                if (constraint.operationId > 0) {
                    constraint.name += ':' + constraint.operationId
                }
            });

            return CMPFService.addConstraintsToUserGroup(userGroup, $scope.constraints).then(function (response) {
                $log.debug('Add constraints to user group. Response: ', response);
                return $scope;
            }, function (response) {
                $log.error('Cannot add constraints to user group. Error: ', response);
                return $scope;
            });
        };
    });

    ProvisioningUsersGroupsOperationsModule.controller('ProvisioningOperationsUserGroupsCtrl', function ($scope, $state, $log, $filter, $uibModal, NgTableParams, NgTableService,
                                                                                                         $translate, notification, CMPFService, Restangular, userGroups) {
        $log.debug('ProvisioningOperationsUserGroupsCtrl');

        $scope.userGroups = Restangular.stripRestangular(userGroups);
        $scope.userGroups.userGroups = $filter('orderBy')($scope.userGroups.userGroups, 'id');
        _.each($scope.userGroups.userGroups, function (userGroup) {
            userGroup.userAccountNames = _.pluck(userGroup.userAccounts, 'userName').toString();
        });

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'id',
                    headerKey: 'Subsystems.Provisioning.UserGroups.Id'
                },
                {
                    fieldName: 'name',
                    headerKey: 'Subsystems.Provisioning.UserGroups.Name'
                },
                {
                    fieldName: 'state',
                    headerKey: 'Subsystems.Provisioning.UserGroups.State'
                },
                {
                    fieldName: 'userAccountNames',
                    headerKey: 'Subsystems.Provisioning.UserGroups.UserAccounts'
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
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.userGroups.userGroups);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.userGroups.userGroups;
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

        $scope.remove = function (group) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                $log.debug('remove', group.name);
                CMPFService.deleteUserGroup(group).then(function (response) {
                    $log.debug('Removed. Response: ', response);

                    var deletedListItem = _.findWhere($scope.userGroups.userGroups, {id: group.id});
                    $scope.userGroups.userGroups = _.without($scope.userGroups.userGroups, deletedListItem);

                    $scope.tableParams.reload();

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                }, function (response) {
                    $log.debug('Cannot remove user group. Error: ', response);
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
            });
        };

        $scope.showUserAccountsOfGroup = function (group) {
            $uibModal.open({
                templateUrl: 'subsystems/provisioning/operations/users/operations.users.groups.modal.accounts.html',
                controller: UserGroupMembersModalInstanceCtrl,
                size: 'lg',
                resolve: {
                    userGroupParameter: function () {
                        return group;
                    },
                    userGroupMembers: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                        return CMPFService.getUserGroupMembers(group.id, 0, DEFAULT_REST_QUERY_LIMIT);
                    }
                }
            });
        };
    });

    ProvisioningUsersGroupsOperationsModule.controller('ProvisioningOperationsNewUserGroupCtrl', function ($scope, $state, $log, $controller, $uibModal, notification, $translate, Restangular,
                                                                                                           CMPFService, USER_STATES) {
        $log.debug('ProvisioningOperationsNewUserGroupCtrl');

        $controller('ProvisioningOperationsUserGroupsCommonCtrl', {$scope: $scope});

        $scope.USER_STATES = USER_STATES;

        $scope.userGroup = {
            name: '',
            state: $scope.USER_STATES[0]
        };

        $scope.save = function (userGroup) {
            var userGroupItem = {
                name: userGroup.name,
                state: userGroup.state
            };

            var createUserGroup = function (newGroupItems) {
                return CMPFService.createUserGroup(newGroupItems).then(function (response) {
                    $log.debug('User group created. Response: ', response);

                    return Restangular.stripRestangular(response)[0];
                }, function (response) {
                    $log.debug('Cannot create new user group. Error: ', response);
                });
            };

            createUserGroup([userGroupItem]).then($scope.addUsers).then($scope.addPermissions).then($scope.addConstraints).then($scope.goToList);
        };

    });

    ProvisioningUsersGroupsOperationsModule.controller('ProvisioningOperationsUserGroupUpdateCtrl', function ($scope, $state, $log, $q, $stateParams, $controller, notification, $translate, $uibModal, CMPFService, Restangular,
                                                                                                              USER_STATES, userGroup, userGroupPermissions, userGroupConstraints, userGroupMembers) {
        $log.debug('ProvisioningOperationsUserGroupUpdateCtrl');

        $controller('ProvisioningOperationsUserGroupsCommonCtrl', {$scope: $scope});

        $scope.USER_STATES = USER_STATES;

        $log.debug('Get User Group Response: ', userGroup);
        $scope.userGroup = Restangular.stripRestangular(userGroup);

        $log.debug('Get User Group Permissions Response: ', userGroupPermissions);
        $scope.userGroupPermissions = Restangular.stripRestangular(userGroupPermissions);
        if ($scope.userGroupPermissions.metaData.totalCount > 0) {
            $scope.permissions = $scope.userGroupPermissions.permissions;
        }

        $log.debug('Get User Group Constraints Response: ', userGroupConstraints);
        $scope.userGroupConstraints = Restangular.stripRestangular(userGroupConstraints);
        if ($scope.userGroupConstraints.metaData.totalCount > 0) {
            $scope.constraints = $scope.userGroupConstraints.constraints;
        }

        $log.debug('Get User Group Members Response: ', userGroupMembers);
        $scope.selectedUsers = Restangular.stripRestangular(userGroupMembers).userAccounts;

        $scope.userGroupOriginal = angular.copy($scope.userGroup);
        $scope.privilegesOriginal = angular.copy($scope.privileges);
        $scope.selectedUsersOriginal = angular.copy($scope.selectedUsers);
        $scope.isNotChanged = function () {
            return angular.equals($scope.userGroup, $scope.userGroupOriginal) &&
                angular.equals($scope.privileges, $scope.privilegesOriginal) &&
                angular.equals($scope.selectedUsers, $scope.selectedUsersOriginal)
        };

        $scope.save = function (userGroup) {
            var userGroupItem = {
                id: userGroup.id,
                name: userGroup.name,
                state: userGroup.state
            };

            var updateUserGroup = function (userGroup) {
                return CMPFService.updateUserGroup(userGroup).then(function (response) {
                    $log.debug('Update user group. Response: ', response);

                    $scope.userGroup = Restangular.stripRestangular(response);

                    return $scope.userGroup;
                }, function (response) {
                    $log.error('Cannot update user group. Error: ', response);
                });
            };

            var removeUsers = function (userGroup) {
                var removedUsers = _.filter($scope.selectedUsersOriginal, function (user) {
                    return !_.findWhere($scope.selectedUsers, {id: user.id});
                });

                if (removedUsers.length === 0) {
                    return userGroup;
                }

                var deferred = $q.defer();

                var removeUser = function(index) {
                    if (removedUsers[index]) {
                        return CMPFService.removeAccountFromUserGroup(userGroup, removedUsers[index]).then(function (response) {
                            $log.debug('User removed from user group. Response: ', response);
                            removeUser(index+1);
                        }, function (response) {
                            $log.error('Cannot remove user from user group. Error: ', response);

                            notification({
                                type: 'warning',
                                text: 'Cannot remove user from user group: ' + removedUsers[index].name
                            });

                            removeUser(index+1);
                        });
                    } else {
                        deferred.resolve(userGroup);
                    }
                }

                removeUser(0);

                return deferred.promise;
            };

            var removePermissions = function () {
                if ($scope.ungrantResources.length === 0) {
                    return userGroup;
                }

                var deferred = $q.defer();

                var promises = [];
                angular.forEach($scope.ungrantResources, function (permission) {
                    $log.debug('Trying to remove resource permission: ', permission);
                    promises.push(CMPFService.removeResourcePermissionFromUserGroup($scope.userGroup, permission.resourceId));
                });

                return $q.all(promises).then(function (response) {
                    $log.debug('Removed resource permission from user group. Response: ', response);
                    return userGroup;
                }, function (response) {
                    $log.error('Cannot remove resource permission form user group. Error: ', response);
                    return userGroup;
                });
            };

            var removeConstraints = function () {
                if ($scope.undenyResources.length === 0) {
                    return userGroup;
                }

                var deferred = $q.defer();

                var promises = [];
                angular.forEach($scope.undenyResources, function (constraint) {
                    $log.debug('Trying to remove resource constraint: ', constraint);
                    promises.push(CMPFService.removeResourceConstraintFromUserGroup($scope.userGroup, constraint.resourceId));
                });

                return $q.all(promises).then(function (response) {
                    $log.debug('Removed resource constraint from user group. Response: ', response);
                    return userGroup;
                }, function (response) {
                    $log.error('Cannot remove resource constraint form user group. Error: ', response);
                    return userGroup;
                });
            };

            updateUserGroup(userGroupItem).then(removeUsers).then($scope.addUsers).then(removePermissions).then(removeConstraints).then($scope.addPermissions).then($scope.addConstraints).then($scope.goToList);
        };

    });

    var UserGroupMembersModalInstanceCtrl = function ($scope, $uibModalInstance, $log, $filter, NgTableParams, NgTableService, Restangular, userGroupParameter,
                                                      userGroupMembers) {
        $log.debug('UserGroupMembersModalInstanceCtrl');

        $scope.userGroup = userGroupParameter;

        $scope.userGroupMembers = Restangular.stripRestangular(userGroupMembers);
        $scope.userGroupMembers.userAccounts = $filter('orderBy')($scope.userGroupMembers.userAccounts, ['id']);

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'id',
                    headerKey: 'Subsystems.Provisioning.UserAccounts.Id'
                },
                {
                    fieldName: 'userName',
                    headerKey: 'Subsystems.Provisioning.UserAccounts.UserName'
                },
                {
                    fieldName: 'organization.name',
                    headerKey: 'GenericFormFields.Organization.Label'
                },
                {
                    fieldName: 'state',
                    headerKey: 'Subsystems.Provisioning.UserAccounts.State'
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
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.userGroupMembers.userAccounts);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.userGroupMembers.userAccounts;
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

        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    };

    var PrivilegesModalInstanceCtrl = function ($scope, $log, $uibModalInstance, $filter, NgTableParams, Restangular, resources,
                                                groupNameParameter, permissionsParameter, constraintsParameter) {
        $log.debug('PrivilegesModalInstanceCtrl');

        $scope.resources = Restangular.stripRestangular(resources);
        $scope.flatResources = [];

        $scope.groupName = groupNameParameter;

        $scope.tableParams = new NgTableParams({
            sorting: {
                "resourceName": 'asc',
                "operationName": 'asc'
            }
        }, {
            $scope: $scope,
            groupBy: 'resourceName',
            total: 0,
            getData: function ($defer, params) {
                angular.forEach($scope.resources.resources, function (resource, key) {
                    var preGrantedResources = _.where(permissionsParameter, {resourceId: resource.id});
                    var isResourceGranted = preGrantedResources.length > 0;
                    var grantAllOperations = isResourceGranted ? preGrantedResources[0].operationId === 0 : false;

                    var preDeniedResources = _.where(constraintsParameter, {resourceId: resource.id});
                    var isResourceDenied = preDeniedResources.length > 0;
                    var denyAllOperations = isResourceDenied ? preDeniedResources[0].operationId === 0 : false;

                    angular.forEach(resource.operations, function (operation, key) {
                        var newEntry = {
                            resourceName: resource.name,
                            operationName: operation.name,
                            resourceId: resource.id,
                            operationId: operation.id,
                            operationGranted: false,
                            resourceGranted: false,
                            operationDenied: false,
                            resourceDenied: false
                        };

                        if (grantAllOperations) {
                            newEntry.operationGranted = true;
                            newEntry.resourceGranted = true;
                        } else if (isResourceGranted) {
                            var grantOp = angular.isDefined(_.findWhere(preGrantedResources, {operationName: operation.name}));
                            if (grantOp)
                                newEntry.operationGranted = true;
                        }

                        if (denyAllOperations) {
                            newEntry.operationDenied = true;
                            newEntry.resourceDenied = true;
                        } else if (isResourceDenied) {
                            var denyOp = angular.isDefined(_.findWhere(preDeniedResources, {operationName: operation.name}));
                            if (denyOp) newEntry.operationDenied = true;
                        }
                        this.push(newEntry);
                    }, $scope.flatResources);
                });

                // executes when the modal is opened first time contains both grants and constraints
                $scope.flatResourcesOrig = angular.copy($scope.flatResources);

                $scope.flatResources = $filter('orderBy')($scope.flatResources, ['resourceName', 'operationName']);
                $defer.resolve($scope.flatResources);
            }
        });

        var checkAllGranted = function (resource) {
            var isCheck = _.isUndefined(_.findWhere(resource.data, {operationGranted: false}));

            _.each(resource.data, function (item) {
                item.resourceGranted = isCheck;
            });
        }

        var checkAllDenied = function (resource) {
            var isCheck = _.isUndefined(_.findWhere(resource.data, {operationDenied: false}));

            _.each(resource.data, function (item) {
                item.resourceDenied = isCheck;
            });
        }

        var checkIndeterminate = function (selectedCount, itemsCount){
            if (selectedCount === 0) {
                return false;
            } else if (selectedCount < itemsCount) {
                return true;
            } else {
                return undefined;
            }
        }

        $scope.grantOperation = function (resource, item) {
            item.operationDenied = false;

            checkAllGranted(resource);
            checkAllDenied(resource);
        };

        $scope.grantAllOperations = function (item) {
            var isGranted = !item.data[0].resourceGranted;

            for (var i = 0; i < item.data.length; i++) {
                item.data[i].operationGranted = isGranted;
                item.data[i].resourceGranted = isGranted;

                item.data[i].operationDenied = false;
                item.data[i].resourceDenied = false;
            }
        };

        $scope.isAnyGranted = function (items) {
            // Count items with operationGranted explicitly true
            var grantedCount = _.filter(items, { operationGranted: true }).length
            return checkIndeterminate(grantedCount, items.length);

        };

        $scope.denyOperation = function (resource, item) {
            item.operationGranted = false;

            checkAllDenied(resource);
            checkAllGranted(resource);
        };

        $scope.denyAllOperations = function (item) {
            var isDenied = !item.data[0].resourceDenied;

            for (var i = 0; i < item.data.length; i++) {
                item.data[i].operationGranted = false;
                item.data[i].resourceGranted = false;

                item.data[i].operationDenied = isDenied;
                item.data[i].resourceDenied = isDenied;
            }
        };

        $scope.isAnyDenied = function (items) {
            // Count items with operationDenied explicitly true
            var deniedCount = _.filter(items, { operationDenied: true }).length;
            return checkIndeterminate(deniedCount, items.length);
        };

        $scope.ok = function () {
            angular.forEach($scope.flatResources, function (obj, key) {
                var orig = _.findWhere($scope.flatResourcesOrig, {
                    operationName: obj.operationName,
                    resourceName: obj.resourceName
                });
            });

            $uibModalInstance.close($scope.flatResources);
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    };

    var UserAccountsModalInstanceCtrl = function ($scope, $uibModalInstance, $log, $filter, NgTableParams, NgTableService, Restangular,
                                                  userAccountsParameter, groupNameParameter, userAccounts) {
        $log.debug('UserAccountsModalInstanceCtrl');

        $scope.selectedItems = userAccountsParameter ? userAccountsParameter : [];

        $scope.userGroupName = groupNameParameter;

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
    };

})();