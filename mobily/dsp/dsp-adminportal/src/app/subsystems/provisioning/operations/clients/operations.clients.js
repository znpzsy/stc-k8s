(function () {

    'use strict';

    angular.module('adminportal.subsystems.provisioning.operations.clients', []);

    var ProvisioningOperationsClientsModule = angular.module('adminportal.subsystems.provisioning.operations.clients');

    ProvisioningOperationsClientsModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.provisioning.operations.clients', {
            abstract: true,
            url: "/clients",
            template: '<div ui-view></div>',
            data: {
                exportFileName: 'Clients',
                permissions: []
            },
            resolve: {
                partners: function (CMPFService) {
                    return CMPFService.getAllPartners(false, true, [CMPFService.ORGANIZATION_PROVIDER_CLIENT_PROFILE]);
                }
            }
        }).state('subsystems.provisioning.operations.clients.list', {
            url: "",
            templateUrl: "subsystems/provisioning/operations/clients/operations.clients.html",
            controller: 'ProvisioningOperationsClientsCtrl'
        }).state('subsystems.provisioning.operations.clients.new', {
            url: "/new",
            templateUrl: "subsystems/provisioning/operations/clients/operations.clients.details.html",
            controller: 'ProvisioningOperationsClientsNewCtrl'
        }).state('subsystems.provisioning.operations.clients.update', {
            url: "/update/:orgId/:profileId",
            templateUrl: "subsystems/provisioning/operations/clients/operations.clients.details.html",
            controller: 'ProvisioningOperationsClientsUpdateCtrl',
            resolve: {
                partner: function ($stateParams, CMPFService) {
                    return CMPFService.getPartner($stateParams.orgId);
                }
            }
        });

    });

    ProvisioningOperationsClientsModule.controller('ProvisioningOperationsClientsCommonCtrl', function ($scope, $log, $q, $state, $controller, $filter, $uibModal, notification, $translate, CMPFService,
                                                                                                        SessionService, CLIENTS_STATUSES, CLIENTS_TYPES, CLIENTS_SCOPES) {
        $log.debug('ProvisioningOperationsClientsCommonCtrl');

        $controller('GenericDateTimeCtrl', {$scope: $scope});

        var username = SessionService.getUsername();

        $scope.CLIENTS_STATUSES = CLIENTS_STATUSES;
        $scope.CLIENTS_TYPES = CLIENTS_TYPES;
        $scope.CLIENTS_SCOPES = CLIENTS_SCOPES;

        $scope.updateClient = function (clientsOrganizationOriginal, client, isDelete) {
            var deferred = $q.defer();

            var currentTimestamp = $filter('date')(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss');

            $log.debug('Trying update default organization: ', clientsOrganizationOriginal, client);

            var organizationItem = {
                id: clientsOrganizationOriginal.id,
                name: clientsOrganizationOriginal.name,
                type: clientsOrganizationOriginal.type,
                orgType: clientsOrganizationOriginal.orgType,
                parentId: clientsOrganizationOriginal.parentId,
                parentName: clientsOrganizationOriginal.parentName,
                state: clientsOrganizationOriginal.state,
                description: clientsOrganizationOriginal.description,
                // Profiles
                profiles: angular.copy(clientsOrganizationOriginal.profiles)
            };

            var originalClientProfiles = CMPFService.findProfilesByName(organizationItem.profiles, CMPFService.ORGANIZATION_PROVIDER_CLIENT_PROFILE);

            var updatedClientProfile = JSON.parse(angular.toJson(client));
            var originalClientProfile = _.findWhere(originalClientProfiles, {id: updatedClientProfile.profileId});

            // Modify some attributes here
            if ($scope.dateHolder.startDate) {
                updatedClientProfile.StartDate = $filter('date')($scope.dateHolder.startDate, 'yyyy-MM-dd\'T\'HH:mm:ss');
            }
            if ($scope.dateHolder.endDate) {
                updatedClientProfile.EndDate = $filter('date')($scope.dateHolder.endDate, 'yyyy-MM-dd\'T\'HH:mm:ss');
            }
            delete updatedClientProfile.organization;

            if (updatedClientProfile.profileId) {
                // Is updating
                updatedClientProfile.LastUpdatedOn = currentTimestamp;
                updatedClientProfile.LastUpdatedBy = username;
            } else {
                // Is creating
                updatedClientProfile.CreatedOn = currentTimestamp;
                updatedClientProfile.CreatedBy = username;
            }

            if (isDelete) {
                organizationItem.profiles = _.without(organizationItem.profiles, originalClientProfile);
            } else {
                var clientProfileAttrArray = CMPFService.prepareProfile(updatedClientProfile, originalClientProfile);
                // ---
                if (originalClientProfile) {
                    originalClientProfile.attributes = clientProfileAttrArray;
                } else {
                    var clientProfile = {
                        name: CMPFService.ORGANIZATION_PROVIDER_CLIENT_PROFILE,
                        profileDefinitionName: CMPFService.ORGANIZATION_PROVIDER_CLIENT_PROFILE,
                        attributes: clientProfileAttrArray
                    };

                    organizationItem.profiles.push(clientProfile);
                }
            }

            CMPFService.updatePartner(organizationItem).then(function (response) {
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

        $scope.openOrganizations = function (client) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.organizations.html',
                controller: 'OrganizationsModalInstanceCtrl',
                size: 'lg',
                resolve: {
                    organizationParameter: function () {
                        return angular.copy(client.organization);
                    },
                    itemName: function () {
                        return client.NameEn;
                    },
                    allOrganizations: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                        return CMPFService.getAllPartners();
                    },
                    organizationsModalTitleKey: function () {
                        return 'Subsystems.Provisioning.Clients.OrganizationsModalTitle';
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
                if (selectedItem.organization) {
                    CMPFService.getPartner(selectedItem.organization.id).then(function(response) {
                        client.organization = response;
                    });
                } else {
                    client.organization = selectedItem.organization;
                }
            }, function () {
            });
        };

        $scope.removeSelectedOrganization = function () {
            $scope.client.organization = {};
        };

        $scope.cancel = function () {
            $state.go('subsystems.provisioning.operations.clients.list');
        };
    });

    ProvisioningOperationsClientsModule.controller('ProvisioningOperationsClientsCtrl', function ($scope, $log, $controller, $state, $uibModal, $filter, $translate, notification, NgTableParams, NgTableService,
                                                                                                  CMPFService, DateTimeConstants, DEFAULT_REST_QUERY_LIMIT, partners) {
        $log.debug('ProvisioningOperationsClientsCtrl');

        $controller('ProvisioningOperationsClientsCommonCtrl', {$scope: $scope});

        $scope.clients = [];
        _.each(partners.partners, function (partner) {
            // ProviderClientProfile
            var providerClientProfiles = CMPFService.getClients(partner);
            if (providerClientProfiles && providerClientProfiles.length > 0) {
                _.each(providerClientProfiles, function (providerClientProfile) {
                    var client = angular.copy(providerClientProfile);
                    client.organization = partner;

                    $scope.clients.push(client);
                });
            }
        });
        $scope.clients = $filter('orderBy')($scope.clients, 'ClientID');

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'profileId',
                    headerKey: 'Subsystems.Provisioning.Clients.Id'
                },
                {
                    fieldName: 'CreatedOn',
                    headerKey: 'CommonLabels.CreatedOn',
                    filter: {name: 'date', params: ['yyyy-MM-dd HH:mm:ss', DateTimeConstants.OFFSET]}
                },
                {
                    fieldName: 'CreatedBy',
                    headerKey: 'CommonLabels.CreatedBy'
                },
                {
                    fieldName: 'LastUpdatedOn',
                    headerKey: 'CommonLabels.LastUpdatedOn',
                    filter: {name: 'date', params: ['yyyy-MM-dd HH:mm:ss', DateTimeConstants.OFFSET]}
                },
                {
                    fieldName: 'LastUpdatedBy',
                    headerKey: 'CommonLabels.LastUpdatedBy'
                },
                {
                    fieldName: 'organization.name',
                    headerKey: 'GenericFormFields.Organization.Label'
                },
                {
                    fieldName: 'Status',
                    headerKey: 'CommonLabels.State'
                },
                {
                    fieldName: 'StartDate',
                    headerKey: 'GenericFormFields.StartDate.Label',
                    filter: {name: 'date', params: ['yyyy-MM-dd', DateTimeConstants.OFFSET]}
                },
                {
                    fieldName: 'EndDate',
                    headerKey: 'GenericFormFields.EndDate.Label',
                    filter: {name: 'date', params: ['yyyy-MM-dd', DateTimeConstants.OFFSET]}
                },
                {
                    fieldName: 'NameEN',
                    headerKey: 'Subsystems.Provisioning.Clients.ClientInfo.NameEn'
                },
                {
                    fieldName: 'DescriptionEN',
                    headerKey: 'Subsystems.Provisioning.Clients.ClientInfo.DescriptionEn'
                },
                {
                    fieldName: 'NameLangOther',
                    headerKey: 'Subsystems.Provisioning.Clients.ClientInfo.NameAr'
                },
                {
                    fieldName: 'DescriptionLangOther',
                    headerKey: 'Subsystems.Provisioning.Clients.ClientInfo.DescriptionAr'
                },
                {
                    fieldName: 'Type',
                    headerKey: 'Subsystems.Provisioning.Clients.ClientInfo.Type'
                },
                {
                    fieldName: 'AccessScope',
                    headerKey: 'Subsystems.Provisioning.Clients.ClientInfo.AccessScope'
                },
                {
                    fieldName: 'IsPortal',
                    headerKey: 'Subsystems.Provisioning.Clients.ClientInfo.IsPortal',
                    filter: {name: 'YesNoFilter'}
                },
                {
                    fieldName: 'ClientID',
                    headerKey: 'Subsystems.Provisioning.Clients.ClientInfo.ClientID'
                },
                {
                    fieldName: 'Password',
                    headerKey: 'Subsystems.Provisioning.Clients.ClientInfo.Password'
                }
            ]
        };

        // Client list
        $scope.clientList = {
            list: $scope.clients,
            tableParams: {}
        };

        $scope.clientList.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "ClientID": 'asc'
            }
        }, {
            total: $scope.clientList.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.clientList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.clientList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - Client list

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.clientList.tableParams.settings().$scope.filterText = filterText;
            $scope.clientList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.clientList.tableParams.page(1);
            $scope.clientList.tableParams.reload();
        }, 750);

        var findServiceTypesUsingTheClient = function (allServiceTypes, client) {
            var serviceTypes = [];
            _.each(allServiceTypes, function (serviceType) {
                if (Number(serviceType.ClientID) === Number(client.profileId)) {
                    serviceTypes.push(serviceType);
                }
            });

            return serviceTypes;
        };

        $scope.remove = function (client) {
            client.rowSelected = true;

            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                client.rowSelected = false;

                $scope.updateClient(client.organization, client, true).then(function (response) {
                    var deletedListItem = _.findWhere($scope.clientList.list, {profileId: client.profileId});
                    $scope.clientList.list = _.without($scope.clientList.list, deletedListItem);

                    $scope.clientList.tableParams.reload();

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                }, function (response) {
                    CMPFService.showApiError(response);
                });
            }, function () {
                client.rowSelected = false;
            });
        };
    });

    ProvisioningOperationsClientsModule.controller('ProvisioningOperationsClientsNewCtrl', function ($scope, $log, $controller, $translate, notification, CMPFService) {
        $log.debug('ProvisioningOperationsClientsNewCtrl');

        $controller('ProvisioningOperationsClientsCommonCtrl', {$scope: $scope});

        $scope.dateHolder.startDate = null;
        $scope.dateHolder.endDate = null;

        $scope.client = {
            Status: 'DRAFT',
            Type: null,
            AccessScope: null,
            IsPortal: false
        };

        $scope.save = function (client) {
            $scope.updateClient(client.organization, client).then(function (response) {
                notification.flash({
                    type: 'success',
                    text: $translate.instant('CommonLabels.OperationSuccessful')
                });

                $scope.go('subsystems.provisioning.operations.clients.list');
            }, function (response) {
                CMPFService.showApiError(response);
            });
        };
    });

    ProvisioningOperationsClientsModule.controller('ProvisioningOperationsClientsUpdateCtrl', function ($scope, $log, $controller, $stateParams, $translate, notification, CMPFService,
                                                                                                        DateTimeConstants, partner) {
        $log.debug('ProvisioningOperationsClientsUpdateCtrl');

        $controller('ProvisioningOperationsClientsCommonCtrl', {$scope: $scope});

        var profileId = $stateParams.profileId;

        var clientProfiles = CMPFService.getClients(partner);
        if (clientProfiles.length > 0) {
            var foundClient = _.findWhere(clientProfiles, {"profileId": Number(profileId)});
            $scope.client = angular.copy(foundClient);

            $scope.client.organization = partner;
        }

        if ($scope.client) {
            $scope.dateHolder = {
                startDate: ($scope.client.StartDate ? new Date(moment($scope.client.StartDate).utcOffset(DateTimeConstants.OFFSET).format('YYYY/MM/DD HH:mm:ss')) : ''),
                endDate: ($scope.client.EndDate ? new Date(moment($scope.client.EndDate).utcOffset(DateTimeConstants.OFFSET).format('YYYY/MM/DD HH:mm:ss')) : '')
            }
        }

        $scope.originalClient = angular.copy($scope.client);
        $scope.isNotChanged = function () {
            return angular.equals($scope.originalClient, $scope.client);
        };

        $scope.save = function (client) {
            $scope.updateClient(client.organization, client).then(function (response) {
                notification.flash({
                    type: 'success',
                    text: $translate.instant('CommonLabels.OperationSuccessful')
                });

                $scope.go('subsystems.provisioning.operations.clients.list');
            }, function (response) {
                CMPFService.showApiError(response);
            });
        };
    });

})();
