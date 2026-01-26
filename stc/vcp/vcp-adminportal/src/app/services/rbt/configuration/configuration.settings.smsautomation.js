(function () {

    'use strict';

    angular.module('adminportal.services.rbt.configuration.settings.sa', []);

    var RBTConfigurationSettingsSMSAutoModule = angular.module('adminportal.services.rbt.configuration.settings.sa');

    RBTConfigurationSettingsSMSAutoModule.config(function ($stateProvider) {

        $stateProvider.state('services.rbt.configuration.settings.sa', {
            url: "/sms-automation",
            templateUrl: "services/rbt/configuration/configuration.settings.smsautomation.html",
            controller: 'RBTConfigurationSettingsSMSAutomationCtrl',
            resolve: {
                smsAutomationService: function (RBTSMSAutomationService) {
                    return RBTSMSAutomationService.getSMSAutomationService();
                }
            }
        })

    });

    RBTConfigurationSettingsSMSAutoModule.controller('RBTConfigurationSettingsSMSAutomationCtrl', function ($scope, $log, $state, $translate, $filter, notification, UtilService, RBTSMSAutomationService, smsAutomationService) {
        $log.debug('RBTConfigurationSettingsSMSAutomationCtrl');

        if(smsAutomationService === undefined){
            smsAutomationService = {
                smsAutomationServiceEnabled:false,
                workingHoursStartTime:  "",
                workingHoursEndTime: ""
            }
        }else{
            if (smsAutomationService.smsAutomationWorkingHours && smsAutomationService.smsAutomationWorkingHours.includes('-')) {
                var parts = smsAutomationService.smsAutomationWorkingHours.split('-');
                smsAutomationService.workingHoursStartTime = parts[0].trim();
                smsAutomationService.workingHoursEndTime = parts[1].trim();
            }
        }

        $scope.serviceProfile = smsAutomationService;

        var workingHoursStartTimeMoment = moment($scope.serviceProfile.workingHoursStartTime, 'HH:mm:ss');
        if (workingHoursStartTimeMoment.isValid()) {
            $scope.serviceProfile.workingHoursStartTime = workingHoursStartTimeMoment.toDate();
        } else {
            $scope.serviceProfile.workingHoursStartTime = null;
        }
        var workingHoursEndTimeMoment = moment($scope.serviceProfile.workingHoursEndTime, 'HH:mm:ss');
        if (workingHoursEndTimeMoment.isValid()) {
            $scope.serviceProfile.workingHoursEndTime = workingHoursEndTimeMoment.toDate();
        } else {
            $scope.serviceProfile.workingHoursEndTime = null;
        }

        $scope.originalServiceProfile = angular.copy($scope.serviceProfile);

        $scope.isNotChanged = function () {
            return angular.equals($scope.originalServiceProfile, $scope.serviceProfile);
        };

        $scope.save = function (serviceProfile) {

            var serviceProfileItem = {
                  smsAutomationServiceEnabled: serviceProfile.smsAutomationServiceEnabled,
                  smsAutomationWorkingHours: concatTime(serviceProfile),
                  smsAutomationFrequencyDays: serviceProfile.smsAutomationFrequencyDays,
                  promotionPeriodCount : serviceProfile.promotionPeriodCount
              }

            $log.debug('Updating sms automation service profile: ', serviceProfileItem);

            RBTSMSAutomationService.updateSMSAutomationService(serviceProfileItem).then(function (response) {
                  $log.debug('Updated sms automation service profile: ', serviceProfileItem, ', response: ', response);

                  $scope.originalServiceProfile = angular.copy(serviceProfile);

                  notification({
                      type: 'success',
                      text: $translate.instant('CommonLabels.OperationSuccessful')
                  });
              }, function (response) {
                  $log.debug('Cannot update sms automation service profile: ', serviceProfileItem, ', response: ', response);
            });
          };

        $scope.cancel = function () {
            $state.go($state.$current, null, {reload: true});
        };

        function concatTime(serviceProfile) {
            return $filter('date')(serviceProfile.workingHoursStartTime, "HH:mm") + "-" + $filter('date')(serviceProfile.workingHoursEndTime, "HH:mm");

        }

        $scope.$watch('serviceProfile.workingHoursStartTime', function (newValue, oldValue) {

            var start = $scope.serviceProfile.workingHoursStartTime;
            var end = $scope.serviceProfile.workingHoursEndTime;

            var startMs = start.getHours() * 60 + start.getMinutes();
            var endMs = end.getHours() * 60 + end.getMinutes();
            if (startMs >= endMs) {
                UtilService.setError($scope.form, 'workingHoursStartTime', 'maxTime', false);
                UtilService.setError($scope.form, 'workingHoursEndTime', 'minTime', true);
            }else{
                UtilService.setError($scope.form, 'workingHoursStartTime', 'maxTime', true);
                UtilService.setError($scope.form, 'workingHoursEndTime', 'minTime', true);
            }
        });

        $scope.$watch('serviceProfile.workingHoursEndTime', function (newValue, oldValue) {

            var start = $scope.serviceProfile.workingHoursStartTime;
            var end = $scope.serviceProfile.workingHoursEndTime;

            var startMs = start.getHours() * 60 + start.getMinutes();
            var endMs = end.getHours() * 60 + end.getMinutes();
            if (endMs<= startMs) {
                UtilService.setError($scope.form, 'workingHoursEndTime', 'minTime', false);
                UtilService.setError($scope.form, 'workingHoursStartTime', 'maxTime', true);
            }else{
                UtilService.setError($scope.form, 'workingHoursEndTime', 'minTime', true);
                UtilService.setError($scope.form, 'workingHoursStartTime', 'maxTime', true);
            }
        });

    });

})();
