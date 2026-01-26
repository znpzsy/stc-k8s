(function () {

    'use strict';

    angular.module('partnerportal.partner-info.reporting.reports.reporttemplate', []);

    var ReportingReportsReportTemplateModule = angular.module('partnerportal.partner-info.reporting.reports.reporttemplate');

    ReportingReportsReportTemplateModule.controller('ReportingReportsReportTemplateCtrl', function ($scope, $log, $q, $filter, $translate, notification, $uibModal, DateTimeConstants,
                                                                                                    SessionService, CMPFService) {
        $log.debug("ReportingReportsReportTemplate");

        $scope.getTemplatesForUserAccountByCategory = function (reportCategoryInterval) {
            $scope.reportTemplateList = [];
            $scope.reportTemplate = null;

            var userId = SessionService.getUserId();

            CMPFService.getUserAccount(userId, true, true).then(function (userAccount) {
                // Assign the user account to the current scope.
                $scope.userAccount = userAccount;

                // Get all template records from the cmpf db as profile list.
                var userReportTemplateProfiles = CMPFService.getProfileAttributes(userAccount.profiles, CMPFService.USER_REPORT_TEMPLATE_PROFILE);

                if (userReportTemplateProfiles && userReportTemplateProfiles.length > 0) {
                    userReportTemplateProfiles = _.filter(userReportTemplateProfiles, function (userReportTemplateProfile) {
                        return userReportTemplateProfile.ReportURL === reportCategoryInterval.url;
                    });

                    $scope.reportTemplateList = $filter('orderBy')(userReportTemplateProfiles, ['TemplateName']);
                }
            });
        };

        // Apply the selected template to the actual form.
        $scope.applyReportTemplate = function (reportTemplate) {
            if (reportTemplate && reportTemplate.ReportParams) {
                var ReportParams = JSON.parse(reportTemplate.ReportParams);

                $scope.dateHolder.startDate = moment(ReportParams.startDate).toDate();
                $scope.dateHolder.endDate = moment(ReportParams.endDate).toDate();
                $scope.permanentParams = ReportParams.permanentParams;
                $scope.additionalParams = ReportParams.additionalParams;

                // API Manager specific checks.
                if ($scope.additionalParams.apiName) {
                    $scope.api = _.findWhere($scope.apiList, function(api){
                        return (api.apiName + ' - ' + api.versionName) === $scope.additionalParams.apiName;
                    });
                }

                if (ReportParams.period) {
                    $scope.interval = _.findWhere($scope.reportCategory.intervals, {name: ReportParams.period});
                }

                if (ReportParams.period) {
                    $scope.formatPentaho = _.findWhere($scope.FORMATS_PENTAHO, {name: ReportParams.format});
                }
            }
        };

        // Remove the selected template and update the actual user account.
        $scope.removeReportTemplate = function (reportTemplate) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                $scope.updateUserAccount(reportTemplate, true).then(function (response) {
                    $scope.getTemplatesForUserAccountByCategory($scope.interval);

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                }, function (response) {
                    CMPFService.showApiError(response);
                });
            }, function () {
                //
            });
        };

        // Update the selected template with the actual user account.
        $scope.updateReportTemplate = function (reportTemplate, reportCategory, interval, formatPentaho, dateHolder, permanentParams, additionalParams) {
            var startDate = $filter('date')(dateHolder.startDate, 'yyyy-MM-dd\'T\'HH:mm:ss') + DateTimeConstants.OFFSET;
            var endDate = $filter('date')(dateHolder.endDate, 'yyyy-MM-dd\'T\'HH:mm:ss') + DateTimeConstants.OFFSET;

            reportTemplate.ReportParams = JSON.stringify({
                startDate: startDate,
                endDate: endDate,
                period: interval.name,
                format: formatPentaho.name,
                permanentParams: permanentParams,
                additionalParams: additionalParams
            });

            $scope.updateUserAccount(reportTemplate).then(function (response) {
                $scope.reportTemplate = reportTemplate;

                notification({
                    type: 'success',
                    text: $translate.instant('CommonLabels.OperationSuccessful')
                });
            }, function (response) {
                CMPFService.showApiError(response);
            });
        };

        // Save the actual form as template for the current user account.
        $scope.saveReportTemplate = function (reportCategory, interval, formatPentaho, dateHolder, permanentParams, additionalParams) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partner-info/reporting/reports/reporting.reports.reporttemplate.modal.html',
                controller: function ($scope, $log, $uibModalInstance, reportTemplateList) {
                    $scope.reportTemplateList = reportTemplateList;
                    $scope.reportCategory = reportCategory;

                    var startDate = $filter('date')(dateHolder.startDate, 'yyyy-MM-dd\'T\'HH:mm:ss') + DateTimeConstants.OFFSET;
                    var endDate = $filter('date')(dateHolder.endDate, 'yyyy-MM-dd\'T\'HH:mm:ss') + DateTimeConstants.OFFSET;

                    $scope.reportTemplate = {
                        TemplateName: '',
                        ReportURL: interval.url,
                        ReportParams: JSON.stringify({
                            startDate: startDate,
                            endDate: endDate,
                            period: interval.name,
                            format: formatPentaho.name,
                            permanentParams: permanentParams,
                            additionalParams: additionalParams
                        })
                    };

                    $scope.$watch('reportTemplate.TemplateName', function (newVal, oldVal) {
                        if (!angular.equals(newVal, oldVal)) {
                            var foundTemplate = _.findWhere($scope.reportTemplateList, {TemplateName: newVal});

                            $scope.form.TemplateName.$setValidity('availabilityCheck', _.isUndefined(foundTemplate));
                        }
                    });

                    $scope.save = function (reportTemplate) {
                        $uibModalInstance.close(reportTemplate);
                    };

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                resolve: {
                    reportTemplateList: function () {
                        return $scope.reportTemplateList;
                    }
                }
            });

            modalInstance.result.then(function (reportTemplate) {
                $scope.updateUserAccount(reportTemplate).then(function (response) {
                    $scope.getTemplatesForUserAccountByCategory($scope.interval);

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                }, function (response) {
                    CMPFService.showApiError(response);
                });
            }, function () {
                //
            });
        };

        // Update method.
        $scope.updateUserAccount = function (userReportTemplate, isDelete) {
            var deferred = $q.defer();

            var currentTimestamp = $filter('date')(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss');

            $log.debug('Trying update user account: ', $scope.userAccount, userReportTemplate);

            var userAccountItem = {
                id: $scope.userAccount.id,
                userName: $scope.userAccount.userName,
                password: $scope.userAccount.password,
                state: $scope.userAccount.state,
                organization: $scope.userAccount.organization,
                organizationId: $scope.userAccount.organizationId,
                userGroups: $scope.userAccount.userGroups,
                // Profiles
                profiles: angular.copy($scope.userAccount.profiles)
            };

            var originalUserReportTemplateProfiles = CMPFService.findProfilesByName(userAccountItem.profiles, CMPFService.USER_REPORT_TEMPLATE_PROFILE);

            var updatedUserReportTemplateProfile = JSON.parse(angular.toJson(userReportTemplate));

            var originalUserReportTemplateProfile = _.findWhere(originalUserReportTemplateProfiles, {id: updatedUserReportTemplateProfile.profileId});

            if (isDelete) {
                userAccountItem.profiles = _.without(userAccountItem.profiles, originalUserReportTemplateProfile);
            } else {
                var userReportTemplateProfileAttrArray = CMPFService.prepareProfile(updatedUserReportTemplateProfile, originalUserReportTemplateProfile);
                // ---
                if (originalUserReportTemplateProfile) {
                    originalUserReportTemplateProfile.attributes = userReportTemplateProfileAttrArray;
                } else {
                    var userReportTemplateProfile = {
                        name: CMPFService.USER_REPORT_TEMPLATE_PROFILE,
                        profileDefinitionName: CMPFService.USER_REPORT_TEMPLATE_PROFILE,
                        attributes: userReportTemplateProfileAttrArray
                    };

                    userAccountItem.profiles.push(userReportTemplateProfile);
                }
            }

            // EntityAuditProfile
            var originalEntityAuditProfile = CMPFService.findProfileByName(userAccountItem.profiles, CMPFService.ENTITY_AUDIT_PROFILE);
            $scope.userAccount.entityAuditProfile = {
                LastUpdatedBy: SessionService.getUsername(),
                LastUpdatedOn: currentTimestamp,
                LastUpdateApprovedBy: SessionService.getUsername(),
                LastUpdateApprovedOn: currentTimestamp
            };
            var updatedEntityAuditProfile = JSON.parse(angular.toJson($scope.userAccount.entityAuditProfile));
            var entityAuditProfileArray = CMPFService.prepareProfile(updatedEntityAuditProfile, originalEntityAuditProfile);
            // ---
            if (originalEntityAuditProfile) {
                originalEntityAuditProfile.attributes = entityAuditProfileArray;
            } else {
                var entityAuditProfile = {
                    name: CMPFService.ENTITY_AUDIT_PROFILE,
                    profileDefinitionName: CMPFService.ENTITY_AUDIT_PROFILE,
                    attributes: entityAuditProfileArray
                };

                userAccountItem.profiles.push(entityAuditProfile);
            }

            CMPFService.updateUserAccount(userAccountItem).then(function (response) {
                $log.debug('Update Success. Response: ', response);

                if (response && response.errorCode) {
                    deferred.reject(response)
                } else {
                    deferred.resolve(response)
                }
            }, function (response) {
                $log.debug('Cannot save the userAccount. Error: ', response);

                deferred.reject(response)
            });

            return deferred.promise;
        };
    });

})();
