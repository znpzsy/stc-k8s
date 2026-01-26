(function () {

    'use strict';

    angular.module('adminportal.subsystems.screeningmanager.operations.screeninglists.service', []);

    var ScreeningManagementOperationsScreeningListsServiceModule = angular.module('adminportal.subsystems.screeningmanager.operations.screeninglists.service');

    ScreeningManagementOperationsScreeningListsServiceModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.screeningmanager.operations.screeninglists.service', {
            abstract: true,
            url: "/service",
            templateUrl: 'subsystems/screeningmanager/operations/screeninglists/operations.screeninglists.service.html',
            data: {
                permissions: [
                    'SCRM__OPERATIONS_PERSERVICE_READ'
                ]
            }
        }).state('subsystems.screeningmanager.operations.screeninglists.service.msisdn', {
            url: "/msisdn",
            data: {
                pageHeaderKey: 'Subsystems.ScreeningManager.Operations.ScreeningLists.Msisdn'
            },
            resolve: {
                organizations: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizations(false, true, [CMPFService.OPERATOR_PROFILE]);
                },
                services: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllServices();
                }
            },
            views: {
                'searchForm': {
                    templateUrl: 'subsystems/screeningmanager/operations/screeninglists/operations.screeninglists.service.msisdn.search.html',
                    controller: 'ScreeningManagementOperationsScreeningListsServiceSearchCtrl'
                },
                'screeningInformation': {
                    templateUrl: 'subsystems/screeningmanager/operations/screeninglists/operations.screeninglists.service.detail.html',
                    controller: 'ScreeningManagementOperationsScreeningListsServiceDetailCtrl'
                }
            }
        });

    });

    ScreeningManagementOperationsScreeningListsServiceModule.controller('ScreeningManagementOperationsScreeningListsServiceSearchCtrl', function ($scope, $log, $filter, $translate, notification, Restangular, ScreeningManagerV3Service,
                                                                                                                                                  organizations, services) {
        $log.debug('ScreeningManagementOperationsScreeningListsServiceSearchCtrl');

        $scope.filter = {};

        var organizationList = Restangular.stripRestangular(organizations).organizations;
        $scope.organizationList = $filter('orderBy')(organizationList, ['name']);

        var serviceList = Restangular.stripRestangular(services).services;
        $scope.serviceList = $filter('orderBy')(serviceList, ['name']);

        var _scope = $scope.$parent;

        _scope.showInformation = false;

        _scope.initializeScreeningInformation = function (cleanFields) {
            _scope.showInformation = false;
            _scope.blackListScreening = null;
            _scope.whiteListScreening = null;

            if (cleanFields) {
                delete _scope.filter.msisdn;
            }
        };

        _scope.search = function (filter) {
            var serviceName = filter.serviceName;

            // Assign the filter to a variable which is on the parent level.
            _scope.filter = filter;

            var filterEntry, listQueryMethod;
            filterEntry = filter.msisdn;
            listQueryMethod = ScreeningManagerV3Service.getServiceListExistenceByMsisdn;

            listQueryMethod(serviceName, filterEntry, 'blacklist').then(function (blackListScreeningResponse) {
                $log.debug('Black List Screening information found. Response: ', blackListScreeningResponse);

                var blackListScreening = Restangular.stripRestangular(blackListScreeningResponse);
                if (!blackListScreeningResponse || !blackListScreeningResponse.containsResponse) {
                    notification({
                        type: 'warning',
                        text: $translate.instant('ScreeningLists.Messages.ScreeningInformationNotFound')
                    });
                } else {
                    listQueryMethod(serviceName, filterEntry, 'whitelist').then(function (whiteListScreeningResponse) {
                        $log.debug('White List Screening information found. Response: ', whiteListScreeningResponse);

                        var whiteListScreening = Restangular.stripRestangular(whiteListScreeningResponse);
                        if (!whiteListScreeningResponse || !whiteListScreeningResponse.containsResponse) {
                            notification({
                                type: 'warning',
                                text: $translate.instant('ScreeningLists.Messages.ScreeningInformationNotFound')
                            });
                        } else {
                            _scope.showInformation = true;

                            // Black List
                            _scope.blackListScreening = {
                                contains: blackListScreening.containsResponse.contains
                            };

                            _scope.blackListScreeningOriginal = angular.copy(_scope.blackListScreening);

                            // White List
                            _scope.whiteListScreening = {
                                contains: whiteListScreening.containsResponse.contains
                            };

                            _scope.whiteListScreeningOriginal = angular.copy(_scope.whiteListScreening);
                        }
                    }, function (whiteListScreeningErrorResponse) {
                        $log.debug('White List Screening information cannot found. Error: ', whiteListScreeningErrorResponse);

                        notification({
                            type: 'warning',
                            text: $translate.instant('ScreeningLists.Messages.ScreeningInformationNotFound')
                        });
                    });
                }
            }, function (blackListScreeningErrorResponse) {
                $log.debug('Black List Screening information cannot found. Error: ', blackListScreeningErrorResponse);

                notification({
                    type: 'warning',
                    text: $translate.instant('ScreeningLists.Messages.ScreeningInformationNotFound')
                });
            });
        };

    });

    ScreeningManagementOperationsScreeningListsServiceModule.controller('ScreeningManagementOperationsScreeningListsServiceDetailCtrl', function ($scope, $log, $filter, $translate, notification, Restangular,
                                                                                                                                                  DateTimeConstants, ScreeningManagerV3Service) {
        $log.debug('ScreeningManagementOperationsScreeningListsServiceDetailCtrl');

        $scope.isNotChanged = function () {
            return angular.equals($scope.blackListScreening, $scope.blackListScreeningOriginal) &&
                angular.equals($scope.whiteListScreening, $scope.whiteListScreeningOriginal);
        };

        $scope.save = function (filter, blackListScreening, whiteListScreening) {
            var filterEntry, addMethod, removeMethod;
            filterEntry = filter.msisdn;
            addMethod = ScreeningManagerV3Service.addSubscriberToServiceListByMsisdn;
            removeMethod = ScreeningManagerV3Service.removeSubscriberFromServiceListByMsisdn;

            // Black list
            if (!angular.equals($scope.blackListScreening, $scope.blackListScreeningOriginal)) {
                if (blackListScreening.contains) {
                    var screenableEntry = {
                        "screenableEntryId": filterEntry,
                        "screenableCorrelator": $filter('date')(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss.sss' + DateTimeConstants.OFFSET)
                    };

                    addMethod(filter.serviceName, screenableEntry, 'blacklist').then(function (response) {
                        if (!_.isUndefined(response) && !_.isUndefined(response.errorCode)) {
                            var text = '';
                            if (response.errorCode === ScreeningManagerV3Service.errorCodes.QUOTA_ERROR) {
                                // If maximum list member quota is exceeded show a quota information notification.
                                text = $translate.instant('ScreeningLists.Messages.QuotaExceededWithoutCount');
                            } else if (response.errorCode === ScreeningManagerV3Service.errorCodes.WRONG_REQUEST_ERROR) {
                                // If subscribe number is invalid
                                text = $translate.instant('ScreeningLists.Messages.ValueIsInvalid', {value: filterEntry});
                            } else {
                                // If there are some other type errors
                                text = response.errorCode + ' - ' + response.message;
                            }

                            notification({
                                type: 'warning',
                                text: text
                            });
                        } else {
                            notification({
                                type: 'success',
                                text: $translate.instant('ScreeningLists.Messages.BlackListed', {value: filterEntry})
                            });

                            $scope.blackListScreening = blackListScreening;
                            $scope.blackListScreeningOriginal = angular.copy($scope.blackListScreening);

                            $log.debug('A new item [', filterEntry, ', ', screenableEntry.screenableCorrelator, '] added to blacklist list.');
                        }
                    }, function (response) {
                        $log.debug('Error: ', response);
                    });
                } else {
                    removeMethod(filter.serviceName, filterEntry, 'blacklist').then(function (response) {
                        if (!_.isUndefined(response) && !_.isUndefined(response.errorCode)) {
                            // If there are some other type errors
                            notification({
                                type: 'warning',
                                text: response.errorCode + ' - ' + response.message
                            });
                        } else {
                            notification({
                                type: 'success',
                                text: $translate.instant('ScreeningLists.Messages.NotBlackListed', {value: filterEntry})
                            });

                            $scope.blackListScreening = blackListScreening;
                            $scope.blackListScreeningOriginal = angular.copy($scope.blackListScreening);
                        }
                    }, function (response) {
                        $log.debug('Error: ', response);
                    });
                }
            }

            // White list
            if (!angular.equals($scope.whiteListScreening, $scope.whiteListScreeningOriginal)) {
                if (whiteListScreening.contains) {
                    var screenableEntry = {
                        "screenableEntryId": filterEntry,
                        "screenableCorrelator": $filter('date')(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss.sss' + DateTimeConstants.OFFSET)
                    };

                    addMethod(filter.serviceName, screenableEntry, 'whitelist').then(function (response) {
                        if (!_.isUndefined(response) && !_.isUndefined(response.errorCode)) {
                            var text = '';
                            if (response.errorCode === ScreeningManagerV3Service.errorCodes.QUOTA_ERROR) {
                                // If maximum list member quota is exceeded show a quota information notification.
                                text = $translate.instant('ScreeningLists.Messages.QuotaExceededWithoutCount');
                            } else if (response.errorCode === ScreeningManagerV3Service.errorCodes.WRONG_REQUEST_ERROR) {
                                // If subscribe number is invalid
                                text = $translate.instant('ScreeningLists.Messages.ValueIsInvalid', {value: filterEntry});
                            } else {
                                // If there are some other type errors
                                text = response.errorCode + ' - ' + response.message;
                            }

                            notification({
                                type: 'warning',
                                text: text
                            });
                        } else {
                            notification({
                                type: 'success',
                                text: $translate.instant('ScreeningLists.Messages.WhiteListed', {value: filterEntry})
                            });

                            $scope.whiteListScreening = whiteListScreening;
                            $scope.whiteListScreeningOriginal = angular.copy($scope.whiteListScreening);

                            $log.debug('A new item [', filterEntry, ', ', screenableEntry.screenableCorrelator, '] added to whitelist list.');
                        }
                    }, function (response) {
                        $log.debug('Error: ', response);
                    });
                } else {
                    removeMethod(filter.serviceName, filterEntry, 'whitelist').then(function (response) {
                        if (!_.isUndefined(response) && !_.isUndefined(response.errorCode)) {
                            // If there are some other type errors
                            notification({
                                type: 'warning',
                                text: response.errorCode + ' - ' + response.message
                            });
                        } else {
                            notification({
                                type: 'success',
                                text: $translate.instant('ScreeningLists.Messages.NotWhiteListed', {value: filterEntry})
                            });

                            $scope.whiteListScreening = whiteListScreening;
                            $scope.whiteListScreeningOriginal = angular.copy($scope.whiteListScreening);
                        }
                    }, function (response) {
                        $log.debug('Error: ', response);
                    });
                }
            }
        };

        $scope.cancel = function (filter) {
            $scope.search(filter);
        };
    });

})();