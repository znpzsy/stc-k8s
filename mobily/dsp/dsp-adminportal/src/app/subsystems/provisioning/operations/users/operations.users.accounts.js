(function () {

    'use strict';

    angular.module('adminportal.subsystems.provisioning.operations.users.accounts', [
        'adminportal.subsystems.provisioning.operations.users.accounts.bulkmessagingpolicies'
    ]);

    var ProvisioningUsersAccountsOperationsModule = angular.module('adminportal.subsystems.provisioning.operations.users.accounts');

    ProvisioningUsersAccountsOperationsModule.config(function ($stateProvider) {

        // Users states
        $stateProvider.state('subsystems.provisioning.operations.users.accounts', {
            abstract: true,
            url: "/useraccounts",
            template: "<div ui-view></div>",
            data: {
                permissions: [
                    'CMPF__OPERATIONS_USERACCOUNT_READ'
                ]
            }
        }).state('subsystems.provisioning.operations.users.accounts.list', {
            url: "",
            templateUrl: "subsystems/provisioning/operations/users/operations.users.accounts.html",
            controller: 'ProvisioningOperationsUserAccountsCtrl',
            resolve: {
                userAccounts: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getUserAccounts(0, DEFAULT_REST_QUERY_LIMIT, true);
                }
            }
        }).state('subsystems.provisioning.operations.users.accounts.update', {
            url: "/update/:id",
            templateUrl: "subsystems/provisioning/operations/users/operations.users.accounts.detail.html",
            controller: 'ProvisioningOperationsUpdateUserAccountCtrl',
            resolve: {
                userAccount: function ($stateParams, CMPFService) {
                    return CMPFService.getUserAccount($stateParams.id, true);
                },
                teamsOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_TEAMS_ORGANIZATION_NAME);
                },
                projectsOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_PROJECTS_ORGANIZATION_NAME);
                }
            }
        }).state('subsystems.provisioning.operations.users.accounts.new', {
            url: "/new",
            templateUrl: "subsystems/provisioning/operations/users/operations.users.accounts.detail.html",
            controller: 'ProvisioningOperationsNewUserAccountCtrl',
            resolve: {
                teamsOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_TEAMS_ORGANIZATION_NAME);
                },
                projectsOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_PROJECTS_ORGANIZATION_NAME);
                }
            }
        });

    });

    // Users controllers
    ProvisioningUsersAccountsOperationsModule.controller('ProvisioningOperationsUserAccountsCommonCtrl', function ($scope, $log, $controller, $uibModal, $translate, notification, CMPFService,
                                                                                                                   USER_ACCOUNT_TYPES) {
        $log.debug('ProvisioningOperationsUserAccountsCommonCtrl');

        $controller('GenericDateTimeCtrl', {$scope: $scope});

        $scope.USER_ACCOUNT_TYPES = USER_ACCOUNT_TYPES;

        $scope.DEFAULT_ORGANIZATION_NAME = CMPFService.DEFAULT_ORGANIZATION_NAME;

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
                        return CMPFService.getAllOrganizations(false, true, [CMPFService.OPERATOR_PROFILE]);
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
                templateUrl: 'subsystems/provisioning/operations/users/operations.users.accounts.usergroups.modal.html',
                controller: 'UserGroupsModalCtrl',
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
                        return CMPFService.getUserGroups(0, DEFAULT_REST_QUERY_LIMIT, true);
                    }
                }
            });

            modalInstance.result.then(function (selectedItems) {
                userAccount.userGroups = selectedItems;
            }, function () {
            });
        };

        $scope.removeSelectedOrganization = function (userAccount) {
            userAccount.selectedOrganization = {};
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

        // Teams
        $scope.updateTeam = function (teamsOrganizationOriginal, team) {
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

            var originalTeamProfiles = CMPFService.findProfilesByName(organizationItem.profiles, CMPFService.ORGANIZATION_TEAM_PROFILE);

            var updatedTeamProfile = JSON.parse(angular.toJson(team));
            var originalTeamProfile = _.findWhere(originalTeamProfiles, {id: updatedTeamProfile.profileId});

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

        $scope.showTeams = function () {
            var modalInstance = $uibModal.open({
                templateUrl: 'subsystems/provisioning/operations/users/operations.users.accounts.teams.modal.html',
                controller: 'ProvisioningOperationsUserAccountsTeamsModalCtrl',
                size: 'lg',
                resolve: {
                    teamsParameter: function () {
                        return angular.copy($scope.userAccount.selectedTeams);
                    },
                    userNameParameter: function () {
                        return $scope.userAccount.userName;
                    },
                    teamsOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                        return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_TEAMS_ORGANIZATION_NAME);
                    }
                }
            });

            modalInstance.result.then(function (selectedItems) {
                $scope.userAccount.selectedTeams = selectedItems;
            }, function () {
            });
        };

        $scope.removeTeam = function (team) {
            var index = _.indexOf($scope.userAccount.selectedTeams, team);
            if (index != -1) {
                $scope.userAccount.selectedTeams.splice(index, 1);
            }
        };

        // Projects
        $scope.updateProject = function (projectsOrganizationOriginal, project) {
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

            var originalProjectProfiles = CMPFService.findProfilesByName(organizationItem.profiles, CMPFService.ORGANIZATION_PROJECT_PROFILE);

            var updatedProjectProfile = JSON.parse(angular.toJson(project));
            var originalProjectProfile = _.findWhere(originalProjectProfiles, {id: updatedProjectProfile.profileId});

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

        $scope.showProjects = function () {
            var modalInstance = $uibModal.open({
                templateUrl: 'subsystems/provisioning/operations/users/operations.users.accounts.projects.modal.html',
                controller: 'ProvisioningOperationsUserAccountsProjectsModalCtrl',
                size: 'lg',
                resolve: {
                    projectsParameter: function () {
                        return angular.copy($scope.userAccount.selectedProjects);
                    },
                    userNameParameter: function () {
                        return $scope.userAccount.userName;
                    },
                    projectsOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                        return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_PROJECTS_ORGANIZATION_NAME);
                    }
                }
            });

            modalInstance.result.then(function (selectedItems) {
                $scope.userAccount.selectedProjects = selectedItems;
            }, function () {
            });
        };

        $scope.removeProject = function (project) {
            var index = _.indexOf($scope.userAccount.selectedProjects, project);
            if (index != -1) {
                $scope.userAccount.selectedProjects.splice(index, 1);
            }
        };

        // Roles
        $scope.showRoles = function () {
            var modalInstance = $uibModal.open({
                templateUrl: 'subsystems/provisioning/operations/users/operations.users.accounts.roles.modal.html',
                controller: 'ProvisioningOperationsUserAccountsRolesModalCtrl',
                size: 'lg',
                resolve: {
                    rolesParameter: function () {
                        return angular.copy($scope.userAccount.selectedRoles);
                    },
                    userNameParameter: function () {
                        return $scope.userAccount.userName;
                    },
                    roles: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                        return CMPFService.getRoles(0, DEFAULT_REST_QUERY_LIMIT);
                    }
                }
            });

            modalInstance.result.then(function (selectedItems) {
                $scope.userAccount.selectedRoles = selectedItems;
            }, function () {
            });
        };

        $scope.removeRole = function (role) {
            var index = _.indexOf($scope.userAccount.selectedRoles, role);
            if (index != -1) {
                $scope.userAccount.selectedRoles.splice(index, 1);
            }
        };

        $scope.prepareProfileListValuesJSON = function (array) {
            var objArray = [];
            _.each(array, function (value) {
                objArray.push({value: (_.isObject(value) ? String(value.value) : value)});
            });

            return objArray;
        };

        $scope.prepareNewBulkUserProfile = function (bulkUserProfile) {
            return {
                "name": CMPFService.BULK_USER_PROFILE,
                "profileDefinitionName": CMPFService.BULK_USER_PROFILE,
                "attributes": [
                    {"name": "Name", "value": bulkUserProfile.Name},
                    {"name": "Surname", "value": bulkUserProfile.Surname},
                    {"name": "Phone", "value": bulkUserProfile.Phone},
                    {"name": "Email", "value": bulkUserProfile.Email},
                    {"name": "Address", "value": bulkUserProfile.Address},
                    {"name": "SecretQuestion", "value": bulkUserProfile.SecretQuestion},
                    {"name": "SecretQuestionCorrectAnswer", "value": bulkUserProfile.SecretQuestionCorrectAnswer},
                    {"name": "LastLoginAdminPortal", "value": bulkUserProfile.LastLoginAdminPortal},
                    {"name": "LastLoginCustomerCarePortal", "value": bulkUserProfile.LastLoginCustomerCarePortal},
                    {"name": "isBulkSmsUser", "value": bulkUserProfile.isBulkSmsUser},
                    {"name": "isBulkMmsUser", "value": bulkUserProfile.isBulkMmsUser},
                    {"name": "isBulkIvrUser", "value": bulkUserProfile.isBulkIvrUser}
                ]
            };
        };

        var defaultBulkUserPolicyProfile = {
            isModerated: false,
            isApiAccessAllowed: false,
            isIpAddressListRestricted: false,
            PermissibleIpAddresses: [],
            isTimeConstraintEnforced: false,
            TimeConstraints: []
        };

        $scope.prepareNewBulkUserPolicyProfile = function (bulkUserPolicyProfile) {
            if (!bulkUserPolicyProfile) {
                bulkUserPolicyProfile = defaultBulkUserPolicyProfile;
            }

            var emptyProfile = {
                "name": CMPFService.BULK_USER_POLICY_PROFILE,
                "profileDefinitionName": CMPFService.BULK_USER_POLICY_PROFILE,
                "attributes": [
                    {
                        "name": "isModerated",
                        "value": bulkUserPolicyProfile.isModerated
                    },
                    {
                        "name": "isApiAccessAllowed",
                        "value": bulkUserPolicyProfile.isApiAccessAllowed
                    },
                    {
                        "name": "isIpAddressListRestricted",
                        "value": bulkUserPolicyProfile.isIpAddressListRestricted
                    },
                    {
                        "name": "PermissibleIpAddresses",
                        "listValues": $scope.prepareProfileListValuesJSON(bulkUserPolicyProfile.PermissibleIpAddresses)
                    },
                    {
                        "name": "isTimeConstraintEnforced",
                        "value": bulkUserPolicyProfile.isTimeConstraintEnforced
                    },
                    {
                        "name": "TimeConstraints",
                        "listValues": $scope.prepareProfileListValuesJSON(bulkUserPolicyProfile.TimeConstraints)
                    }
                ]
            };

            return emptyProfile;
        };

        var defaultBulkSMSPolicyProfile = {
            SenderMsisdn: null,
            isAlphanumericSenderListRestricted: false,
            PermissibleAlphanumericSenders: [],
            isOffNetDeliveryAllowed: false,
            isOffnetSenderListRestricted: false,
            PermissibleOffnetSenders: [],
            isDisableChargingAllowed: false,
            isQuotaLimited: false,
            AvailableQuotaAmount: null,
            isQuotaRefundedUponDeliveryFailure: false,
            isThroughputLimited: false,
            ThroughputLimit: null
        };

        $scope.prepareNewBulkSMSPolicyProfile = function (bulkSMSPolicyProfile) {
            if (!bulkSMSPolicyProfile) {
                bulkSMSPolicyProfile = defaultBulkSMSPolicyProfile;
            }

            var emptyProfile = {
                "name": CMPFService.BULK_SMS_POLICY_PROFILE,
                "profileDefinitionName": CMPFService.BULK_SMS_POLICY_PROFILE,
                "attributes": [
                    {
                        "name": "SenderMsisdn",
                        "value": bulkSMSPolicyProfile.SenderMsisdn
                    },
                    {
                        "name": "isAlphanumericSenderListRestricted",
                        "value": bulkSMSPolicyProfile.isAlphanumericSenderListRestricted
                    },
                    {
                        "name": "PermissibleAlphanumericSenders",
                        "listValues": $scope.prepareProfileListValuesJSON(bulkSMSPolicyProfile.PermissibleAlphanumericSenders)
                    },
                    {
                        "name": "isOffNetDeliveryAllowed",
                        "value": bulkSMSPolicyProfile.isOffNetDeliveryAllowed
                    },
                    {
                        "name": "isOffnetSenderListRestricted",
                        "value": bulkSMSPolicyProfile.isOffnetSenderListRestricted
                    },
                    {
                        "name": "PermissibleOffnetSenders",
                        "listValues": $scope.prepareProfileListValuesJSON(bulkSMSPolicyProfile.PermissibleOffnetSenders)
                    },
                    {
                        "name": "isDisableChargingAllowed",
                        "value": bulkSMSPolicyProfile.isDisableChargingAllowed
                    },
                    {
                        "name": "isQuotaLimited",
                        "value": bulkSMSPolicyProfile.isQuotaLimited
                    },
                    {
                        "name": "AvailableQuotaAmount",
                        "value": bulkSMSPolicyProfile.AvailableQuotaAmount
                    },
                    {
                        "name": "isQuotaRefundedUponDeliveryFailure",
                        "value": bulkSMSPolicyProfile.isQuotaRefundedUponDeliveryFailure
                    },
                    {
                        "name": "isThroughputLimited",
                        "value": bulkSMSPolicyProfile.isThroughputLimited
                    },
                    {
                        "name": "ThroughputLimit",
                        "value": bulkSMSPolicyProfile.ThroughputLimit
                    }
                ]
            };

            if (bulkSMSPolicyProfile.isQuotaLimited) {
                emptyProfile.attributes.push({
                    "name": "QuotaStartDate",
                    "value": moment(bulkSMSPolicyProfile.QuotaStartDate).format('YYYY-MM-DDTHH:mm:ss')
                });

                emptyProfile.attributes.push({
                    "name": "QuotaExpiryDate",
                    "value": moment(bulkSMSPolicyProfile.QuotaExpiryDate).format('YYYY-MM-DDTHH:mm:ss')
                });
            }

            return emptyProfile;
        };

        var defaultBulkMMSPolicyProfile = {
            ChargingMsisdn: null,
            isAlphanumericSenderListRestricted: false,
            PermissibleAlphanumericSenders: [],
            isOffNetDeliveryAllowed: false,
            isForwardTrackingAllowed: false,
            isDisableChargingAllowed: false,
            isQuotaLimited: false,
            AvailableQuotaAmount: null,
            isQuotaRefundedUponDeliveryFailure: false,
            isThroughputLimited: false,
            ThroughputLimit: null
        };

        $scope.prepareNewBulkMMSPolicyProfile = function (bulkMMSPolicyProfile) {
            if (!bulkMMSPolicyProfile) {
                bulkMMSPolicyProfile = defaultBulkMMSPolicyProfile;
            }

            var emptyProfile = {
                "name": CMPFService.BULK_MMS_POLICY_PROFILE,
                "profileDefinitionName": CMPFService.BULK_MMS_POLICY_PROFILE,
                "attributes": [
                    {
                        "name": "ChargingMsisdn",
                        "value": bulkMMSPolicyProfile.ChargingMsisdn
                    },
                    {
                        "name": "isAlphanumericSenderListRestricted",
                        "value": bulkMMSPolicyProfile.isAlphanumericSenderListRestricted
                    },
                    {
                        "name": "PermissibleAlphanumericSenders",
                        "listValues": $scope.prepareProfileListValuesJSON(bulkMMSPolicyProfile.PermissibleAlphanumericSenders)
                    },
                    {
                        "name": "isOffNetDeliveryAllowed",
                        "value": bulkMMSPolicyProfile.isOffNetDeliveryAllowed
                    },
                    {
                        "name": "isForwardTrackingAllowed",
                        "value": bulkMMSPolicyProfile.isForwardTrackingAllowed
                    },
                    {
                        "name": "isDisableChargingAllowed",
                        "value": bulkMMSPolicyProfile.isDisableChargingAllowed
                    },
                    {
                        "name": "isQuotaLimited",
                        "value": bulkMMSPolicyProfile.isQuotaLimited
                    },
                    {
                        "name": "AvailableQuotaAmount",
                        "value": bulkMMSPolicyProfile.AvailableQuotaAmount
                    },
                    {
                        "name": "isQuotaRefundedUponDeliveryFailure",
                        "value": bulkMMSPolicyProfile.isQuotaRefundedUponDeliveryFailure
                    },
                    {
                        "name": "isThroughputLimited",
                        "value": bulkMMSPolicyProfile.isThroughputLimited
                    },
                    {
                        "name": "ThroughputLimit",
                        "value": bulkMMSPolicyProfile.ThroughputLimit
                    }
                ]
            };

            if (bulkMMSPolicyProfile.isQuotaLimited) {
                emptyProfile.attributes.push({
                    "name": "QuotaStartDate",
                    "value": moment(bulkMMSPolicyProfile.QuotaStartDate).format('YYYY-MM-DDTHH:mm:ss')
                });

                emptyProfile.attributes.push({
                    "name": "QuotaExpiryDate",
                    "value": moment(bulkMMSPolicyProfile.QuotaExpiryDate).format('YYYY-MM-DDTHH:mm:ss')
                });
            }

            return emptyProfile;
        };

        var defaultBulkIVRPolicyProfile = {
            SenderMsisdn: null,
            isAlphanumericSenderListRestricted: false,
            PermissibleAlphanumericSenders: [],
            isOffNetDeliveryAllowed: false,
            isOffnetSenderListRestricted: false,
            PermissibleOffnetSenders: [],
            isDisableChargingAllowed: false,
            isQuotaLimited: false,
            AvailableQuotaAmount: null,
            isQuotaRefundedUponDeliveryFailure: false,
            isThroughputLimited: false,
            ThroughputLimit: null,
            QuotaStartDate: '',
            QuotaExpiryDate: ''
        };

        $scope.prepareNewBulkIVRPolicyProfile = function (bulkIVRPolicyProfile) {
            if (!bulkIVRPolicyProfile) {
                bulkIVRPolicyProfile = defaultBulkIVRPolicyProfile;
            }

            var emptyProfile = {
                "name": CMPFService.BULK_IVR_POLICY_PROFILE,
                "profileDefinitionName": CMPFService.BULK_IVR_POLICY_PROFILE,
                "attributes": [
                    {
                        "name": "SenderMsisdn",
                        "value": bulkIVRPolicyProfile.SenderMsisdn
                    },
                    {
                        "name": "isAlphanumericSenderListRestricted",
                        "value": bulkIVRPolicyProfile.isAlphanumericSenderListRestricted
                    },
                    {
                        "name": "PermissibleAlphanumericSenders",
                        "listValues": $scope.prepareProfileListValuesJSON(bulkIVRPolicyProfile.PermissibleAlphanumericSenders)
                    },
                    {
                        "name": "isOffNetDeliveryAllowed",
                        "value": bulkIVRPolicyProfile.isOffNetDeliveryAllowed
                    },
                    {
                        "name": "isOffnetSenderListRestricted",
                        "value": bulkIVRPolicyProfile.isOffnetSenderListRestricted
                    },
                    {
                        "name": "PermissibleOffnetSenders",
                        "listValues": $scope.prepareProfileListValuesJSON(bulkIVRPolicyProfile.PermissibleOffnetSenders)
                    },
                    {
                        "name": "isDisableChargingAllowed",
                        "value": bulkIVRPolicyProfile.isDisableChargingAllowed
                    },
                    {
                        "name": "isQuotaLimited",
                        "value": bulkIVRPolicyProfile.isQuotaLimited
                    },
                    {
                        "name": "AvailableQuotaAmount",
                        "value": bulkIVRPolicyProfile.AvailableQuotaAmount
                    },
                    {
                        "name": "isQuotaRefundedUponDeliveryFailure",
                        "value": bulkIVRPolicyProfile.isQuotaRefundedUponDeliveryFailure
                    },
                    {
                        "name": "isThroughputLimited",
                        "value": bulkIVRPolicyProfile.isThroughputLimited
                    },
                    {
                        "name": "ThroughputLimit",
                        "value": bulkIVRPolicyProfile.ThroughputLimit
                    }
                ]
            };

            if (bulkIVRPolicyProfile.isQuotaLimited) {
                emptyProfile.attributes.push({
                    "name": "QuotaStartDate",
                    "value": moment(bulkIVRPolicyProfile.QuotaStartDate).format('YYYY-MM-DDTHH:mm:ss')
                });

                emptyProfile.attributes.push({
                    "name": "QuotaExpiryDate",
                    "value": moment(bulkIVRPolicyProfile.QuotaExpiryDate).format('YYYY-MM-DDTHH:mm:ss')
                });
            }

            return emptyProfile;
        };

        $scope.cancel = function () {
            $scope.go('subsystems.provisioning.operations.users.accounts.list');
        };

        $scope.goToList = function () {
            notification.flash({
                type: 'success',
                text: $translate.instant('CommonLabels.OperationSuccessful')
            });

            $scope.cancel();
        };
    });

    ProvisioningUsersAccountsOperationsModule.controller('ProvisioningOperationsUserAccountsCtrl', function ($scope, $state, $log, $filter, $uibModal, NgTableParams, NgTableService, notification, $translate,
                                                                                                             CMPFService, Restangular, userAccounts, DateTimeConstants) {
        $log.debug('ProvisioningOperationsUserAccountsCtrl');

        $scope.userAccounts = Restangular.stripRestangular(userAccounts).userAccounts;
        $scope.userAccounts = $filter('orderBy')($scope.userAccounts, 'id');

        _.each($scope.userAccounts, function (userAccount) {
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

        $scope.remove = function (user) {
            user.rowSelected = true;

            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                user.rowSelected = false;

                CMPFService.deleteUserAccount(user).then(function (response) {
                    $log.debug('Removed. Response: ', response);

                    var deletedListItem = _.findWhere($scope.userAccounts, {id: user.id});
                    $scope.userAccounts = _.without($scope.userAccounts, deletedListItem);

                    $scope.tableParams.reload();

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
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
                });
            }, function () {
                user.rowSelected = false;
            });
        };

        // Projects
        $scope.viewProjects = function (userAccount) {
            $uibModal.open({
                templateUrl: 'subsystems/businessmanagement/operations/operations.projects.view.modal.html',
                controller: function ($scope, $uibModalInstance, projectsOrganization) {
                    $scope.pageHeaderKey = 'Subsystems.Provisioning.UserAccounts.ProjectsModalTitle';
                    $scope.itemName = userAccount.userName;

                    $scope.projectsOrganization = projectsOrganization.organizations[0];
                    var allProjects = CMPFService.getProjects($scope.projectsOrganization);
                    allProjects = $filter('orderBy')(allProjects, 'profileId');

                    $scope.projects = [];
                    _.each(allProjects, function (project) {
                        var foundUser = _.findWhere(project.Users, {value: userAccount.id.toString()});
                        if (foundUser) {
                            $scope.projects.push(project);
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
                            var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.projects);
                            var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.projects;
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
                    projectsOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                        return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_PROJECTS_ORGANIZATION_NAME);
                    }
                }
            });
        };

        // Roles
        $scope.viewRoles = function (userAccount) {
            $uibModal.open({
                templateUrl: 'subsystems/provisioning/operations/users/operations.users.roles.view.modal.html',
                controller: function ($scope, $uibModalInstance, roles) {
                    $scope.pageHeaderKey = 'Subsystems.Provisioning.UserAccounts.RolesModalTitle';
                    $scope.itemName = userAccount.userName;

                    $scope.roles = [];
                    /*
                    var userProfiles = CMPFService.getProfileAttributes(userAccount.profiles, CMPFService.USER_PROFILE_NAME);
                    if (userProfiles.length > 0) {
                        userAccount.userProfile = angular.copy(userProfiles[0]);

                        _.each(userAccount.selectedRoles, function (roleId) {
                            var foundRole = _.findWhere(allRoles, {id: Number(roleId)});
                            if (foundRole) {
                                $scope.roles.push(foundRole);
                            }
                        });
                    }
                    */

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

        // User Groups
        $scope.viewUserGroupsOfAccount = function (user) {
            $uibModal.open({
                templateUrl: 'subsystems/provisioning/operations/users/operations.users.accounts.groups.modal.html',
                controller: 'UserAccountGroupsModalCtrl',
                size: 'lg',
                resolve: {
                    userAccountParameter: function () {
                        return user;
                    },
                    userAccountGroups: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                        return CMPFService.getUserAccountGroups(user.id, 0, DEFAULT_REST_QUERY_LIMIT);
                    }
                }
            });
        };

        // User Rights
        $scope.viewUserRights = function (user) {
            $uibModal.open({
                templateUrl: 'subsystems/provisioning/operations/users/operations.users.accounts.rights.modal.html',
                controller: 'UserRightsModalCtrl',
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

    ProvisioningUsersAccountsOperationsModule.controller('ProvisioningOperationsNewUserAccountCtrl', function ($scope, $state, $log, $uibModal, $filter, $timeout, $q, $controller, notification, $translate, SessionService,
                                                                                                               CMPFService, Restangular, DateTimeConstants, STATUS_TYPES, teamsOrganization, projectsOrganization) {
        $log.debug('ProvisioningOperationsNewUserAccountCtrl');

        $controller('ProvisioningOperationsUserAccountsCommonCtrl', {$scope: $scope});

        $scope.dateHolder.startDate = null;
        $scope.dateHolder.endDate = null;

        $scope.teamsOrganization = teamsOrganization.organizations[0];
        $scope.projectsOrganization = projectsOrganization.organizations[0];

        $scope.STATUS_TYPES = STATUS_TYPES;

        $scope.userAccount = {
            state: $scope.STATUS_TYPES[0].value,
            userName: '',
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
                IsPwdResetForcedAtFirstLogin: false,
                LastUpdateTime: null,
                EnforceStrongPasswords: true,
                EnforcePasswordAging: true,
                MonitorConsecutiveLoginFailures: true,
                MonitorUserInactivity: true
            },
            bulkMessagingUser: false,
            bulkUserProfile: {
                Name: '',
                Surname: '',
                Phone: '',
                Email: '',
                Address: '',
                SecretQuestion: '',
                SecretQuestionCorrectAnswer: '',
                LastLoginCustomerCarePortal: '1970-01-01T00:00:00',
                LastLoginAdminPortal: '1970-01-01T00:00:00',
                isBulkSmsUser: false,
                isBulkMmsUser: false,
                isBulkIvrUser: false
            },
            selectedOrganization: null,
            selectedProjects: [],
            selectedTeams: [],
            selectedRoles: []
        };

        // Prepare bulk policy form fields and necessary functions.
        $controller('ProvisioningUsersAccountsBulkMessagingPoliciesOperationsCtrl', {$scope: $scope});

        $scope.save = function (userAccount) {
            $log.debug('Trying create user account: ', userAccount);

            var currentTimestamp = $filter('date')(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss');

            // Update the last update time for create first time or for update everytime.
            userAccount.LastUpdateTime = currentTimestamp;

            var userAccountItem = {
                userName: userAccount.userName,
                password: userAccount.password,
                state: userAccount.state,
                userGroups: [],
                organizationId: userAccount.selectedOrganization.id,
                profiles: []
            };

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
                        "value": userAccount.userProfile.IsPwdResetForcedAtFirstLogin
                    },
                    {
                        "name": "EnforceStrongPasswords",
                        "value": userAccount.userProfile.EnforceStrongPasswords
                    },
                    {
                        "name": "EnforcePasswordAging",
                        "value": userAccount.userProfile.EnforcePasswordAging
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

            // If Bulk Messaging User flag enabled
            if (userAccount.bulkMessagingUser) {
                // Enforce the values for newly created users.
                userAccount.bulkUserPolicyProfile.isModerated = false;
                userAccount.bulkUserPolicyProfile.isApiAccessAllowed = false;

                var newBulkUserProfile = $scope.prepareNewBulkUserProfile(userAccount.bulkUserProfile);
                userAccountItem.profiles.push(newBulkUserProfile);

                // Bulk User Policy Profile related steps
                var bulkUserPolicyProfile = $scope.prepareNewBulkUserPolicyProfile(userAccount.bulkUserPolicyProfile);
                userAccountItem.profiles.push(bulkUserPolicyProfile);

                // Bulk SMS Policy Profile related steps
                if (userAccount.bulkUserProfile.isBulkSmsUser) {
                    userAccount.bulkSMSPolicyProfile.isDisableChargingAllowed = false;
                    var bulkSMSPolicyProfile = $scope.prepareNewBulkSMSPolicyProfile(userAccount.bulkSMSPolicyProfile);
                    userAccountItem.profiles.push(bulkSMSPolicyProfile);
                }

                // Bulk MMS Policy Profile related steps
                if (userAccount.bulkUserProfile.isBulkMmsUser) {
                    var bulkMMSPolicyProfile = $scope.prepareNewBulkMMSPolicyProfile(userAccount.bulkMMSPolicyProfile);
                    userAccountItem.profiles.push(bulkMMSPolicyProfile);
                }

                // Bulk IVR Policy Profile related steps
                if (userAccount.bulkUserProfile.isBulkIvrUser) {
                    var bulkIVRPolicyProfile = $scope.prepareNewBulkMMSPolicyProfile(userAccount.bulkIVRPolicyProfile);
                    userAccountItem.profiles.push(bulkIVRPolicyProfile);
                }
            }

            // EntityAuditProfile
            userAccount.entityAuditProfile = {
                CreatedBy: SessionService.getUsername(),
                CreatedOn: currentTimestamp,
                CreateApprovedBy: SessionService.getUsername(),
                CreateApprovedOn: currentTimestamp
            };
            var entityAuditProfile = CMPFService.prepareNewEntityAuditProfile(userAccount.entityAuditProfile);
            userAccountItem.profiles.push(entityAuditProfile);

            var newUser = [userAccountItem];
            var userGroups = angular.copy(userAccount.userGroups);
            var userRoles = angular.copy(userAccount.selectedRoles);

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
                    } else if (response.data.errorDescription) {
                        message = response.data.errorDescription;
                    }

                    throw(new Error(message));
                });
            };

            var addUserToProject = function (createdUserAccount) {
                var deferred = $q.defer();
                var promise = deferred.promise;

                var newUserAccount = createdUserAccount[0];

                var promises = [];
                _.each(userAccount.selectedProjects, function (selectedProject) {
                    var foundUserAccount = _.findWhere(selectedProject.Users, {value: newUserAccount.id.toString()});
                    if (!foundUserAccount) {
                        selectedProject.Users.push({
                            value: newUserAccount.id
                        });
                    }

                    promises.push($scope.updateProject($scope.projectsOrganization, selectedProject));
                });

                $q.all(promises).then(function () {
                    $timeout(function () {
                        deferred.resolve(createdUserAccount);
                    }, 100);
                }, function (response) {
                    $log.debug('Could not add user to project!');

                    notification({
                        type: 'warning',
                        text: 'Could not add user to project!'
                    });

                    deferred.reject(response);
                });

                return promise;
            };

            var addUserToTeam = function (createdUserAccount) {
                var deferred = $q.defer();
                var promise = deferred.promise;

                var newUserAccount = createdUserAccount[0];

                var promises = [];
                _.each(userAccount.selectedTeams, function (selectedTeam) {
                    var foundUserAccount = _.findWhere(selectedTeam.Users, {value: newUserAccount.id.toString()});
                    if (!foundUserAccount) {
                        selectedTeam.Users.push({
                            value: newUserAccount.id
                        });
                    }

                    promises.push($scope.updateTeam($scope.teamsOrganization, selectedTeam));
                });

                $q.all(promises).then(function () {
                    $timeout(function () {
                        deferred.resolve(createdUserAccount);
                    }, 100);
                }, function (response) {
                    $log.debug('Could not add user to team!');

                    notification({
                        type: 'warning',
                        text: 'Could not add user to team!'
                    });

                    deferred.reject(response);
                });

                return promise;
            };

            var addUserToRole = function (aRole, aUserAccount) {
                var deferred = $q.defer();
                var promise = deferred.promise;
                CMPFService.addNewAccountsToRole(aRole, aUserAccount).then(function (response) {
                    $timeout(function () {
                        deferred.resolve(response);
                    }, 100);
                }, function (response) {
                    $log.debug('could not add user to role ', aRole.name);

                    notification({
                        type: 'warning',
                        text: 'Could not add user to role: ' + aRole.name
                    });

                    deferred.reject(response);
                });
                return promise;
            };

            var addUserToRoleRecursive = function (createdUserAccount) {
                var role = userRoles.shift();
                if (role) {
                    $log.debug('userRole :', role.name);

                    addUserToRole(role, createdUserAccount).then(function () {
                        return addUserToRoleRecursive(createdUserAccount);
                    });
                } else {
                    return;
                }
            };

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
                }
            };

            var reportProblems = function (fault) {
                notification({
                    type: 'warning',
                    text: String(fault)
                });
            };

            //createUser(newUser).then(addUserToProject).then(addUserToTeam).then($scope.goToList).catch(reportProblems);
            createUser(newUser).then(addUserToGroupRecursive).then($scope.goToList).catch(reportProblems);
        };
    });

    ProvisioningUsersAccountsOperationsModule.controller('ProvisioningOperationsUpdateUserAccountCtrl', function ($scope, $state, $log, $q, $filter, $controller, notification, $translate, $timeout, $stateParams, $uibModal, SessionService,
                                                                                                                  CMPFService, Restangular, DateTimeConstants, STATUS_TYPES, userAccount, teamsOrganization, projectsOrganization) {
        $log.debug('ProvisioningOperationsUpdateUserAccountCtrl');

        $controller('ProvisioningOperationsUserAccountsCommonCtrl', {$scope: $scope});

        var DUMMY_PASSWORD = '********';

        $scope.STATUS_TYPES = STATUS_TYPES;

        $scope.userAccount = Restangular.stripRestangular(userAccount);
        $scope.userAccount.selectedOrganization = userAccount.organization;
        $scope.originalGroups = angular.copy($scope.userAccount.userGroups);
        $scope.userAccount.confirmpassword = $scope.userAccount.password;

        $scope.originalPassword = angular.copy($scope.userAccount.password);
        $scope.userAccount.password = DUMMY_PASSWORD;
        $scope.userAccount.confirmpassword = DUMMY_PASSWORD;

        // UserProfile
        var userProfiles = CMPFService.getProfileAttributes(userAccount.profiles, CMPFService.USER_PROFILE_NAME);
        if (userProfiles.length > 0) {
            $scope.userAccount.userProfile = angular.copy(userProfiles[0]);
            $scope.dateHolder.startDate = ($scope.userAccount.userProfile.EffectiveDate ? new Date(moment($scope.userAccount.userProfile.EffectiveDate).utcOffset(DateTimeConstants.OFFSET).format('YYYY/MM/DD HH:mm:ss')) : '');
            $scope.dateHolder.endDate = new Date(moment($scope.userAccount.userProfile.ExpiryDate).utcOffset(DateTimeConstants.OFFSET).format('YYYY/MM/DD HH:mm:ss'));
        } else {
            $scope.dateHolder.startDate = null;
            $scope.dateHolder.endDate = null;

            $scope.userAccount.userProfile = {
                ActiveDirectoryAuthentication: true,
                IsPwdResetForcedAtFirstLogin: false,
                LastUpdateTime: null,
                EnforceStrongPasswords: true,
                EnforcePasswordAging: true,
                MonitorConsecutiveLoginFailures: true,
                MonitorUserInactivity: true
            };
        }

        /*
        $scope.teamsOrganization = teamsOrganization.organizations[0];
        $scope.teams = CMPFService.getTeams($scope.teamsOrganization);
        $scope.userAccount.selectedTeam = _.findWhere($scope.teams, {profileId: Number()}),

        $scope.userAccount.selectedProjects = [];
        $scope.userAccount.selectedTeams = [];
        $scope.userAccount.selectedRoles = [];
        */

        // Bulk user profile
        $scope.userAccount.bulkUserProfile = CMPFService.extractBulkUserProfile($scope.userAccount);
        if ($scope.userAccount.bulkUserProfile && !_.isEmpty($scope.userAccount.bulkUserProfile)) {
            $scope.userAccount.bulkMessagingUser = true;

            $scope.userAccount.bulkUserProfile.SecretQuestionCorrectAnswerConfirm = $scope.userAccount.bulkUserProfile.SecretQuestionCorrectAnswer;
        } else {
            $scope.userAccount.bulkMessagingUser = false;

            $scope.userAccount.bulkUserProfile = {
                Name: '',
                Surname: '',
                Phone: '',
                Email: '',
                Address: '',
                SecretQuestion: '',
                SecretQuestionCorrectAnswer: '',
                LastLoginCustomerCarePortal: '1970-01-01T00:00:00',
                LastLoginAdminPortal: '1970-01-01T00:00:00',
                isBulkSmsUser: false,
                isBulkMmsUser: false,
                isBulkIvrUser: false
            };
        }

        $scope.userAccount.bulkUserPolicyProfile = CMPFService.extractBulkUserPolicyProfile($scope.userAccount);
        $scope.userAccount.bulkSMSPolicyProfile = CMPFService.extractBulkSMSPolicyProfile($scope.userAccount);
        $scope.userAccount.bulkMMSPolicyProfile = CMPFService.extractBulkMMSPolicyProfile($scope.userAccount);
        $scope.userAccount.bulkIVRPolicyProfile = CMPFService.extractBulkIVRPolicyProfile($scope.userAccount);

        // Prepare bulk policy form fields and necessary functions.
        $controller('ProvisioningUsersAccountsBulkMessagingPoliciesOperationsCtrl', {$scope: $scope});

        // EntityAuditProfile
        var entityAuditProfiles = CMPFService.getProfileAttributes($scope.userAccount.profiles, CMPFService.ENTITY_AUDIT_PROFILE);
        if (entityAuditProfiles.length > 0) {
            $scope.userAccount.entityAuditProfile = angular.copy(entityAuditProfiles[0]);
        }

        $scope.userAccountOriginal = angular.copy($scope.userAccount);
        $scope.dateHolderOriginal = angular.copy($scope.dateHolder);
        $scope.isNotChanged = function () {
            return angular.equals($scope.userAccount, $scope.userAccountOriginal) &&
                angular.equals($scope.dateHolder, $scope.dateHolderOriginal);
        };

        $scope.save = function (userAccount) {
            userAccount.bulkUserPolicyProfile.isModerated = false;
            userAccount.bulkUserPolicyProfile.isApiAccessAllowed = false;

            var currentTimestamp = $filter('date')(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss');

            var userAccountItem = {
                id: $scope.userAccountOriginal.id,
                userName: $scope.userAccountOriginal.userName,
                password: userAccount.password,
                state: userAccount.state,
                userGroups: userAccount.userGroups,
                organization: userAccount.selectedOrganization,
                organizationId: userAccount.selectedOrganization.id,
                profiles: ($scope.userAccountOriginal.profiles === undefined ? [] : $scope.userAccountOriginal.profiles)
            };

            if (userAccountItem.password == DUMMY_PASSWORD) {
                userAccountItem.password = $scope.originalPassword;
            }

            // Filter out existing groups. add user to only new groups
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

            // BulkUserProfile
            if (userAccount.bulkMessagingUser && userAccount.bulkUserProfile) {
                var originalBulkUserProfile = CMPFService.findProfileByName(userAccountItem.profiles, CMPFService.BULK_USER_PROFILE);
                var updatedBulkUserProfile = JSON.parse(angular.toJson(userAccount.bulkUserProfile));

                // Modify some attributes here.
                delete updatedBulkUserProfile.SecretQuestionCorrectAnswerConfirm;

                var bulkUserProfileArray = CMPFService.prepareProfile(updatedBulkUserProfile, originalBulkUserProfile);
                // ---
                if (originalBulkUserProfile) {
                    originalBulkUserProfile.attributes = bulkUserProfileArray;
                } else {
                    var bulkUserProfile = {
                        name: CMPFService.BULK_USER_PROFILE,
                        profileDefinitionName: CMPFService.BULK_USER_PROFILE,
                        attributes: bulkUserProfileArray
                    };

                    userAccountItem.profiles.push(bulkUserProfile);
                }
            } else {
                // Remove BulkUserProfile instances
                userAccountItem.profiles = _.filter(userAccountItem.profiles, function (profile) {
                    return profile.profileDefinitionName !== CMPFService.BULK_USER_PROFILE;
                });
            }

            // BulkUserPolicyProfile
            if (userAccount.bulkMessagingUser && userAccount.bulkUserPolicyProfile) {
                var originalBulkUserPolicyProfile = CMPFService.findProfileByName(userAccountItem.profiles, CMPFService.BULK_USER_POLICY_PROFILE);
                var updatedBulkUserPolicyProfile = JSON.parse(angular.toJson(userAccount.bulkUserPolicyProfile));

                // Modify some attributes here.
                delete updatedBulkUserPolicyProfile.SecretQuestionCorrectAnswerConfirm;

                var bulkUserPolicyProfileArray = CMPFService.prepareProfile(updatedBulkUserPolicyProfile, originalBulkUserPolicyProfile);
                // ---
                if (originalBulkUserPolicyProfile) {
                    originalBulkUserPolicyProfile.attributes = bulkUserPolicyProfileArray;
                } else {
                    var bulkUserPolicyProfile = {
                        name: CMPFService.BULK_USER_POLICY_PROFILE,
                        profileDefinitionName: CMPFService.BULK_USER_POLICY_PROFILE,
                        attributes: bulkUserPolicyProfileArray
                    };

                    userAccountItem.profiles.push(bulkUserPolicyProfile);
                }
            } else {
                // Remove BulkUserPolicyProfile instances
                userAccountItem.profiles = _.filter(userAccountItem.profiles, function (profile) {
                    return profile.profileDefinitionName !== CMPFService.BULK_USER_POLICY_PROFILE;
                });
            }

            // BulkSMSPolicyProfile
            if (userAccount.bulkMessagingUser && userAccount.bulkUserProfile && userAccount.bulkUserProfile.isBulkSmsUser) {
                var originalBulkSMSPolicyProfile = CMPFService.findProfileByName(userAccountItem.profiles, CMPFService.BULK_SMS_POLICY_PROFILE);
                var updatedBulkSMSPolicyProfile = JSON.parse(angular.toJson(userAccount.bulkSMSPolicyProfile));

                // Modify some attributes here.
                delete updatedBulkSMSPolicyProfile.SecretQuestionCorrectAnswerConfirm;
                updatedBulkSMSPolicyProfile.isDisableChargingAllowed = false;
                if (updatedBulkSMSPolicyProfile.isQuotaLimited) {
                    updatedBulkSMSPolicyProfile.QuotaStartDate = $filter('date')(updatedBulkSMSPolicyProfile.QuotaStartDate, 'yyyy-MM-dd\'T\'HH:mm:ss');
                    updatedBulkSMSPolicyProfile.QuotaExpiryDate = $filter('date')(updatedBulkSMSPolicyProfile.QuotaExpiryDate, 'yyyy-MM-dd\'T\'HH:mm:ss');
                } else {
                    updatedBulkSMSPolicyProfile.QuotaStartDate = '';
                    updatedBulkSMSPolicyProfile.QuotaExpiryDate = '';
                }

                var bulkSMSPolicyProfileArray = CMPFService.prepareProfile(updatedBulkSMSPolicyProfile, originalBulkSMSPolicyProfile);
                // ---
                if (originalBulkSMSPolicyProfile) {
                    originalBulkSMSPolicyProfile.attributes = bulkSMSPolicyProfileArray;
                } else {
                    var bulkSMSPolicyProfile = {
                        name: CMPFService.BULK_SMS_POLICY_PROFILE,
                        profileDefinitionName: CMPFService.BULK_SMS_POLICY_PROFILE,
                        attributes: bulkSMSPolicyProfileArray
                    };

                    userAccountItem.profiles.push(bulkSMSPolicyProfile);
                }
            } else {
                // Remove BulkSMSPolicyProfile instances
                userAccountItem.profiles = _.filter(userAccountItem.profiles, function (profile) {
                    return profile.profileDefinitionName !== CMPFService.BULK_SMS_POLICY_PROFILE;
                });
            }

            // BulkMMSPolicyProfile
            if (userAccount.bulkMessagingUser && userAccount.bulkUserProfile && userAccount.bulkUserProfile.isBulkMmsUser) {
                var originalBulkMMSPolicyProfile = CMPFService.findProfileByName(userAccountItem.profiles, CMPFService.BULK_MMS_POLICY_PROFILE);
                var updatedBulkMMSPolicyProfile = JSON.parse(angular.toJson(userAccount.bulkMMSPolicyProfile));

                // Modify some attributes here.
                delete updatedBulkMMSPolicyProfile.SecretQuestionCorrectAnswerConfirm;
                if (updatedBulkMMSPolicyProfile.isQuotaLimited) {
                    updatedBulkMMSPolicyProfile.QuotaStartDate = $filter('date')(updatedBulkMMSPolicyProfile.QuotaStartDate, 'yyyy-MM-dd\'T\'HH:mm:ss');
                    updatedBulkMMSPolicyProfile.QuotaExpiryDate = $filter('date')(updatedBulkMMSPolicyProfile.QuotaExpiryDate, 'yyyy-MM-dd\'T\'HH:mm:ss');
                } else {
                    updatedBulkMMSPolicyProfile.QuotaStartDate = '';
                    updatedBulkMMSPolicyProfile.QuotaExpiryDate = '';
                }

                var bulkMMSPolicyProfileArray = CMPFService.prepareProfile(updatedBulkMMSPolicyProfile, originalBulkMMSPolicyProfile);
                // ---
                if (originalBulkMMSPolicyProfile) {
                    originalBulkMMSPolicyProfile.attributes = bulkMMSPolicyProfileArray;
                } else {
                    var bulkMMSPolicyProfile = {
                        name: CMPFService.BULK_MMS_POLICY_PROFILE,
                        profileDefinitionName: CMPFService.BULK_MMS_POLICY_PROFILE,
                        attributes: bulkMMSPolicyProfileArray
                    };

                    userAccountItem.profiles.push(bulkMMSPolicyProfile);
                }
            } else {
                // Remove BulkMMSPolicyProfile instances
                userAccountItem.profiles = _.filter(userAccountItem.profiles, function (profile) {
                    return profile.profileDefinitionName !== CMPFService.BULK_MMS_POLICY_PROFILE;
                });
            }

            // BulkIVRPolicyProfile
            if (userAccount.bulkMessagingUser && userAccount.bulkUserProfile && userAccount.bulkUserProfile.isBulkIvrUser) {
                var originalBulkIVRPolicyProfile = CMPFService.findProfileByName(userAccountItem.profiles, CMPFService.BULK_IVR_POLICY_PROFILE);
                var updatedBulkIVRPolicyProfile = JSON.parse(angular.toJson(userAccount.bulkIVRPolicyProfile));

                // Modify some attributes here.
                delete updatedBulkIVRPolicyProfile.SecretQuestionCorrectAnswerConfirm;
                if (updatedBulkIVRPolicyProfile.isQuotaLimited) {
                    updatedBulkIVRPolicyProfile.QuotaStartDate = $filter('date')(updatedBulkIVRPolicyProfile.QuotaStartDate, 'yyyy-MM-dd\'T\'HH:mm:ss');
                    updatedBulkIVRPolicyProfile.QuotaExpiryDate = $filter('date')(updatedBulkIVRPolicyProfile.QuotaExpiryDate, 'yyyy-MM-dd\'T\'HH:mm:ss');
                } else {
                    updatedBulkIVRPolicyProfile.QuotaStartDate = '';
                    updatedBulkIVRPolicyProfile.QuotaExpiryDate = '';
                }

                var bulkIVRPolicyProfileArray = CMPFService.prepareProfile(updatedBulkIVRPolicyProfile, originalBulkIVRPolicyProfile);
                // ---
                if (originalBulkIVRPolicyProfile) {
                    originalBulkIVRPolicyProfile.attributes = bulkIVRPolicyProfileArray;
                } else {
                    var bulkIVRPolicyProfile = {
                        name: CMPFService.BULK_IVR_POLICY_PROFILE,
                        profileDefinitionName: CMPFService.BULK_IVR_POLICY_PROFILE,
                        attributes: bulkIVRPolicyProfileArray
                    };

                    userAccountItem.profiles.push(bulkIVRPolicyProfile);
                }
            } else {
                // Remove BulkIVRPolicyProfile instances
                userAccountItem.profiles = _.filter(userAccountItem.profiles, function (profile) {
                    return profile.profileDefinitionName !== CMPFService.BULK_IVR_POLICY_PROFILE;
                });
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

            var updateUser = function (user) {
                return CMPFService.updateUserAccount(user).then(function (response) {
                    $log.debug('Updated user account. ', response);

                    return user;
                }, function (response) {
                    $log.debug('Cannot update user account. Error: ', response);

                    if (response.data.errorDescription) {
                        throw(new Error(response.data.errorDescription));
                    } else {
                        throw(new Error($translate.instant('CommonMessages.CouldNotUpdateUser')));
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
    });

    ProvisioningUsersAccountsOperationsModule.controller('ProvisioningOperationsUserAccountsProjectsModalCtrl', function ($scope, $uibModalInstance, $log, $filter, NgTableParams, NgTableService, Restangular,
                                                                                                                          projectsParameter, userNameParameter, projectsOrganization, CMPFService) {
        $log.debug('ProvisioningOperationsUserAccountsProjectsModalCtrl');

        $scope.selectedItems = projectsParameter ? projectsParameter : [];

        $scope.userNameParameter = userNameParameter;

        $scope.projectsOrganization = projectsOrganization.organizations[0];
        $scope.projects = CMPFService.getProjects($scope.projectsOrganization);
        $scope.projects = $filter('orderBy')($scope.projects, 'profileId');

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
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.projects);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.projects;
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

    ProvisioningUsersAccountsOperationsModule.controller('ProvisioningOperationsUserAccountsTeamsModalCtrl', function ($scope, $uibModalInstance, $log, $filter, NgTableParams, NgTableService, Restangular,
                                                                                                                       teamsParameter, userNameParameter, teamsOrganization, CMPFService) {
        $log.debug('ProvisioningOperationsUserAccountsTeamsModalCtrl');

        $scope.selectedItems = teamsParameter ? teamsParameter : [];

        $scope.userNameParameter = userNameParameter;

        $scope.teamsOrganization = teamsOrganization.organizations[0];
        $scope.teams = CMPFService.getTeams($scope.teamsOrganization);
        $scope.teams = $filter('orderBy')($scope.teams, 'profileId');

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

    ProvisioningUsersAccountsOperationsModule.controller('ProvisioningOperationsUserAccountsRolesModalCtrl', function ($scope, $uibModalInstance, $log, $filter, NgTableParams, NgTableService, Restangular,
                                                                                                                       rolesParameter, userNameParameter, roles) {
        $log.debug('ProvisioningOperationsUserAccountsRolesModalCtrl');

        $scope.selectedItems = rolesParameter ? rolesParameter : [];

        $scope.userNameParameter = userNameParameter;

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

    ProvisioningUsersAccountsOperationsModule.controller('UserGroupsModalCtrl', function ($scope, $uibModalInstance, $log, $filter, NgTableParams, NgTableService, CMPFService,
                                                                                          Restangular, userGroups, userAccountId, userName, allUserGroups) {
        $log.debug('UserGroupsModalCtrl');

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
    });

    ProvisioningUsersAccountsOperationsModule.controller('UserAccountGroupsModalCtrl', function ($scope, $uibModalInstance, $log, $filter, NgTableParams, NgTableService, Restangular, userAccountParameter,
                                                                                                 userAccountGroups) {
        $log.debug('UserAccountGroupsModalCtrl');

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
    });

    ProvisioningUsersAccountsOperationsModule.controller('UserRightsModalCtrl', function ($scope, $uibModalInstance, $log, $filter, NgTableParams, NgTableService,
                                                                                          Restangular, CMPFService, userAccountParameter, userAccountRights) {
        $log.debug('UserRightsModalCtrl');

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
    });

})();