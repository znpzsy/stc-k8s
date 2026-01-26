(function () {

    'use strict';

    angular.module('partnerportal.partner-info.operations.rbt.bulk.upload', []);

    var PartnerInfoContentManagementBulkRBTUploadModule = angular.module('partnerportal.partner-info.operations.rbt.bulk.upload');

    PartnerInfoContentManagementBulkRBTUploadModule.config(function ($stateProvider) {

        $stateProvider.state('partner-info.operations.rbt.bulk.upload', {
            url: "/upload",
            templateUrl: "partner-info/content/rbt/operations.bulk.upload.html",
            controller: 'PartnerInfoContentManagementBulkRBTUploadCtrl'
        })

    });

    PartnerInfoContentManagementBulkRBTUploadModule.controller('PartnerInfoContentManagementBulkRBTUploadCtrl', function ($scope, $log, $q, $translate, $state, $controller, $filter, notification, UtilService, SessionService, ContentManagementService, CMPFService, FileDownloadService) {
        $log.debug('PartnerInfoContentManagementBulkRBTUploadCtrl');
        $controller('PartnerInfoContentManagementRBTCommonCtrl', {$scope: $scope});

        $scope.sessionOrganization = SessionService.getSessionOrganization();
        $scope.username = SessionService.getUsername();

        $scope.bulkObject = {
            templateFile: undefined,
            templateSample: undefined,
            contentZipFile: undefined,
            contentZipSample: undefined,
            organizationId: $scope.sessionOrganization.id,
        };

        // Get the sample template and content zip file
        if (!$scope.bulkObject.templateSample) {
            var sampleTemplateUrl = ContentManagementService.generateFilePath('partner_bulk_template_csv_sample');
            var sampleTemplate = undefined;
            FileDownloadService.downloadFileAndGetBlob(sampleTemplateUrl, function (blob, fileName) {
                sampleTemplate = blob;
                if (blob) {
                    sampleTemplate.name = fileName;
                }
                $scope.bulkObject.templateSample = sampleTemplate;
            });
        }
        if (!$scope.bulkObject.contentZipSample) {
            var sampleContentUrl = ContentManagementService.generateFilePath('partner_bulk_content_zip_sample');
            var sampleContent = undefined;
            FileDownloadService.downloadFileAndGetBlob(sampleContentUrl, function (blob, fileName) {
                sampleContent = blob;
                if (blob) {
                    sampleContent.name = fileName;
                }
                $scope.bulkObject.contentZipSample = sampleContent;
            });
        }


        $scope.upload = function (bulkObject) {
            $log.debug('Uploading bulk content: ', bulkObject);
            $scope.uploading = true;

            ContentManagementService.uploadBulkContent(bulkObject.templateFile, bulkObject.contentZipFile, bulkObject.organizationId).then(function (response) {
                $log.debug('Upload bulk content response: ', response);
                $scope.uploading = false;

                if (response) {
                    var type = 'warning', message;
                    if (response.code === 2000) {
                        type = 'success';
                        message = $translate.instant('CommonMessages.BulkUploadSucceded');
                        // Do nothing for succeeded content upload.
                    } else if (response.code === 3013) {
                        message = $translate.instant('CommonMessages.GenericServerError');
                    } else if (response.message) {
                        message = response.message.split(':')[0] + '...';
                    } else if (response.data) {
                        if (response.data.message) {
                            message = response.data.message.split(':')[0] + '...';
                        } else {
                            type = 'danger';
                            message = $translate.instant('CommonMessages.HttpError', {errorCode: response.data.status, errorText: response.data.error});
                        }
                    }

                    notification({
                        type: type,
                        text: message
                    });
                    $state.go('partner-info.operations.rbt.bulk.management.list');

                } else {
                    $log.debug('No response from bulk upload service: ', response);

                    $state.transitionTo($state.current, {}, { reload: true, inherit: true, notify: true });
                }

            }, function(response){
                $log.error('Error uploading bulk content: ', response);
                $scope.uploading = false;

                var type = 'danger', message;

                if (response) {
                    if (response.data) {
                        if (response.data.code){
                            message = $translate.instant('CommonMessages.ApiError', {
                                errorCode: response.data.code,
                                errorText: response.data.description
                            });
                        } else if (response.data.message) {
                            message = response.data.message.split(':')[0] + '...';
                        } else {
                            message = $translate.instant('CommonMessages.HttpError', {errorCode: response.data.status, errorText: response.data.error});
                        }

                    } else if (response.message) {
                        message = response.message.split(':')[0] + '...';
                    } else {
                        message = $translate.instant('CommonMessages.GenericServerError');
                    }

                } else {
                    message = $translate.instant('CommonMessages.GenericServerError');
                }

                notification({
                    type: type,
                    text: message
                });

                // Do not reload the sample files by reloading the state, set the form as pristine instead
                $scope.bulkObject.templateFile = undefined;
                $scope.bulkObject.contentZipFile = undefined;
                $scope.form.$setPristine();
                $scope.form.$setUntouched();
                $scope.form.$setValidity();

            });
        };
    });

})();
