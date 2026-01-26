(function () {

    'use strict';

    angular.module('ccportal.subscriber-info.rbt.operations.specialconditionassignment', []);

    var RBTOperationsSpecialConditionAssignmentModule = angular.module('ccportal.subscriber-info.rbt.operations.specialconditionassignment');

    RBTOperationsSpecialConditionAssignmentModule.config(function ($stateProvider) {

        $stateProvider.state('subscriber-info.rbt.operations.specialconditionassignment', {
            url: "/special-condition-assignment",
            templateUrl: 'subscriber-info/rbt/operations/operations.specialconditionassignment.details.html',
            controller: 'RBTOperationsSpecialConditionAssignmentCtrl',
            resolve: {
                specialConditions: function (RBTContentManagementService) {
                    return RBTContentManagementService.getSpecialConditions();
                },
                specialConditionAssignment: function (UtilService, RBTContentManagementService) {
                    var msisdn = UtilService.getSubscriberMsisdn();

                    return RBTContentManagementService.getSpecialConditionAssignment(msisdn);
                }
            }
        });

    });

    RBTOperationsSpecialConditionAssignmentModule.controller('RBTOperationsSpecialConditionAssignmentCtrl', function ($scope, $log, $controller, $state, $uibModal, $filter, $translate, notification, DateTimeConstants, Restangular, UtilService,
                                                                                                                      RBTContentManagementService, specialConditions, specialConditionAssignment) {
        $log.debug('RBTOperationsSpecialConditionAssignmentCtrl');

        var msisdn = UtilService.getSubscriberMsisdn();

        $scope.specialConditionList = specialConditions ? Restangular.stripRestangular(specialConditions) : [];
        $scope.specialConditionList = $filter('orderBy')($scope.specialConditionList, 'name');

        $scope.specialConditionAssignment = Restangular.stripRestangular(specialConditionAssignment);

        $scope.specialConditionAssignmentOriginal = angular.copy($scope.specialConditionAssignment);
        $scope.isNotChanged = function () {
            return angular.equals($scope.specialConditionAssignmentOriginal, $scope.specialConditionAssignment);
        };

        $scope.save = function (specialConditionAssignment) {
            var specialConditionAssignmentItem = {
                "specialConditionId": specialConditionAssignment.condition ? specialConditionAssignment.condition.id : null
            };

            RBTContentManagementService.updateAssignmentProfileTone(msisdn, specialConditionAssignmentItem).then(function (response) {
                $log.debug('Updated assignment profile tone: ', specialConditionAssignmentItem, ', response: ', response);

                if (response && response.errorCode) {
                    RBTContentManagementService.showApiError(response);
                } else {
                    notification.flash({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    $scope.cancel();
                }
            }, function (response) {
                $log.debug('Cannot update assignment profile tone: ', specialConditionAssignmentItem, ', response: ', response);

                RBTContentManagementService.showApiError(response);
            });
        };

        $scope.delete = function () {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                $log.debug('Remove assignment profile tone.');

                RBTContentManagementService.deleteAssignmentProfileTone(msisdn).then(function (response) {
                    $log.debug('Deleted assignment profile tone. response: ', response);

                    if (response && response.errorCode) {
                        RBTContentManagementService.showApiError(response);
                    } else {
                        notification.flash({
                            type: 'success',
                            text: $translate.instant('SubscriberInfo.RBT.Messages.SpecialConditionAssignmentReset')
                        });

                        $scope.cancel();
                    }
                }, function (response) {
                    $log.debug('Cannot delete assignment profile tone: ', specialConditionAssignmentItem, ', response: ', response);

                    RBTContentManagementService.showApiError(response);
                });
            }, function () {
            });
        };

        $scope.cancel = function () {
            $state.go($state.$current, null, {reload: true});
        };
    });


})();
