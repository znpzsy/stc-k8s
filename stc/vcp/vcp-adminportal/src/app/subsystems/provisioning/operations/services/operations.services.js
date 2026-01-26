(function () {

    'use strict';

    angular.module('adminportal.subsystems.provisioning.operations.services', []);

    var ProvisioningOperationsModule = angular.module('adminportal.subsystems.provisioning.operations.services');

    ProvisioningOperationsModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.provisioning.operations.services', {
            abstract: true,
            url: "",
            template: "<div ui-view></div>"
        }).state('subsystems.provisioning.operations.services.list', {
            url: "/services",
            templateUrl: "subsystems/provisioning/operations/services/operations.services.html",
            controller: 'ProvisioningOperationsServicesCtrl',
            resolve: {
                organizations: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizations(0, DEFAULT_REST_QUERY_LIMIT);
                },
                services: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getServices(0, DEFAULT_REST_QUERY_LIMIT);
                }
            }
        }).state('subsystems.provisioning.operations.services.newservice', {
            url: "/newservice",
            templateUrl: "subsystems/provisioning/operations/services/operations.services.detail.html",
            controller: 'ProvisioningOperationsNewServiceCtrl',
            resolve: {}
        }).state('subsystems.provisioning.operations.services.serviceUpdate', {
            url: "/services/:id",
            templateUrl: "subsystems/provisioning/operations/services/operations.services.detail.html",
            controller: 'ProvisioningOperationsUpdateServiceCtrl',
            resolve: {
                service: function ($stateParams, CMPFService) {
                    return CMPFService.getService($stateParams.id);
                }
            }
        });

    });

    ProvisioningOperationsModule.controller('ProvisioningOperationsServicesCommonCtrl', function ($scope, $log, $uibModal, $controller, CMPFService, Restangular, STATUS_TYPES) {
        $log.debug('ProvisioningOperationsServicesCommonCtrl');

        $controller('GenericDateTimeCtrl', {$scope: $scope});

        $scope.dateFilter.startDate = $scope.getTodayBegin();
        $scope.dateFilter.startTime = $scope.getTodayBegin();
        $scope.dateFilter.endDate = $scope.getTodayBegin();
        $scope.dateFilter.endTime = $scope.getTodayBegin();

        $scope.STATUS_TYPES = STATUS_TYPES;

        $scope.openServiceProviders = function () {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.organizations.html',
                controller: 'OrganizationsModalInstanceCtrl',
                size: 'lg',
                resolve: {
                    organizationParameter: function () {
                        return $scope.service.organization;
                    },
                    itemName: function () {
                        return $scope.service.name;
                    },
                    allOrganizations: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                        return CMPFService.getAllOrganizations(0, DEFAULT_REST_QUERY_LIMIT);
                    },
                    organizationsModalTitleKey: function () {
                        return 'Subsystems.Provisioning.Services.OrganizationsModalTitle';
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
                $scope.service.organization = selectedItem.organization;
                $scope.service.organizationId = selectedItem.organization.id;
            }, function () {
                //
            });
        };

        $scope.cancel = function () {
            $scope.go('subsystems.provisioning.operations.services.list');
        };
    });

    ProvisioningOperationsModule.controller('ProvisioningOperationsServicesCtrl', function ($scope, $log, $uibModal, $filter, $translate, notification, NgTableParams,
                                                                                            NgTableService, AuthorizationService, Restangular, CMPFService, organizations,
                                                                                            services, DEFAULT_REST_QUERY_LIMIT, STATUS_TYPES) {
        $log.debug('ProvisioningOperationsServicesCtrl');

        $scope.STATUS_TYPES = STATUS_TYPES;

        $scope.stateFilter = 'ALL';
        $scope.stateFilterChange = function (state) {
            if (state !== 'ALL') {
                $scope.services = _.where($scope.originalServices, {state: state});
            } else {
                $scope.services = angular.copy($scope.originalServices);
            }

            $scope.tableParams.page(1);
            $scope.tableParams.reload();
        };

        var services = Restangular.stripRestangular(services);
        $scope.services = $filter('orderBy')(services.services, 'id');
        _.each($scope.services, function (service) {
            var foundOrganization = _.findWhere(organizations.organizations, {"id": s.toNumber(service.organizationId)});
            service.organization = {
                name: _.isUndefined(foundOrganization) ? CMPFService.DEFAULT_ORGANIZATION_NAME : foundOrganization.name
            };
        });
        $scope.originalServices = angular.copy($scope.services);

        $scope.exportAllData = function (fileNamePrefix, exporter) {
            CMPFService.getServices(0, DEFAULT_REST_QUERY_LIMIT, true, true).then(function (exportingServices) {
                var exportingServiceList = exportingServices.services;
                // Reformatted all records again to show meaningful data on the exporting data.
                _.each(exportingServiceList, function (service) {
                    var serviceProfile = CMPFService.extractServiceProfile(service);
                    if (serviceProfile) {
                        service.startDate = serviceProfile.startDate;
                        service.endDate = serviceProfile.endDate;
                        service.description = serviceProfile.description;
                    }
                });

                exporter.download(fileNamePrefix, exportingServiceList);
            });
        };

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'id',
                    headerKey: 'Subsystems.Provisioning.Services.Id'
                },
                {
                    fieldName: 'name',
                    headerKey: 'Subsystems.Provisioning.Services.Name'
                },
                {
                    fieldName: 'description',
                    headerKey: 'Subsystems.Provisioning.Services.Description'
                },
                {
                    fieldName: 'organization.name',
                    headerKey: 'Subsystems.Provisioning.Services.Organization'
                },
                {
                    fieldName: 'state',
                    headerKey: 'Subsystems.Provisioning.Services.State'
                },
                {
                    fieldName: 'subscriptionNotificationProfile.RequiresNotification',
                    headerKey: 'Subsystems.Provisioning.Services.NotificationEnabled',
                    filter: {name: 'YesNoFilter'}
                },
                {
                    fieldName: 'subscriptionNotificationProfile.url',
                    headerKey: 'Subsystems.Provisioning.Services.NotificationURL'
                },
                {
                    fieldName: 'startDate',
                    headerKey: 'GenericFormFields.StartDate.Label',
                    filter: {name: 'date', params: ['yyyy-MM-dd HH:mm:ss']}
                },
                {
                    fieldName: 'endDate',
                    headerKey: 'GenericFormFields.EndDate.Label',
                    filter: {name: 'date', params: ['yyyy-MM-dd HH:mm:ss']}
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
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.services);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.services;
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

        $scope.remove = function (service) {
            service.rowSelected = true;

            CMPFService.getService(service.id).then(function (cmpfService) {
                if (cmpfService.accessGatewayEnabled || cmpfService.chargingGatewayEnabled || cmpfService.messagingGatewayEnabled) {
                    var modalInstance = $uibModal.open({
                        templateUrl: 'partials/modal/modal.alert.html',
                        controller: function ($scope, $uibModalInstance, $translate, $controller, $sce) {
                            $scope.alertTitle = $translate.instant('CommonLabels.Warning');

                            var gatewayNames = [];
                            if (cmpfService.accessGatewayEnabled) {
                                gatewayNames.push($translate.instant('Subsystems.Provisioning.Services.ProvisonedGateways.AccessGateway'));
                            }
                            if (cmpfService.chargingGatewayEnabled) {
                                gatewayNames.push($translate.instant('Subsystems.Provisioning.Services.ProvisonedGateways.ChargingGateway'));
                            }
                            if (cmpfService.messagingGatewayEnabled) {
                                gatewayNames.push($translate.instant('Subsystems.Provisioning.Services.ProvisonedGateways.MessagingGateway'));
                            }

                            var message = $translate.instant('Subsystems.Provisioning.Services.Messages.AnyGatewayProvisioned', {
                                serviceName: cmpfService.name
                            });
                            message = message + ' [' + gatewayNames.join(', ') + ']';

                            $scope.alertMessage = $sce.trustAsHtml(message);

                            $controller('AlertModalInstanceCtrl', {
                                $scope: $scope,
                                $uibModalInstance: $uibModalInstance
                            });
                        }
                    });

                    modalInstance.result.then(function () {
                        service.rowSelected = false;
                    }, function () {
                        service.rowSelected = false;
                    });
                } else {
                    var modalInstance = $uibModal.open({
                        templateUrl: 'partials/modal/modal.confirmation.html',
                        controller: function ($scope, $uibModalInstance, $translate, $controller, $sce) {
                            var message = $translate.instant('CommonLabels.ConfirmationRemoveMessage');
                            message = message + ' [' + cmpfService.name + ']';
                            $scope.confirmationMessage = $sce.trustAsHtml(message);

                            $controller('ConfirmationModalInstanceCtrl', {
                                $scope: $scope,
                                $uibModalInstance: $uibModalInstance
                            });
                        },
                        size: 'sm'
                    });

                    modalInstance.result.then(function () {
                        $log.debug('remove', cmpfService.name);

                        CMPFService.deleteService(service).then(function (response) {
                            $log.debug('Removed. Response: ', response);

                            if (response && response.errorCode) {
                                CMPFService.showApiError(response);
                            } else {
                                var deletedListItem = _.findWhere($scope.services, {id: cmpfService.id});
                                $scope.services = _.without($scope.services, deletedListItem);

                                $scope.tableParams.reload();

                                notification({
                                    type: 'success',
                                    text: $translate.instant('CommonLabels.OperationSuccessful')
                                });
                            }
                        }, function (response) {
                            $log.debug('Cannot remove services. Error: ', response);

                            if (response.data && response.data.errorDescription) {
                                var message = response.data.errorDescription;
                                if (response.data.errorDescription.indexOf('SM_SERVICE_SUBSCRIPTION') > -1) {
                                    message = $translate.instant('CommonMessages.ThereAreServiceSubscriptions');
                                } else if (response.data.errorDescription.indexOf('SCM_LNK_OFFER_SERVICE') > -1) {
                                    message = $translate.instant('CommonMessages.ThereAreLinkedOffers');
                                }

                                notification({
                                    type: 'warning',
                                    text: message
                                });
                            } else {
                                CMPFService.showApiError(response);
                            }
                        });

                        service.rowSelected = false;
                    }, function () {
                        service.rowSelected = false;
                    });
                }
            });
        };

        $scope.showSubscriptions = function (service) {
            $uibModal.open({
                templateUrl: 'subsystems/provisioning/operations/services/operations.services.modal.subscriptions.html',
                controller: 'ServiceSubscriptionsModalInstanceCtrl',
                size: 'lg',
                resolve: {
                    serviceParameter: function () {
                        return service;
                    }
                }
            });
        };

        $scope.showOffers = function (service) {
            $uibModal.open({
                templateUrl: 'subsystems/provisioning/operations/services/operations.services.modal.offers.html',
                controller: 'ServicesOffersModalInstanceCtrl',
                size: 'lg',
                resolve: {
                    serviceParameter: function () {
                        return service;
                    },
                    offersByServiceName: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                        return CMPFService.getOffersByServiceName(0, DEFAULT_REST_QUERY_LIMIT, service.name);
                    }
                }
            });
        };

    });

    ProvisioningOperationsModule.controller('ProvisioningOperationsNewServiceCtrl', function ($scope, $log, $controller, $filter, $uibModal, notification, $translate,
                                                                                              Restangular, CMPFService, STATUS_TYPES) {
        $log.debug('ProvisioningOperationsNewServiceCtrl');

        $controller('ProvisioningOperationsServicesCommonCtrl', {$scope: $scope});

        $scope.service = {
            name: '',
            state: STATUS_TYPES[0].name,
            serviceProfile: {
                description: '',
                category: null
            },
            subscriptionNotificationProfile: {
                RequiresNotification: false,
                url: ''
            }
        };

        $scope.save = function (service) {
            var serviceItem = {
                name: service.name,
                organizationId: service.organizationId,
                state: service.state,
                profiles: []
            };

            serviceItem.profiles.push({
                name: CMPFService.SERVICE_PROFILE_NAME,
                profileDefinitionName: CMPFService.SERVICE_PROFILE_NAME,
                attributes: [
                    {
                        "name": "startDate",
                        "value": $filter('date')($scope.dateHolder.startDate, 'yyyy-MM-dd') + 'T00:00:00'
                    },
                    {
                        "name": "endDate",
                        "value": $filter('date')($scope.dateHolder.endDate, 'yyyy-MM-dd') + 'T00:00:00'
                    },
                    {
                        "name": "description",
                        "value": service.serviceProfile.description
                    }
                ]
            });

            $log.debug('Trying to create service: ', serviceItem);

            CMPFService.createService([serviceItem]).then(function (response) {
                $log.debug('Save Success. Response: ', response);

                if (response && response.errorCode) {
                    CMPFService.showApiError(response);
                } else {
                    notification.flash({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    $scope.go('subsystems.provisioning.operations.services.list');
                }
            }, function (response) {
                $log.debug('Cannot save service. Error: ', response);

                CMPFService.showApiError(response);
            });
        };
    });

    ProvisioningOperationsModule.controller('ProvisioningOperationsUpdateServiceCtrl', function ($scope, $log, $controller, $filter, $uibModal, notification, $translate, Restangular,
                                                                                                 AuthorizationService, CMPFService, service) {
        $log.debug('ProvisioningOperationsUpdateServiceCtrl');

        $controller('ProvisioningOperationsServicesCommonCtrl', {$scope: $scope});

        $scope.service = Restangular.stripRestangular(service);
        $log.debug("$scope.service", $scope.service);
        $log.debug("service", service);
        $scope.service.serviceProfile = CMPFService.extractServiceProfile($scope.service);
        $scope.dateHolder.startDate = $scope.service.serviceProfile.startDate;
        $scope.dateHolder.endDate = $scope.service.serviceProfile.endDate;

        $scope.originalService = angular.copy($scope.service);
        $scope.originalDateHolder = angular.copy($scope.dateHolder);
        $scope.isNotChanged = function () {
            return angular.equals($scope.service, $scope.originalService) &&
                angular.equals($scope.dateHolder, $scope.originalDateHolder);
        };

        $scope.save = function (service) {
            var serviceItem = {
                id: $scope.originalService.id,
                name: $scope.originalService.name,
                // Changed fields
                organizationId: service.organizationId,
                state: service.state,
                profiles: $scope.originalService.profiles
            };

            var serviceProfileDef = CMPFService.getServiceProfile($scope.originalService);
            if (serviceProfileDef) {
                var startDateAttr = _.findWhere(serviceProfileDef.attributes, {name: "startDate"});
                if (startDateAttr) {
                    startDateAttr.value = $filter('date')($scope.dateHolder.startDate, 'yyyy-MM-dd') + 'T00:00:00';
                } else {
                    serviceProfileDef.attributes.push({
                        "name": "startDate",
                        "value": $filter('date')($scope.dateHolder.startDate, 'yyyy-MM-dd') + 'T00:00:00'
                    });
                }

                var endDateAttr = _.findWhere(serviceProfileDef.attributes, {name: "endDate"});
                if (endDateAttr) {
                    endDateAttr.value = $filter('date')($scope.dateHolder.endDate, 'yyyy-MM-dd') + 'T00:00:00';
                } else {
                    serviceProfileDef.attributes.push({
                        "name": "endDate",
                        "value": $filter('date')($scope.dateHolder.endDate, 'yyyy-MM-dd') + 'T00:00:00'
                    });
                }

                var descriptionAttr = _.findWhere(serviceProfileDef.attributes, {name: "description"});
                if (descriptionAttr) {
                    descriptionAttr.value = service.serviceProfile.description;
                } else {
                    serviceProfileDef.attributes.push({
                        "name": "description",
                        "value": service.serviceProfile.description
                    });
                }

            } else {
                var serviceProfile = {
                    name: CMPFService.SERVICE_PROFILE_NAME,
                    profileDefinitionName: CMPFService.SERVICE_PROFILE_NAME,
                    attributes: [
                        {
                            "name": "startDate",
                            "value": $filter('date')($scope.dateHolder.startDate, 'yyyy-MM-dd') + 'T00:00:00'
                        },
                        {
                            "name": "endDate",
                            "value": $filter('date')($scope.dateHolder.endDate, 'yyyy-MM-dd') + 'T00:00:00'
                        },
                        {
                            "name": "Description",
                            "value": service.serviceProfile.description
                        }
                    ]
                };

                serviceItem.profiles.push(serviceProfile);
            }

            $log.debug('Trying to update service: ', serviceItem);

            CMPFService.updateService(serviceItem).then(function (response) {
                $log.debug('Update Success. Response: ', response);

                if (response && response.errorCode) {
                    CMPFService.showApiError(response);
                } else {
                    notification.flash({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    $scope.go('subsystems.provisioning.operations.services.list');
                }
            }, function (response) {
                $log.debug('Cannot update service. Error: ', response);

                CMPFService.showApiError(response);
            });
        };

    });

    ProvisioningOperationsModule.controller('ServiceSubscriptionsModalInstanceCtrl', function ($scope, $uibModalInstance, $log, $timeout, $translate, NgTableParams, CMPFService, Restangular,
                                                                                               serviceParameter, MAXIMUM_RECORD_DOWNLOAD_SIZE) {
        $log.debug('ServiceSubscriptionsModalInstanceCtrl');

        $scope.service = serviceParameter;

        $scope.apiResponse = {};

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'ms',
                    headerKey: 'Subsystems.Provisioning.Services.SubscriberId'
                },
                {
                    fieldName: 'snst',
                    headerKey: 'Subsystems.Provisioning.Services.SubscriptionState'
                }
            ]
        };

        $scope.tableParams = new NgTableParams({
            page: 1,
            count: 10
        }, {
            $scope: $scope,
            total: 0,
            getData: function ($defer, params) {
                var offset = (params.page() - 1) * params.count();
                var limit = params.count();

                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;

                CMPFService.getServiceSubscriptionsSummary($scope.service.id, offset, limit, filterText).then(function (response) {
                    $scope.apiResponse = Restangular.stripRestangular(response);

                    var totalCount = $scope.apiResponse.metaData.totalCount;

                    $scope.isDataFetched = false;
                    $scope.selectedOffset = undefined;

                    // Prepare data range array to guiding data generate operation.
                    $scope.dataRangeArray = [];
                    for (var i = 0; i < totalCount; i += MAXIMUM_RECORD_DOWNLOAD_SIZE) {
                        var maxLimit = (i + MAXIMUM_RECORD_DOWNLOAD_SIZE)
                        if (maxLimit > totalCount) {
                            maxLimit = totalCount;
                        }

                        $scope.dataRangeArray.push({
                            label: i + ' - ' + maxLimit,
                            value: i
                        });
                    }

                    params.total(totalCount);
                    $defer.resolve($scope.apiResponse.serviceSubscriptions);
                }, function (response) {
                    $log.debug('Cannot read service subscriptions. Error: ', response);
                });
            }
        });

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.tableParams.settings().$scope.filterText = filterText;
            $scope.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.tableParams.page(1);
            $scope.tableParams.reload();
        }, 500);

        $scope.fetchServiceSubscriptionsData = function (offset) {
            var firstOffset = offset;
            var filterText = $scope.tableParams.settings().$scope.filterText;

            var offset = offset ? offset : 0;
            $scope.serviceSubscriptionsDataAccumulator = [];
            $scope.isDataFetchingInProgress = true;
            $scope.dataFetchingPercent = 0;

            var limit = 1000;

            var getData = function (offset, limit) {
                CMPFService.getServiceSubscriptionsSummary($scope.service.id, offset, limit, filterText, null, true).then(function (response) {
                    $scope.serviceSubscriptionsDataAccumulator = $scope.serviceSubscriptionsDataAccumulator.concat(response.serviceSubscriptions);

                    var totalRecordCount = response.metaData.totalCount < MAXIMUM_RECORD_DOWNLOAD_SIZE ? response.metaData.totalCount : MAXIMUM_RECORD_DOWNLOAD_SIZE;

                    $scope.dataFetchingPercent = Math.round(($scope.serviceSubscriptionsDataAccumulator.length / totalRecordCount) * 100);

                    if (((offset + limit) - firstOffset) < totalRecordCount && $scope.isDataFetchingInProgress) {
                        getData(offset + limit, limit);
                    } else {
                        $timeout(function () {
                            $scope.isDataFetchingInProgress = false;
                            $scope.isDataFetched = true;
                        }, 1000);
                    }
                });
            };

            getData(offset, limit);
        };

        $scope.close = function () {
            $uibModalInstance.close();
        };

        $uibModalInstance.result.then(function () {
            $scope.isDataFetchingInProgress = false;
        }, function () {
            $scope.isDataFetchingInProgress = false;
        });
    });

    ProvisioningOperationsModule.controller('ServicesOffersModalInstanceCtrl', function ($scope, $uibModalInstance, $log, $filter, NgTableParams, NgTableService, Restangular,
                                                                                         CMPFService, serviceParameter, offersByServiceName) {
        $log.debug('ServicesOffersModalInstanceCtrl');

        $scope.service = serviceParameter;

        $scope.offersByServiceName = Restangular.stripRestangular(offersByServiceName);
        $scope.offersByServiceName.offers = $filter('orderBy')($scope.offersByServiceName.offers, ['id']);

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'id',
                    headerKey: 'Subsystems.Provisioning.Offers.Id'
                },
                {
                    fieldName: 'name',
                    headerKey: 'Subsystems.Provisioning.Offers.Name'
                },
                {
                    fieldName: 'state',
                    headerKey: 'Subsystems.Provisioning.Offers.State'
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
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.offersByServiceName.offers);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.offersByServiceName.offers;
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
            $uibModalInstance.close();
        };
    });

})();
