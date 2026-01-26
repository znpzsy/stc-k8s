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
                },
                serverConfiguration: function (ServerConfigurationService) {
                    return ServerConfigurationService.requestServerConfiguration();
                }
            }
        }).state('subsystems.provisioning.operations.users.accounts.newuseraccount', {
            url: "/newuseraccount",
            templateUrl: "subsystems/provisioning/operations/users/operations.users.accounts.detail.html",
            controller: 'ProvisioningOperationsNewUserAccountCtrl',
            resolve: {
                defaultOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_ORGANIZATION_NAME, false);
                },
                serverConfiguration: function (ServerConfigurationService) {
                    return ServerConfigurationService.requestServerConfiguration();
                }
            }
        });

    });

    // Users controllers
    ProvisioningUsersAccountsOperationsModule.controller('ProvisioningOperationsUserAccountsCommonCtrl', function ($scope, $log, $controller, $uibModal, $translate, notification, DateTimeConstants, CMPFService) {

        $log.debug('ProvisioningOperationsUserAccountsCommonCtrl');

        $controller('GenericDateTimeCtrl', {$scope: $scope});

        $scope.isLocallyManagedUser = function (userAccount) {
            if (!userAccount) { return false; }
            return userAccount.userProfile && userAccount.userProfile.RemotePasswordControl !== true
        };

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
                        return CMPFService.getAllOrganizationsCustom(false, true, [], 0, DEFAULT_REST_QUERY_LIMIT);
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

        // Check if organization changed, if so, set/reset user profile attributes based on STC/CP user
        $scope.$watch('userAccount.userProfile.RemotePasswordControl', function (newValue, oldValue) {
            if (newValue !== oldValue) {
                // set default user attributes if managed remotely / if locally managed, set defaults but allow changes.
                if (newValue) {
                    $scope.userAccount.activityProfile = undefined;
                    // If active user is managed remotely, do not enable the user activity monitoring options.
                    $scope.userAccount.userProfile.EnforcePasswordChange = false;
                    $scope.userAccount.userProfile.MonitorUserInactivity = false;
                    $scope.userAccount.userProfile.MonitorConsecutiveLoginFailures = false;
                    $scope.userAccount.userProfile.ActiveDirectoryAuthentication = false;
                } else {
                    // reset to defaults for locally managed users
                    $scope.userAccount.userProfile.EnforcePasswordChange = true;
                    $scope.userAccount.userProfile.MonitorUserInactivity = true;
                    $scope.userAccount.userProfile.MonitorConsecutiveLoginFailures = true;
                    $scope.userAccount.userProfile.ActiveDirectoryAuthentication = false;

                    $scope.userAccount.activityProfile = {
                        MonitorConsecutiveLoginFailures: true,
                        MonitorUserInactivity: true,
                        BlockUserFor: 30, // minutes
                        MaxConsecutiveLoginFailures: 3,
                        DisableUserAfter: 90 // days
                    };
                }
            }
        });

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


        $scope.prepareProfileListValuesJSON = function (array) {
            var objArray = [];
            _.each(array, function (value) {
                objArray.push({value: (_.isObject(value) ? String(value.value) : value)});
            });

            return objArray;
        };

        $scope.prepareNewUserActivityProfile = function (activityProfile) {
            if(activityProfile) {
                var emptyProfile = {
                    "name": CMPFService.USER_ACTIVITY_PROFILE_NAME,
                    "profileDefinitionName": CMPFService.USER_ACTIVITY_PROFILE_NAME,
                    "attributes": [
                        {
                            "name": "MonitorConsecutiveLoginFailures",
                            "value": activityProfile.MonitorConsecutiveLoginFailures
                        },
                        {
                            "name": "MonitorUserInactivity",
                            "value": activityProfile.MonitorUserInactivity
                        },
                        {
                            "name": "BlockUserFor",
                            "value": activityProfile.BlockUserFor
                        },
                        {
                            "name": "MaxConsecutiveLoginFailures",
                            "value": activityProfile.MaxConsecutiveLoginFailures
                        },
                        {
                            "name": "DisableUserAfter",
                            "value": activityProfile.DisableUserAfter
                        }
                    ]
                };

                return emptyProfile;
            } else {
                return undefined;
            }
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
    });

    ProvisioningUsersAccountsOperationsModule.controller('ProvisioningOperationsUserAccountsCtrl', function ($scope, $state, $log, $controller, $filter, $uibModal, NgTableParams, NgTableService, notification, $translate,
                                                                                                             DateTimeConstants, SessionService, CMPFService, Restangular, userAccounts) {
        $log.debug('ProvisioningOperationsUserAccountsCtrl');
        $controller('ProvisioningOperationsUserAccountsCommonCtrl', {$scope: $scope});

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
                templateUrl: 'subsystems/provisioning/operations/users/operations.users.accounts.custom.warning.modal.html',
                controller: function ($scope, $uibModalInstance, $translate, $sce, $controller, account) {
                    $scope.modalUser = Restangular.stripRestangular(account);

                    var userProfiles = CMPFService.getProfileAttributes($scope.modalUser.profiles, CMPFService.USER_PROFILE_NAME);
                    $scope.modalUser.userProfile = (userProfiles.length > 0) ? angular.copy(userProfiles[0]) : {};
                    var message = '';
                    var isRemoteUser = ($scope.modalUser.userProfile && $scope.modalUser.userProfile.RemotePasswordControl);
                    if(isRemoteUser) {
                        message = $translate.instant('Subsystems.Provisioning.UserAccounts.RemoteUserRemovalNotAllowed');
                        $scope.modalMessage = $sce.trustAsHtml(message);
                        $scope.modalTitle = $sce.trustAsHtml($translate.instant('CommonLabels.Warning'));
                        $scope.modalOkDisabled = true;

                    } else {
                        message = $translate.instant('CommonLabels.ConfirmationRemoveMessage', {
                            userName: $scope.modalUser.userName
                        });
                        $scope.modalMessage = $sce.trustAsHtml(message);
                        $scope.modalTitle = '';

                    }
                    $scope.ok = function () {
                        $uibModalInstance.close($scope.modalUser);
                    };
                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                size: 'sm',
                resolve: {
                    account: function () {
                        return CMPFService.getUserAccount(user.id, true);
                    }
                }
            });

            modalInstance.result.then(function (user) {
                CMPFService.deleteUserAccount(user).then(function (response) {
                    $log.debug('User Removed. Response: ', response);

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

        // Reset Password functionality & modal window definitions
        var resetCPPassword = function (userAccount) {
            return CMPFService.requestPasswordReset(userAccount.userName).then(function (response) {
                if (response.data && response.data.errorCode) {
                    //var message= response.data.errorCode + ' - ' + response.data.errorDescription;
                    var message= response.data.errorDescription;

                    notification({
                        type: 'danger',
                        text: $translate.instant('Login.ForgotPassword.Messages.Error', {errorMessage: message})
                    });

                } else {
                    notification({
                        type: 'success',
                        text: $translate.instant('Login.ForgotPassword.Messages.Completed')
                    });
                }
            }, function (response) {
                $log.error('Error on password reset: ', response);
                var message= (response.data && response.data.errorDescription) ? response.data.errorDescription :  "Something went wrong";

                notification({
                    type: 'danger',
                    text: $translate.instant('Login.ForgotPassword.Messages.Error', {errorMessage: message})
                });
            });
        };

        $scope.resetPassword = function (user) {
            var modalInstance = $uibModal.open({
                templateUrl: 'subsystems/provisioning/operations/users/operations.users.accounts.custom.warning.modal.html',
                controller: function ($scope, $uibModalInstance, $translate, $sce, $controller, account) {
                    $scope.modalUser = Restangular.stripRestangular(account);

                    var userProfiles = CMPFService.getProfileAttributes($scope.modalUser.profiles, CMPFService.USER_PROFILE_NAME);
                    $scope.modalUser.userProfile = (userProfiles.length > 0) ? angular.copy(userProfiles[0]) : {};
                    var message = '';
                    var isRemoteUser = ($scope.modalUser.userProfile && $scope.modalUser.userProfile.RemotePasswordControl);
                    var email = ($scope.modalUser.userProfile && $scope.modalUser.userProfile.Email && $scope.modalUser.userProfile.Email.length > 0) ? $scope.modalUser.userProfile.Email : undefined;

                    if(isRemoteUser) {
                        message = $translate.instant('Subsystems.Provisioning.UserAccounts.RemoteUserPasswordChangeNotAllowed');
                        $scope.modalMessage = $sce.trustAsHtml(message);
                        $scope.modalTitle = $sce.trustAsHtml($translate.instant('CommonLabels.Warning'));
                        $scope.modalOkDisabled = true;

                    } else if(email) {
                        message = $translate.instant('Login.ForgotPassword.Messages.PasswordResetWarning', {
                            userEmail: email,
                        });
                        $scope.modalMessage = $sce.trustAsHtml(message);
                        $scope.modalTitle = '';

                    } else {
                        message = $translate.instant('Login.ForgotPassword.Messages.PasswordResetWarningNoEmail', {
                            userName: $scope.modalUser.userName
                        });
                        $scope.modalMessage = $sce.trustAsHtml(message);
                        $scope.modalTitle = $sce.trustAsHtml($translate.instant('CommonLabels.Warning'));
                        $scope.modalCancelDisabled = true;

                    }
                    $scope.ok = function () {
                        $uibModalInstance.close($scope.modalUser);
                    };
                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                size: 'md',
                resolve: {
                    account: function () {
                        return CMPFService.getUserAccount(user.id, true);
                    }
                }
            });

            modalInstance.result.then(function (user) {
                if (user.userProfile && user.userProfile.Email && user.userProfile.Email.length > 0) {
                    resetCPPassword(user)
                } else {
                    $state.go('subsystems.provisioning.operations.users.accounts.accountsUpdate', {id: user.id})
                }
            }, function () {
            });
        };

    });

    ProvisioningUsersAccountsOperationsModule.controller('ProvisioningOperationsNewUserAccountCtrl', function ($scope, $state, $log, $uibModal, $filter, $timeout, $q, $controller, notification, $translate, DateTimeConstants,
                                                                                                               AuthorizationService, CMPFService, Restangular, USER_STATES, CMPF_USER_KEYS, defaultOrganization, serverConfiguration) {
        $log.debug('ProvisioningOperationsNewUserAccountCtrl');

        $controller('ProvisioningOperationsUserAccountsCommonCtrl', {$scope: $scope});

        $scope.dateHolder.startDate = null;
        $scope.dateHolder.endDate = null; //moment(moment('2020-07-14 00:00:00')).toDate();
        $scope.dateHolderOriginal = angular.copy($scope.dateHolder);

        $scope.serverConfiguration = Restangular.stripRestangular(serverConfiguration);
        $scope.USER_STATES = USER_STATES;
        $scope.PROVISIONING_MM_SIMOTA_ROLES = $scope.serverConfiguration.SIMOTAProvisioningRoles;
        $scope.PROVISIONING_MM_DMC_ROLES = $scope.serverConfiguration.DMCProvisioningRoles;

        $scope.userAccount = {
            state: $scope.USER_STATES[0],
            selectedOrganization: defaultOrganization.organizations[0],
            userName: '',
            password: '',
            userGroups: [],
            userProfile: {
                Type: 'COMMON',
                Name: '',
                Surname: '',
                MobilePhone: '',
                Email: '',
                ActiveDirectoryAuthentication: false,
                RemotePasswordControl: false,
                EnforcePasswordChange: true,
                LastUpdateTime: null,
                /*
                MonitorConsecutiveLoginFailures, MonitorUserInactivity --> Handled in UserActivityPolicy profile
                EnforceStrongPasswords, EnforcePasswordAging --> Meaningful only if UserPasswordPolicy profile is present.
                EnforcePasswordChange --> Should be set as true only if user is a CP user
                */
            },
            activityProfile: {
                MonitorConsecutiveLoginFailures: true,
                MonitorUserInactivity: true,
                BlockUserFor: 30, // minutes
                MaxConsecutiveLoginFailures: 3,
                DisableUserAfter: 90 // days
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
            }
        };


        // Prepare bulk policy form fields and necessary functions.
        $controller('ProvisioningUsersAccountsBulkMessagingPoliciesOperationsCtrl', {$scope: $scope});
        $scope.originalUserAccount = angular.copy($scope.userAccount);

        $scope.isNotChanged = function () {
            return angular.equals($scope.userAccount, $scope.userAccountOriginal) &&
                angular.equals($scope.dateHolder, $scope.dateHolderOriginal);
        };

        $scope.save = function (userAccount) {
            var userAccountItem = {
                userName: userAccount.userName,
                password: userAccount.password,
                state: userAccount.state,
                userGroups: [],
                organizationId: userAccount.selectedOrganization.id,
                profiles: []
            };

            // User profile - attributes assigned
            var userProfileItem = {
                "attributes": [
                    {"name": "Name", "value": userAccount.userProfile.Name},
                    {"name": "Surname", "value": userAccount.userProfile.Surname},
                    {"name": "MobilePhone", "value": userAccount.userProfile.MobilePhone},
                    {"name": "Email", "value": userAccount.userProfile.Email},
                    {
                        "name": "LastUpdateTime",
                        "value": $filter('date')(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss')
                    },
                    {
                        "name": "EffectiveDate",
                        "value": ($scope.dateHolder.startDate ? $filter('date')($scope.dateHolder.startDate, 'yyyy-MM-dd') + 'T00:00:00' : '')
                    },
                    {
                        "name": "ExpiryDate",
                        "value": ($scope.dateHolder.endDate ? $filter('date')($scope.dateHolder.endDate, 'yyyy-MM-dd') + 'T00:00:00' : '')
                    },
                    {"name": "ActiveDirectoryAuthentication", "value": false}, // No active directory authentication here. AD Authentication will be set to false as default.
                    {"name": "RemotePasswordControl", "value": userAccount.userProfile.RemotePasswordControl},
                    // Enforce the values for newly created users.
                    {"name": "EnforcePasswordChange", "value": ($scope.isLocallyManagedUser(userAccount) ? userAccount.userProfile.EnforcePasswordChange : false) }
                ],
                "name": CMPFService.USER_PROFILE_NAME,
                "profileDefinitionName": CMPFService.USER_PROFILE_NAME
            };

            // 3rd Party (Metamorfoz Apps) Role Ids
            if(AuthorizationService.canMMSimotaAccess() && Number(userAccount.userProfile.SimotaRoleId) > 0) {
                userProfileItem.attributes.push({"name": "SimotaRoleId", "value": userAccount.userProfile.SimotaRoleId});
            }
            if(AuthorizationService.canMMDMCAccess() && Number(userAccount.userProfile.DmcRoleId) > 0) {
                userProfileItem.attributes.push({"name": "DmcRoleId", "value": userAccount.userProfile.DmcRoleId});
            }

            // User profile pushed into userAccountItem.profiles
            userAccountItem.profiles.push(userProfileItem);

            // Only if user is locally managed, account should have the activity profile defined. Remote users' credentials will be handled over NIAM
            if($scope.isLocallyManagedUser(userAccount)) {
                var userActivityProfile = $scope.prepareNewUserActivityProfile(userAccount.activityProfile);
                if(userActivityProfile) {
                    userAccountItem.profiles.push(userActivityProfile);
                }
            }

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

            var newUser = [userAccountItem];
            var userGroups = angular.copy(userAccount.userGroups); // replicated variable for manipulation

            var createUser = function (user) {
                return CMPFService.createUserAccount(user).then(function (response) {
                    var createdUserAccount = Restangular.stripRestangular(response);
                    $log.debug('Created user', createdUserAccount);

                    if (response.data && response.data.errorCode && response.data.errorDescription) {
                        //var message= response.data.errorCode + ' - ' + response.data.errorDescription;
                        var message= response.data.errorDescription;

                        notification({
                            type: 'danger',
                            text: $translate.instant('Login.ForgotPassword.Messages.Error', {errorMessage: message})
                        });

                    }
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

    ProvisioningUsersAccountsOperationsModule.controller('ProvisioningOperationsUpdateUserAccountCtrl', function ($scope, $state, $log, $q, $filter, $controller, notification, $translate, $timeout, $stateParams, $uibModal, DateTimeConstants,
                                                                                                                  AuthorizationService, CMPFService, Restangular, USER_STATES, CMPF_USER_KEYS, userAccount, serverConfiguration) {
        $log.debug('ProvisioningOperationsUpdateUserAccountCtrl');
        $controller('ProvisioningOperationsUserAccountsCommonCtrl', {$scope: $scope});

        var DUMMY_PASSWORD = '************';

        $scope.dateHolder.startDate = null;
        $scope.dateHolder.endDate = null; //moment(moment('2020-07-14 00:00:00')).toDate();

        $scope.serverConfiguration = Restangular.stripRestangular(serverConfiguration);
        $scope.USER_STATES = USER_STATES;
        $scope.PROVISIONING_MM_SIMOTA_ROLES = $scope.serverConfiguration.SIMOTAProvisioningRoles;
        $scope.PROVISIONING_MM_DMC_ROLES = $scope.serverConfiguration.DMCProvisioningRoles;

        $scope.userAccount = Restangular.stripRestangular(userAccount);
        $scope.userAccount.selectedOrganization = userAccount.organization;
        $scope.originalGroups = angular.copy($scope.userAccount.userGroups);
        $scope.userAccount.confirmpassword = $scope.userAccount.password;
        $scope.userAccount.activeDirectoryAuth = $filter('activeDirectoryAuthFilter')($scope.userAccount.password);
        $scope.userAccount.selectedRemotePassworControl = isSelectedRemotePasswordControl($scope.userAccount);
        $scope.originalPassword = angular.copy($scope.userAccount.password);
        $scope.userAccount.password = DUMMY_PASSWORD;
        $scope.userAccount.confirmpassword = DUMMY_PASSWORD;

        // User profile
        //$scope.userAccount.userProfile = CMPFService.extractUserProfile(userAccount);
        var userProfiles = CMPFService.getProfileAttributes(userAccount.profiles, CMPFService.USER_PROFILE_NAME);
        if (userProfiles.length > 0) {
            $scope.userAccount.userProfile = angular.copy(userProfiles[0]);
            $scope.userAccount.userProfile.SimotaRoleId = $scope.userAccount.userProfile.SimotaRoleId ? String($scope.userAccount.userProfile.SimotaRoleId) : null;
            $scope.userAccount.userProfile.DmcRoleId = $scope.userAccount.userProfile.DmcRoleId ? String($scope.userAccount.userProfile.DmcRoleId) : null;
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


        // Set Effective Date & Expiry Date for locally managed users, if specified.
        if($scope.isLocallyManagedUser($scope.userAccount)){
            $scope.dateHolder.startDate = $scope.userAccount.userProfile.EffectiveDate ? new Date(moment($scope.userAccount.userProfile.EffectiveDate).utcOffset(DateTimeConstants.OFFSET).format('YYYY/MM/DD HH:mm:ss')) : null;
            $scope.dateHolder.endDate = $scope.userAccount.userProfile.ExpiryDate ? new Date(moment($scope.userAccount.userProfile.ExpiryDate).utcOffset(DateTimeConstants.OFFSET).format('YYYY/MM/DD HH:mm:ss')): null;
        }

        // Activity Profile
        var activityProfiles = CMPFService.getProfileAttributes(userAccount.profiles, CMPFService.USER_ACTIVITY_PROFILE_NAME);
        if (activityProfiles && activityProfiles.length > 0) {
            $scope.userAccount.activityProfile = angular.copy(activityProfiles[0]);
        } else {
            // Only locally managed users should have activity profile. Remote Controlled users will be handled over NIAM
            if(!$scope.userAccount.userProfile.RemotePasswordControl) {
                $scope.userAccount.activityProfile = {
                    MonitorConsecutiveLoginFailures: false,
                    MonitorUserInactivity: false,
                    BlockUserFor: 30, // minutes
                    MaxConsecutiveLoginFailures: 3,
                    DisableUserAfter: 90 // days
                }
            } else {
                $scope.userAccount.activityProfile = undefined;
            }
        }
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

        $scope.userAccountOriginal = angular.copy($scope.userAccount);
        $scope.dateHolderOriginal = angular.copy($scope.dateHolder);

        $scope.isNotChanged = function () {
            return angular.equals($scope.userAccount, $scope.userAccountOriginal) &&
                angular.equals($scope.dateHolder, $scope.dateHolderOriginal);
        };


        function isSelectedRemotePasswordControl (userAccount) {
            var userProfileDefn = CMPFService.getUserProfile(userAccount);
            if(userProfileDefn !== undefined){
                var remotepasswordcontrolAttr = _.findWhere(userProfileDefn.attributes, {name: "RemotePasswordControl"});
                return  remotepasswordcontrolAttr !== undefined
            }
           return false;
        };

        // Reset Password functinality & modal window definitions
        var resetCPPassword = function (userAccount) {
            return CMPFService.requestPasswordReset(userAccount.userName).then(function (response) {
                if (response.data && response.data.errorCode) {

                    var message = response.data.errorDescription;
                    notification({
                        type: 'danger',
                        text: $translate.instant('Login.ForgotPassword.Messages.Error', {errorMessage: message})
                    });

                } else {
                    notification({
                        type: 'success',
                        text: $translate.instant('Login.ForgotPassword.Messages.Completed')
                    });
                }
            }, function (response) {
                $log.error('Error on password reset: ', response);
                var message= (response.data && response.data.errorDescription) ? response.data.errorDescription :  "Something went wrong";

                notification({
                    type: 'danger',
                    text: $translate.instant('Login.ForgotPassword.Messages.Error', {errorMessage: message})
                });
            });
        }
        $scope.resetPassword = function (user) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: function ($scope, $uibModalInstance, $translate, $sce, $controller) {
                    var message = $translate.instant('Login.ForgotPassword.Messages.PasswordResetWarning', {
                        userEmail: (user.userProfile && user.userProfile.Email) ? user.userProfile.Email : ''
                    });

                    $scope.confirmationMessage = $sce.trustAsHtml(message);

                    $controller('ConfirmationModalInstanceCtrl', {$scope: $scope, $uibModalInstance: $uibModalInstance});
                },
                size: 'sm'
            });

            modalInstance.result.then(function () {
                resetCPPassword(user)
            }, function () {
            });
        };

        $scope.save = function (userAccount) {

            userAccount.bulkUserPolicyProfile.isModerated = false;
            userAccount.bulkUserPolicyProfile.isApiAccessAllowed = false;

            var userAccountItem = {
                id: $scope.userAccountOriginal.id,
                userName: $scope.userAccountOriginal.userName,
                password: ($scope.userAccount.activeDirectoryAuth ? CMPF_USER_KEYS[0] : userAccount.password),
                state: userAccount.state,
                userGroups: userAccount.userGroups,
                organization: userAccount.selectedOrganization,
                organizationId: userAccount.selectedOrganization.id,
                profiles: $scope.userAccountOriginal.profiles ? angular.copy($scope.userAccount.profiles) : []
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

                // Update the last update time
                updatedUserProfile.LastUpdateTime = $filter('date')(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss');

                // Set Effective Date & Expiry Date for locally managed users, if specified.
                if($scope.isLocallyManagedUser(userAccount)) {
                    updatedUserProfile.EffectiveDate = $scope.dateHolder.startDate ? $filter('date')($scope.dateHolder.startDate, 'yyyy-MM-dd') + 'T00:00:00' : '';
                    updatedUserProfile.ExpiryDate = $scope.dateHolder.endDate ? $filter('date')($scope.dateHolder.endDate, 'yyyy-MM-dd') + 'T00:00:00' : '';
                }

                // If active directory selected do not activate the user activity monitoring options.
                if (updatedUserProfile.ActiveDirectoryAuthentication || updatedUserProfile.RemotePasswordControl) {
                    updatedUserProfile.EnforceStrongPasswords = false;
                    updatedUserProfile.EnforcePasswordAging = false;
                    updatedUserProfile.MonitorConsecutiveLoginFailures = false;
                    updatedUserProfile.MonitorUserInactivity = false;
                }
                if (AuthorizationService.canMMSimotaAccess() && Number(userAccount.userProfile.SimotaRoleId) > 0)
                    updatedUserProfile.SimotaRoleId = userAccount.userProfile.SimotaRoleId;
                if (AuthorizationService.canMMDMCAccess() && Number(userAccount.userProfile.DmcRoleId) > 0)
                    updatedUserProfile.DmcRoleId = userAccount.userProfile.DmcRoleId;

                var userProfileArray = CMPFService.prepareProfile(updatedUserProfile, originalUserProfile);

                userProfileArray = Number(userAccount.userProfile.SimotaRoleId) > 0 ? userProfileArray : _.filter(userProfileArray, function (attribute) {
                    return (attribute.name !== 'SimotaRoleId');
                });
                userProfileArray = Number(userAccount.userProfile.DmcRoleId) > 0 ? userProfileArray : _.filter(userProfileArray, function (attribute) {
                    return (attribute.name !== 'DmcRoleId');
                });

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

            // Activity Profile
            if(userAccount.activityProfile) {
                if($scope.isLocallyManagedUser(userAccount)) {

                    var originalActivityProfile = CMPFService.findProfileByName(userAccountItem.profiles, CMPFService.USER_ACTIVITY_PROFILE_NAME);
                    var updatedActivityProfile = JSON.parse(angular.toJson(userAccount.activityProfile));
                    // For locally managed Users, add or update the profile.
                    var activityProfileArray = CMPFService.prepareProfile(updatedActivityProfile, originalActivityProfile);

                    if(originalActivityProfile) {
                        originalActivityProfile.attributes = activityProfileArray;
                    } else {
                        var activityProfile = {
                            name: CMPFService.USER_ACTIVITY_PROFILE_NAME,
                            profileDefinitionName: CMPFService.USER_ACTIVITY_PROFILE_NAME,
                            attributes: activityProfileArray
                        };

                        userAccountItem.profiles.push(activityProfile);
                    }

                } else {
                    userAccountItem.profiles = CMPFService.deleteProfileByName(userAccountItem.profiles, CMPFService.USER_ACTIVITY_PROFILE_NAME);
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

            var updateUser = function (user) {
                return CMPFService.updateUserAccount(user).then(function (response) {
                    $log.debug('Updated user account. ', response);
                    return user;
                }, function (response) {
                    $log.debug('Cannot update user account. Error: ', response);

                    var knownErrorCodes = [
                        5021100, 5021101, 5021120, 5021121, 5021122, 5021123, 5021124, 5021125, 5021126,
                        5022140, 5022141, 5022142, 5022143, 5022144, 5022145, 5022146, 5022147, 5022148,
                        5022149, 5022150, 5022151,
                        5024120, 5024121, 5024122, 5024123, 5024124
                    ];
                    var message = $translate.instant('CommonMessages.CouldNotUpdateUser');
                    if (response.data && knownErrorCodes.indexOf(response.data.errorCode) !== -1) {
                        message = message + ' ' +  response.data.errorDescription;
                    }

                    throw(new Error(message));
                });
            };

            var addUserToGroup = function (aUserGroup, aUserAccount) {
                var deferred = $q.defer();
                var promise = deferred.promise;
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
