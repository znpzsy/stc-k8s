(function () {

    'use strict';

    angular.module('adminportal.services.rbt.campaigns.bogof', []);

    var RBTCampaignsBogofModule = angular.module('adminportal.services.rbt.campaigns.bogof');

    RBTCampaignsBogofModule.config(function ($stateProvider) {

        $stateProvider.state('services.rbt.campaigns.bogof', {
            // abstract: true,
            url: "/bogof",
            template: "<div ui-view></div>"
        }).state('services.rbt.campaigns.bogof.list', {
            url: "/list",
            templateUrl: "services/rbt/campaigns/campaigns.bogof.html",
            controller: 'RBTCampaignsBogofCtrl',
            resolve: {
                 campaigns: function (CMPFService) {
                     return CMPFService.getRbtContentOffer();
                }
            }
        }).state('services.rbt.campaigns.bogof.new', {
            url: "/new",
            templateUrl: "services/rbt/campaigns/campaigns.bogof.detail.html",
            controller: 'RBTCampaignsBogofNewCtrl'

        }).state('services.rbt.campaigns.bogof.update', {
            url: "/update/:profileId",
            templateUrl: "services/rbt/campaigns/campaigns.bogof.detail.html",
            controller: 'RBTCampaignsBogofUpdateCtrl',
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

    RBTCampaignsBogofModule.controller('RBTCampaignsBogofCommonCtrl', function ($scope, $log, $q, $state, $stateParams, $filter, $translate, $controller, UtilService) {
        $log.debug("RBTCampaignsBogofCommonCtrl");

        $controller('GenericDateTimeCtrl', {$scope: $scope});

        $scope.listState = "services.rbt.campaigns.bogof.list";
        $scope.newState = "services.rbt.campaigns.bogof.new";
        $scope.updateState = "services.rbt.campaigns.bogof.update";

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

                if(newValue < new Date()){
                    UtilService.setError($scope.form, 'startDate', 'todayDateExceeded', false);
                }if($scope.dateHolder.endDate && newValue>=$scope.dateHolder.endDate){
                    UtilService.setError($scope.form, 'startDate', 'maxDateExceeded', false);
                } else{
                    $scope.endDateOptions.minDate = new Date(newValue.setDate(newValue.getDate() ));
                }
                $log.debug("endDate minDate:", $scope.endDateOptions.minDate);
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
                }if(newValue < new Date()){
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

    RBTCampaignsBogofModule.controller('RBTCampaignsBogofCtrl', function ($scope, $log, $q, $state, $stateParams, $controller,$uibModal, $filter, $translate, notification, NgTableParams, NgTableService, Restangular,
                                                                                  CMPFService, DateTimeConstants,campaigns) {
        $log.debug("RBTCampaignsBogofCtrl");

        $scope.newState = "services.rbt.campaigns.bogof.new";
        $scope.updateState = "services.rbt.campaigns.bogof.update";

        $scope.campaignList = {
            list: [],
            tableParams: {}
        };

        var bogofCampaignProfiles = CMPFService.getProfileAttributes(campaigns.profiles, CMPFService.OFFER_BOGOF_CAMPAIGN_PROFILE);

        _.each(bogofCampaignProfiles, function (campaign) {
            var campaignItem = {
                profileId: campaign.profileId,
                name: campaign.BOGOFCampaignName,
                freeDays: campaign.BOGOFCampaignNumOfFreeDays,
                reminderDays: campaign.BOGOFCampaignReminderDaysBeforePaidRenewal,
                startDateTime: campaign.BOGOFCampaignStartDateTime ? $filter('date')(campaign.BOGOFCampaignStartDateTime, 'yyyy-MM-dd HH:mm'):'',
                endDateTime: campaign.BOGOFCampaignEndDateTime ?  $filter('date')(campaign.BOGOFCampaignEndDateTime, 'yyyy-MM-dd HH:mm'):'',
                lastUpdatedUser: campaign.BOGOFCampaignLastUpdatedUser,
                lastUpdatedTime: campaign.BOGOFCampaignLastUpdatedDateTime
            };
            $scope.campaignList.list.push(campaignItem);
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
    RBTCampaignsBogofModule.controller('RBTCampaignsBogofNewCtrl', function ($scope, $log, $q, $state,$filter,  $stateParams, $translate, $controller, SessionService, notification, UtilService, CMPFService) {
        $log.debug("RBTCampaignsBogofNewCtrl");

        $controller('RBTCampaignsBogofCommonCtrl', {$scope: $scope});

        $scope.dateHolder.startDate = null;
        $scope.dateHolder.endDate = null;

        $scope.campaign = {
            profileId:null,
            BOGOFCampaignName: "",
            BOGOFCampaignNumOfFreeDays:30,
            allowReminder: true,
            BOGOFCampaignReminderDaysBeforePaidRenewal:2
        };

        $scope.originalcampaign = angular.copy($scope.campaign);
        $scope.dateHolderOriginal = angular.copy($scope.dateHolder);
        $scope.generateBogofCampaignProfile = function (campaign) {

            $log.debug("endDate:" , $filter('date')($scope.dateHolder.endDate, 'yyyy-MM-dd') + $filter('date')($scope.dateHolder.endTime, 'THH:mm:ss'));
            var bogofCampaignProfileObj = {
                name: CMPFService.OFFER_BOGOF_CAMPAIGN_PROFILE,
                profileDefinitionName: CMPFService.OFFER_BOGOF_CAMPAIGN_PROFILE,
                attributes: [
                    {
                        "name": "BOGOFCampaignName",
                        "value": campaign.BOGOFCampaignName
                    },
                    {
                        "name": "BOGOFCampaignStartDateTime",
                        "value": $scope.dateHolder.startDate? $filter('date')($scope.dateHolder.startDate, 'yyyy-MM-dd\'T\'HH:mm:ss'):""
                    },
                    {
                        "name": "BOGOFCampaignEndDateTime",
                        "value":$scope.dateHolder.endDate? $filter('date')($scope.dateHolder.endDate, 'yyyy-MM-dd') + $filter('date')($scope.dateHolder.endTime, 'THH:mm:ss'):""
                    },
                    {
                        "name": "BOGOFCampaignNumOfFreeDays",
                        "value": campaign.BOGOFCampaignNumOfFreeDays
                    },
                    {
                        "name": "BOGOFCampaignReminderDaysBeforePaidRenewal",
                        "value": campaign.allowReminder ? campaign.BOGOFCampaignReminderDaysBeforePaidRenewal: 0
                    },
                    {
                        "name": "BOGOFCampaignLastUpdatedUser",
                        "value": SessionService.getUsername()
                    },
                    {
                        "name": "BOGOFCampaignLastUpdatedDateTime",
                        "value": $filter('date')(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss')
                    }

                ]
            };

            return bogofCampaignProfileObj;
        };

        $scope.save = function (campaign) {
           var bogofCampaignProfile = $scope.generateBogofCampaignProfile(campaign);

            CMPFService.createOfferCampaign(bogofCampaignProfile).then(function (response) {
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

    RBTCampaignsBogofModule.controller('RBTCampaignsBogofUpdateCtrl', function ($scope, $log, $q, $state,$filter,  $stateParams, $translate, $controller,SessionService, notification, DateTimeConstants, UtilService, CMPFService, profileId, campaigns) {
        $log.debug("RBTCampaignsBogofUpdateCtrl");

        $controller('RBTCampaignsBogofCommonCtrl', {$scope: $scope});

        var campaignProfile = CMPFService.findProfileById(campaigns.profiles,profileId);
        $scope.originalCampaignProfile = angular.copy(campaignProfile);
        campaignProfile = CMPFService.getProfileAttributesArray(campaignProfile);

        $scope.dateHolder.startDate = new Date($filter('date')(campaignProfile.BOGOFCampaignStartDateTime, 'yyyy-MM-dd\'T\'HH:mm:ss' + DateTimeConstants.OFFSET_WITH_COLON));
        $scope.dateHolder.startTime = $scope.dateHolder.startDate;
        $scope.dateHolder.endDate = new Date($filter('date')(campaignProfile.BOGOFCampaignEndDateTime, 'yyyy-MM-dd\'T\'HH:mm:ss' + DateTimeConstants.OFFSET_WITH_COLON));
        $scope.dateHolder.endTime = $scope.dateHolder.endDate;

        $scope.campaign = {
            profileId: profileId,
            BOGOFCampaignName: campaignProfile.BOGOFCampaignName,
            BOGOFCampaignNumOfFreeDays: campaignProfile.BOGOFCampaignNumOfFreeDays,
            allowReminder: (campaignProfile.BOGOFCampaignReminderDaysBeforePaidRenewal>0),
            BOGOFCampaignReminderDaysBeforePaidRenewal: (campaignProfile.BOGOFCampaignReminderDaysBeforePaidRenewal> 0 ? campaignProfile.BOGOFCampaignReminderDaysBeforePaidRenewal:2),
            BOGOFCampaignLastUpdatedUser: campaignProfile.BOGOFCampaignLastUpdatedUser,
            BOGOFCampaignLastUpdatedDateTime: $filter('date')(new Date(campaignProfile.BOGOFCampaignLastUpdatedDateTime), 'yyyy-MM-dd\'T\'HH:mm:ss')
        };

        $scope.originalCampaign = angular.copy($scope.campaign);
        $scope.dateHolderOriginal = angular.copy($scope.dateHolder);



        $scope.save = function (campaign) {
            var updatedCampaignProfile = JSON.parse(angular.toJson(campaign));
            updatedCampaignProfile.BOGOFCampaignStartDateTime = $filter('date')($scope.dateHolder.startDate, 'yyyy-MM-dd\'T\'HH:mm:ss');
            updatedCampaignProfile.BOGOFCampaignEndDateTime = $filter('date')($scope.dateHolder.endDate, 'yyyy-MM-dd\'T\'HH:mm:ss');
            updatedCampaignProfile.BOGOFCampaignLastUpdatedUser = SessionService.getUsername();
            updatedCampaignProfile.BOGOFCampaignLastUpdatedDateTime = $filter('date')(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss')
            updatedCampaignProfile.BOGOFCampaignReminderDaysBeforePaidRenewal= (campaign.allowReminder ? campaign.BOGOFCampaignReminderDaysBeforePaidRenewal:0);
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

