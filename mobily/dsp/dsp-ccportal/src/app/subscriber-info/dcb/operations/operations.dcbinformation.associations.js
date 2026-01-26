(function () {

    'use strict';

    angular.module('ccportal.subscriber-info.dcb.operations.dcbinformation.associations', []);

    var DCBOperationsDCBInformationAssociationsModule = angular.module('ccportal.subscriber-info.dcb.operations.dcbinformation.associations');

    DCBOperationsDCBInformationAssociationsModule.config(function ($stateProvider) {

        $stateProvider.state('subscriber-info.dcb.operations.dcbinformation.associations', {
            url: "/associations",
            templateUrl: 'subscriber-info/dcb/operations/operations.dcbinformation.associations.html',
            controller: 'DCBOperationsDCBInformationAssociationsCtrl',
            resolve: {
                services: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllServices();
                },
                dcbStatistics: function ($q, UtilService, SSMSubscribersService, DCBService) {
                    var deferred = $q.defer();

                    var subscriberResponse = UtilService.getFromSessionStore(UtilService.SUBSCRIBER_PROFILE_KEY);

                    DCBService.getSubscriberStatistics(subscriberResponse.msisdn, subscriberResponse.subscriberAccountNumber).then(function (response) {
                        deferred.resolve(response);
                    }, function (response) {
                        notification({
                            type: 'warning',
                            text: $translate.instant('SubscriberInfo.DCB.DcbStatistics.Messages.NotFound')
                        });

                        deferred.reject(response);
                    });

                    return deferred.promise;
                }
            }
        });

    });

    DCBOperationsDCBInformationAssociationsModule.controller('DCBOperationsDCBInformationAssociationsCtrl', function ($scope, $log, $state, $controller, $uibModal, $filter, $translate, notification, UtilService, NgTableParams, NgTableService,
                                                                                                                      CMPFService, DCBService, dcbSettingsOrganization, dcbStatistics, services) {
        $log.debug('DCBOperationsDCBInformationAssociationsCtrl');

        $controller('DCBOperationsDCBInformationCommonCtrl', {
            $scope: $scope,
            dcbSettingsOrganization: dcbSettingsOrganization,
            services: services,
            dcbStatistics: dcbStatistics
        });

        var associationList = [];
        _.each(dcbStatistics.associateMap, function (value, key) {
            var serviceId = Number(key);
            var foundService = $scope.serviceMap[serviceId];

            associationList.push({
                serviceId: serviceId,
                serviceName: foundService ? foundService.name : 'N/A',
                state: foundService ? foundService.state : 'N/A',
                timestamp: value
            });
        })

        $scope.associationList = {
            list: associationList,
            tableParams: {}
        };

        $scope.associationList.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "timestamp": 'asc'
            }
        }, {
            $scope: $scope,
            total: 0,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.associationList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.associationList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.associationList.tableParams.settings().$scope.filterText = filterText;
            $scope.associationList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.associationList.tableParams.page(1);
            $scope.associationList.tableParams.reload();
        }, 500);

        $scope.createAssociation = function () {
            var modalInstance = $uibModal.open({
                templateUrl: 'subscriber-info/dcb/operations/operations.dcbinformation.associations.details.modal.html',
                controller: function ($scope, $log, $filter, $uibModalInstance, Restangular, UtilService, CMPFService, serviceList, associationList) {
                    $scope.serviceList = serviceList;
                    $scope.serviceList = _.filter($scope.serviceList, function (service) {
                        // ServiceProfile
                        var serviceProfiles = CMPFService.getProfileAttributes(service.profiles, CMPFService.SERVICE_PROFILE);
                        if (serviceProfiles.length > 0) {
                            return serviceProfiles[0].Type === 'DCB_SERVICE';
                        }

                        return false;
                    });

                    $scope.associationList = associationList;

                    $scope.subscriber = UtilService.getFromSessionStore(UtilService.SUBSCRIBER_PROFILE_KEY);

                    $scope.association = {
                        serviceId: null,
                        type: 'MSISDN'
                    };

                    $scope.save = function (association) {
                        $uibModalInstance.close(association);
                    };

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                resolve: {
                    serviceList: function () {
                        return $scope.serviceList;
                    },
                    associationList: function () {
                        return $scope.associationList.list;
                    }
                }
            });

            modalInstance.result.then(function (association) {
                var san = UtilService.getSubscriberSan();
                var msisdn = UtilService.getSubscriberMsisdn();

                var accountInfoPayload = {
                    "accountInfo": {
                        "accountId": association.type === 'SAN' ? san : msisdn,
                        "accountIdType": association.type
                    }
                };

                DCBService.associate(association.serviceId, accountInfoPayload).then(function (response) {
                    $log.debug('Updated subscriber dcb association settings: ', response);

                    if (response && response.result && response.result.status === 'ERROR') {
                        notification({
                            type: 'warning',
                            text: response.result.message
                        });
                    } else {
                        notification.flash({
                            type: 'success',
                            text: $translate.instant('CommonLabels.OperationSuccessful')
                        });

                        $state.reload();
                    }
                }, function (response) {
                    $log.debug('Cannot update subscriber dcb association settings. Error: ', response);

                    if (response && response.data && response.data.status === 'ERROR') {
                        notification({
                            type: 'warning',
                            text: response.data.message
                        });
                    } else {
                        notification({
                            type: 'warning',
                            text: $translate.instant('SubscriberInfo.DCB.SubscriberSettingsUpdatingError')
                        });
                    }
                });
            }, function () {
            });
        };

        $scope.dissociate = function (association) {
            association.rowSelected = true;

            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                size: 'sm',
                controller: function ($scope, $uibModalInstance, $controller, $sce, $translate) {
                    var message = $translate.instant('SubscriberInfo.DCB.Associations.ConfirmationDissociationMessage');
                    $scope.confirmationMessage = $sce.trustAsHtml(message);

                    $controller('ConfirmationModalInstanceCtrl', {
                        $scope: $scope,
                        $uibModalInstance: $uibModalInstance
                    });
                }
            });

            modalInstance.result.then(function () {
                association.rowSelected = false;

                $log.debug('Dissociate the service association:', association);

                var msisdn = UtilService.getSubscriberMsisdn();

                var accountInfoPayload = {
                    "accountInfo": {
                        "accountId": msisdn,
                        "accountIdType": 'MSISDN'
                    }
                };

                DCBService.dissociate(association.serviceId, accountInfoPayload).then(function (response) {
                    $log.debug('Updated subscriber dcb association settings: ', response);

                    if (response && response.result && response.result.status === 'ERROR') {
                        notification({
                            type: 'warning',
                            text: response.result.message
                        });
                    } else {
                        notification.flash({
                            type: 'success',
                            text: $translate.instant('CommonLabels.OperationSuccessful')
                        });

                        $state.reload();
                    }
                }, function (response) {
                    $log.debug('Cannot update subscriber dcb association settings. Error: ', response);

                    if (response && response.data && response.data.status === 'ERROR') {
                        notification({
                            type: 'warning',
                            text: response.data.message
                        });
                    } else {
                        notification({
                            type: 'warning',
                            text: $translate.instant('SubscriberInfo.DCB.SubscriberSettingsUpdatingError')
                        });
                    }
                });
            }, function () {
                association.rowSelected = false;
            });
        };
    });


})();
