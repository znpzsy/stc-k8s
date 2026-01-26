(function () {

    'use strict';

    angular.module('adminportal.subsystems.provisioning.operations.services.servicefees', []);

    var ProvisioningOperationsServicesFeesModule = angular.module('adminportal.subsystems.provisioning.operations.services.servicefees');

    ProvisioningOperationsServicesFeesModule.controller('ProvisioningOperationsServicesFeesCtrl', function ($scope, $log, $uibModal) {
        $log.debug('ProvisioningOperationsServicesFeesCtrl');

        $scope.shortCodeList = [];

        // ServiceFeeProfiles managing methods.
        $scope.addMTServiceFeeProfile = function (service) {
            var modalInstance = $uibModal.open({
                templateUrl: 'subsystems/provisioning/operations/services/operations.services.modal.servicefees.html',
                controller: function ($scope, $log, $uibModalInstance, shortCodeList) {
                    $scope.service = service;

                    $scope.shortCodeList = shortCodeList;

                    $scope.serviceFeeProfile = {};

                    $scope.save = function (serviceFeeProfile) {
                        $uibModalInstance.close(serviceFeeProfile);
                    };

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                resolve: {
                    shortCodeList: function () {
                        return $scope.shortCodeList;
                    }
                }
            });

            modalInstance.result.then(function (serviceFeeProfile) {
                service.mtServiceFeeList = service.mtServiceFeeList || [];

                serviceFeeProfile.id = _.uniqueId();
                service.mtServiceFeeList.push(serviceFeeProfile);
            }, function () {
                //
            });
        };
        $scope.editMTServiceFeeProfile = function (service, serviceFeeProfile) {
            var modalInstance = $uibModal.open({
                templateUrl: 'subsystems/provisioning/operations/services/operations.services.modal.servicefees.html',
                controller: function ($scope, $log, $uibModalInstance, shortCodeList) {
                    $scope.service = service;

                    $scope.shortCodeList = shortCodeList;

                    $scope.serviceFeeProfile = angular.copy(serviceFeeProfile);
                    $scope.serviceFeeProfileOriginal = angular.copy($scope.serviceFeeProfile);
                    $scope.isNotChanged = function () {
                        return angular.equals($scope.serviceFeeProfile, $scope.serviceFeeProfileOriginal);
                    };

                    $scope.save = function (serviceFeeProfile) {
                        $uibModalInstance.close(serviceFeeProfile);
                    };

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                resolve: {
                    shortCodeList: function () {
                        return $scope.shortCodeList;
                    }
                }
            });

            modalInstance.result.then(function (editedMTServiceFeeProfile) {
                var foundMTServiceFeeProfile = _.findWhere(service.mtServiceFeeList, {id: editedMTServiceFeeProfile.id});
                if (foundMTServiceFeeProfile) {
                    foundMTServiceFeeProfile.ShortCode = editedMTServiceFeeProfile.ShortCode;
                    foundMTServiceFeeProfile.Fee = editedMTServiceFeeProfile.Fee;
                }
            }, function () {
            });
        };
        $scope.removeMTServiceFeeProfile = function (service, serviceFeeProfile) {
            var index = _.indexOf(service.mtServiceFeeList, serviceFeeProfile);
            if (index !== -1) {
                service.mtServiceFeeList.splice(index, 1);
            }
        };
        $scope.getMTServiceFeeProfileString = function (serviceFeeProfile) {
            var resultStr = 'MT Short Code: ' + serviceFeeProfile.ShortCode +
                ', MT Service Fee (SAR): ' + serviceFeeProfile.Fee;

            return resultStr;
        };

    });

})();
