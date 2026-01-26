(function () {

    'use strict';

    angular.module('partnerportal.partner-info.users', []);

    var PartnerInfoUsersModule = angular.module('partnerportal.partner-info.users');

    PartnerInfoUsersModule.config(function ($stateProvider) {

        $stateProvider.state('partner-info.users', {
            abstract: true,
            url: "/users",
            template: "<div ui-view></div>",
            data: {
                permissions: [
                    'PRM__USERACCOUNT_READ'
                ]
            }
        }).state('partner-info.users.list', {
            url: "/user-accounts",
            templateUrl: "partner-info/users/users.html",
            controller: 'PartnerInfoUsersCtrl',
            resolve: {
                userAccounts: function ($rootScope, CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    var organizationId = $rootScope.getOrganizationId();

                    return CMPFService.getUserAccountsByOrganizationId(0, DEFAULT_REST_QUERY_LIMIT, organizationId);
                }
            }
        }).state('partner-info.users.new', {
            url: "/new",
            templateUrl: "partner-info/users/users.details.html",
            controller: 'PartnerInfoUsersUserAccountsNewCtrl',
            resolve: {
                partnerAdminUserGroup: function (CMPFService) {
                    return CMPFService.getUserAccountGroupsByName(CMPFService.DSP_PARTNER_ADMIN_GROUP);
                },
                partnerAgentUserGroup: function (CMPFService) {
                    return CMPFService.getUserAccountGroupsByName(CMPFService.DSP_PARTNER_USER_GROUP);
                }
            }
        }).state('partner-info.users.update', {
            url: "/update/:id",
            templateUrl: "partner-info/users/users.details.html",
            controller: 'PartnerInfoUsersUserAccountsUpdateCtrl',
            resolve: {
                partnerAdminUserGroup: function (CMPFService) {
                    return CMPFService.getUserAccountGroupsByName(CMPFService.DSP_PARTNER_ADMIN_GROUP);
                },
                partnerAgentUserGroup: function (CMPFService) {
                    return CMPFService.getUserAccountGroupsByName(CMPFService.DSP_PARTNER_USER_GROUP);
                },
                userAccount: function (CMPFService, $stateParams) {
                    return CMPFService.getUserAccount($stateParams.id, true, true);
                }
            }
        });

    });

    // Users Controller
    PartnerInfoUsersModule.controller('PartnerInfoUsersCtrl', function ($scope, $log, $filter, $uibModal, $translate, notification, NgTableParams, NgTableService,
                                                                        Restangular, SessionService, CMPFService, userAccounts) {
        $scope.userAccounts = userAccounts.userAccounts;
        _.each($scope.userAccounts, function (userAccount) {
            userAccount.groupNames = _.pluck(userAccount.userGroups, 'name').join(', ');
        });

        // Filter out only the users which are included a customer care group.
        $scope.userAccounts = _.filter($scope.userAccounts, function (userAccount) {
            var foundUserGroup = _.findWhere(userAccount.userGroups, {name: CMPFService.DSP_PARTNER_ADMIN_GROUP});
            if (!foundUserGroup) {
                foundUserGroup = _.findWhere(userAccount.userGroups, {name: CMPFService.DSP_PARTNER_USER_GROUP});
            }

            return !_.isUndefined(foundUserGroup);
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
                return $scope.go('partner-info.users.list', {}, {reload: true});
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
    PartnerInfoUsersModule.controller('PartnerInfoUsersUserAccountsNewCtrl', function ($scope, $rootScope, $log, $controller, $state, $filter, $uibModal, $q, notification, $translate, $timeout,
                                                                                       Restangular, SessionService, CMPFService, STATUS_TYPES, partnerAdminUserGroup,
                                                                                       partnerAgentUserGroup) {

        // Check is user admin so only admin users can create a user.
        if (!SessionService.isUserAdmin()) {
            return $scope.go('partner-info.users.list', {}, {reload: true});
        }

        $controller('GenericDateTimeCtrl', {$scope: $scope});

        $scope.dateHolder.startDate = null;
        $scope.dateHolder.endDate = null;

        $scope.STATUS_TYPES = STATUS_TYPES;

        var adminUserGroup = partnerAdminUserGroup.userGroups[0];
        var normalUserGroup = partnerAgentUserGroup.userGroups[0];

        $scope.userAccount = {
            password: '',
            confirmpassword: '',
            state: STATUS_TYPES[0].value,
            isAdminUser: false
        };

        $scope.save = function (userAccount) {
            var currentTimestamp = $filter('date')(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss');

            $log.debug('User creating request: ', userAccount);

            if (!SessionService.isUserAdmin()) {
                return $scope.go('partner-info.users.list', {}, {reload: true});
            }

            var userAccountItem = {
                userName: userAccount.userName + '@' + $rootScope.getOrganizationName(),
                password: userAccount.password,
                state: userAccount.state,
                organizationId: $rootScope.getOrganizationId(),
                profiles: []
            };

            var userGroup = (userAccount.isAdminUser ? angular.copy(adminUserGroup) : angular.copy(normalUserGroup));

            // If active directory selected do not activate the user activity monitoring options.
            if (userAccount.userProfile && userAccount.userProfile.ActiveDirectoryAuthentication) {
                userAccount.userProfile.IsPwdResetForcedAtFirstLogin = false;
                userAccount.userProfile.EnforceStrongPasswords = false;
                userAccount.userProfile.EnforcePasswordAging = false;
                userAccount.userProfile.MonitorConsecutiveLoginFailures = false;
                userAccount.userProfile.MonitorUserInactivity = false;
            }

            // User profile attributes are filling.
            var userProfileItem = {
                "attributes": [
                    {
                        "name": "Type",
                        "value": 'COMMON'
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
                        "name": "EffectiveDate",
                        "value": ($scope.dateHolder.startDate ? $filter('date')($scope.dateHolder.startDate, 'yyyy-MM-dd') + 'T00:00:00' : '')
                    },
                    {
                        "name": "ExpiryDate",
                        "value": $filter('date')($scope.dateHolder.endDate, 'yyyy-MM-dd') + 'T00:00:00'
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
                    } else {
                        throw(new Error($translate.instant('CommonMessages.CouldNotCreateNewUser')));
                    }
                });
            };

            var addUserToGroup = function (userAccount) {
                CMPFService.addNewAccountsToUserGroup(userGroup, userAccount).then(function (response) {
                    $log.debug('User added group: ', userGroup.name);

                    notification.flash({
                        type: 'success',
                        text: $translate.instant('CommonMessages.CreateNewUserSucceded')
                    });

                    $state.go('partner-info.users.list');
                }, function () {
                    $log.debug('Could not add user to group: ', userGroup.name);
                });
            };

            var reportProblems = function (fault) {
                notification({
                    type: 'warning',
                    text: String(fault)
                });
            };

            createUser([userAccountItem]).then(addUserToGroup).catch(reportProblems);
        };

        $scope.showUserForm = true;

        $scope.cancel = function () {
            $scope.go('partner-info.users.list');
        };
    });

    // Update User Controller
    PartnerInfoUsersModule.controller('PartnerInfoUsersUserAccountsUpdateCtrl', function ($scope, $rootScope, $log, $controller, $state, $filter, $uibModal, $q, notification, $translate, $timeout, Restangular,
                                                                                          DateTimeConstants, SessionService, CMPFService, STATUS_TYPES, CMPF_USER_KEYS, userAccount, partnerAdminUserGroup,
                                                                                          partnerAgentUserGroup) {

        // Check is user admin so only admin users can update a user or only can update itself.
        if (!SessionService.isUserAdmin()) {
            var foundUserGroup = _.findWhere(userAccount.userGroups, {name: CMPFService.DSP_PARTNER_ADMIN_GROUP});
            if (!foundUserGroup) {
                foundUserGroup = _.findWhere(userAccount.userGroups, {name: CMPFService.DSP_PARTNER_USER_GROUP});
            }

            if (!foundUserGroup) {
                return $scope.go('partner-info.users.list', {}, {reload: true});
            } else if (userAccount.id !== SessionService.getUserId()) {
                return $scope.go('partner-info.users.list', {}, {reload: true});
            }
        }

        $controller('GenericDateTimeCtrl', {$scope: $scope});

        $scope.cmpfUserAccount = Restangular.stripRestangular(userAccount);

        $scope.STATUS_TYPES = STATUS_TYPES;

        var dummyPassword = s.repeat('*', 8);

        var adminUserGroup = partnerAdminUserGroup.userGroups[0];
        var normalUserGroup = partnerAgentUserGroup.userGroups[0];

        $scope.userAccount = {
            id: userAccount.id,
            userName: userAccount.userName,
            password: dummyPassword,
            confirmpassword: dummyPassword,
            state: userAccount.state,
            organizationId: userAccount.organizationId
        };

        // UserProfile
        var userProfiles = CMPFService.getProfileAttributes($scope.cmpfUserAccount.profiles, CMPFService.USER_PROFILE_NAME);
        if (userProfiles.length > 0) {
            $scope.userAccount.userProfile = angular.copy(userProfiles[0]);
            $scope.dateHolder.startDate = ($scope.userAccount.userProfile.EffectiveDate ? new Date(moment($scope.userAccount.userProfile.EffectiveDate).utcOffset(DateTimeConstants.OFFSET).format('YYYY/MM/DD HH:mm:ss')) : '');
            $scope.dateHolder.endDate = new Date(moment($scope.userAccount.userProfile.ExpiryDate).utcOffset(DateTimeConstants.OFFSET).format('YYYY/MM/DD HH:mm:ss'));
        }

        if (userAccount.userGroups && !_.isEmpty(userAccount.userGroups)) {
            $scope.userAccount.isAdminUser = !_.isUndefined(_.findWhere(userAccount.userGroups, {name: adminUserGroup.name}));
        }

        // EntityAuditProfile
        var entityAuditProfiles = CMPFService.getProfileAttributes($scope.cmpfUserAccount.profiles, CMPFService.ENTITY_AUDIT_PROFILE);
        if (entityAuditProfiles.length > 0) {
            $scope.userAccount.entityAuditProfile = angular.copy(entityAuditProfiles[0]);
        }

        $scope.originalUserAccount = angular.copy($scope.userAccount);
        $scope.dateHolderOriginal = angular.copy($scope.dateHolder);
        $scope.isNotChanged = function () {
            return angular.equals($scope.userAccount, $scope.originalUserAccount) &&
                angular.equals($scope.dateHolder, $scope.dateHolderOriginal);
        };

        $scope.save = function (userAccount) {
            var currentTimestamp = $filter('date')(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss');

            $log.debug('User updating request: ', userAccount);

            // Check is user admin so only admin users can update a user or only can update itself.
            if (!SessionService.isUserAdmin()) {
                var foundUserGroup = _.findWhere(userAccount.userGroups, {name: CMPFService.DSP_PARTNER_ADMIN_GROUP});
                if (!foundUserGroup) {
                    foundUserGroup = _.findWhere(userAccount.userGroups, {name: CMPFService.DSP_PARTNER_USER_GROUP});
                }

                if (!foundUserGroup) {
                    return $scope.go('partner-info.users.list', {}, {reload: true});
                } else if (userAccount.id !== SessionService.getUserId()) {
                    return $scope.go('partner-info.users.list', {}, {reload: true});
                }
            }

            var isAdminUser = userAccount.isAdminUser;

            var userAccountItem = {
                id: $scope.originalUserAccount.id,
                userName: $scope.originalUserAccount.userName,
                state: userAccount.state,
                organizationId: $rootScope.getOrganizationId()
            };

            // Profiles
            if ($scope.cmpfUserAccount.profiles) {
                userAccountItem.profiles = angular.copy($scope.cmpfUserAccount.profiles);
            } else {
                userAccountItem.profiles = [];
            }

            if (userAccount.password !== dummyPassword) {
                userAccountItem.password = userAccount.password;
            }

            var userGroup = (isAdminUser ? angular.copy(adminUserGroup) : angular.copy(normalUserGroup));

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

                if ($scope.dateHolder.startDate) {
                    updatedUserProfile.EffectiveDate = $filter('date')($scope.dateHolder.startDate, 'yyyy-MM-dd') + 'T00:00:00';
                } else {
                    updatedUserProfile.EffectiveDate = '';
                }
                updatedUserProfile.ExpiryDate = $filter('date')($scope.dateHolder.endDate, 'yyyy-MM-dd') + 'T00:00:00';

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
                        throw(new Error($translate.instant('CommonMessages.CouldNotUpdateUser')));
                    }
                });
            };

            var addUserToGroup = function (userAccount) {
                var deferred = $q.defer();
                var promise = deferred.promise;

                if (isAdminUser === $scope.originalUserAccount.isAdminUser) {
                    deferred.resolve(userAccount);
                } else {
                    $log.debug('add to this userGroup', userGroup.name);

                    CMPFService.addNewAccountsToUserGroup(userGroup, [userAccount]).then(function (response) {
                        $log.debug('added user to group ', userGroup.name);
                        $timeout(function () {
                            $log.debug('resolved userGroup', userGroup.name);
                            deferred.resolve(userAccount);
                        }, 100);
                    }, function (response) {
                        $log.debug('could not add user to group ', userGroup.name);
                        deferred.reject(response);
                        throw(new Error($translate.instant('CommonMessages.CouldNotUpdateUser')));
                    });
                }

                return promise;
            };

            var removeUserFromGroup = function (userAccount) {
                var deferred = $q.defer();
                var promise = deferred.promise;

                if (isAdminUser === $scope.originalUserAccount.isAdminUser) {
                    deferred.resolve(userAccount);
                } else {
                    var otherGroup = (isAdminUser ? angular.copy(normalUserGroup) : angular.copy(adminUserGroup));

                    $log.debug('remove from this userGroup', otherGroup.name);

                    CMPFService.removeAccountFromUserGroup(otherGroup, userAccount).then(function (response) {
                        $log.debug('removed from userGroup :', otherGroup.name);
                        $timeout(function () {
                            $log.debug('resolved userGroup', otherGroup.name);
                            deferred.resolve(userAccount);
                        }, 100);
                    }, function (response) {
                        $log.debug('Could not remove user from group ', otherGroup.name);
                        deferred.reject(response);
                    });
                }

                return promise;
            };

            var success = function () {
                notification.flash({
                    type: 'success',
                    text: $translate.instant('CommonMessages.UpdateUserSucceded')
                });

                $state.go('partner-info.users.list');
            };

            var reportProblems = function (fault) {
                notification({
                    type: 'warning',
                    text: String(fault)
                });
            };

            updateUser(userAccountItem).then(addUserToGroup).then(removeUserFromGroup).then(success).catch(reportProblems);
        };

        $scope.showUserForm = true;

        $scope.cancel = function () {
            $scope.go('partner-info.users.list');
        };
    });

})();
