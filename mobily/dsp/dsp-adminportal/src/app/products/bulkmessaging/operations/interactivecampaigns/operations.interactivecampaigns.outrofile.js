(function () {

    'use strict';

    angular.module('adminportal.products.bulkmessaging.operations.interactivecampaigns.outrofile', []);

    var BulkMessagingInteractiveCampaignsOperationsOutroFileModule = angular.module('adminportal.products.bulkmessaging.operations.interactivecampaigns.outrofile');

    BulkMessagingInteractiveCampaignsOperationsOutroFileModule.controller('BulkMessagingInteractiveCampaignsOperationsOutroFileCtrl', function ($scope, $log, $uibModal, $filter) {
        $log.debug('BulkMessagingInteractiveCampaignsOperationsOutroFileCtrl');

        // OutroFiles managing methods.
        $scope.addOutroFile = function (campaign) {
            var modalInstance = $uibModal.open({
                templateUrl: 'products/bulkmessaging/operations/interactivecampaigns/operations.interactivecampaigns.outrofile.modal.html',
                backdrop: 'static',
                controller: function ($scope, $log, $uibModalInstance, Restangular) {
                    $scope.campaign = campaign;

                    $scope.outroFile = {
                        file: null
                    };

                    $scope.save = function (outroFile) {
                        $uibModalInstance.close(outroFile);
                    };

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                resolve: {}
            });

            modalInstance.result.then(function (outroFile) {
                campaign.outroFileList = campaign.outroFileList || [];

                outroFile.id = _.uniqueId();
                campaign.outroFileList.push(outroFile);
            }, function () {
                //
            });
        };
        $scope.editOutroFile = function (campaign, outroFile) {
            var modalInstance = $uibModal.open({
                templateUrl: 'products/bulkmessaging/operations/interactivecampaigns/operations.interactivecampaigns.outrofile.modal.html',
                backdrop: 'static',
                controller: function ($scope, $log, $uibModalInstance, Restangular) {
                    $scope.campaign = campaign;

                    $scope.outroFile = {
                        id: outroFile.id,
                        file: new File([outroFile.file], outroFile.file.name, {type: outroFile.file.type})
                    };

                    $scope.outroFileOriginal = {
                        id: outroFile.id,
                        file: $scope.outroFile.file
                    };

                    $scope.isNotChanged = function () {
                        return angular.equals($scope.outroFile, $scope.outroFileOriginal);
                    };

                    $scope.save = function (outroFile) {
                        $uibModalInstance.close(outroFile);
                    };

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                resolve: {}
            });

            modalInstance.result.then(function (editedOutroFile) {
                var foundOutroFile = _.findWhere(campaign.outroFileList, {id: editedOutroFile.id});
                if (foundOutroFile) {
                    foundOutroFile.file = editedOutroFile.file;
                }
            }, function () {
            });
        };
        $scope.removeOutroFile = function (campaign, outroFile) {
            var index = _.indexOf(campaign.outroFileList, outroFile);
            if (index !== -1) {
                campaign.outroFileList.splice(index, 1);
            }
        };
        $scope.getOutroFileString = function (outroFile) {
            var resultStr = outroFile.file.name

            return resultStr;
        };

    });

})();
