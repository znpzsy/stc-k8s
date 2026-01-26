(function () {

    'use strict';

    angular.module('adminportal.subsystems.businessmanagement.operations.channels', []);

    var BusinessManagementOperationsChannelsModule = angular.module('adminportal.subsystems.businessmanagement.operations.channels');

    BusinessManagementOperationsChannelsModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.businessmanagement.operations.channels', {
            abstract: true,
            url: "/channels",
            template: '<div ui-view></div>',
            data: {
                exportFileName: 'Channels',
                permissions: [
                    'BIZ__OPERATIONS_CHANNEL_READ'
                ]
            },
            resolve: {
                channelsOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_CHANNELS_ORGANIZATION_NAME);
                }
            }
        }).state('subsystems.businessmanagement.operations.channels.list', {
            url: "",
            templateUrl: "subsystems/businessmanagement/operations/operations.channels.html",
            controller: 'BusinessManagementOperationsChannelsCtrl'
        }).state('subsystems.businessmanagement.operations.channels.new', {
            url: "/new",
            templateUrl: "subsystems/businessmanagement/operations/operations.channels.details.html",
            controller: 'BusinessManagementOperationsChannelsNewCtrl'
        }).state('subsystems.businessmanagement.operations.channels.update', {
            url: "/update/:id",
            templateUrl: "subsystems/businessmanagement/operations/operations.channels.details.html",
            controller: 'BusinessManagementOperationsChannelsUpdateCtrl'
        });

    });

    BusinessManagementOperationsChannelsModule.controller('BusinessManagementOperationsChannelsCommonCtrl', function ($scope, $log, $q, $state, $filter, $uibModal, notification, $translate, CMPFService,
                                                                                                                      BUSINESS_MANAGEMENT_STATUS_TYPES) {
        $log.debug('BusinessManagementOperationsChannelsCommonCtrl');

        $scope.BUSINESS_MANAGEMENT_STATUS_TYPES = BUSINESS_MANAGEMENT_STATUS_TYPES;

        $scope.updateChannel = function (channelsOrganizationOriginal, channel, isDelete) {
            var deferred = $q.defer();

            $log.debug('Trying update default organization: ', channelsOrganizationOriginal, channel);

            // Update the last update time for create first time or for update everytime.
            channel.LastUpdateTime = $filter('date')(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss');

            var organizationItem = {
                id: channelsOrganizationOriginal.id,
                name: channelsOrganizationOriginal.name,
                type: channelsOrganizationOriginal.type,
                orgType: channelsOrganizationOriginal.orgType,
                parentId: channelsOrganizationOriginal.parentId,
                parentName: channelsOrganizationOriginal.parentName,
                state: channelsOrganizationOriginal.state,
                description: channelsOrganizationOriginal.description,
                // Profiles
                profiles: angular.copy(channelsOrganizationOriginal.profiles)
            };

            var originalChannelProfiles = CMPFService.findProfilesByName(organizationItem.profiles, CMPFService.ORGANIZATION_CHANNEL_PROFILE);

            var updatedChannelProfile = JSON.parse(angular.toJson(channel));
            var originalChannelProfile = _.findWhere(originalChannelProfiles, {id: updatedChannelProfile.profileId});

            if (isDelete) {
                organizationItem.profiles = _.without(organizationItem.profiles, originalChannelProfile);
            } else {
                var channelProfileAttrArray = CMPFService.prepareProfile(updatedChannelProfile, originalChannelProfile);
                // ---
                if (originalChannelProfile) {
                    originalChannelProfile.attributes = channelProfileAttrArray;
                } else {
                    var channelProfile = {
                        name: CMPFService.ORGANIZATION_CHANNEL_PROFILE,
                        profileDefinitionName: CMPFService.ORGANIZATION_CHANNEL_PROFILE,
                        attributes: channelProfileAttrArray
                    };

                    organizationItem.profiles.push(channelProfile);
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

        $scope.cancel = function () {
            $state.go('subsystems.businessmanagement.operations.channels.list');
        };
    });

    BusinessManagementOperationsChannelsModule.controller('BusinessManagementOperationsChannelsCtrl', function ($scope, $log, $controller, $state, $uibModal, $filter, $translate, notification, NgTableParams, NgTableService,
                                                                                                                DateTimeConstants, channelsOrganization, CMPFService, DEFAULT_REST_QUERY_LIMIT) {
        $log.debug('BusinessManagementOperationsChannelsCtrl');

        $controller('BusinessManagementOperationsChannelsCommonCtrl', {$scope: $scope});

        $scope.channels = [];
        if (channelsOrganization.organizations && channelsOrganization.organizations.length > 0) {
            $scope.channelsOrganization = channelsOrganization.organizations[0];

            $scope.channels = CMPFService.getChannels($scope.channelsOrganization);
            $scope.channels = $filter('orderBy')($scope.channels, 'profileId');
        }

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'profileId',
                    headerKey: 'Subsystems.BusinessManagement.Operations.Channels.Id'
                },
                {
                    fieldName: 'Name',
                    headerKey: 'Subsystems.BusinessManagement.Operations.Channels.Name'
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

        // Channel list
        $scope.channelList = {
            list: $scope.channels,
            tableParams: {}
        };

        $scope.channelList.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "profileId": 'asc'
            }
        }, {
            total: $scope.channelList.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.channelList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.channelList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - Channel list

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.channelList.tableParams.settings().$scope.filterText = filterText;
            $scope.channelList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.channelList.tableParams.page(1);
            $scope.channelList.tableParams.reload();
        }, 750);

        var findServiceTypesUsingTheChannel = function (allServiceTypes, channel) {
            var serviceTypes = [];
            _.each(allServiceTypes, function (serviceType) {
                if (Number(serviceType.ChannelID) === Number(channel.profileId)) {
                    serviceTypes.push(serviceType);
                }
            });

            return serviceTypes;
        };

        // Service Types
        $scope.viewServiceTypes = function (channel) {
            $uibModal.open({
                templateUrl: 'subsystems/businessmanagement/operations/operations.servicetypes.view.modal.html',
                controller: function ($scope, $uibModalInstance, serviceTypesOrganization) {
                    $scope.pageHeaderKey = 'Subsystems.BusinessManagement.Operations.Channels.ServiceTypesModalTitle';
                    $scope.itemName = channel.Name;

                    $scope.serviceTypesOrganization = serviceTypesOrganization.organizations[0];
                    var allServiceTypes = CMPFService.getServiceTypes($scope.serviceTypesOrganization);
                    allServiceTypes = $filter('orderBy')(allServiceTypes, 'profileId');

                    $scope.serviceTypes = findServiceTypesUsingTheChannel(allServiceTypes, channel);

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
                            var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.serviceTypes);
                            var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.serviceTypes;
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
                    serviceTypesOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                        return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_SERVICE_TYPES_ORGANIZATION_NAME);
                    }
                }
            });
        };

        var findBusinessTypesUsingTheChannel = function (allBusinessTypes, channel) {
            var businessTypes = [];
            _.each(allBusinessTypes, function (businessType) {
                if (Number(businessType.ChannelID) === Number(channel.profileId)) {
                    businessTypes.push(businessType);
                }
            });

            return businessTypes;
        };

        // Business Types
        $scope.viewBusinessTypes = function (channel) {
            $uibModal.open({
                templateUrl: 'subsystems/businessmanagement/operations/operations.businesstypes.view.modal.html',
                controller: function ($scope, $uibModalInstance, businessTypesOrganization) {
                    $scope.pageHeaderKey = 'Subsystems.BusinessManagement.Operations.Channels.BusinessTypesModalTitle';
                    $scope.itemName = channel.Name;

                    $scope.businessTypesOrganization = businessTypesOrganization.organizations[0];
                    var allBusinessTypes = CMPFService.getBusinessTypes($scope.businessTypesOrganization);
                    allBusinessTypes = $filter('orderBy')(allBusinessTypes, 'profileId');

                    $scope.businessTypes = findBusinessTypesUsingTheChannel(allBusinessTypes, channel);

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
                            var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.businessTypes);
                            var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.businessTypes;
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
                    businessTypesOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                        return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_BUSINESS_TYPES_ORGANIZATION_NAME);
                    }
                }
            });
        };

        $scope.remove = function (channel) {

            CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_SERVICE_TYPES_ORGANIZATION_NAME).then(function (serviceTypesResponse) {
                var allServiceTypes = CMPFService.getServiceTypes(serviceTypesResponse.organizations[0]);
                var serviceTypes = findServiceTypesUsingTheChannel(allServiceTypes, channel);

                CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_BUSINESS_TYPES_ORGANIZATION_NAME).then(function (businessTypesResponse) {
                    var allBusinessTypes = CMPFService.getBusinessTypes(businessTypesResponse.organizations[0]);
                    var businessTypes = findBusinessTypesUsingTheChannel(allBusinessTypes, channel);

                    if ((serviceTypes && serviceTypes.length > 0) || (businessTypes && businessTypes.length > 0)) {
                        if (serviceTypes.length > 0) {
                            notification({
                                type: 'warning',
                                text: $translate.instant('CommonMessages.ThereAreLinkedServiceTypes')
                            });
                        }

                        if (businessTypes.length > 0) {
                            notification({
                                type: 'warning',
                                text: $translate.instant('CommonMessages.ThereAreLinkedBusinessTypes')
                            });
                        }
                    } else {
                        channel.rowSelected = true;

                        var modalInstance = $uibModal.open({
                            templateUrl: 'partials/modal/modal.confirmation.html',
                            controller: 'ConfirmationModalInstanceCtrl',
                            size: 'sm'
                        });

                        modalInstance.result.then(function () {
                            channel.rowSelected = false;

                            $scope.updateChannel($scope.channelsOrganization, channel, true).then(function (response) {
                                var deletedListItem = _.findWhere($scope.channelList.list, {profileId: channel.profileId});
                                $scope.channelList.list = _.without($scope.channelList.list, deletedListItem);

                                $scope.channelList.tableParams.reload();

                                notification({
                                    type: 'success',
                                    text: $translate.instant('CommonLabels.OperationSuccessful')
                                });
                            }, function (response) {
                                CMPFService.showApiError(response);
                            });
                        }, function () {
                            channel.rowSelected = false;
                        });
                    }
                });
            });
        };
    });

    BusinessManagementOperationsChannelsModule.controller('BusinessManagementOperationsChannelsNewCtrl', function ($scope, $log, $controller, $translate, notification, CMPFService,
                                                                                                                   channelsOrganization) {
        $log.debug('BusinessManagementOperationsChannelsNewCtrl');

        $controller('BusinessManagementOperationsChannelsCommonCtrl', {$scope: $scope});

        if (channelsOrganization.organizations && channelsOrganization.organizations.length > 0) {
            $scope.channelsOrganization = channelsOrganization.organizations[0];
        }

        $scope.channel = {
            Name: '',
            Description: '',
            Status: null,
            LastUpdateTime: null
        };

        $scope.save = function (channel) {
            $scope.updateChannel($scope.channelsOrganization, channel).then(function (response) {
                notification.flash({
                    type: 'success',
                    text: $translate.instant('CommonLabels.OperationSuccessful')
                });

                $scope.go('subsystems.businessmanagement.operations.channels.list');
            }, function (response) {
                CMPFService.showApiError(response);
            });
        };
    });

    BusinessManagementOperationsChannelsModule.controller('BusinessManagementOperationsChannelsUpdateCtrl', function ($scope, $log, $controller, $stateParams, $translate, notification, CMPFService,
                                                                                                                      channelsOrganization) {
        $log.debug('BusinessManagementOperationsChannelsUpdateCtrl');

        $controller('BusinessManagementOperationsChannelsCommonCtrl', {$scope: $scope});

        var id = $stateParams.id;

        if (channelsOrganization.organizations && channelsOrganization.organizations.length > 0) {
            $scope.channelsOrganization = channelsOrganization.organizations[0];

            // ChannelProfile
            var channelProfiles = CMPFService.getChannels($scope.channelsOrganization);
            if (channelProfiles.length > 0) {
                var foundChannel = _.findWhere(channelProfiles, {"profileId": Number(id)});
                $scope.channel = angular.copy(foundChannel);
            }
        }

        $scope.originalChannel = angular.copy($scope.channel);
        $scope.isNotChanged = function () {
            return angular.equals($scope.originalChannel, $scope.channel);
        };

        $scope.save = function (channel) {
            $scope.updateChannel($scope.channelsOrganization, channel).then(function (response) {
                notification.flash({
                    type: 'success',
                    text: $translate.instant('CommonLabels.OperationSuccessful')
                });

                $scope.go('subsystems.businessmanagement.operations.channels.list');
            }, function (response) {
                CMPFService.showApiError(response);
            });
        };
    });

})();
