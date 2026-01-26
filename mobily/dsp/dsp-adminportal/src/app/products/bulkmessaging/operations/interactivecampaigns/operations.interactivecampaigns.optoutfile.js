(function () {

    'use strict';

    angular.module('adminportal.products.bulkmessaging.operations.interactivecampaigns.optoutfile', []);

    var BulkMessagingInteractiveCampaignsOperationsOptOutFileModule = angular.module('adminportal.products.bulkmessaging.operations.interactivecampaigns.optoutfile');

    BulkMessagingInteractiveCampaignsOperationsOptOutFileModule.controller('BulkMessagingInteractiveCampaignsOperationsOptOutFileCtrl', function ($scope, $log, $uibModal, $filter) {
        $log.debug('BulkMessagingInteractiveCampaignsOperationsOptOutFileCtrl');

        // OptOutFiles managing methods.
        $scope.addOptOutFile = function (campaign) {
            var modalInstance = $uibModal.open({
                templateUrl: 'products/bulkmessaging/operations/interactivecampaigns/operations.interactivecampaigns.optoutfile.modal.html',
                backdrop: 'static',
                controller: function ($scope, $log, $uibModalInstance, Restangular) {
                    $scope.campaign = campaign;

                    $scope.optOutFile = {
                        file: null
                    };

                    $scope.save = function (optOutFile) {
                        $uibModalInstance.close(optOutFile);
                    };

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                resolve: {}
            });

            modalInstance.result.then(function (optOutFile) {
                campaign.optOutFileList = campaign.optOutFileList || [];

                optOutFile.id = _.uniqueId();
                campaign.optOutFileList.push(optOutFile);
            }, function () {
                //
            });
        };
        $scope.editOptOutFile = function (campaign, optOutFile) {
            var modalInstance = $uibModal.open({
                templateUrl: 'products/bulkmessaging/operations/interactivecampaigns/operations.interactivecampaigns.optoutfile.modal.html',
                backdrop: 'static',
                controller: function ($scope, $log, $uibModalInstance, Restangular) {
                    $scope.campaign = campaign;

                    $scope.optOutFile = {
                        id: optOutFile.id,
                        file: new File([optOutFile.file], optOutFile.file.name, {type: optOutFile.file.type})
                    };

                    $scope.optOutFileOriginal = {
                        id: optOutFile.id,
                        file: $scope.optOutFile.file
                    };

                    $scope.isNotChanged = function () {
                        return angular.equals($scope.optOutFile, $scope.optOutFileOriginal);
                    };

                    $scope.save = function (optOutFile) {
                        $uibModalInstance.close(optOutFile);
                    };

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                resolve: {}
            });

            modalInstance.result.then(function (editedOptOutFile) {
                var foundOptOutFile = _.findWhere(campaign.optOutFileList, {id: editedOptOutFile.id});
                if (foundOptOutFile) {
                    foundOptOutFile.file = editedOptOutFile.file;
                }
            }, function () {
            });
        };
        $scope.removeOptOutFile = function (campaign, optOutFile) {
            var index = _.indexOf(campaign.optOutFileList, optOutFile);
            if (index !== -1) {
                campaign.optOutFileList.splice(index, 1);
            }
        };
        $scope.getOptOutFileString = function (optOutFile) {
            var resultStr = optOutFile.file.name

            return resultStr;
        };

    });

})();
