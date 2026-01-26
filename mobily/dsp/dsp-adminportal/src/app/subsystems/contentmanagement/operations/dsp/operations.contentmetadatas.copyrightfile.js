(function () {

    'use strict';

    angular.module('adminportal.subsystems.contentmanagement.operations.dsp.contentmetadatas.copyrightfile', []);

    var ContentManagementOperationsContentMetadatasCopyrightFileModule = angular.module('adminportal.subsystems.contentmanagement.operations.dsp.contentmetadatas.copyrightfile');

    ContentManagementOperationsContentMetadatasCopyrightFileModule.controller('ContentManagementOperationsContentMetadatasCopyrightFileCtrl', function ($scope, $log, $uibModal, $filter, DateTimeConstants) {
        $log.debug('ContentManagementOperationsContentMetadatasCopyrightFileCtrl');

        // CopyrightFiles managing methods.
        $scope.addCopyrightFile = function (contentMetadata) {
            var modalInstance = $uibModal.open({
                templateUrl: 'subsystems/contentmanagement/operations/dsp/operations.contentmetadatas.copyrightfile.modal.html',
                controller: function ($scope, $log, $uibModalInstance, Restangular) {
                    $scope.contentMetadata = contentMetadata;

                    $scope.hstep = 1;
                    $scope.mstep = 1;

                    $scope.dateFormat = 'MMMM d, y';
                    $scope.dateOptions = {
                        formatYear: 'yy',
                        startingDay: 1,
                        showWeeks: false
                    };

                    $scope.openStartDatePicker = function ($event) {
                        $event.preventDefault();
                        $event.stopPropagation();
                        $scope.startDatePicker = {
                            opened: true
                        };
                    };
                    $scope.openEndDatePicker = function ($event) {
                        $event.preventDefault();
                        $event.stopPropagation();
                        $scope.endDatePicker = {
                            opened: true
                        };
                    };

                    $scope.copyrightFile = {
                        copyrightFile: null,
                        startDate: moment().startOf('day').toDate(),
                        endDate: moment().endOf('day').add(1, 'years').toDate()
                    };

                    $scope.save = function (copyrightFile) {
                        $uibModalInstance.close(copyrightFile);
                    };

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                resolve: {}
            });

            modalInstance.result.then(function (copyrightFile) {
                contentMetadata.copyrightFileList = contentMetadata.copyrightFileList || [];

                copyrightFile.id = _.uniqueId();
                contentMetadata.copyrightFileList.push(copyrightFile);
            }, function () {
                //
            });
        };
        $scope.editCopyrightFile = function (contentMetadata, copyrightFile) {
            var modalInstance = $uibModal.open({
                templateUrl: 'subsystems/contentmanagement/operations/dsp/operations.contentmetadatas.copyrightfile.modal.html',
                controller: function ($scope, $log, $uibModalInstance, Restangular) {
                    $scope.contentMetadata = contentMetadata;

                    $scope.hstep = 1;
                    $scope.mstep = 1;

                    $scope.dateFormat = 'MMMM d, y';
                    $scope.dateOptions = {
                        formatYear: 'yy',
                        startingDay: 1,
                        showWeeks: false
                    };

                    $scope.openStartDatePicker = function ($event) {
                        $event.preventDefault();
                        $event.stopPropagation();
                        $scope.startDatePicker = {
                            opened: true
                        };
                    };
                    $scope.openEndDatePicker = function ($event) {
                        $event.preventDefault();
                        $event.stopPropagation();
                        $scope.endDatePicker = {
                            opened: true
                        };
                    };

                    $scope.copyrightFile = _.deepClone(copyrightFile);
                    $scope.copyrightFile.copyrightFile = new File([copyrightFile.copyrightFile], copyrightFile.copyrightFile.name, {type: copyrightFile.copyrightFile.type});
                    $scope.copyrightFile.startDate = copyrightFile.startDate;
                    $scope.copyrightFile.endDate = copyrightFile.endDate;

                    $scope.copyrightFileOriginal = _.deepClone($scope.copyrightFile);
                    $scope.copyrightFileOriginal.copyrightFile = new File([$scope.copyrightFile.copyrightFile], $scope.copyrightFile.copyrightFile.name, {type: $scope.copyrightFile.copyrightFile.type});
                    $scope.copyrightFileOriginal.startDate = $scope.copyrightFile.startDate;
                    $scope.copyrightFileOriginal.endDate = $scope.copyrightFile.endDate;

                    $scope.isNotChanged = function () {
                        var isQuestionsEquals = true;
                        if ($scope.copyrightFile.copyrightFile) {
                            isQuestionsEquals = isQuestionsEquals && ($scope.copyrightFileOriginal.copyrightFile.name === $scope.copyrightFile.copyrightFile.name &&
                                $scope.copyrightFileOriginal.copyrightFile.size === $scope.copyrightFile.copyrightFile.size &&
                                $scope.copyrightFileOriginal.copyrightFile.type === $scope.copyrightFile.copyrightFile.type);

                            isQuestionsEquals = isQuestionsEquals && _.isEqual($scope.copyrightFileOriginal.startDate, $scope.copyrightFile.startDate);
                            isQuestionsEquals = isQuestionsEquals && _.isEqual($scope.copyrightFileOriginal.endDate, $scope.copyrightFile.endDate);
                        }

                        return isQuestionsEquals;
                    };

                    $scope.save = function (copyrightFile) {
                        $uibModalInstance.close(copyrightFile);
                    };

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                resolve: {}
            });

            modalInstance.result.then(function (editedCopyrightFile) {
                var foundCopyrightFile = _.findWhere(contentMetadata.copyrightFileList, {id: editedCopyrightFile.id});
                if (foundCopyrightFile) {
                    foundCopyrightFile.copyrightFile = editedCopyrightFile.copyrightFile;
                    foundCopyrightFile.startDate = editedCopyrightFile.startDate;
                    foundCopyrightFile.endDate = editedCopyrightFile.endDate;
                }
            }, function () {
            });
        };
        $scope.removeCopyrightFile = function (contentMetadata, copyrightFile) {
            var index = _.indexOf(contentMetadata.copyrightFileList, copyrightFile);
            if (index !== -1) {
                contentMetadata.copyrightFileList.splice(index, 1);
            }
        };
        $scope.getCopyrightFileString = function (copyrightFile) {
            var resultStr = copyrightFile.copyrightFile.name + ', ' +
                $filter('date')(copyrightFile.startDate, 'MMMM d, y', DateTimeConstants.OFFSET) + ' - ' +
                $filter('date')(copyrightFile.endDate, 'MMMM d, y', DateTimeConstants.OFFSET) + '';

            return resultStr;
        };

    });

})();
