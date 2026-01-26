(function () {

    'use strict';

    angular.module('partnerportal.partner-info.services.templates', []);

    var PartnerInfoServicesTemplatesModule = angular.module('partnerportal.partner-info.services.templates');

    PartnerInfoServicesTemplatesModule.controller('PartnerInfoServicesTemplatesCtrl', function ($scope, $log, $uibModal) {
        $log.debug('PartnerInfoServicesTemplatesCtrl');

        var templateProfiles = {
            'ALERTS': {
                templateUrl: 'partner-info/services/operations.services.modal.alerttemplate.html',
                controller: 'PartnerInfoServicesTemplatesAlertsModalInstanceCtrl'
            },
            'ON_DEMAND': {
                templateUrl: 'partner-info/services/operations.services.modal.ondemandtemplate.html',
                controller: 'PartnerInfoServicesTemplatesOnDemandModalInstanceCtrl'
            },
            'OTHER': {
                templateUrl: 'partner-info/services/operations.services.modal.othertemplate.html',
                controller: 'PartnerInfoServicesTemplatesOtherModalInstanceCtrl'
            },
            'SEQUENTIAL': {
                templateUrl: 'partner-info/services/operations.services.modal.alerttemplate.html',
                controller: 'PartnerInfoServicesTemplatesAlertsModalInstanceCtrl'
            }
        };

        $scope.changeTemplate = function () {
            delete $scope.service.templateAttributes;
            delete $scope.templateAttributesForm;
        };

        $scope.showTemplateAttributes = function (template) {
            var modalInstance = $uibModal.open({
                templateUrl: templateProfiles[template].templateUrl,
                controller: templateProfiles[template].controller,
                resolve: {
                    service: function () {
                        return $scope.service;
                    },
                    itemName: function () {
                        return $scope.service.name;
                    },
                    templateAttributes: function () {
                        return _.deepClone($scope.service.templateAttributes);
                    }
                }
            });

            modalInstance.result.then(function (result) {
                $scope.service.templateAttributes = result.templateAttributes;
                $scope.templateAttributesForm = result.templateAttributesForm;
            }, function () {
                //
            });
        };
    });

    PartnerInfoServicesTemplatesModule.controller('PartnerInfoServicesTemplatesCommonCtrl', function ($scope, $log, $uibModal, $uibModalInstance, SERVICE_ALERT_SCHEDULING_TYPES, SERVICE_CYCLE_PERIODS,
                                                                                                      DAYS_OF_WEEK) {
        $log.debug('PartnerInfoServicesTemplatesCommonCtrl');

        $scope.SERVICE_ALERT_SCHEDULING_TYPES = SERVICE_ALERT_SCHEDULING_TYPES;
        $scope.SERVICE_CYCLE_PERIODS = SERVICE_CYCLE_PERIODS;
        $scope.DAYS_OF_WEEK = DAYS_OF_WEEK;

        $scope.save = function (templateAttributes, templateAttributesForm) {
            $uibModalInstance.close({
                templateAttributes: templateAttributes,
                templateAttributesForm: templateAttributesForm
            });
        };

        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });

    PartnerInfoServicesTemplatesModule.controller('PartnerInfoServicesTemplatesAlertsModalInstanceCtrl', function ($scope, $log, $controller, $filter, $uibModalInstance, UtilService, service, itemName,
                                                                                                                   templateAttributes) {
        $log.debug('PartnerInfoServicesTemplatesAlertsModalInstanceCtrl');

        $controller('PartnerInfoServicesTemplatesCommonCtrl', {
            $scope: $scope,
            $uibModalInstance: $uibModalInstance
        });

        $scope.service = service;
        $scope.itemName = itemName;

        // Initialize the date/time/day selectors
        $scope.timeOfDay = UtilService.calculateDate(new Date(), 0, 0);
        $scope.daysOfMonth = _.range(1, 32);
        $scope.dayOfMonth = 1;

        if (templateAttributes) {
            $scope.alertTemplateProfile = templateAttributes;

            $scope.dummyDaysOfWeek = [];
            _.each($scope.DAYS_OF_WEEK, function (dayOfWeek, index) {
                $scope.dummyDaysOfWeek[index] = _.contains($scope.alertTemplateProfile.DaysOfWeek, dayOfWeek.abbr);
            });
        } else {
            $scope.alertTemplateProfile = {
                IsDynamicContent: false,
                DynamicContentURL: null,
                IsTriggerSending: false,
                AlertScheduling: null,
                CyclePeriod: null,
                TimesOfDay: null,
                DaysOfWeek: null,
                DaysOfMonth: null
            };
        }

        $scope.alertTemplateProfileOriginal = angular.copy($scope.alertTemplateProfile);
        $scope.isNotChanged = function () {
            return angular.equals($scope.alertTemplateProfile, $scope.alertTemplateProfileOriginal);
        };

        // Time of day
        $scope.addTime = function (timeOfDay) {
            if ($scope.alertTemplateProfile.TimesOfDay === null) {
                $scope.alertTemplateProfile.TimesOfDay = [];
            }

            var formattedTimeOfDay = $filter('date')(timeOfDay, 'HH:mm:ss');

            var index = _.indexOf($scope.alertTemplateProfile.TimesOfDay, formattedTimeOfDay);
            if (index === -1) {
                $scope.alertTemplateProfile.TimesOfDay.unshift(formattedTimeOfDay);
            }
        };
        $scope.removeTime = function (timeOfDay) {
            var formattedTimeOfDay = $filter('date')(timeOfDay, 'HH:mm:ss');

            var index = _.indexOf($scope.alertTemplateProfile.TimesOfDay, formattedTimeOfDay);
            if (index !== -1) {
                $scope.alertTemplateProfile.TimesOfDay.splice(index, 1);
            }
        };

        // Day of week
        $scope.toggleDaysOfWeek = function (abbr, isChecked) {
            if ($scope.alertTemplateProfile.DaysOfWeek === null) {
                $scope.alertTemplateProfile.DaysOfWeek = [];
            }

            if (isChecked) {
                $scope.alertTemplateProfile.DaysOfWeek.push(abbr);
            } else {
                $scope.alertTemplateProfile.DaysOfWeek = _.without($scope.alertTemplateProfile.DaysOfWeek, abbr);
            }

            $scope.alertTemplateProfile.DaysOfWeek = $filter('orderBy')($scope.alertTemplateProfile.DaysOfWeek);
        };

        // Day of month
        $scope.addDayOfMonth = function (dayOfMonth) {
            if ($scope.alertTemplateProfile.DaysOfMonth === null) {
                $scope.alertTemplateProfile.DaysOfMonth = [];
            }

            var index = _.indexOf($scope.alertTemplateProfile.DaysOfMonth, dayOfMonth);
            if (index === -1) {
                $scope.alertTemplateProfile.DaysOfMonth.unshift(dayOfMonth);
            }
        };
        $scope.removeDayOfMonth = function (dayOfMonth) {
            var index = _.indexOf($scope.alertTemplateProfile.DaysOfMonth, dayOfMonth);
            if (index !== -1) {
                $scope.alertTemplateProfile.DaysOfMonth.splice(index, 1);
            }
        };

    });

    PartnerInfoServicesTemplatesModule.controller('PartnerInfoServicesTemplatesOnDemandModalInstanceCtrl', function ($scope, $log, $controller, $uibModalInstance, service, itemName, templateAttributes) {
        $log.debug('PartnerInfoServicesTemplatesOnDemandModalInstanceCtrl');

        $controller('PartnerInfoServicesTemplatesCommonCtrl', {
            $scope: $scope,
            $uibModalInstance: $uibModalInstance
        });

        $scope.service = service;
        $scope.itemName = itemName;

        // Initialize the date/t
        if (templateAttributes) {
            $scope.onDemandTemplateProfile = templateAttributes;
        } else {
            $scope.onDemandTemplateProfile = {
                IsDynamicContent: false,
                DynamicContentURL: null,
                ResponseMessageLangEN: null,
                ResponseMessageLangOther: null,
                ServiceProposalFileID: null
            };
        }

        $scope.initServiceProposalFile = function (file) {
            if ($scope.service.id && file) {
                file.name = file.$ngfName || file.name;
                $scope.onDemandTemplateProfileOriginal = angular.copy($scope.onDemandTemplateProfile);
            }
        };

        $scope.onDemandTemplateProfileOriginal = angular.copy($scope.onDemandTemplateProfile);
        $scope.isNotChanged = function () {
            return angular.equals($scope.onDemandTemplateProfile, $scope.onDemandTemplateProfileOriginal);
        };

    });

    PartnerInfoServicesTemplatesModule.controller('PartnerInfoServicesTemplatesOtherModalInstanceCtrl', function ($scope, $log, $controller, $uibModalInstance, service, itemName, templateAttributes) {
        $log.debug('PartnerInfoServicesTemplatesOtherModalInstanceCtrl');

        $controller('PartnerInfoServicesTemplatesCommonCtrl', {
            $scope: $scope,
            $uibModalInstance: $uibModalInstance
        });

        $scope.service = service;
        $scope.itemName = itemName;

        // Initialize the date/t
        if (templateAttributes) {
            $scope.otherTemplateProfile = templateAttributes;
        } else {
            $scope.otherTemplateProfile = {
                IsDynamicContent: false,
                DynamicContentURL: null,
                IsTriggerSending: false,
                IsChapteredContent: false,
                ServiceProposalFileID: null
            };
        }
        $scope.initServiceProposalFile = function (file) {
            if ($scope.service.id && file) {
                file.name = file.$ngfName || file.name;
                $scope.otherTemplateProfileOriginal = angular.copy($scope.otherTemplateProfile);
            }
        };

        $scope.otherTemplateProfileOriginal = angular.copy($scope.otherTemplateProfile);
        $scope.isNotChanged = function () {
            return angular.equals($scope.otherTemplateProfile, $scope.otherTemplateProfileOriginal);
        };

    });

})();
