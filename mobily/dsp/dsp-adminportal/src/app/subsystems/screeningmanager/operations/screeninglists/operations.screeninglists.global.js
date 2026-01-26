(function () {

    'use strict';

    angular.module('adminportal.subsystems.screeningmanager.operations.screeninglists.global', []);

    var ScreeningManagementOperationsScreeningListsGlobalModule = angular.module('adminportal.subsystems.screeningmanager.operations.screeninglists.global');

    ScreeningManagementOperationsScreeningListsGlobalModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.screeningmanager.operations.screeninglists.global', {
            url: "/global",
            templateUrl: 'subsystems/screeningmanager/operations/screeninglists/operations.screeninglists.global.html',
            controller: 'ScreeningManagementOperationsScreeningListsGlobalCtrl',
            data: {
                permissions: [
                    'SCRM__OPERATIONS_GLOBAL_READ'
                ]
            }
        }).state('subsystems.screeningmanager.operations.screeninglists.global.msisdn', {
            url: "/msisdn",
            views: {
                'searchForm': {
                    templateUrl: 'subsystems/screeningmanager/operations/screeninglists/operations.screeninglists.global.search.html'
                },
                'screeningInformation': {
                    templateUrl: 'subsystems/screeningmanager/operations/screeninglists/operations.screeninglists.global.detail.html',
                    controller: 'ScreeningManagementOperationsScreeningListsGlobalMsisdnCtrl'
                }
            }
        });

    });

    ScreeningManagementOperationsScreeningListsGlobalModule.controller('ScreeningManagementOperationsScreeningListsGlobalCtrl', function ($scope, $log, $translate, notification, Restangular,
                                                                                                                                          ScreeningManagerV3Service) {
        $log.debug('ScreeningManagementOperationsScreeningListsGlobalCtrl');

        $scope.showInformation = false;

        $scope.initializeScreeningInformation = function() {
            $scope.showInformation = false;
            $scope.screening = null;
        };

        $scope.search = function (msisdn) {
            $scope.msisdn = msisdn;

            ScreeningManagerV3Service.getGlobalBlackListExistence(msisdn).then(function (response) {
                $log.debug('Screening information found. Response: ', response);

                var screening = Restangular.stripRestangular(response);
                if (screening && screening.containsResponse) {
                    $scope.showInformation = true;

                    $scope.screening = {
                        contains: screening.containsResponse.contains
                    };
                    $scope.screeningOriginal = angular.copy($scope.screening);
                } else {
                    notification({
                        type: 'warning',
                        text: $translate.instant('ScreeningLists.Messages.ScreeningInformationNotFound')
                    });
                }
            }, function (response) {
                $log.debug('Screening information cannot found. Error: ', response);

                notification({
                    type: 'warning',
                    text: $translate.instant('ScreeningLists.Messages.ScreeningInformationNotFound')
                });
            });
        };
    });

    ScreeningManagementOperationsScreeningListsGlobalModule.controller('ScreeningManagementOperationsScreeningListsGlobalMsisdnCtrl', function ($scope, $log, $filter, $translate, notification, Restangular,
                                                                                                                                                DateTimeConstants, ScreeningManagerV3Service) {
        $log.debug('ScreeningManagementOperationsScreeningListsGlobalMsisdnCtrl');

        $scope.isGlobalScreeningNotChanged = function () {
            return angular.equals($scope.screening, $scope.screeningOriginal);
        };

        $scope.saveGlobalScreening = function (msisdn, screening) {
            if (screening.contains) {
                var screenableEntry = {
                    "screenableEntryId": msisdn,
                    "screenableCorrelator": $filter('date')(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss.sss' + DateTimeConstants.OFFSET)
                };

                // Add to the list if the number wanted to be blocked.
                ScreeningManagerV3Service.addSubscriberToGlobalBlackList(screenableEntry).then(function (response) {
                    if (!_.isUndefined(response) && !_.isUndefined(response.errorCode)) {
                        var text = '';
                        if (response.errorCode === ScreeningManagerV3Service.errorCodes.QUOTA_ERROR) {
                            // If maximum list member quota is exceeded show a quota information notification.
                            text = $translate.instant('ScreeningLists.Messages.QuotaExceededWithoutCount');
                        } else if (response.errorCode === ScreeningManagerV3Service.errorCodes.WRONG_REQUEST_ERROR) {
                            // If subscribe number is invalid
                            text = $translate.instant('ScreeningLists.Messages.ValueIsInvalid', {value: msisdn});
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
                            text: $translate.instant('ScreeningLists.Messages.BlackListed', {value: msisdn})
                        });

                        $scope.$parent.screening = screening;
                        $scope.$parent.screeningOriginal = angular.copy($scope.$parent.screening);

                        $log.debug('A new item [', msisdn, ', ', screenableEntry.screenableCorrelator, '] added to blacklist list.');
                    }
                }, function (response) {
                    $log.debug('Error: ', response);
                });
            } else {
                // Remove from the list if the number wanted to be allowed.
                ScreeningManagerV3Service.removeSubscriberFromGlobalBlackList(msisdn).then(function (response) {
                    if (!_.isUndefined(response) && !_.isUndefined(response.errorCode)) {
                        // If there are some other type errors
                        notification({
                            type: 'warning',
                            text: response.errorCode + ' - ' + response.message
                        });
                    } else {
                        notification({
                            type: 'success',
                            text: $translate.instant('ScreeningLists.Messages.NotBlackListed', {value: msisdn})
                        });

                        $scope.$parent.screening = screening;
                        $scope.$parent.screeningOriginal = angular.copy($scope.$parent.screening);
                    }
                }, function (response) {
                    $log.debug('Error: ', response);
                });
            }
        };

        $scope.cancel = function (msisdn) {
            $scope.$parent.search(msisdn);
        };
    });

})();
