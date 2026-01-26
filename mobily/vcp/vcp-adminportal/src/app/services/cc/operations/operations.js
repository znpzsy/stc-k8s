/**
 * Created by tayfuno on 7/24/14.
 */
(function () {

    'use strict';

    angular.module('adminportal.services.cc.operations', []);

    var CCOperationsModule = angular.module('adminportal.services.cc.operations');

    CCOperationsModule.config(function ($stateProvider) {

        $stateProvider.state('services.cc.operations', {
            abstract: true,
            url: "/operations",
            templateUrl: "services/cc/operations/operations.html"
        }).state('services.cc.operations.cosprofiles', {
            abstract: true,
            url: "/class-of-service-profiles",
            template: "<div ui-view></div>"
        }).state('services.cc.operations.cosprofiles.collectcall', {
            url: "/collect-call",
            templateUrl: "services/cc/operations/operations.cosprofiles.collectcall.html",
            controller: 'CCCollectCallOperationsCtrl',
            resolve: {
                ccConfigAll: function (P4MService) {
                    return P4MService.getCcConfigAll();
                }
            }
        });

        $stateProvider.state('services.cc.operations.cosprofiles.collectcalledit', {
            url: "/collect-call/:cosName",
            templateUrl: "services/cc/operations/operations.cosprofiles.collectcall.details.html",
            controller: 'CCCollectCallEditOperationsCtrl',
            resolve: {
                ccConfig: function ($stateParams, P4MService) {
                    var cosName = $stateParams.cosName;

                    return P4MService.getCcConfig(cosName);
                }
            }
        }).state('services.cc.operations.screenings', {
            url: "/screenings",
            templateUrl: "partials/screenings/operations.screenings.html",
            controller: 'CCCollectCallScreeningsOperationsCtrl'
        });
    });

    CCOperationsModule.controller('CCCollectCallOperationsCtrl', function ($scope, $log, $filter, NgTableParams, NgTableService, Restangular, notification, ccConfigAll) {
        $log.debug("CCCollectCallOperationsCtrl");

        $scope.ccConfigAll = Restangular.stripRestangular(ccConfigAll);
        $log.debug('CC Cos Profiles response: ', $scope.ccConfigAll);

        $scope.cosProfilesParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "cosName": 'asc' // initial sorting
            }
        }, {
            total: $scope.ccConfigAll.length,
            $scope: $scope,
            getData: function ($defer, params) {
                var orderedData = params.sorting() ? $filter('orderBy')($scope.ccConfigAll, params.orderBy()) : $scope.ccConfigAll;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });

    });

    CCOperationsModule.controller('CCCollectCallEditOperationsCtrl', function ($scope, $log, $state, $stateParams, $translate, NgTableParams, notification,
                                                                               Restangular, P4MService, ccConfig, CURRENCY) {
        $log.debug("CCCollectCallEditOperationsCtrl");

        $scope.CURRENCY = CURRENCY;
        $scope.cosProfile = Restangular.stripRestangular(ccConfig);

        $scope.originalCOSProfile = angular.copy($scope.cosProfile);
        $scope.isConfigurationNotChanged = function () {
            return angular.equals($scope.originalCOSProfile, $scope.cosProfile);
        };

        $scope.save = function () {
            P4MService.updateCcConfig($scope.cosProfile.cosName, $scope.cosProfile).then(function (response) {
                $log.debug('CC Cos Profile update response: ', response);
                notification({
                    type: 'success',
                    text: $translate.instant('CommonLabels.OperationSuccessful')
                });
                $state.go('services.cc.operations.cosprofiles.collectcall');
            }, function (response) {
                $log.debug('Cannot update Collect Call Cos Profile: ', response);
            });
        };

    });

    CCOperationsModule.controller('CCCollectCallScreeningsOperationsCtrl', function ($scope, $log, $uibModal, notification, $translate, Restangular, NgTableParams,
                                                                                     ScreeningManagerService) {
        $log.debug("CCCollectCallScreeningsOperationsCtrl");

        $scope.tableParams = new NgTableParams({
            page: 1,
            count: 10
        }, {
            total: 0,
            $scope: $scope,
            getData: function ($defer, params) {
                var msisdn = params.settings().$scope.msisdn;
                if (msisdn) {
                    ScreeningManagerService.getScreeningLists(msisdn).then(function (response) {
                        $log.debug('Success. Response: ', response);
                        var apiResponse = Restangular.stripRestangular(response);
                        if (apiResponse.screeningSubscriber) {
                            $scope.subscriberNumber = msisdn;
                            $scope.msisdn = null;

                            // clean irrelevant scopes. order global and coc scopes
                            var results = [];
                            var cocScope = _.findWhere(apiResponse.screeningSubscriber.screeningScopes, {screeningScopeId: ScreeningManagerService.scopes.COC_SCOPE_KEY});
                            if (cocScope) {
                                results.push(cocScope);
                            }

                            params.total(results.length);
                            $defer.resolve(results);
                        } else if (apiResponse.errorCode === ScreeningManagerService.errorCodes.SUBSCRIBER_NOT_FOUND) {
                            $scope.subscriberNumber = msisdn;
                            $scope.msisdn = null;

                            params.total(0);
                            $defer.resolve([]);
                        } else {
                            $scope.subscriberNumber = null;
                            notification({
                                type: 'warning',
                                text: $translate.instant('CommonMessages.ApiError', {
                                    errorCode: apiResponse.errorCode,
                                    errorText: apiResponse.message + ' [' + msisdn + ']'
                                })
                            });
                        }
                    }, function (response) {
                        $log.debug('Cannot read screenings. Error: ', response);
                    });
                }
            }
        });

        $scope.search = _.debounce(function (msisdn) {
            $scope.tableParams.settings().$scope.msisdn = msisdn;
            $scope.tableParams.page(1);
            $scope.tableParams.reload();
        }, 750, {immediate: true});

        $scope.showConstraints = function (scope) {
            scope.rowSelected = true;

            var modalInstance = $uibModal.open({
                templateUrl: 'partials/screenings/screenings.modal.constraints.html',
                controller: 'CCOperationsSubscriberScreeningConstraintsCtrl',
                size: 'lg',
                resolve: {
                    scopeParameter: function () {
                        return scope;
                    }
                }
            });

            modalInstance.result.then(function () {
                scope.rowSelected = false;
            }, function () {
                scope.rowSelected = false;
            });
        };

        $scope.showBlacklists = function (scope) {
            scope.rowSelected = true;

            var modalInstance = $uibModal.open({
                templateUrl: 'partials/screenings/screenings.modal.list.html',
                controller: 'CCOperationsSubscriberScreeningListsCtrl',
                size: 'lg',
                resolve: {
                    modalTitleParameter: function () {
                        return 'ScreeningLists.Screenings.BlackList';
                    },
                    scopeNameParameter: function () {
                        return scope.screeningScopeId;
                    },
                    listParameter: function () {
                        return scope.blackList;
                    }
                }
            });

            modalInstance.result.then(function () {
                scope.rowSelected = false;
            }, function () {
                scope.rowSelected = false;
            });
        };

        $scope.showWhitelists = function (scope) {
            scope.rowSelected = true;

            var modalInstance = $uibModal.open({
                templateUrl: 'partials/screenings/screenings.modal.list.html',
                controller: 'CCOperationsSubscriberScreeningListsCtrl',
                size: 'lg',
                resolve: {
                    modalTitleParameter: function () {
                        return 'ScreeningLists.Screenings.WhiteList';
                    },
                    scopeNameParameter: function () {
                        return scope.screeningScopeId;
                    },
                    listParameter: function () {
                        return scope.whiteList;
                    }
                }
            });

            modalInstance.result.then(function () {
                scope.rowSelected = false;
            }, function () {
                scope.rowSelected = false;
            });
        };
    });

    CCOperationsModule.controller('CCOperationsSubscriberScreeningListsCtrl', function ($scope, $log, $filter, $uibModalInstance, NgTableParams, listParameter,
                                                                                        scopeNameParameter, modalTitleParameter) {
        $log.debug('CCOperationsSubscriberScreeningListsCtrl');

        $scope.list = listParameter;
        $scope.modalTitle = modalTitleParameter;
        $scope.scopeName = scopeNameParameter;

        $scope.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "screenableCorrelator": 'asc'
            }
        }, {
            total: $scope.list.length, // length of organizations
            $scope: $scope,
            getData: function ($defer, params) {
                var orderedData = params.sorting() ? $filter('orderBy')($scope.list, params.orderBy()) : $scope.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });

        $scope.close = function () {
            $uibModalInstance.close();
        };
    });

    CCOperationsModule.controller('CCOperationsSubscriberScreeningConstraintsCtrl', function ($scope, $log, $uibModalInstance, scopeParameter, NgTableParams, DAYS_OF_WEEK) {
        $log.debug('CCOperationsSubscriberScreeningConstraintsCtrl');

        $scope.screeningScope = scopeParameter;

        var selectedMode = $scope.screeningScope.selectedScreeningModeType;
        var selectedModeDetails = _.findWhere($scope.screeningScope.screeningModes, {screeningModeType: selectedMode});
        var absoluteTimeConstraint;
        var recurringTimeConstraint;
        if (selectedModeDetails) {
            absoluteTimeConstraint = selectedModeDetails.absoluteTimeConstraint;
            recurringTimeConstraint = selectedModeDetails.recurringTimeConstraint;
        }

        if (absoluteTimeConstraint) {
            $scope.absoluteTimeConstraint = absoluteTimeConstraint;
        } else if (recurringTimeConstraint) {
            $scope.recurringTimeConstraint = selectedModeDetails.recurringTimeConstraint;

            $scope.days = [
                {active: false, day: DAYS_OF_WEEK[0]},
                {active: false, day: DAYS_OF_WEEK[1]},
                {active: false, day: DAYS_OF_WEEK[2]},
                {active: false, day: DAYS_OF_WEEK[3]},
                {active: false, day: DAYS_OF_WEEK[4]},
                {active: false, day: DAYS_OF_WEEK[5]},
                {active: false, day: DAYS_OF_WEEK[6]}
            ];

            var daysOfWeek = $scope.recurringTimeConstraint.daysOfWeek;
            for (var i = 0; i < daysOfWeek.length; i++) {
                var activeDay = daysOfWeek[i];
                $scope.days[activeDay - 1].active = true;
            }
        }

        $scope.close = function () {
            $uibModalInstance.close();
        };
    });

})();
