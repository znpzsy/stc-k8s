(function () {

    'use strict';

    angular.module('adminportal.subsystems.provisioning.operations.users.accounts', []);

    var ProvisioningUsersAccountsOperationsModule = angular.module('adminportal.subsystems.provisioning.operations.users.accounts');

    ProvisioningUsersAccountsOperationsModule.config(function ($stateProvider) {

        // Users states
        $stateProvider.state('subsystems.provisioning.operations.users.accounts', {
            abstract: true,
            url: "",
            template: "<div ui-view></div>"
        }).state('subsystems.provisioning.operations.users.accounts.list', {
            url: "/useraccounts",
            templateUrl: "subsystems/provisioning/operations/users/operations.users.accounts.html",
            controller: 'ProvisioningOperationsUserAccountsCtrl',
            resolve: {
                userAccounts: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getUserAccounts(0, DEFAULT_REST_QUERY_LIMIT);
                }
            }
        }).state('subsystems.provisioning.operations.users.accounts.accountsUpdate', {
            url: "/useraccounts/:id",
            templateUrl: "subsystems/provisioning/operations/users/operations.users.accounts.detail.html",
            controller: 'ProvisioningOperationsUpdateUserAccountCtrl',
            resolve: {
                userAccount: function ($stateParams, CMPFService) {
                    return CMPFService.getUserAccount($stateParams.id, true);
                }
            }
        }).state('subsystems.provisioning.operations.users.accounts.newuseraccount', {
            url: "/newuseraccount",
            templateUrl: "subsystems/provisioning/operations/users/operations.users.accounts.detail.html",
            controller: 'ProvisioningOperationsNewUserAccountCtrl',
            resolve: {
                defaultOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_ORGANIZATION_NAME, false);
                }
            }
        });

    });

    // Users controllers
    ProvisioningUsersAccountsOperationsModule.controller('ProvisioningOperationsUserAccountsCommonCtrl', function ($scope, $log, $uibModal, CMPFService) {

        $log.debug('ProvisioningOperationsUserAccountsCommonCtrl');

        $scope.openOrganizations = function (userAccount) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.organizations.html',
                controller: 'OrganizationsModalInstanceCtrl',
                size: 'lg',
                resolve: {
                    organizationParameter: function () {
                        return angular.copy(userAccount.selectedOrganization);
                    },
                    itemName: function () {
                        return userAccount.userName;
                    },
                    allOrganizations: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                        return CMPFService.getAllOrganizations(0, DEFAULT_REST_QUERY_LIMIT);
                    },
                    organizationsModalTitleKey: function () {
                        return 'Subsystems.Provisioning.UserAccounts.OrganizationsModalTitle';
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
                userAccount.selectedOrganization = selectedItem.organization;
            }, function () {
            });
        };

        $scope.openUserGroups = function (userAccount) {
            var modalInstance = $uibModal.open({
                templateUrl: 'subsystems/provisioning/operations/users/operations.users.accounts.modal.usergroups.html',
                controller: UserGroupsModalInstanceCtrl,
                size: 'lg',
                resolve: {
                    userGroups: function () {
                        return angular.copy(userAccount.userGroups);
                    },
                    userAccountId: function () {
                        return userAccount.id;
                    },
                    userName: function () {
                        return userAccount.userName;
                    },
                    allUserGroups: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                        return CMPFService.getUserGroups(0, DEFAULT_REST_QUERY_LIMIT);
                    }
                }
            });

            modalInstance.result.then(function (selectedItems) {
                userAccount.userGroups = selectedItems;
            }, function () {
            });
        };

        $scope.removeSelectedGroup = function (userGroups, i) {
            var index = _.indexOf(userGroups, i);
            if (index != -1) {
                userGroups.splice(index, 1);
            }
        };

        $scope.resetConfirmPassword = function () {
            $scope.userAccount.confirmpassword = '';
        };

        $scope.cancel = function () {
            $scope.go('subsystems.provisioning.operations.users.accounts.list');
        };
    });

    ProvisioningUsersAccountsOperationsModule.controller('ProvisioningOperationsUserAccountsCtrl', function ($scope, $state, $log, $filter, $uibModal, NgTableParams, NgTableService, notification, $translate,
                                                                                                             CMPFService, Restangular, userAccounts) {
        $log.debug('ProvisioningOperationsUserAccountsCtrl');

        $scope.userAccounts = Restangular.stripRestangular(userAccounts);
        $scope.userAccounts.userAccounts = $filter('orderBy')($scope.userAccounts.userAccounts, 'id');
        _.each($scope.userAccounts.userAccounts, function (userAccount) {
            userAccount.activeDirectoryAuth = $filter('YesNoFilter')($filter('activeDirectoryAuthFilter')(userAccount.password));
            userAccount.userGroupNames = _.pluck(userAccount.userGroups, 'name').toString();
        });

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
                },
                {
                    fieldName: 'activeDirectoryAuth',
                    headerKey: 'Subsystems.Provisioning.UserAccounts.AuthAgainstAD'
                },
                {
                    fieldName: 'userGroupNames',
                    headerKey: 'Subsystems.Provisioning.UserAccounts.UserGroups'
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

        $scope.remove = function (user) {
            user.rowSelected = true;

            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                CMPFService.deleteUserAccount(user).then(function (response) {
                    $log.debug('Removed. Response: ', response);

                    var deletedListItem = _.findWhere($scope.userAccounts.userAccounts, {id: user.id});
                    $scope.userAccounts.userAccounts = _.without($scope.userAccounts.userAccounts, deletedListItem);

                    $scope.tableParams.reload();

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    user.rowSelected = false;
                }, function (response) {
                    $log.debug('Cannot remove user account. Error: ', response);
                    var res = Restangular.stripRestangular(response);
                    notification({
                        type: 'warning',
                        text: $translate.instant('CommonMessages.ApiError', {
                            errorCode: res.data.errorCode,
                            errorText: res.data.errorDescription
                        })
                    });

                    user.rowSelected = false;
                });
            }, function () {
                user.rowSelected = false;
            });
        };

        $scope.showUserGroupsOfAccount = function (user) {
            $uibModal.open({
                templateUrl: 'subsystems/provisioning/operations/users/operations.users.accounts.modal.groups.html',
                controller: UserAccountGroupsModalInstanceCtrl,
                size: 'lg',
                resolve: {
                    userAccountParameter: function () {
                        return user;
                    },
                    userAccountGroups: function (CMPFService) {
                        return CMPFService.getUserAccountGroups(user.id);
                    }
                }
            });
        };

        $scope.showUserRights = function (user) {
            $uibModal.open({
                templateUrl: 'subsystems/provisioning/operations/users/operations.users.accounts.modal.rights.html',
                controller: UserRightsModalInstanceCtrl,
                size: 'lg',
                resolve: {
                    userAccountParameter: function () {
                        return user;
                    },
                    userAccountRights: function (CMPFService) {
                        return CMPFService.getUserAccountRights(user.id);
                    }
                }
            });
        };

    });

    ProvisioningUsersAccountsOperationsModule.controller('ProvisioningOperationsNewUserAccountCtrl', function ($scope, $state, $log, $uibModal, $timeout, $q, $controller, notification, $translate,
                                                                                                               CMPFService, Restangular, USER_STATES, CMPF_USER_KEYS, defaultOrganization) {
        $log.debug('ProvisioningOperationsNewUserAccountCtrl');

        $controller('ProvisioningOperationsUserAccountsCommonCtrl', {$scope: $scope});

        $scope.USER_STATES = USER_STATES;

        $scope.userAccount = {
            state: $scope.USER_STATES[0],
            userName: '',
            activeDirectoryAuth: false,
            userGroups: [],
            userProfile: {
                Name: '',
                Surname: '',
                MobilePhoneNo: '',
                EMail: ''
            },
            selectedOrganization: defaultOrganization.organizations[0]
        };

        $scope.save = function (userAccount) {
            var userAccountItem = {
                userName: userAccount.userName,
                password: ($scope.userAccount.activeDirectoryAuth ? CMPF_USER_KEYS[0] : userAccount.password),
                state: userAccount.state,
                userGroups: [],
                organizationId: userAccount.selectedOrganization.id,
                profiles: []
            };

            // User profile attributes are filling.
            userAccountItem.profiles = [{
                "attributes": [
                    {"name": "Name", "value": userAccount.userProfile.Name},
                    {"name": "Surname", "value": userAccount.userProfile.Surname},
                    {"name": "MobilePhoneNo", "value": userAccount.userProfile.MobilePhoneNo},
                    {"name": "EMail", "value": userAccount.userProfile.EMail}
                ],
                "name": CMPFService.USER_PROFILE_NAME,
                "profileDefinitionName": CMPFService.USER_PROFILE_NAME
            }];

            var newUser = [userAccountItem];
            var userGroups = angular.copy(userAccount.userGroups); // replicated variable for manipulation

            var createUser = function (user) {
                return CMPFService.createUserAccount(user).then(function (response) {
                    var createdUserAccount = Restangular.stripRestangular(response);

                    $log.debug('Created user', createdUserAccount);

                    return createdUserAccount;
                }, function (response) {
                    $log.debug('Cannot create new user account. Error: ', response);

                    var message = $translate.instant('CommonMessages.CouldNotCreateNewUser');
                    if (response.data.errorCode === 5025801) {
                        message = $translate.instant('CommonMessages.CouldNotCreateNewUserAlreadyDefined');
                    }

                    throw(new Error(message));
                });
            };

            // simplfy
            var addUserToGroup = function (aUserGroup, aUserAccount) {
                var deferred = $q.defer();
                var promise = deferred.promise;
                CMPFService.addNewAccountsToUserGroup(aUserGroup, aUserAccount).then(function (response) {
                    $timeout(function () {
                        deferred.resolve(response);
                    }, 100);
                }, function (response) {
                    $log.debug('could not add user to group ', aUserGroup.name);

                    notification({
                        type: 'warning',
                        text: 'Could not add user to group: ' + aUserGroup.name
                    });

                    deferred.reject(response);
                });
                return promise;
            };

            var addUserToGroupRecursive = function (createdUserAccount) {
                var group = userGroups.shift();
                if (group) {
                    $log.debug('userGroup :', group.name);

                    addUserToGroup(group, createdUserAccount).then(function () {
                        return addUserToGroupRecursive(createdUserAccount);
                    });
                } else {
                    notification.flash({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    $scope.go('subsystems.provisioning.operations.users.accounts.list');
                }
            };

            var reportProblems = function (fault) {
                notification({
                    type: 'warning',
                    text: String(fault)
                });
            };

            createUser(newUser).then(addUserToGroupRecursive).catch(reportProblems);
        };
    });

    ProvisioningUsersAccountsOperationsModule.controller('ProvisioningOperationsUpdateUserAccountCtrl', function ($scope, $state, $log, $q, $filter, $controller, notification, $translate, $timeout, $stateParams, $uibModal,
                                                                                                                  CMPFService, Restangular, USER_STATES, CMPF_USER_KEYS, userAccount) {
        $log.debug('ProvisioningOperationsUpdateUserAccountCtrl');

        $controller('ProvisioningOperationsUserAccountsCommonCtrl', {$scope: $scope});

        var DUMMY_PASSWORD = '********';

        $scope.USER_STATES = USER_STATES;

        $scope.userAccount = Restangular.stripRestangular(userAccount);
        $scope.userAccount.selectedOrganization = userAccount.organization;
        $scope.originalGroups = angular.copy($scope.userAccount.userGroups);
        $scope.userAccount.confirmpassword = $scope.userAccount.password;
        $scope.userAccount.activeDirectoryAuth = $filter('activeDirectoryAuthFilter')($scope.userAccount.password);

        $scope.originalPassword = angular.copy($scope.userAccount.password);
        $scope.userAccount.password = DUMMY_PASSWORD;
        $scope.userAccount.confirmpassword = DUMMY_PASSWORD;

        $scope.userAccount.userProfile = CMPFService.extractUserProfile(userAccount);

        $scope.userAccountOriginal = angular.copy($scope.userAccount);
        $scope.isNotChanged = function () {
            return angular.equals($scope.userAccount, $scope.userAccountOriginal);
        };

        $scope.save = function (userAccount) {
            var userAccountItem = {
                id: $scope.userAccountOriginal.id,
                userName: $scope.userAccountOriginal.userName,
                password: ($scope.userAccount.activeDirectoryAuth ? CMPF_USER_KEYS[0] : userAccount.password),
                state: userAccount.state,
                userGroups: userAccount.userGroups,
                organization: userAccount.selectedOrganization,
                organizationId: userAccount.selectedOrganization.id,
                profiles: $scope.userAccount.profiles ? angular.copy($scope.userAccount.profiles) : []
            };

            if (userAccountItem.password == DUMMY_PASSWORD) {
                userAccountItem.password = $scope.originalPassword;
            }

            // filterout existing groups. add user to only new groups
            var addToNewGroups = _.filter(userAccount.userGroups, function (obj) {
                return !_.findWhere($scope.originalGroups, {"id": obj.id});
            });
            var groupsToRemove = _.filter($scope.originalGroups, function (obj) {
                return !_.findWhere(userAccount.userGroups, {"id": obj.id});
            });

            // UserProfile
            if (userAccount.userProfile) {
                var originalUserProfile = CMPFService.findProfileByName(userAccountItem.profiles, CMPFService.USER_PROFILE_NAME);
                var updatedUserProfile = JSON.parse(angular.toJson(userAccount.userProfile));
                var userProfileArray = CMPFService.prepareProfile(updatedUserProfile, originalUserProfile);
                // ---
                if (originalUserProfile) {
                    originalUserProfile.attributes = userProfileArray;
                } else {
                    var userProfile = {
                        name: CMPFService.USER_PROFILE_NAME,
                        profileDefinitionName: CMPFService.USER_PROFILE_NAME,
                        attributes: userProfileArray
                    };

                    userAccountItem.profiles.push(userProfile);
                }
            }

            var updateUser = function (user) {
                return CMPFService.updateUserAccount(user).then(function (response) {
                    $log.debug('Updated user account. ', response);

                    return user;
                }, function (response) {
                    $log.debug('Cannot update user account. Error: ', response);

                    throw(new Error($translate.instant('CommonMessages.CouldNotUpdateUser')));
                });
            };

            var addUserToGroup = function (aUserGroup, aUserAccount) {
                var deferred = $q.defer();
                var promise = deferred.promise;
                $log.debug('add to this userGroup', aUserGroup.name);
                CMPFService.addNewAccountsToUserGroup(aUserGroup, [aUserAccount]).then(function (response) {
                    $log.debug('added user to group ', aUserGroup.name);
                    $timeout(function () {
                        $log.debug('resolved userGroup', aUserGroup.name);
                        deferred.resolve(response);
                    }, 100);
                }, function (response) {
                    $log.debug('could not add user to group ', aUserGroup.name);
                    deferred.reject(response);
                    throw(new Error($translate.instant('CommonMessages.CouldNotUpdateUser')));
                });
                return promise;
            };

            var addUserToGroups = function (updatedUserAccount) {
                $log.debug('add to all userGroups');
                if (addToNewGroups.length) {
                    var group = addToNewGroups.shift();
                    if (group) {
                        $log.debug('add to userGroup :', group.name);
                        return addUserToGroup(group, updatedUserAccount).then(function () {
                            return addUserToGroups(updatedUserAccount);
                        });
                    }
                } else {
                    $log.debug('added to all userGroups');
                    return updatedUserAccount;
                }
            };

            var removeUserFromGroup = function (group, user) {
                var deferred = $q.defer();
                var promise = deferred.promise;
                $log.debug('remove from this userGroup', group.name);
                CMPFService.removeAccountFromUserGroup(group, user).then(function (response) {
                    $log.debug('removed from userGroup :', group.name);
                    $timeout(function () {
                        $log.debug('resolved userGroup', group.name);
                        deferred.resolve(response);
                    }, 100);
                }, function (response) {
                    $log.debug('Could not remove user from group ', group.name);
                    deferred.reject(response);
                });
                return promise;
            };

            var removeUserFromGroups = function (updatedUserAccount) {
                $log.debug('remove from all userGroups');
                if (groupsToRemove.length) {
                    $log.debug('remove user from:', groupsToRemove);
                    var group = groupsToRemove.shift();
                    if (group) {
                        $log.debug('remove from userGroup :', group.name);
                        return removeUserFromGroup(group, updatedUserAccount).then(function () {
                            return removeUserFromGroups(updatedUserAccount);
                        });
                    }
                } else {
                    notification.flash({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    $scope.go('subsystems.provisioning.operations.users.accounts.list');
                }
            };

            var reportProblems = function (fault) {
                notification({
                    type: 'warning',
                    text: String(fault)
                });
            };

            updateUser(userAccountItem).then(addUserToGroups).then(removeUserFromGroups).catch(reportProblems);
        };
    });

    var UserGroupsModalInstanceCtrl = function ($scope, $uibModalInstance, $log, $filter, NgTableParams, NgTableService, CMPFService,
                                                Restangular, userGroups, userAccountId, userName, allUserGroups) {
        $log.debug('UserGroupsModalInstanceCtrl');

        $scope.selectedItems = userGroups ? userGroups : [];

        $scope.userAccountId = userAccountId;
        $scope.userName = userName;

        $scope.allUserGroups = Restangular.stripRestangular(allUserGroups);

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
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.allUserGroups.userGroups);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.allUserGroups.userGroups;
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

        $scope.addToSelection = function (group) {
            var user = _.findWhere($scope.selectedItems, {name: group.name});
            if (!user)
                $scope.selectedItems.push(group);
        };

        $scope.removeFromSelection = function (group) {
            var index = _.indexOf($scope.selectedItems, group);
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

    var UserAccountGroupsModalInstanceCtrl = function ($scope, $uibModalInstance, $log, $filter, NgTableParams, NgTableService, Restangular, userAccountParameter,
                                                       userAccountGroups) {
        $log.debug('UserAccountGroupsModalInstanceCtrl');

        $scope.userAccount = userAccountParameter;

        $scope.userAccountGroups = Restangular.stripRestangular(userAccountGroups);
        $scope.userAccountGroups.userGroups = $filter('orderBy')($scope.userAccountGroups.userGroups, ['id']);

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
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.userAccountGroups.userGroups);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.userAccountGroups.userGroups;
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

    var UserRightsModalInstanceCtrl = function ($scope, $uibModalInstance, $log, $filter, NgTableParams, NgTableService,
                                                Restangular, CMPFService, userAccountParameter, userAccountRights) {
        $log.debug('UserRightsModalInstanceCtrl');

        $scope.userAccountRights = Restangular.stripRestangular(userAccountRights);
        $scope.user = userAccountParameter;

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
                var userAccountRights = $filter('orderBy')($scope.userAccountRights, ['resourceName', 'operationName']);
                $defer.resolve(userAccountRights);
            }
        });

        $scope.ok = function () {
            $uibModalInstance.close();
        };
    };

})();