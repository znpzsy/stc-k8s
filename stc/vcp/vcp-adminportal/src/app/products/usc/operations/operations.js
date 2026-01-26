(function () {

    'use strict';

    angular.module('adminportal.products.usc.operations', [
        'adminportal.products.usc.operations.pssr',
        'adminportal.products.usc.operations.smppapps',
        'adminportal.products.usc.operations.wsapps'
    ]);

    var USCOperationsModule = angular.module('adminportal.products.usc.operations');

    USCOperationsModule.config(function ($stateProvider) {

        $stateProvider.state('products.usc.operations', {
            url: "/operations",
            abstract: true,
            templateUrl: "products/usc/operations/operations.html"
        }).state('products.usc.operations.applications', {
            url: "/applications",
            abstract: true,
            templateUrl: "products/usc/operations/operations.abstract.html"
        });

    });

    USCOperationsModule.controller('USCRoutingModalInstanceCtrl', function ($scope, $uibModal, $uibModalInstance, appIdParameter, appNameParameter, $log, $filter, UtilService,
                                                                            notification, $translate, UssdGwConfService, Restangular, NgTableParams, appRouting) {
        $log.debug('USCRoutingModalInstanceCtrl');

        $scope.appName = appNameParameter;

        $scope.appRouting = Restangular.stripRestangular(appRouting);
        _.each($scope.appRouting, function (routing) {
            routing.addRangeStart = Number(routing.addRangeStart);
            routing.addRangeEnd = Number(routing.addRangeEnd);
        });

        $log.debug('Smpp Application Routing Conf: ', appRouting);

        $scope.range = {
            start: '',
            end: ''
        };

        $scope.$watch('range.start', function (newVal, oldVal) {
            var foundItem = _.find($scope.appRouting, function (item) {
                var itemStartValue = eval('item.addRangeStart');
                var itemEndValue = eval('item.addRangeEnd');

                return (String(itemStartValue) === String(newVal) && String(itemEndValue) === String($scope.range.end));
            });

            $scope.newEntryForm.addRangeStart.$setValidity('availabilityCheck', _.isUndefined(foundItem));
            $scope.newEntryForm.addRangeEnd.$setValidity('availabilityCheck', true);
        });
        $scope.$watch('range.end', function (newVal, oldVal) {
            var foundItem = _.find($scope.appRouting, function (item) {
                var itemStartValue = eval('item.addRangeStart');
                var itemEndValue = eval('item.addRangeEnd');

                return (String(itemStartValue) === String($scope.range.start) && String(itemEndValue) === String(newVal));
            });

            $scope.newEntryForm.addRangeStart.$setValidity('availabilityCheck', true);
            $scope.newEntryForm.addRangeEnd.$setValidity('availabilityCheck', _.isUndefined(foundItem));
        });

        $scope.tableParams = new NgTableParams({
            page: 1,          // show first page
            count: 10,        // count per page
            sorting: {
                "addRangeStart": 'asc'
            }
        }, {
            total: 0, // length of organizations
            $scope: $scope,
            getData: function ($defer, params) {
                var orderedData = params.sorting() ? $filter('orderBy')($scope.appRouting, params.orderBy()) : $scope.appRouting;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });

        $scope.remove = function (routing) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                $log.debug('Removing Smpp Application Routing: ', routing);

                UssdGwConfService.deleteApplicationRouting(appIdParameter, routing).then(function (response) {
                    $log.debug('Deleted Smpp Application Routing: ', response);

                    var deletedListItem = _.findWhere($scope.appRouting, {
                        addRangeStart: routing.addRangeStart,
                        addRangeEnd: routing.addRangeEnd
                    });
                    $scope.appRouting = _.without($scope.appRouting, deletedListItem);

                    $scope.tableParams.reload();

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                }, function (response) {
                    $log.debug('Cannot delete Smpp Application routing : ', response);
                });
            });
        };

        $scope.addNewRage = function (start, end) {
            var newRange = {
                addRangeStart: Number(start),
                addRangeEnd: Number(end),
                applicationId: appIdParameter
            };

            UssdGwConfService.addApplicationRouting(newRange).then(function (response) {
                $log.debug('Added Smpp Application Routing : ', response);

                $scope.appRouting.push(newRange);
                $scope.tableParams.reload();

                $scope.newEntryForm.$setPristine();
                $scope.range.start = '';
                $scope.range.end = '';
            }, function (response) {
                $log.debug('Cannot add Smpp Application routing : ', response);
            });
        };

        $scope.ok = function () {
            $uibModalInstance.close();
        };
    });

})();
