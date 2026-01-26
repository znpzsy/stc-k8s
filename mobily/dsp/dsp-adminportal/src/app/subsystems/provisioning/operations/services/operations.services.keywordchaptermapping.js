(function () {

    'use strict';

    angular.module('adminportal.subsystems.provisioning.operations.services.keywordchaptermapping', []);

    var ProvisioningOperationsKeywordChapterMappingModule = angular.module('adminportal.subsystems.provisioning.operations.services.keywordchaptermapping');

    ProvisioningOperationsKeywordChapterMappingModule.controller('ProvisioningOperationsKeywordChapterMappingCtrl', function ($scope, $log, $uibModal) {
        $log.debug('ProvisioningOperationsKeywordChapterMappingCtrl');

        // KeywordChapterMappings managing methods.
        $scope.addKeywordChapterMappingProfile = function (service) {
            var modalInstance = $uibModal.open({
                templateUrl: 'subsystems/provisioning/operations/services/operations.services.modal.keywordchaptermapping.html',
                controller: function ($scope, $log, $uibModalInstance) {
                    $scope.service = service;

                    $scope.keywordChapterMappingProfile = {};

                    $scope.save = function (keywordChapterMappingProfile) {
                        $uibModalInstance.close(keywordChapterMappingProfile);
                    };

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                resolve: {}
            });

            modalInstance.result.then(function (keywordChapterMappingProfile) {
                service.keywordChapterMappingList = service.keywordChapterMappingList || [];

                keywordChapterMappingProfile.id = _.uniqueId();
                service.keywordChapterMappingList.push(keywordChapterMappingProfile);
            }, function () {
                //
            });
        };
        $scope.editKeywordChapterMappingProfile = function (service, keywordChapterMappingProfile) {
            var modalInstance = $uibModal.open({
                templateUrl: 'subsystems/provisioning/operations/services/operations.services.modal.keywordchaptermapping.html',
                controller: function ($scope, $log, $uibModalInstance) {
                    $scope.service = service;

                    $scope.keywordChapterMappingProfile = angular.copy(keywordChapterMappingProfile);
                    $scope.keywordChapterMappingProfileOriginal = angular.copy($scope.keywordChapterMappingProfile);
                    $scope.isNotChanged = function () {
                        return angular.equals($scope.keywordChapterMappingProfile, $scope.keywordChapterMappingProfileOriginal);
                    };

                    $scope.save = function (keywordChapterMappingProfile) {
                        $uibModalInstance.close(keywordChapterMappingProfile);
                    };

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                resolve: {}
            });

            modalInstance.result.then(function (editedKeywordChapterMappingProfile) {
                var foundKeywordChapterMappingProfile = _.findWhere(service.keywordChapterMappingList, {id: editedKeywordChapterMappingProfile.id});
                if (foundKeywordChapterMappingProfile) {
                    foundKeywordChapterMappingProfile.ChapterKeyword = editedKeywordChapterMappingProfile.ChapterKeyword;
                    foundKeywordChapterMappingProfile.ChapterId = editedKeywordChapterMappingProfile.ChapterId;
                }
            }, function () {
            });
        };
        $scope.removeKeywordChapterMappingProfile = function (service, keywordChapterMappingProfile) {
            var index = _.indexOf(service.keywordChapterMappingList, keywordChapterMappingProfile);
            if (index !== -1) {
                service.keywordChapterMappingList.splice(index, 1);
            }
        };
        $scope.getKeywordChapterMappingProfileString = function (keywordChapterMappingProfile) {
            var resultStr = 'Chapter Keyword: ' + keywordChapterMappingProfile.ChapterKeyword +
                ', Chapter ID: ' + keywordChapterMappingProfile.ChapterId;

            return resultStr;
        };

    });

})();
