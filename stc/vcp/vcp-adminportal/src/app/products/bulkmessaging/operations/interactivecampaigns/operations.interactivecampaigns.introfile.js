(function () {

    'use strict';

    angular.module('adminportal.products.bulkmessaging.operations.interactivecampaigns.introfile', []);

    var BulkMessagingInteractiveCampaignsOperationsIntroFileModule = angular.module('adminportal.products.bulkmessaging.operations.interactivecampaigns.introfile');

    BulkMessagingInteractiveCampaignsOperationsIntroFileModule.controller('BulkMessagingInteractiveCampaignsOperationsIntroFileCtrl', function ($scope, $log, $uibModal, $filter) {
        $log.debug('BulkMessagingInteractiveCampaignsOperationsIntroFileCtrl');

        // IntroFiles managing methods.
        $scope.addIntroFile = function (campaign) {
            var modalInstance = $uibModal.open({
                templateUrl: 'products/bulkmessaging/operations/interactivecampaigns/operations.interactivecampaigns.introfile.modal.html',
                backdrop: 'static',
                controller: function ($scope, $log, $uibModalInstance, Restangular) {
                    $scope.campaign = campaign;

                    $scope.introFile = {
                        file: null
                    };

                    $scope.save = function (introFile) {
                        $uibModalInstance.close(introFile);
                    };

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                resolve: {}
            });

            modalInstance.result.then(function (introFile) {
                campaign.introFileList = campaign.introFileList || [];

                introFile.id = _.uniqueId();
                campaign.introFileList.push(introFile);
            }, function () {
                //
            });
        };
        $scope.editIntroFile = function (campaign, introFile) {
            var modalInstance = $uibModal.open({
                templateUrl: 'products/bulkmessaging/operations/interactivecampaigns/operations.interactivecampaigns.introfile.modal.html',
                backdrop: 'static',
                controller: function ($scope, $log, $uibModalInstance, Restangular) {
                    $scope.campaign = campaign;

                    $scope.introFile = {
                        id: introFile.id,
                        file: new File([introFile.file], introFile.file.name, {type: introFile.file.type})
                    };

                    $scope.introFileOriginal = {
                        id: introFile.id,
                        file: $scope.introFile.file
                    };

                    $scope.isNotChanged = function () {
                        return angular.equals($scope.introFile, $scope.introFileOriginal);
                    };

                    $scope.save = function (introFile) {
                        $uibModalInstance.close(introFile);
                    };

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                resolve: {}
            });

            modalInstance.result.then(function (editedIntroFile) {
                var foundIntroFile = _.findWhere(campaign.introFileList, {id: editedIntroFile.id});
                if (foundIntroFile) {
                    foundIntroFile.file = editedIntroFile.file;
                }
            }, function () {
            });
        };
        $scope.removeIntroFile = function (campaign, introFile) {
            var index = _.indexOf(campaign.introFileList, introFile);
            if (index !== -1) {
                campaign.introFileList.splice(index, 1);
            }
        };
        $scope.getIntroFileString = function (introFile) {
            var resultStr = introFile.file.name

            return resultStr;
        };

    });

})();
