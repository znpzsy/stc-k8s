(function () {

    'use strict';

    angular.module('partnerportal.partner-info.services.servicecapabilityaccess', []);

    var PartnerInfoServiceCapabilityAccessModule = angular.module('partnerportal.partner-info.services.servicecapabilityaccess');

    PartnerInfoServiceCapabilityAccessModule.controller('PartnerInfoServiceCapabilityAccessCtrl', function ($scope, $log, $uibModal) {
        $log.debug('PartnerInfoServiceCapabilityAccessCtrl');

        // ServiceCapabilityAccessProfiles managing methods.
        $scope.addServiceCapabilityAccessProfile = function (service) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partner-info/services/operations.services.modal.servicecapabilityaccess.html',
                controller: function ($scope, $log, $uibModalInstance, Restangular, serviceCapabilities) {
                    $scope.service = service;

                    $scope.serviceCapabilityList = Restangular.stripRestangular(serviceCapabilities);

                    $scope.serviceCapabilityAccessProfile = {
                        CapabilityName: null
                    };

                    $scope.$watch('serviceCapabilityAccessProfile.CapabilityName', function (newVal, oldVal) {
                        if (!angular.equals(newVal, oldVal)) {
                            var foundProfile = _.findWhere(service.serviceCapabilityAccessProfileList, {CapabilityName: newVal});

                            $scope.form.CapabilityName.$setValidity('availabilityCheck', _.isUndefined(foundProfile));
                        }
                    });

                    $scope.save = function (serviceCapabilityAccessProfile) {
                        $uibModalInstance.close(serviceCapabilityAccessProfile);
                    };

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                resolve: {
                    serviceCapabilities: function (ApiManagerProvService) {
                        // label e.g., DCB_SERVICE_TRUSTED or DCB_SERVICE_UNTRUSTED
                        var label = '';
                        if (service.serviceProfile && service.serviceProfile.Type) {
                            label = service.serviceProfile.Type;

                            if (service.serviceProfile.Type.startsWith('DCB_') && service.dcbServiceProfile && service.dcbServiceProfile.TrustStatus) {
                                label = label + '_' + service.dcbServiceProfile.TrustStatus
                            }
                        }

                        return ApiManagerProvService.getServiceCapabilityListByLabel(label);
                    }
                }
            });

            modalInstance.result.then(function (serviceCapabilityAccessProfile) {
                service.serviceCapabilityAccessProfileList = service.serviceCapabilityAccessProfileList || [];

                serviceCapabilityAccessProfile.id = _.uniqueId();
                service.serviceCapabilityAccessProfileList.push(serviceCapabilityAccessProfile);
            }, function () {
                //
            });
        };
        $scope.editServiceCapabilityAccessProfile = function (service, serviceCapabilityAccessProfile) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partner-info/services/operations.services.modal.servicecapabilityaccess.html',
                controller: function ($scope, $log, $uibModalInstance, Restangular, serviceCapabilities) {
                    $scope.service = service;

                    $scope.serviceCapabilityList = Restangular.stripRestangular(serviceCapabilities);

                    $scope.serviceCapabilityAccessProfile = angular.copy(serviceCapabilityAccessProfile);
                    $scope.serviceCapabilityAccessProfileOriginal = angular.copy($scope.serviceCapabilityAccessProfile);
                    $scope.isNotChanged = function () {
                        return angular.equals($scope.serviceCapabilityAccessProfile, $scope.serviceCapabilityAccessProfileOriginal);
                    };

                    $scope.$watch('serviceCapabilityAccessProfile.CapabilityName', function (newVal, oldVal) {
                        if (!angular.equals(newVal, oldVal)) {
                            var foundProfile = _.findWhere(service.serviceCapabilityAccessProfileList, {CapabilityName: newVal});

                            var isDifferent = foundProfile ? $scope.serviceCapabilityAccessProfile.id !== foundProfile.id : false;
                            $scope.form.CapabilityName.$setValidity('availabilityCheck', !(isDifferent && foundProfile));
                        }
                    });

                    $scope.save = function (serviceCapabilityAccessProfile) {
                        $uibModalInstance.close(serviceCapabilityAccessProfile);
                    };

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                resolve: {
                    serviceCapabilities: function (ApiManagerProvService) {
                        // label e.g., DCB_SERVICE_TRUSTED or DCB_SERVICE_UNTRUSTED
                        var label = '';
                        if (service.serviceProfile && service.serviceProfile.Type) {
                            label = service.serviceProfile.Type;

                            if (service.serviceProfile.Type.startsWith('DCB_') && service.dcbServiceProfile && service.dcbServiceProfile.TrustStatus) {
                                label = label + '_' + service.dcbServiceProfile.TrustStatus
                            }
                        }

                        return ApiManagerProvService.getServiceCapabilityListByLabel(label);
                    }
                }
            });

            modalInstance.result.then(function (editedServiceCapabilityAccessProfile) {
                var foundServiceCapabilityAccessProfile = _.findWhere(service.serviceCapabilityAccessProfileList, {id: editedServiceCapabilityAccessProfile.id});
                if (foundServiceCapabilityAccessProfile) {
                    foundServiceCapabilityAccessProfile.CapabilityName = editedServiceCapabilityAccessProfile.CapabilityName;
                }
            }, function () {
            });
        };
        $scope.removeServiceCapabilityAccessProfile = function (service, serviceCapabilityAccessProfile) {
            var index = _.indexOf(service.serviceCapabilityAccessProfileList, serviceCapabilityAccessProfile);
            if (index !== -1) {
                service.serviceCapabilityAccessProfileList.splice(index, 1);
            }
        };
        $scope.getServiceCapabilityAccessProfileString = function (serviceCapabilityAccessProfile) {
            var resultStr = serviceCapabilityAccessProfile.CapabilityName;

            return resultStr;
        };

    });

})();
