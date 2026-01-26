(function () {

    'use strict';

    angular.module('adminportal.subsystems.provisioning.operations.services.servicecopyrightfile', []);

    var ProvisioningOperationsServiceCopyrightFileModule = angular.module('adminportal.subsystems.provisioning.operations.services.servicecopyrightfile');

    ProvisioningOperationsServiceCopyrightFileModule.controller('ProvisioningOperationsServiceCopyrightFileCtrl', function ($scope, $log, $uibModal, $filter, DateTimeConstants) {
        $log.debug('ProvisioningOperationsServiceCopyrightFileCtrl');

        // ServiceCopyrightFileProfiles managing methods.
        $scope.addServiceCopyrightFileProfile = function (service) {
            var modalInstance = $uibModal.open({
                templateUrl: 'subsystems/provisioning/operations/services/operations.services.modal.servicecopyrightfile.html',
                controller: function ($scope, $log, $uibModalInstance, Restangular) {
                    $scope.service = service;

                    $scope.hstep = 1;
                    $scope.mstep = 1;

                    $scope.dateFormat = 'MMMM d, y';
                    $scope.dateOptions = {
                        formatYear: 'yy',
                        startingDay: 1,
                        showWeeks: false
                    };

                    $scope.openValidFromPicker = function ($event) {
                        $event.preventDefault();
                        $event.stopPropagation();
                        $scope.validFromPicker = {
                            opened: true
                        };
                    };
                    $scope.openValidToPicker = function ($event) {
                        $event.preventDefault();
                        $event.stopPropagation();
                        $scope.validToPicker = {
                            opened: true
                        };
                    };

                    $scope.serviceCopyrightFileProfile = {
                        copyrightFile: null,
                        ValidFrom: moment().startOf('day').toDate(),
                        ValidTo: moment().endOf('day').add(1, 'years').toDate()
                    };

                    $scope.save = function (serviceCopyrightFileProfile) {
                        $uibModalInstance.close(serviceCopyrightFileProfile);
                    };

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                resolve: {}
            });

            modalInstance.result.then(function (serviceCopyrightFileProfile) {
                service.serviceCopyrightFileProfileList = service.serviceCopyrightFileProfileList || [];

                serviceCopyrightFileProfile.id = _.uniqueId();
                service.serviceCopyrightFileProfileList.push(serviceCopyrightFileProfile);
            }, function () {
                //
            });
        };
        $scope.editServiceCopyrightFileProfile = function (service, serviceCopyrightFileProfile) {
            var modalInstance = $uibModal.open({
                templateUrl: 'subsystems/provisioning/operations/services/operations.services.modal.servicecopyrightfile.html',
                controller: function ($scope, $log, $uibModalInstance, Restangular) {
                    $scope.service = service;

                    $scope.hstep = 1;
                    $scope.mstep = 1;

                    $scope.dateFormat = 'MMMM d, y';
                    $scope.dateOptions = {
                        formatYear: 'yy',
                        startingDay: 1,
                        showWeeks: false
                    };

                    $scope.openValidFromPicker = function ($event) {
                        $event.preventDefault();
                        $event.stopPropagation();
                        $scope.validFromPicker = {
                            opened: true
                        };
                    };
                    $scope.openValidToPicker = function ($event) {
                        $event.preventDefault();
                        $event.stopPropagation();
                        $scope.validToPicker = {
                            opened: true
                        };
                    };

                    $scope.serviceCopyrightFileProfile = _.deepClone(serviceCopyrightFileProfile);
                    $scope.serviceCopyrightFileProfile.copyrightFile = new File([serviceCopyrightFileProfile.copyrightFile], serviceCopyrightFileProfile.copyrightFile.name, {type: serviceCopyrightFileProfile.copyrightFile.type});
                    $scope.serviceCopyrightFileProfile.ValidFrom = serviceCopyrightFileProfile.ValidFrom;
                    $scope.serviceCopyrightFileProfile.ValidTo = serviceCopyrightFileProfile.ValidTo;

                    $scope.serviceCopyrightFileProfileOriginal = _.deepClone($scope.serviceCopyrightFileProfile);
                    $scope.serviceCopyrightFileProfileOriginal.copyrightFile = new File([$scope.serviceCopyrightFileProfile.copyrightFile], $scope.serviceCopyrightFileProfile.copyrightFile.name, {type: $scope.serviceCopyrightFileProfile.copyrightFile.type});
                    $scope.serviceCopyrightFileProfileOriginal.ValidFrom = $scope.serviceCopyrightFileProfile.ValidFrom;
                    $scope.serviceCopyrightFileProfileOriginal.ValidTo = $scope.serviceCopyrightFileProfile.ValidTo;

                    $scope.isNotChanged = function () {
                        var isQuestionsEquals = true;
                        if ($scope.serviceCopyrightFileProfile.copyrightFile) {
                            isQuestionsEquals = isQuestionsEquals && ($scope.serviceCopyrightFileProfileOriginal.copyrightFile.name === $scope.serviceCopyrightFileProfile.copyrightFile.name &&
                                $scope.serviceCopyrightFileProfileOriginal.copyrightFile.size === $scope.serviceCopyrightFileProfile.copyrightFile.size &&
                                $scope.serviceCopyrightFileProfileOriginal.copyrightFile.type === $scope.serviceCopyrightFileProfile.copyrightFile.type);

                            isQuestionsEquals = isQuestionsEquals && _.isEqual($scope.serviceCopyrightFileProfileOriginal.ValidFrom, $scope.serviceCopyrightFileProfile.ValidFrom);
                            isQuestionsEquals = isQuestionsEquals && _.isEqual($scope.serviceCopyrightFileProfileOriginal.ValidTo, $scope.serviceCopyrightFileProfile.ValidTo);
                        }

                        return isQuestionsEquals;
                    };

                    $scope.save = function (serviceCopyrightFileProfile) {
                        $uibModalInstance.close(serviceCopyrightFileProfile);
                    };

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                resolve: {}
            });

            modalInstance.result.then(function (editedServiceCopyrightFileProfile) {
                var foundServiceCopyrightFileProfile = _.findWhere(service.serviceCopyrightFileProfileList, {id: editedServiceCopyrightFileProfile.id});
                if (foundServiceCopyrightFileProfile) {
                    foundServiceCopyrightFileProfile.copyrightFile = editedServiceCopyrightFileProfile.copyrightFile;
                    foundServiceCopyrightFileProfile.ValidFrom = editedServiceCopyrightFileProfile.ValidFrom;
                    foundServiceCopyrightFileProfile.ValidTo = editedServiceCopyrightFileProfile.ValidTo;
                }
            }, function () {
            });
        };
        $scope.removeServiceCopyrightFileProfile = function (service, serviceCopyrightFileProfile) {
            var index = _.indexOf(service.serviceCopyrightFileProfileList, serviceCopyrightFileProfile);
            if (index !== -1) {
                service.serviceCopyrightFileProfileList.splice(index, 1);
            }
        };
        $scope.getServiceCopyrightFileProfileString = function (serviceCopyrightFileProfile) {
            var resultStr = serviceCopyrightFileProfile.copyrightFile.name + ', ' +
                $filter('date')(serviceCopyrightFileProfile.ValidFrom, 'MMMM d, y', DateTimeConstants.OFFSET) + ' - ' +
                $filter('date')(serviceCopyrightFileProfile.ValidTo, 'MMMM d, y', DateTimeConstants.OFFSET) + '';

            return resultStr;
        };

    });

})();
