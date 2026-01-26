(function () {

    'use strict';

    angular.module('adminportal.services.mca.advertisement.advertisement', [
        'adminportal.services.mca.advertisement.advertisement.adcontents'
    ]);

    var MCAAdvertisementOperationsModule = angular.module('adminportal.services.mca.advertisement.advertisement');

    MCAAdvertisementOperationsModule.config(function ($stateProvider) {

        $stateProvider.state('services.mca.advertisement.advertisement', {
            url: "/adlistings",
            template: "<div ui-view></div>"
        }).state('services.mca.advertisement.advertisement.list', {
            url: "/list",
            templateUrl: "services/mca/advertisement/operations.advertisement.html",
            controller: 'MCAAdvertisementOperationsCtrl',
            resolve: {
                advertisements: function (AdvertisementConfigurationService) {
                    return AdvertisementConfigurationService.getAdvertisements();
                }
            }
        }).state('services.mca.advertisement.advertisement.new', {
            url: "/new",
            templateUrl: "services/mca/advertisement/operations.advertisement.detail.html",
            controller: 'MCAAdvertisementOperationsNewCtrl'
        }).state('services.mca.advertisement.advertisement.update', {
            url: "/update/:name",
            templateUrl: "services/mca/advertisement/operations.advertisement.detail.html",
            controller: 'MCAAdvertisementOperationsUpdateCtrl',
            resolve: {
                advertisement: function ($stateParams, AdvertisementConfigurationService) {
                    return AdvertisementConfigurationService.getAdvertisement($stateParams.name);
                }
            }
        });

    });

    MCAAdvertisementOperationsModule.controller('MCAAdvertisementOperationsCommonCtrl', function ($scope, $log, $state, UtilService) {
        $log.debug('MCAAdvertisementOperationsCommonCtrl');

        $scope.listState = "services.mca.advertisement.advertisement.list";
        $scope.newState = "services.mca.advertisement.advertisement.new";
        $scope.updateState = "services.mca.advertisement.advertisement.update";

        $scope.initializeDateTimeFields = function () {
            $scope.hstep = 1;
            $scope.mstep = 1;

            $scope.dateFormat = 'MMMM d, y';
            $scope.dateOptions = {
                formatYear: 'yy',
                startingDay: 1,
                showWeeks: false
            };

            $scope.openValidFromDatePicker = function ($event) {
                $event.preventDefault();
                $event.stopPropagation();
                $scope.validFromDatePicker = {
                    opened: true
                };
            };
            $scope.openValidToDatePicker = function ($event) {
                $event.preventDefault();
                $event.stopPropagation();
                $scope.validToDatePicker = {
                    opened: true
                };
            };

            $scope.updateValidFromDate = function () {
                if ($scope.entry.validFromDate) {
                    $scope.entry.validFromDate = UtilService.calculateDate($scope.entry.validFromDate, $scope.entry.validFromTime.getHours(), $scope.entry.validFromTime.getMinutes());

                    if ($scope.entry.validToDate < $scope.entry.validFromDate) {
                        UtilService.setError($scope.form, 'validFrom', 'maxDateExceeded', false);
                        UtilService.setError($scope.form, 'validTo', 'minDateExceeded', true);
                    } else {
                        UtilService.setError($scope.form, 'validFrom', 'maxDateExceeded', true);
                        UtilService.setError($scope.form, 'validTo', 'minDateExceeded', true);
                    }
                }
            };
            $scope.updateValidFromTime = function () {
                $scope.entry.validFromDate = UtilService.calculateDate($scope.entry.validFromDate, $scope.entry.validFromTime.getHours(), $scope.entry.validFromTime.getMinutes());

                if ($scope.entry.validToDate < $scope.entry.validFromDate) {
                    $scope.entry.validToDate = UtilService.calculateDate($scope.entry.validToDate, $scope.entry.validFromTime.getHours(), $scope.entry.validFromTime.getMinutes());
                    $scope.entry.validToTime = UtilService.calculateDate($scope.entry.validToTime, $scope.entry.validFromTime.getHours(), $scope.entry.validFromTime.getMinutes());
                }
            };
            $scope.updateValidToDate = function () {
                if ($scope.entry.validToDate) {
                    $scope.entry.validToDate = UtilService.calculateDate($scope.entry.validToDate, $scope.entry.validToTime.getHours(), $scope.entry.validToTime.getMinutes());

                    if ($scope.entry.validToDate < $scope.entry.validFromDate) {
                        UtilService.setError($scope.form, 'validFrom', 'maxDateExceeded', true);
                        UtilService.setError($scope.form, 'validTo', 'minDateExceeded', false);
                    } else {
                        UtilService.setError($scope.form, 'validFrom', 'maxDateExceeded', true);
                        UtilService.setError($scope.form, 'validTo', 'minDateExceeded', true);
                    }
                }
            };
            $scope.updateValidToTime = function () {
                $scope.entry.validToDate = UtilService.calculateDate($scope.entry.validToDate, $scope.entry.validToTime.getHours(), $scope.entry.validToTime.getMinutes());

                if ($scope.entry.validToDate < $scope.entry.validFromDate) {
                    $scope.entry.validFromDate = UtilService.calculateDate($scope.entry.validFromDate, $scope.entry.validToTime.getHours(), $scope.entry.validToTime.getMinutes());
                    $scope.entry.validFromTime = UtilService.calculateDate($scope.entry.validFromTime, $scope.entry.validToTime.getHours(), $scope.entry.validToTime.getMinutes());
                }
            };

            $scope.updateStartTime = function () {
                if ($scope.entry.endTime < $scope.entry.startTime) {
                    $scope.entry.endTime = UtilService.calculateDate($scope.entry.endTime, $scope.entry.startTime.getHours(), $scope.entry.startTime.getMinutes());
                }
            };
            $scope.updateEndTime = function () {
                if ($scope.entry.endTime < $scope.entry.startTime) {
                    $scope.entry.startTime = UtilService.calculateDate($scope.entry.startTime, $scope.entry.endTime.getHours(), $scope.entry.endTime.getMinutes());
                }
            };
        };

        $scope.cancel = function () {
            $state.go($scope.listState);
        };
    });

    MCAAdvertisementOperationsModule.controller('MCAAdvertisementOperationsCtrl', function ($scope, $log, $controller, $uibModal, $filter, $translate, notification, NgTableParams, NgTableService, DateTimeConstants,
                                                                                        AdvertisementConfigurationService, advertisements) {
        $log.debug('MCAAdvertisementOperationsCtrl');

        $controller('MCAAdvertisementOperationsCommonCtrl', {$scope: $scope});

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'name',
                    headerKey: 'Services.MCA.Operations.Advertisement.TableColumns.AdName'
                },
                {
                    fieldName: 'validityStartDate',
                    headerKey: 'Services.MCA.Operations.Advertisement.TableColumns.ValidFrom',
                    filter: {name: 'date', params: ['yyyy-MM-dd HH:mm:ss', DateTimeConstants.OFFSET]}
                },
                {
                    fieldName: 'validityEndDate',
                    headerKey: 'Services.MCA.Operations.Advertisement.TableColumns.ValidTo',
                    filter: {name: 'date', params: ['yyyy-MM-dd HH:mm:ss', DateTimeConstants.OFFSET]}
                },
                {
                    fieldName: 'status',
                    headerKey: 'CommonLabels.State',
                    filter: {name: 'StatusTypeFilter'}
                },
                {
                    fieldName: 'mask',
                    headerKey: 'Services.MCA.Operations.Advertisement.TableColumns.Mask'
                },
                {
                    fieldName: 'daysOfWeek',
                    headerKey: 'Services.MCA.Operations.Advertisement.TableColumns.DaysOfWeek'
                },
                {
                    fieldName: 'startTime',
                    headerKey: 'Services.MCA.Operations.Advertisement.TableColumns.StartTime'
                },
                {
                    fieldName: 'endTime',
                    headerKey: 'Services.MCA.Operations.Advertisement.TableColumns.EndTime'
                },
                {
                    fieldName: 'timeExcluded',
                    headerKey: 'Services.MCA.Operations.Advertisement.TableColumns.ExcludeTheTimeRange',
                    filter: {name: 'YesNoFilter'}
                }
            ]
        };

        advertisements = $filter('orderBy')(advertisements, ['name']);

        // Ad template list
        $scope.advertisementList = {
            list: advertisements,
            tableParams: {}
        };

        $scope.advertisementList.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "name": 'asc'
            }
        }, {
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.advertisementList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.advertisementList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - Ad template list

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.advertisementList.tableParams.settings().$scope.filterText = filterText;
            $scope.advertisementList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.advertisementList.tableParams.page(1);
            $scope.advertisementList.tableParams.reload();
        }, 750);

        $scope.remove = function (entry) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                $log.debug('Removing ad template entry: ', entry);


                AdvertisementConfigurationService.deleteAdvertisement(entry.name).then(function (response) {
                    $log.debug('Removed ad template entry: ', entry, ', response: ', response);

                    var deletedListItem = _.findWhere($scope.advertisementList.list, {name: entry.name});
                    $scope.advertisementList.list = _.without($scope.advertisementList.list, deletedListItem);

                    $scope.advertisementList.tableParams.reload();

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                }, function (response) {
                    $log.debug('Cannot delete ad template entry: ', entry, ', response: ', response);
                });
            });
        };

        $scope.showAdContent = function (adInsertion) {
            $uibModal.open({
                templateUrl: 'services/mca/advertisement/operations.advertisement.adcontent.modal.html',
                controller: 'MCAAdvertisementAdContentsOperationsCtrl',
                size: 'lg',
                resolve: {
                    advertisement: function (AdvertisementConfigurationService) {
                        return AdvertisementConfigurationService.getAdvertisement(adInsertion.name);
                    }
                }
            });
        };

    });
    MCAAdvertisementOperationsModule.controller('MCAAdvertisementOperationsNewCtrl', function ($scope, $log, $state, $controller, $translate, notification, DateTimeConstants, UtilService, AdvertisementConfigurationService,
                                                                                           STATES, DAYS_OF_WEEK, MCA_AD_LISTING_MASK) {
        $log.debug('MCAAdvertisementOperationsNewCtrl');

        $controller('MCAAdvertisementOperationsCommonCtrl', {$scope: $scope});

        $scope.STATES = STATES;
        $scope.DAYS_OF_WEEK = DAYS_OF_WEEK;
        $scope.MCA_AD_LISTING_MASK = MCA_AD_LISTING_MASK;

        $scope.entry = {
            name: '',
            state: $scope.STATES[0],
            validFromDate: UtilService.getTodayBegin(),
            validFromTime: UtilService.getTodayBegin(),
            validToDate: UtilService.getTodayEnd(),
            validToTime: UtilService.getTodayEnd(),
            mask: $scope.MCA_AD_LISTING_MASK.NONE,
            daysOfWeek: [],
            startTime: UtilService.getTodayBegin(),
            endTime: UtilService.getTodayEnd(),
            timeExcluded: false
        };

        $scope.changeMaskType = function () {
            if ($scope.maskDaysOfWeek && $scope.maskHoursOfDay) {
                $scope.entry.mask = MCA_AD_LISTING_MASK.BOTH;
            } else if ($scope.maskDaysOfWeek) {
                $scope.entry.mask = MCA_AD_LISTING_MASK.DAYS_OF_WEEK;
            } else if ($scope.maskHoursOfDay) {
                $scope.entry.mask = MCA_AD_LISTING_MASK.HOUR_OF_DAY;
            } else {
                $scope.entry.mask = MCA_AD_LISTING_MASK.NONE;
            }
        };

        $scope.initializeDateTimeFields();

        $scope.toggleDay = function (dayId) {
            if (!$scope.isDaySelected(dayId)) {
                $scope.entry.daysOfWeek.push(dayId)
            } else {
                $scope.entry.daysOfWeek = _.without($scope.entry.daysOfWeek, dayId);
            }

            $scope.entry.daysOfWeek = _.sortBy($scope.entry.daysOfWeek);
        };

        $scope.isDaySelected = function (dayId) {
            return _.contains($scope.entry.daysOfWeek, dayId);
        };

        $scope.save = function (entry) {
            var entryItem = {
                name: entry.name,
                contextList: ["mcn"],
                status: (entry.state === $scope.STATES[0] ? 'ENABLED' : 'DISABLED'),
                validityStartDate: moment(moment(entry.validFromDate).format('YYYY-MM-DDTHH:mm:ss') + DateTimeConstants.OFFSET).toISOString(),
                validityEndDate: moment(moment(entry.validToDate).format('YYYY-MM-DDTHH:mm:ss') + DateTimeConstants.OFFSET).toISOString(),
                mask: entry.mask,
                adContentList: [],
                applicationList: []
            };

            if (entry.mask === 'DAYS_OF_WEEK' || entry.mask === 'BOTH') {
                entryItem.daysOfWeek = entry.daysOfWeek;
            }

            if (entry.mask === 'HOUR_OF_DAY' || entry.mask === 'BOTH') {
                entryItem.startTime = moment(entry.startTime).format('HH:mm');
                entryItem.endTime = moment(entry.endTime).format('HH:mm');
                entryItem.timeExcluded = entry.timeExcluded;
            }

            AdvertisementConfigurationService.createAdvertisement(entryItem).then(function (response) {
                if (response && response.message.indexOf('duplicate key error index') > 1) {
                    $log.debug('Cannot add ad template ad insertion entry: ', entryItem, ', response: ', response);

                    notification({
                        type: 'warning',
                        text: $translate.instant('Services.MCA.Operations.Advertisement.Messages.EntryAlreadyDefinedError', {name: entryItem.name})
                    });
                } else {
                    $log.debug('Added ad template ad insertion entry: ', entryItem);

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    $state.go($scope.listState);
                }
            }, function (response) {
                $log.debug('Cannot add ad template ad insertion entry: ', entryItem, ', response: ', response);
            });
        };
    });

    MCAAdvertisementOperationsModule.controller('MCAAdvertisementOperationsUpdateCtrl', function ($scope, $log, $state, $controller, $translate, notification, DateTimeConstants, UtilService, AdvertisementConfigurationService,
                                                                                              STATES, DAYS_OF_WEEK, MCA_AD_LISTING_MASK, advertisement) {
        $log.debug('MCAAdvertisementOperationsUpdateCtrl');

        $controller('MCAAdvertisementOperationsCommonCtrl', {$scope: $scope});

        $scope.STATES = STATES;
        $scope.DAYS_OF_WEEK = DAYS_OF_WEEK;
        $scope.MCA_AD_LISTING_MASK = MCA_AD_LISTING_MASK;

        var validFromDate = new Date(moment(advertisement.validityStartDate).utcOffset(DateTimeConstants.OFFSET).format('YYYY/MM/DD HH:mm:ss'));
        var validToDate = new Date(moment(advertisement.validityEndDate).utcOffset(DateTimeConstants.OFFSET).format('YYYY/MM/DD HH:mm:ss'));

        var startTimeArr = s.words(advertisement.startTime, ":");
        var startTime = UtilService.calculateDate(new Date(), s.toNumber(startTimeArr[0]), s.toNumber(startTimeArr[1]));

        var endTimeArr = s.words(advertisement.endTime, ":");
        var endTime = UtilService.calculateDate(new Date(), s.toNumber(endTimeArr[0]), s.toNumber(endTimeArr[1]));

        $scope.advertisement = advertisement;

        $scope.entry = {
            id: _.uniqueId(),
            name: advertisement.name,
            state: advertisement.status === 'ENABLED' ? $scope.STATES[0] : $scope.STATES[1],
            validFromDate: angular.copy(validFromDate),
            validFromTime: angular.copy(validFromDate),
            validToDate: angular.copy(validToDate),
            validToTime: angular.copy(validToDate),
            mask: advertisement.mask,
            daysOfWeek: advertisement.daysOfWeek ? advertisement.daysOfWeek : [],
            startTime: startTime,
            endTime: endTime,
            timeExcluded: advertisement.timeExcluded
        };

        $scope.maskDaysOfWeek = ($scope.entry.mask === MCA_AD_LISTING_MASK.DAYS_OF_WEEK || $scope.entry.mask === MCA_AD_LISTING_MASK.BOTH);
        $scope.maskHoursOfDay = ($scope.entry.mask === MCA_AD_LISTING_MASK.HOUR_OF_DAY || $scope.entry.mask === MCA_AD_LISTING_MASK.BOTH);

        $scope.changeMaskType = function () {
            if ($scope.maskDaysOfWeek && $scope.maskHoursOfDay) {
                $scope.entry.mask = MCA_AD_LISTING_MASK.BOTH;
            } else if ($scope.maskDaysOfWeek) {
                $scope.entry.mask = MCA_AD_LISTING_MASK.DAYS_OF_WEEK;
            } else if ($scope.maskHoursOfDay) {
                $scope.entry.mask = MCA_AD_LISTING_MASK.HOUR_OF_DAY;
            } else {
                $scope.entry.mask = MCA_AD_LISTING_MASK.NONE;
            }
        };

        $scope.initializeDateTimeFields();

        $scope.originalEntry = angular.copy($scope.entry);
        $scope.isNotChanged = function () {
            return angular.equals($scope.originalEntry, $scope.entry);
        };

        $scope.toggleDay = function (dayId) {
            if (!$scope.isDaySelected(dayId)) {
                $scope.entry.daysOfWeek.push(dayId)
            } else {
                $scope.entry.daysOfWeek = _.without($scope.entry.daysOfWeek, dayId);
            }

            $scope.entry.daysOfWeek = _.sortBy($scope.entry.daysOfWeek);
        };

        $scope.isDaySelected = function (dayId) {
            return _.contains($scope.entry.daysOfWeek, dayId);
        };

        $scope.save = function (entry) {
            var entryItem = {
                name: entry.name,
                contextList: ["mcn"],
                status: (entry.state === $scope.STATES[0] ? 'ENABLED' : 'DISABLED'),
                validityStartDate: moment(moment(entry.validFromDate).format('YYYY-MM-DDTHH:mm:ss') + DateTimeConstants.OFFSET).toISOString(),
                validityEndDate: moment(moment(entry.validToDate).format('YYYY-MM-DDTHH:mm:ss') + DateTimeConstants.OFFSET).toISOString(),
                mask: entry.mask,
                adContentList: $scope.advertisement.adContentList,
                applicationList: $scope.advertisement.applicationList
            };

            if (entry.mask === 'DAYS_OF_WEEK' || entry.mask === 'BOTH') {
                entryItem.daysOfWeek = entry.daysOfWeek;
            }

            if (entry.mask === 'HOUR_OF_DAY' || entry.mask === 'BOTH') {
                entryItem.startTime = moment(entry.startTime).format('HH:mm');
                entryItem.endTime = moment(entry.endTime).format('HH:mm');
                entryItem.timeExcluded = entry.timeExcluded;
            }

            AdvertisementConfigurationService.updateAdvertisement(entryItem).then(function (response) {
                $log.debug('Updated ad template ad insertion entry: ', entryItem);

                notification({
                    type: 'success',
                    text: $translate.instant('CommonLabels.OperationSuccessful')
                });

                $state.go($scope.listState);
            }, function (response) {
                $log.debug('Cannot update ad template ad insertion entry: ', entryItem, ', response: ', response);
            });
        };
    });

})();
