(function () {

    'use strict';

    angular.module('partnerportal.partner-info.services.contentbasedsettlement', []);

    var PartnerInfoServiceContentBasedSettlementProfileModule = angular.module('partnerportal.partner-info.services.contentbasedsettlement');

    PartnerInfoServiceContentBasedSettlementProfileModule.controller('PartnerInfoServiceContentBasedSettlementProfileCtrl', function ($scope, $log, $uibModal) {
        $log.debug('PartnerInfoServiceContentBasedSettlementProfileCtrl');

        // ServiceContentBasedSettlementProfile managing methods.
        $scope.addServiceContentBasedSettlementProfile = function (service) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partner-info/services/operations.services.modal.contentbasedsettlement.html',
                controller: function ($scope, $log, $filter, $uibModalInstance, settlementTypes, CMPFService) {
                    $scope.service = service;

                    $scope.settlementTypeList = settlementTypes;

                    $scope.serviceContentBasedSettlementProfile = {
                    };

                    $scope.save = function (serviceContentBasedSettlementProfile) {
                        $uibModalInstance.close(serviceContentBasedSettlementProfile);
                    };

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                resolve: {
                    settlementTypes: function () {
                        return $scope.settlementTypes;
                    }
                }
            });

            modalInstance.result.then(function (serviceContentBasedSettlementProfile) {
                service.contentBasedSettlementList = service.contentBasedSettlementList || [];

                serviceContentBasedSettlementProfile.id = _.uniqueId();
                service.contentBasedSettlementList.push(serviceContentBasedSettlementProfile);
            }, function () {
                //
            });
        };
        $scope.editServiceContentBasedSettlementProfile = function (service, serviceContentBasedSettlementProfile) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partner-info/services/operations.services.modal.contentbasedsettlement.html',
                controller: function ($scope, $log, $filter, $uibModalInstance, settlementTypes, CMPFService) {
                    $scope.service = service;

                    $scope.settlementTypeList = settlementTypes;

                    $scope.serviceContentBasedSettlementProfile = angular.copy(serviceContentBasedSettlementProfile);
                    $scope.serviceContentBasedSettlementProfileOriginal = angular.copy($scope.serviceContentBasedSettlementProfile);
                    $scope.isNotChanged = function () {
                        return angular.equals($scope.serviceContentBasedSettlementProfile, $scope.serviceContentBasedSettlementProfileOriginal);
                    };

                    $scope.save = function (serviceContentBasedSettlementProfile) {
                        $uibModalInstance.close(serviceContentBasedSettlementProfile);
                    };

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                resolve: {
                    settlementTypes: function () {
                        return $scope.settlementTypes;
                    }
                }
            });

            modalInstance.result.then(function (editedServiceContentBasedSettlementProfile) {
                var foundServiceContentBasedSettlementProfile = _.findWhere(service.contentBasedSettlementList, {id: editedServiceContentBasedSettlementProfile.id});
                if (foundServiceContentBasedSettlementProfile) {
                    foundServiceContentBasedSettlementProfile.ContentTypeName = editedServiceContentBasedSettlementProfile.ContentTypeName;
                    foundServiceContentBasedSettlementProfile.ContentTypeID = editedServiceContentBasedSettlementProfile.ContentTypeID;
                    foundServiceContentBasedSettlementProfile.ProductCategoryID = editedServiceContentBasedSettlementProfile.ProductCategoryID;
                    foundServiceContentBasedSettlementProfile.SettlementTypeID = editedServiceContentBasedSettlementProfile.SettlementTypeID;
                }
            }, function () {
            });
        };
        $scope.removeServiceContentBasedSettlementProfile = function (service, serviceContentBasedSettlementProfile) {
            var index = _.indexOf(service.contentBasedSettlementList, serviceContentBasedSettlementProfile);
            if (index !== -1) {
                service.contentBasedSettlementList.splice(index, 1);
            }
        };
        $scope.getServiceContentBasedSettlementProfileString = function (serviceContentBasedSettlementProfile) {
            var foundSettlementType = _.findWhere($scope.settlementTypes, {profileId: serviceContentBasedSettlementProfile.SettlementTypeID});
            if (!foundSettlementType) {
                foundSettlementType = {
                    Name: 'N/A'
                }
            }

            var resultStr = serviceContentBasedSettlementProfile.ContentTypeName +
                (serviceContentBasedSettlementProfile.ContentTypeID ? ', ' + serviceContentBasedSettlementProfile.ContentTypeID : '') +
                (serviceContentBasedSettlementProfile.ProductCategoryID ? ', ' + serviceContentBasedSettlementProfile.ProductCategoryID : '') +
                ', ' + foundSettlementType.Name;

            return resultStr;
        };

    });

})();
