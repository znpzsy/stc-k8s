(function () {

    'use strict';

    angular.module('adminportal.products.bulkmessaging.operations.screenings', []);

    var BulkMessagingSubscriberScreeningOperationsModule = angular.module('adminportal.products.bulkmessaging.operations.screenings');

    BulkMessagingSubscriberScreeningOperationsModule.config(function ($stateProvider) {

        $stateProvider.state('products.bulkmessaging.operations.screenings', {
            url: "/screenings",
            templateUrl: "products/bulkmessaging/operations/operations.screenings.html",
            controller: 'BulkMessagingSubscriberScreeningOperationsCtrl'
        });

    });

    BulkMessagingSubscriberScreeningOperationsModule.controller('BulkMessagingSubscriberScreeningOperationsCtrl', function ($scope, $log, $uibModal, notification, $translate, Restangular,
                                                                                                                            NgTableParams, ScreeningManagerV3Service) {
        $log.debug("BulkMessagingSubscriberScreeningOperationsCtrl");

        $scope.tableParams = new NgTableParams({
            page: 1,
            count: 10
        }, {
            total: 0,
            $scope: $scope,
            getData: function ($defer, params) {
                var msisdn = params.settings().$scope.msisdn;
                if (msisdn) {
                    ScreeningManagerV3Service.getScreeningLists(msisdn).then(function (response) {
                        $log.debug('Success. Response: ', response);
                        var apiResponse = Restangular.stripRestangular(response);
                        if (apiResponse.screeningSubscriber) {
                            $scope.subscriberNumber = msisdn;
                            $scope.msisdn = null;

                            // clean irrelevant scopes. order global, cc and ics scopes
                            var results = [];

                            var globalScope = _.findWhere(apiResponse.screeningSubscriber.screeningScopes, {screeningScopeId: ScreeningManagerV3Service.scopes.GLOBAL_SCOPE_KEY});
                            if (globalScope) {
                                results.push(globalScope);
                            }

                            var mcaScope = _.findWhere(apiResponse.screeningSubscriber.screeningScopes, {screeningScopeId: ScreeningManagerV3Service.scopes.COC_SCOPE_KEY});
                            if (mcaScope) {
                                results.push(mcaScope);
                            }

                            params.total(results.length);
                            $defer.resolve(results);
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
            $uibModal.open({
                templateUrl: 'products/bulkmessaging/operations/operations.screenings.modal.constraints.html',
                controller: 'BulkMessagingSubscriberScreeningConstraintsCtrl',
                size: 'lg',
                resolve: {
                    scopeParameter: function () {
                        return scope;
                    }
                }
            });
        };

        $scope.showBlacklists = function (scope) {
            $uibModal.open({
                templateUrl: 'products/bulkmessaging/operations/operations.screenings.modal.list.html',
                controller: 'BulkMessagingSubscriberScreeningListsCtrl',
                size: 'lg',
                resolve: {
                    modalTitleParameter: function () {
                        return 'Products.BulkMessaging.Operations.Screenings.BlackList';
                    }, scopeNameParameter: function () {
                        return scope.screeningScopeId;
                    }, listParameter: function () {
                        return scope.blackList;
                    }
                }
            });
        };

        $scope.showWhitelists = function (scope) {
            $uibModal.open({
                templateUrl: 'products/bulkmessaging/operations/operations.screenings.modal.list.html',
                controller: 'BulkMessagingSubscriberScreeningListsCtrl',
                size: 'lg',
                resolve: {
                    modalTitleParameter: function () {
                        return 'Products.BulkMessaging.Operations.Screenings.WhiteList';
                    }, scopeNameParameter: function () {
                        return scope.screeningScopeId;
                    },
                    listParameter: function () {
                        return scope.whiteList;
                    }
                }
            });
        };

    });

    BulkMessagingSubscriberScreeningOperationsModule.controller('BulkMessagingSubscriberScreeningListsCtrl', function ($scope, $log, $filter, $uibModalInstance, listParameter, scopeNameParameter, modalTitleParameter,
                                                                                                                       NgTableParams) {
        $log.debug('BulkMessagingSubscriberScreeningListsCtrl');

        $scope.list = listParameter;
        $scope.modalTitle = modalTitleParameter;
        $scope.scopeName = scopeNameParameter;

        $scope.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "screenableCorrelator": 'asc' // initial sorting
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

    BulkMessagingSubscriberScreeningOperationsModule.controller('BulkMessagingSubscriberScreeningConstraintsCtrl', function ($scope, $log, $uibModalInstance, scopeParameter, NgTableParams, DAYS_OF_WEEK) {
        $log.debug('BulkMessagingSubscriberScreeningConstraintsCtrl');

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
