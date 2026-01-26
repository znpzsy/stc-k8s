(function () {

    'use strict';

    angular.module('ccportal.users.useraccounts', []);

    var UsersUserAccountsModule = angular.module('ccportal.users.useraccounts');

    UsersUserAccountsModule.config(function ($stateProvider) {

        $stateProvider.state('users.list', {
            url: "/user-accounts",
            templateUrl: "users/users.useraccounts.html",
            controller: 'UsersCtrl',
            resolve: {
                userAccounts: function ($rootScope, CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    var organizationId = $rootScope.getOrganizationId();

                    return CMPFService.getUserAccountsByOrganizationId(0, DEFAULT_REST_QUERY_LIMIT, organizationId);
                }
            }
        }).state('users.new', {
            url: "/new",
            templateUrl: "users/users.useraccounts.details.html",
            controller: 'UsersUserAccountsNewCtrl'
        }).state('users.update', {
            url: "/update/:id",
            templateUrl: "users/users.useraccounts.details.html",
            controller: 'UsersUserAccountsUpdateCtrl',
            resolve: {
                userAccount: function (CMPFService, $stateParams) {
                    return CMPFService.getUserAccount($stateParams.id, true, true);
                }
            }
        });

    });

    // Users Controller
    UsersUserAccountsModule.controller('UsersCtrl', function ($scope, $log, $filter, $uibModal, $translate, notification, NgTableParams, NgTableService,
                                                              Restangular, SessionService, CMPFService, userGroups, userAccounts) {
        $scope.userAccounts = userAccounts.userAccounts;
        _.each($scope.userAccounts, function (userAccount) {
            userAccount.groupNames = _.pluck(userAccount.userGroups, 'name').join(', ');
            userAccount.groupIds = _.map(userAccount.userGroups, _.iteratee('id'));
        });

        var allUserGroupIds = _.map(userGroups ? userGroups.userGroups : [], _.iteratee('id'));

        // Filter out only the users which are included a customer care group.
        $scope.userAccounts = _.filter($scope.userAccounts, function (userAccount) {
            var groupIntersection = _.intersection(userAccount.groupIds, allUserGroupIds);

            return groupIntersection && groupIntersection.length > 0;
        });

        $scope.usersTable = {
            list: $scope.userAccounts,
            tableParams: {}
        };

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.usersTable.tableParams.settings().$scope.filterText = filterText;
            $scope.usersTable.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.usersTable.tableParams.page(1);
            $scope.usersTable.tableParams.reload();
        }, 750);

        $scope.usersTable.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "userName": 'asc'
            }
        }, {
            total: $scope.usersTable.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.usersTable.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.usersTable.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - Activity history list definitions

        // Shows a confirmation window and if yes would select then delete the user account. Refresh the table after that.
        $scope.remove = function (user) {
            // Check is user admin so only admin users can delete a user.
            if (!SessionService.isUserAdmin()) {
                return $scope.go('users.list', {}, {reload: true});
            }

            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: function ($scope, $uibModalInstance, $translate, $controller, $sce) {
                    user.rowSelected = true;

                    $controller('ConfirmationModalInstanceCtrl', {
                        $scope: $scope,
                        $uibModalInstance: $uibModalInstance
                    });
                },
                size: 'sm'
            });

            modalInstance.result.then(function () {
                CMPFService.deleteUserAccount(user).then(function (response) {
                    $log.debug('Removed. Response: ', response);

                    var deletedListItem = _.findWhere($scope.usersTable.list, {
                        userName: user.userName
                    });
                    $scope.usersTable.list = _.without($scope.usersTable.list, deletedListItem);

                    $scope.usersTable.tableParams.reload();

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                }, function (response) {
                    $log.debug('Cannot remove user account. Error: ', response);
                    var res = Restangular.stripRestangular(response);
                    notification({
                        type: 'danger',
                        text: $translate.instant('CommonMessages.ApiError', {
                            errorCode: res.data.errorCode,
                            errorText: res.data.errorDescription
                        })
                    });
                });

                user.rowSelected = false;
            }, function () {
                user.rowSelected = false;
            });
        };
    });

    // Create New User Controller
    UsersUserAccountsModule.controller('UsersUserAccountsNewCtrl', function ($scope, $rootScope, $log, $state, $uibModal, $q, $filter, notification, $translate, $timeout,
                                                                             Restangular, UtilService, SessionService, CMPFService, STATUS_TYPES, userGroups) {
        // Check is user admin so only admin users can create a user.
        if (!SessionService.isUserAdmin()) {
            return $scope.go('users.list', {}, {reload: true});
        }

        $scope.STATUS_TYPES = STATUS_TYPES;

        $scope.userGroupList = $filter('orderBy')(userGroups ? userGroups.userGroups : [], ['name']);

        $scope.userAccount = {
            password: '',
            confirmpassword: '',
            state: STATUS_TYPES[0].value,
            userGroups: [],
            userProfile: {
                Type: 'COMMON',
                Name: '',
                Surname: '',
                MobilePhone: '',
                FixedPhone: '',
                Email: '',
                SupervisorEmail: '',
                ActiveDirectoryAuthentication: true,
                LastUpdateTime: null
            }
        };

        $scope.resetConfirmPassword = function () {
            $scope.userAccount.confirmpassword = '';
        };

        $scope.save = function (userAccount) {
            var currentTimestamp = $filter('date')(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss');

            $log.debug('User creating request: ', userAccount);

            if (!SessionService.isUserAdmin()) {
                return $scope.go('users.list', {}, {reload: true});
            }

            var userAccountItem = {
                userName: userAccount.userName,
                state: userAccount.state,
                organizationId: $rootScope.getOrganizationId(),
                profiles: []
            };

            // If active directory selected do not activate the user activity monitoring options.
            if (userAccount.userProfile) {
                if (userAccount.userProfile.ActiveDirectoryAuthentication) {
                    userAccount.userProfile.IsPwdResetForcedAtFirstLogin = false;
                    userAccount.userProfile.EnforceStrongPasswords = false;
                    userAccount.userProfile.EnforcePasswordAging = false;
                    userAccount.userProfile.MonitorConsecutiveLoginFailures = false;
                    userAccount.userProfile.MonitorUserInactivity = false;
                } else {
                    userAccountItem.password = userAccount.password;
                }
            }

            // User profile attributes are filling.
            var userProfileItem = {
                "attributes": [
                    {
                        "name": "Type",
                        "value": userAccount.userProfile.Type
                    },
                    {
                        "name": "Name",
                        "value": userAccount.userProfile.Name
                    },
                    {
                        "name": "Surname",
                        "value": userAccount.userProfile.Surname
                    },
                    {
                        "name": "MobilePhone",
                        "value": userAccount.userProfile.MobilePhone
                    },
                    {
                        "name": "FixedPhone",
                        "value": userAccount.userProfile.FixedPhone
                    },
                    {
                        "name": "Email",
                        "value": userAccount.userProfile.Email
                    },
                    {
                        "name": "SupervisorEmail",
                        "value": userAccount.userProfile.SupervisorEmail
                    },
                    {
                        "name": "ActiveDirectoryAuthentication",
                        "value": userAccount.userProfile.ActiveDirectoryAuthentication
                    },
                    {
                        "name": "IsPwdResetForcedAtFirstLogin",
                        "value": false
                    },
                    {
                        "name": "EnforceStrongPasswords",
                        "value": userAccount.userProfile.EnforceStrongPasswords
                    },
                    {
                        "name": "EnforcePasswordAging",
                        "value": false
                    },
                    {
                        "name": "MonitorConsecutiveLoginFailures",
                        "value": userAccount.userProfile.MonitorConsecutiveLoginFailures
                    },
                    {
                        "name": "MonitorUserInactivity",
                        "value": userAccount.userProfile.MonitorUserInactivity
                    },
                    {
                        "name": "EffectiveDate",
                        "value": $filter('date')(UtilService.getTodayBegin(), 'yyyy-MM-dd') + 'T00:00:00'
                    },
                    {
                        "name": "ExpiryDate",
                        "value": '2099-01-01T00:00:00'
                    },
                    {
                        "name": "LastUpdateTime",
                        "value": $filter('date')(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss')
                    }
                ],
                "name": CMPFService.USER_PROFILE_NAME,
                "profileDefinitionName": CMPFService.USER_PROFILE_NAME
            };

            userAccountItem.profiles.push(userProfileItem);

            // EntityAuditProfile
            userAccount.entityAuditProfile = {
                CreatedBy: SessionService.getUsername(),
                CreatedOn: currentTimestamp,
                CreateApprovedBy: SessionService.getUsername(),
                CreateApprovedOn: currentTimestamp
            };
            var entityAuditProfile = CMPFService.prepareNewEntityAuditProfile(userAccount.entityAuditProfile);
            userAccountItem.profiles.push(entityAuditProfile);

            var createUser = function (userAccount) {
                return CMPFService.createUserAccount(userAccount).then(function (response) {
                    $log.debug('User created: ', response);

                    var createdUserAccount = Restangular.stripRestangular(response);

                    return createdUserAccount;
                }, function (response) {
                    $log.debug('Cannot create new user account. Error: ', response);

                    if (response.data.errorCode === CMPFService.ERROR_CODES.DUPLICATE_USER_NAME) {
                        throw(new Error($translate.instant('CommonMessages.UserNameAlreadyExist')));
                    } else if (response.data.errorDescription) {
                        throw(new Error(response.data.errorDescription));
                    } else {
                        throw(new Error($translate.instant('CommonMessages.CouldNotCreateNewUser')));
                    }
                });
            };

            var addUserToGroup = function (aUserGroup, aUserAccount) {
                var deferred = $q.defer();
                var promise = deferred.promise;
                CMPFService.addNewAccountsToUserGroup(aUserGroup, aUserAccount).then(function (response) {
                    $timeout(function () {
                        deferred.resolve(response);
                    }, 100);
                }, function (response) {
                    $log.debug('Could not add user to group ', aUserGroup.name);

                    notification({
                        type: 'warning',
                        text: 'Could not add user to group: ' + aUserGroup.name
                    });

                    deferred.reject(response);
                });
                return promise;
            };

            var userGroups = angular.copy($scope.userAccount.userGroups);
            var addUserToGroupRecursive = function (createdUserAccount) {
                var group = userGroups.shift();
                if (group) {
                    $log.debug('userGroup :', group.name);

                    addUserToGroup(group, createdUserAccount).then(function () {
                        return addUserToGroupRecursive(createdUserAccount);
                    });
                }
            };

            var reportProblems = function (fault) {
                notification({
                    type: 'warning',
                    text: String(fault)
                });
            };

            createUser([userAccountItem]).then(addUserToGroupRecursive).then($scope.goToList).catch(reportProblems);
        };

        $scope.showUserForm = true;

        $scope.goToList = function () {
            notification.flash({
                type: 'success',
                text: $translate.instant('CommonLabels.OperationSuccessful')
            });

            $scope.cancel();
        };

        $scope.cancel = function () {
            $scope.go('users.list');
        };
    });

    // Update User Controller
    UsersUserAccountsModule.controller('UsersUserAccountsUpdateCtrl', function ($scope, $rootScope, $log, $state, $uibModal, $q, $filter, notification, $translate, $timeout, Restangular,
                                                                                SessionService, CMPFService, STATUS_TYPES, CMPF_USER_KEYS, userAccount, userGroups) {

        // Check is user admin so only admin users can update a user or only can update itself.
        if (!SessionService.isUserAdmin()) {
            var isUserAdmin = _.findWhere(userAccount.userGroups, {name: CMPFService.DSP_CUSTOMER_CARE_ADMIN_GROUP});

            if (!isUserAdmin && (userAccount.id !== SessionService.getUserId())) {
                return $scope.go('users.list', {}, {reload: true});
            }
        }

        var DUMMY_PASSWORD = '********';

        $scope.cmpfUserAccount = Restangular.stripRestangular(userAccount);

        $scope.STATUS_TYPES = STATUS_TYPES;

        $scope.userGroupList = $filter('orderBy')(userGroups ? userGroups.userGroups : [], ['name']);

        $scope.userAccount = {
            id: userAccount.id,
            userName: userAccount.userName,
            password: DUMMY_PASSWORD,
            confirmpassword: DUMMY_PASSWORD,
            state: userAccount.state,
            organizationId: userAccount.organizationId,
            userGroups: userAccount.userGroups
        };

        $scope.resetConfirmPassword = function () {
            $scope.userAccount.confirmpassword = '';
        };

        $scope.originalPassword = angular.copy($scope.userAccount.password);

        // UserProfile
        var userProfiles = CMPFService.getProfileAttributes(userAccount.profiles, CMPFService.USER_PROFILE_NAME);
        if (userProfiles.length > 0) {
            $scope.userAccount.userProfile = angular.copy(userProfiles[0]);
        } else {
            $scope.userAccount.userProfile = {
                ActiveDirectoryAuthentication: true,
                LastUpdateTime: null
            };
        }

        // EntityAuditProfile
        var entityAuditProfiles = CMPFService.getProfileAttributes($scope.cmpfUserAccount.profiles, CMPFService.ENTITY_AUDIT_PROFILE);
        if (entityAuditProfiles.length > 0) {
            $scope.userAccount.entityAuditProfile = angular.copy(entityAuditProfiles[0]);
        }

        $scope.originalUserAccount = angular.copy($scope.userAccount);
        $scope.isNotChanged = function () {
            return angular.equals($scope.originalUserAccount, $scope.userAccount);
        };

        $scope.save = function (userAccount) {
            var currentTimestamp = $filter('date')(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss');

            $log.debug('User updating request: ', userAccount);

            // Check is user admin so only admin users can update a user or only can update itself.
            if (!SessionService.isUserAdmin()) {
                var isUserAdmin = _.findWhere(userAccount.userGroups, {name: CMPFService.DSP_CUSTOMER_CARE_ADMIN_GROUP});

                if (!isUserAdmin && (userAccount.id !== SessionService.getUserId())) {
                    return $scope.go('users.list', {}, {reload: true});
                }
            }

            var userAccountItem = {
                id: $scope.originalUserAccount.id,
                userName: $scope.originalUserAccount.userName,
                state: userAccount.state,
                organizationId: $rootScope.getOrganizationId(),
                profiles: ($scope.cmpfUserAccount.profiles === undefined ? [] : $scope.cmpfUserAccount.profiles)
            };

            if (!userAccount.userProfile.ActiveDirectoryAuthentication && userAccount.password) {
                userAccountItem.password = (userAccount.password === DUMMY_PASSWORD) ? null : userAccount.password;
            }

            // Filter out existing groups. add user to only new groups
            var addToNewGroups = _.filter(userAccount.userGroups, function (obj) {
                return !_.findWhere($scope.originalUserAccount.userGroups, {"id": obj.id});
            });
            var groupsToRemove = _.filter($scope.originalUserAccount.userGroups, function (obj) {
                return !_.findWhere(userAccount.userGroups, {"id": obj.id});
            });

            // UserProfile
            if (userAccount.userProfile) {
                var originalUserProfile = CMPFService.findProfileByName(userAccountItem.profiles, CMPFService.USER_PROFILE_NAME);
                var updatedUserProfile = JSON.parse(angular.toJson(userAccount.userProfile));

                // Update the last update time for create first time or for update everytime.
                updatedUserProfile.LastUpdateTime = $filter('date')(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss');

                // If active directory selected do not activate the user activity monitoring options.
                if (updatedUserProfile.ActiveDirectoryAuthentication) {
                    updatedUserProfile.IsPwdResetForcedAtFirstLogin = false;
                    updatedUserProfile.EnforceStrongPasswords = false;
                    updatedUserProfile.EnforcePasswordAging = false;
                    updatedUserProfile.MonitorConsecutiveLoginFailures = false;
                    updatedUserProfile.MonitorUserInactivity = false;
                }

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

            // EntityAuditProfile
            var originalEntityAuditProfile = CMPFService.findProfileByName(userAccountItem.profiles, CMPFService.ENTITY_AUDIT_PROFILE);
            userAccount.entityAuditProfile = {
                LastUpdatedBy: SessionService.getUsername(),
                LastUpdatedOn: currentTimestamp,
                LastUpdateApprovedBy: SessionService.getUsername(),
                LastUpdateApprovedOn: currentTimestamp
            };
            var updatedEntityAuditProfile = JSON.parse(angular.toJson(userAccount.entityAuditProfile));
            var entityAuditProfileArray = CMPFService.prepareProfile(updatedEntityAuditProfile, originalEntityAuditProfile);
            // ---
            if (originalEntityAuditProfile) {
                originalEntityAuditProfile.attributes = entityAuditProfileArray;
            } else {
                var entityAuditProfile = {
                    name: CMPFService.ENTITY_AUDIT_PROFILE,
                    profileDefinitionName: CMPFService.ENTITY_AUDIT_PROFILE,
                    attributes: entityAuditProfileArray
                };

                userAccountItem.profiles.push(entityAuditProfile);
            }

            var updateUser = function (userAccount) {
                return CMPFService.updateUserAccount(userAccount).then(function (response) {
                    $log.debug('User updated: ', response);

                    return userAccount;
                }, function (response) {
                    $log.debug('Cannot update user account. Error: ', response);
                    if (response.data.errorCode === CMPFService.ERROR_CODES.DUPLICATE_USER_NAME) {
                        throw(new Error($translate.instant('CommonMessages.UserNameAlreadyExist')));
                    } else {
                        if (response.data.errorDescription) {
                            throw(new Error(response.data.errorDescription));
                        } else {
                            throw(new Error($translate.instant('CommonMessages.CouldNotUpdateUser')));
                        }
                    }
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
                $log.debug('add to all userGroups:', addToNewGroups);
                if (addToNewGroups.length) {
                    var group = addToNewGroups.shift();
                    if (group) {
                        $log.debug('Add to userGroup :', group.name);
                        return addUserToGroup(group, updatedUserAccount).then(function () {
                            return addUserToGroups(updatedUserAccount);
                        });
                    }
                } else {
                    $log.debug('Added to all userGroups');
                    return updatedUserAccount;
                }
            };

            var removeUserFromGroup = function (group, user) {
                var deferred = $q.defer();
                var promise = deferred.promise;
                $log.debug('Remove from this userGroup', group.name);
                CMPFService.removeAccountFromUserGroup(group, user).then(function (response) {
                    $log.debug('Removed from userGroup :', group.name);
                    $timeout(function () {
                        $log.debug('Resolved userGroup', group.name);
                        deferred.resolve(response);
                    }, 100);
                }, function (response) {
                    $log.debug('Could not remove user from group ', group.name);
                    deferred.reject(response);
                });
                return promise;
            };

            var removeUserFromGroups = function (updatedUserAccount) {
                $log.debug('Remove from all userGroups:', groupsToRemove);
                if (groupsToRemove.length) {
                    $log.debug('Remove user from:', groupsToRemove);
                    var group = groupsToRemove.shift();
                    if (group) {
                        $log.debug('Remove from userGroup :', group.name);
                        return removeUserFromGroup(group, updatedUserAccount).then(function () {
                            return removeUserFromGroups(updatedUserAccount);
                        });
                    }
                }
            };

            var reportProblems = function (fault) {
                notification({
                    type: 'warning',
                    text: String(fault)
                });
            };

            updateUser(userAccountItem).then(addUserToGroups).then(removeUserFromGroups).then($scope.goToList).catch(reportProblems);
        };

        $scope.showUserForm = true;

        $scope.goToList = function () {
            notification.flash({
                type: 'success',
                text: $translate.instant('CommonLabels.OperationSuccessful')
            });

            $scope.cancel();
        };

        $scope.cancel = function () {
            $scope.go('users.list');
        };
    });

})();
