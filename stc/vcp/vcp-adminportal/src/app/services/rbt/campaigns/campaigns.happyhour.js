(function () {

    'use strict';

    angular.module('adminportal.services.rbt.campaigns.happyhour', []);

    var RBTCampaignsHappyHourModule = angular.module('adminportal.services.rbt.campaigns.happyhour');

    RBTCampaignsHappyHourModule.config(function ($stateProvider) {

        $stateProvider.state('services.rbt.campaigns.happyhour', {
            // abstract: true,
            url: "/happyhour",
            template: "<div ui-view></div>"
        }).state('services.rbt.campaigns.happyhour.list', {
            url: "/list",
            templateUrl: "services/rbt/campaigns/campaigns.happyhour.html",
            controller: 'RBTCampaignsHappyHourCtrl',
            resolve: {
                 campaigns: function (CMPFService) {
                     return CMPFService.getRbtContentOffer();
                }
            }
        }).state('services.rbt.campaigns.happyhour.new', {
            url: "/new",
            templateUrl: "services/rbt/campaigns/campaigns.happyhour.detail.html",
            controller: 'RBTCampaignsHappyHourNewCtrl'

        }).state('services.rbt.campaigns.happyhour.update', {
            url: "/update/:profileId",
            templateUrl: "services/rbt/campaigns/campaigns.happyhour.detail.html",
            controller: 'RBTCampaignsHappyHourUpdateCtrl',
            resolve: {
                profileId : function ($stateParams) {
                    return $stateParams.profileId;
                },
                campaigns: function (CMPFService) {
                    return CMPFService.getRbtContentOffer();
                }
            }
        });

    });

    RBTCampaignsHappyHourModule.controller('RBTCampaignsHappyHourCommonCtrl', function ($scope, $log, $q, $state, $filter,  $stateParams, $translate, $controller, UtilService) {
        $log.debug("RBTCampaignsHappyHourCommonCtrl");

        $controller('GenericDateTimeCtrl', {$scope: $scope});


        $scope.title = "Services.RBT.Campaigns.HappyHour";
        $scope.listState = "services.rbt.campaigns.happyhour.list";
        $scope.newState = "services.rbt.campaigns.happyhour.new";
        $scope.updateState = "services.rbt.campaigns.happyhour.update";

        $scope.startDateOptions = _.clone($scope.dateOptions);
        $scope.startDateOptions.minDate = UtilService.getTodayBegin();
        $scope.startDateOptions.maxDate = null;

        $scope.endDateOptions = _.clone($scope.dateOptions);
        $scope.endDateOptions.minDate = UtilService.getTomorrow();
        $scope.endDateOptions.maxDate = null;

        $scope.$watch('dateHolder.startDate', function (newValue, oldValue) {
            if (newValue && (newValue !== oldValue)) {
                UtilService.setError($scope.form, 'startDate', 'maxDateExceeded', true);
                UtilService.setError($scope.form, 'startDate', 'todayDateExceeded', true);

                if(newValue < UtilService.getTodayBegin()){
                    UtilService.setError($scope.form, 'startDate', 'todayDateExceeded', false);
                }if($scope.dateHolder.endDate && newValue>=$scope.dateHolder.endDate){
                    UtilService.setError($scope.form, 'startDate', 'maxDateExceeded', false);
                } else{
                    $scope.endDateOptions.minDate = new Date(newValue.setDate(newValue.getDate() ));
                }
            }
        });

        $scope.$watch('dateHolder.endDate', function (newValue, oldValue) {

            if (newValue && (newValue !== oldValue)) {
                UtilService.setError($scope.form, 'endDate', 'minDateExceeded', true);
                UtilService.setError($scope.form, 'endDate', 'todayDateExceeded', true);

                if(oldValue==null){
                    // set default end time to 23:59
                    newValue = $scope.calculateDate(newValue, 23, 59);
                }

                if($scope.dateHolder.startDate && newValue<=$scope.dateHolder.startDate){
                    UtilService.setError($scope.form, 'endDate', 'minDateExceeded', false);
                }if(newValue < UtilService.getTodayBegin()){
                    UtilService.setError($scope.form, 'endDate', 'todayDateExceeded', false);
                }else{
                    $scope.startDateOptions.maxDate = new Date(newValue.setDate(newValue.getDate() ));
                }
            }
        });

        $scope.cancel = function () {
            $state.go($scope.listState);
        };

        $scope.isNotChanged = function () {

            return angular.equals($scope.dateHolder, $scope.dateHolderOriginal) && angular.equals($scope.originalCampaign, $scope.campaign);
        };

        $scope.check = function(currDate){

            if(!angular.equals($scope.dateHolder, $scope.dateHolderOriginal)){
                return true;
            }

            if(!currDate){
                return true;
            }
            currDate = new Date($filter('date')(currDate, 'yyyy-MM-dd HH:mm') );
            var today = new Date($filter('date')(new Date(), 'yyyy-MM-dd HH:mm') );
            return  currDate > today;
        };


    });

    RBTCampaignsHappyHourModule.controller('RBTCampaignsHappyHourCtrl', function ($scope, $log, $q, $state, $stateParams, $controller,$uibModal, $filter, $translate, notification, NgTableParams, NgTableService, Restangular,
                                                                                  CMPFService, DateTimeConstants,campaigns) {
        $log.debug("RBTCampaignsHappyHourCtrl");

        $scope.title = "Services.RBT.Campaigns.HappyHour";
        $scope.newState = "services.rbt.campaigns.happyhour.new";
        $scope.updateState = "services.rbt.campaigns.happyhour.update";

        $scope.campaignList = {
            list: [],
            tableParams: {}
        };

        var happyHourCampaignProfiles = CMPFService.getProfileAttributes(campaigns.profiles, CMPFService.OFFER_HAPPY_HOUR_CAMPAIGN_PROFILE);

        _.each(happyHourCampaignProfiles, function (campaign) {

            if(!campaign.HHCampaignHasSelectedTones){

                var campaignItem = {
                    profileId: campaign.profileId,
                    name: campaign.HHCampaignName,
                    freeDays: campaign.HHCampaignNumOfFreeDays,
                    reminderDays: campaign.HHCampaignReminderDaysBeforePaidRenewal,
                    startDateTime: campaign.HHCampaignStartDateTime ? $filter('date')(campaign.HHCampaignStartDateTime, 'yyyy-MM-dd HH:mm'):'',
                    endDateTime: campaign.HHCampaignEndDateTime ?  $filter('date')(campaign.HHCampaignEndDateTime, 'yyyy-MM-dd HH:mm'):'',
                    lastUpdatedUser: campaign.HHCampaignLastUpdatedUser,
                    lastUpdatedTime: campaign.HHCampaignLastUpdatedDateTime
                };

                $scope.campaignList.list.push(campaignItem);
            }

        });

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'profileId',
                    headerKey: 'Services.RBT.Campaigns.TableColumns.CampaignId'
                },
                {
                    fieldName: 'name',
                    headerKey: 'Services.RBT.Campaigns.TableColumns.CampaignName'
                },
                {
                    fieldName: 'freeDays',
                    headerKey: 'Services.RBT.Campaigns.TableColumns.FreeDays'
                },
                {
                    fieldName: 'reminderDays',
                    headerKey: 'Services.RBT.Campaigns.TableColumns.ReminderDays'
                },
                {
                    fieldName: 'startDateTime',
                    headerKey: 'GenericFormFields.StartDate.Label',
                    filter: {name: 'date', params: ['yyyy-MM-dd HH:mm', DateTimeConstants.OFFSET]}
                },
                {
                    fieldName: 'endDateTime',
                    headerKey: 'GenericFormFields.EndDate.Label',
                    filter: {name: 'date', params: ['yyyy-MM-dd HH:mm', DateTimeConstants.OFFSET]}
                },
                {
                    fieldName: 'lastUpdatedUser',
                    headerKey: 'CommonLabels.LastUpdatedBy'
                },
                {
                    fieldName: 'lastUpdatedTime',
                    headerKey: 'CommonLabels.LastUpdateTime',
                    filter: {name: 'date', params: ['yyyy-MM-dd HH:mm', DateTimeConstants.OFFSET]}
                },

            ]
        };

        $scope.campaignList.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "startDateTime": 'desc'
            }
        }, {
            total: $scope.campaignList.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.campaignList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.campaignList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }
                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.campaignList.tableParams.settings().$scope.filterText = filterText;
            $scope.campaignList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.campaignList.tableParams.page(1);
            $scope.campaignList.tableParams.reload();
        }, 500);

        $scope.check = function(currDate){

            if(!currDate){
                return true;
            }
            currDate = new Date($filter('date')(currDate, 'yyyy-MM-dd HH:mm') );
            var today = new Date($filter('date')(new Date(), 'yyyy-MM-dd HH:mm') );
            return  currDate > today;
        };

        $scope.remove = function (profileId) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                CMPFService.deleteOfferCampaign(profileId).then(function (response) {
                    $log.debug('Removed. Response: ', response);

                    if (response && response.errorCode) {
                        CMPFService.showApiError(response);
                    } else {
                        var deletedListItem = _.findWhere($scope.campaignList.list, {profileId: profileId});
                        $scope.campaignList.list = _.without($scope.campaignList.list, deletedListItem);

                        $scope.campaignList.tableParams.reload();

                        notification({
                            type: 'success',
                            text: $translate.instant('CommonLabels.OperationSuccessful')
                        });
                    }
                }, function (response) {

                    if (response.data && response.data.errorDescription) {
                        var message = response.data.errorDescription;

                        notification({
                            type: 'warning',
                            text: message
                        });
                    } else {
                        CMPFService.showApiError(response);
                    }
                });
            });
        };
    });
    RBTCampaignsHappyHourModule.controller('RBTCampaignsHappyHourNewCtrl', function ($scope, $log, $q, $state,$filter,  $stateParams, $translate, $controller, SessionService, notification, UtilService, CMPFService) {
        $log.debug("RBTCampaignsHappyHourNewCtrl");

        $controller('RBTCampaignsHappyHourCommonCtrl', {$scope: $scope});

        $scope.dateHolder.startDate = null;
        $scope.dateHolder.endDate = null;

        $scope.campaign = {
            profileId:null,
            HHCampaignName: "",
            HHCampaignNumOfFreeDays:30,
            allowReminder: true,
            HHCampaignReminderDaysBeforePaidRenewal:2,
            HHCampaignHasSelectedTones: false
        };

        $scope.originalcampaign = angular.copy($scope.campaign);
        $scope.dateHolderOriginal = angular.copy($scope.dateHolder);
        $scope.generateHappyHourCampaignProfile = function (campaign) {
            var happyHourCampaignProfileObj = {
                name: CMPFService.OFFER_HAPPY_HOUR_CAMPAIGN_PROFILE,
                profileDefinitionName: CMPFService.OFFER_HAPPY_HOUR_CAMPAIGN_PROFILE,
                attributes: [
                    {
                        "name": "HHCampaignName",
                        "value": campaign.HHCampaignName
                    },
                    {
                        "name": "HHCampaignStartDateTime",
                        "value": $scope.dateHolder.startDate? $filter('date')($scope.dateHolder.startDate, 'yyyy-MM-dd\'T\'HH:mm:ss'):""
                    },
                    {
                        "name": "HHCampaignEndDateTime",
                        "value":$scope.dateHolder.endDate? $filter('date')($scope.dateHolder.endDate, 'yyyy-MM-dd\'T\'HH:mm:ss'):""
                    },
                    {
                        "name": "HHCampaignNumOfFreeDays",
                        "value": campaign.HHCampaignNumOfFreeDays
                    },
                    {
                        "name": "HHCampaignReminderDaysBeforePaidRenewal",
                        "value": campaign.allowReminder ? campaign.HHCampaignReminderDaysBeforePaidRenewal: 0
                    },
                    {
                        "name": "HHCampaignLastUpdatedUser",
                        "value": SessionService.getUsername()
                    },
                    {
                        "name": "HHCampaignLastUpdatedDateTime",
                        "value": $filter('date')(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss')
                    },
                    {
                        "name": "HHCampaignHasSelectedTones",
                        "value": false
                    }
                ]
            };

            return happyHourCampaignProfileObj;
        };

        $scope.save = function (campaign) {
           var happyHourCampaignProfile = $scope.generateHappyHourCampaignProfile(campaign);

            CMPFService.createOfferCampaign(happyHourCampaignProfile).then(function (response) {
                if(response && response.errorCode){
                    notification({
                        type: 'danger',
                        text: $translate.instant('CommonMessages.ApiError', {
                            errorCode: response.data.errorCode,
                            errorText: response.data.errorDescription
                        })
                    });
                }else{
                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    $state.go($scope.listState);
                }

            }, function (response) {

                var message;

                if (response.data.errorCode === 5022130) {
                    message = $translate.instant('Services.RBT.Campaigns.Messages.CampaignOverlappedError');
                }else {
                    message = response.data.errorDescription;
                }

                notification({
                    type: 'warning',
                    text:message
                });

            });
        };



    });

    RBTCampaignsHappyHourModule.controller('RBTCampaignsHappyHourUpdateCtrl', function ($scope, $log, $q, $state,$filter,  $stateParams, $translate, $controller,SessionService, notification, DateTimeConstants, UtilService, CMPFService, profileId, campaigns) {
        $log.debug("RBTCampaignsHappyHourUpdateCtrl");

        $controller('RBTCampaignsHappyHourCommonCtrl', {$scope: $scope});

        var campaignProfile = CMPFService.findProfileById(campaigns.profiles,profileId);
        $scope.originalCampaignProfile = angular.copy(campaignProfile);
        campaignProfile = CMPFService.getProfileAttributesArray(campaignProfile);

        $scope.dateHolder.startDate = new Date($filter('date')(campaignProfile.HHCampaignStartDateTime, 'yyyy-MM-dd\'T\'HH:mm:ss' + DateTimeConstants.OFFSET_WITH_COLON));
        $scope.dateHolder.startTime = $scope.dateHolder.startDate;
        $scope.dateHolder.endDate = new Date($filter('date')(campaignProfile.HHCampaignEndDateTime, 'yyyy-MM-dd\'T\'HH:mm:ss' + DateTimeConstants.OFFSET_WITH_COLON));
        $scope.dateHolder.endTime = $scope.dateHolder.endDate;

        $scope.campaign = {
            profileId: profileId,
            HHCampaignName: campaignProfile.HHCampaignName,
            HHCampaignNumOfFreeDays: campaignProfile.HHCampaignNumOfFreeDays,
            allowReminder: (campaignProfile.HHCampaignReminderDaysBeforePaidRenewal>0),
            HHCampaignReminderDaysBeforePaidRenewal: (campaignProfile.HHCampaignReminderDaysBeforePaidRenewal> 0 ? campaignProfile.HHCampaignReminderDaysBeforePaidRenewal:2),
            HHCampaignLastUpdatedUser: campaignProfile.HHCampaignLastUpdatedUser,
            HHCampaignLastUpdatedDateTime: $filter('date')(new Date(campaignProfile.HHCampaignLastUpdatedDateTime), 'yyyy-MM-dd\'T\'HH:mm:ss')
        };
        $scope.originalCampaign = angular.copy($scope.campaign);
        $scope.dateHolderOriginal = angular.copy($scope.dateHolder);

        $scope.save = function (campaign) {
            var updatedCampaignProfile = JSON.parse(angular.toJson(campaign));
            updatedCampaignProfile.HHCampaignStartDateTime = $filter('date')($scope.dateHolder.startDate, 'yyyy-MM-dd\'T\'HH:mm:ss');
            updatedCampaignProfile.HHCampaignEndDateTime = $filter('date')($scope.dateHolder.endDate, 'yyyy-MM-dd\'T\'HH:mm:ss');
            updatedCampaignProfile.HHCampaignLastUpdatedUser = SessionService.getUsername();
            updatedCampaignProfile.HHCampaignLastUpdatedDateTime = $filter('date')(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss')
            updatedCampaignProfile.HHCampaignReminderDaysBeforePaidRenewal= (campaign.allowReminder ? campaign.HHCampaignReminderDaysBeforePaidRenewal:0);
            delete updatedCampaignProfile.allowReminder;

            var originalCampaignProfile =  $scope.originalCampaignProfile;
            var campaignProfileArray = CMPFService.prepareProfile(updatedCampaignProfile, $scope.originalCampaignProfile);
            originalCampaignProfile.attributes = campaignProfileArray;

            CMPFService.updateOfferCampaign(originalCampaignProfile, campaign.profileId).then(function (response) {
                if(response && response.errorCode){
                    notification({
                        type: 'danger',
                        text: $translate.instant('CommonMessages.ApiError', {
                            errorCode: response.data.errorCode,
                            errorText: response.data.errorDescription
                        })
                    });
                }else{
                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    $state.go($scope.listState);
                }

            }, function (response) {

                var message;

                if (response.data.errorCode === 5022130) {
                    message = $translate.instant('Services.RBT.Campaigns.Messages.CampaignOverlappedError');
                }else {
                    message = response.data.errorDescription;
                }

                notification({
                    type: 'warning',
                    text: message
                });

            });

        };



    });

})();
