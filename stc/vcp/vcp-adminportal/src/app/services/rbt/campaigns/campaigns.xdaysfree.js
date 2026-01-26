(function () {

    'use strict';

    angular.module('adminportal.services.rbt.campaigns.xdaysfree', []);

    var RBTCampaignsXDaysFreeModule = angular.module('adminportal.services.rbt.campaigns.xdaysfree');

    RBTCampaignsXDaysFreeModule.config(function ($stateProvider) {

        $stateProvider.state('services.rbt.campaigns.xdaysfree', {
            // abstract: true,
            url: "/xdaysfree",
            template: "<div ui-view></div>"
        }).state('services.rbt.campaigns.xdaysfree.list', {
            url: "/list",
            templateUrl: "services/rbt/campaigns/campaigns.happyhour.html",
            controller: 'RBTCampaignsXDaysFreeCtrl',
            resolve: {
                campaigns: function (CMPFService) {
                    return CMPFService.getRbtContentOffer();
                }
            }
        }).state('services.rbt.campaigns.xdaysfree.new', {
            url: "/new",
            templateUrl: "services/rbt/campaigns/campaigns.happyhour.detail.html",
            controller: 'RBTCampaignsXDaysFreeNewCtrl'

        }).state('services.rbt.campaigns.xdaysfree.update', {
            url: "/update/:profileId",
            templateUrl: "services/rbt/campaigns/campaigns.happyhour.detail.html",
            controller: 'RBTCampaignsXDaysFreeUpdateCtrl',
            resolve: {
                profileId: function ($stateParams) {
                    return $stateParams.profileId;
                },
                campaigns: function (CMPFService) {
                    return CMPFService.getRbtContentOffer();
                },
                toneIds: function ($q, $log, $stateParams, SSMSubscribersService, ContentManagementService, Restangular) {
                    var emptyResult = {
                        campaignContentListId: null,
                        status: null,
                        campaignId: $stateParams.profileId,
                        contentList: [],
                        toneList: []
                    };

                    var deferred = $q.defer();

                    SSMSubscribersService.getCampaignContentList($stateParams.profileId).then(function (resp) {
                        $log.debug('getCampaignContentList', resp);

                        if (!resp || !Array.isArray(resp.contentList) || resp.contentList.length === 0) {
                            deferred.resolve(emptyResult);
                        }

                        var campaignContentListId = resp.campaignContentListId;
                        var uniqueIds = _.uniq(resp.contentList);
                        ContentManagementService.getTonesWithIdList(uniqueIds).then(function (toneList) {
                            toneList = _.filter(toneList.items);
                            $log.debug('getToneList tone list without nulls' , toneList);
                            // Return merged, while preserving original fields
                            var result = angular.extend({}, resp, {
                                contentList: uniqueIds,  // string IDs
                                toneList: toneList, // fetched tone objects
                                campaignContentListId: campaignContentListId // ngssm tone content list id
                            });
                            deferred.resolve(result);

                        }).catch(function (err) {
                            $log.error('RBTCampaignsXDaysFreeUpdateCtrl resolving', err);
                            //return emptyResult;
                            deferred.resolve(emptyResult);
                        });

                        return deferred.promise;

                    }).catch(function (err) {
                        $log.error('RBTCampaignsXDaysFreeUpdateCtrl resolving', err);
                        //return emptyResult;
                        deferred.resolve(emptyResult);
                    });

                    return deferred.promise;
                }
            }
        });

    });

    RBTCampaignsXDaysFreeModule.controller('RBTCampaignsXDaysFreeCommonCtrl', function ($scope, $log, $q, $state, $filter,  $stateParams, $translate, $controller, UtilService) {
        $log.debug("RBTCampaignsXDaysFreeCommonCtrl");

        $controller('GenericDateTimeCtrl', {$scope: $scope});

        $scope.title = "Services.RBT.Campaigns.XDaysFree";
        $scope.listState = "services.rbt.campaigns.xdaysfree.list";
        $scope.newState = "services.rbt.campaigns.xdaysfree.new";
        $scope.updateState = "services.rbt.campaigns.xdaysfree.update";

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


        function arraysEqual(a, b) {
            if (!a && !b) return true;
            if (!a || !b) return false;
            if (a.length !== b.length) return false;
            for (var i = 0; i < a.length; i++) {
                if (a[i] !== b[i]) return false;
            }
            return true;
        }

        $scope.hasCampaignBasicsChanged = function () {

            var dStartNew = $scope.dateHolder.startDate ? +$scope.dateHolder.startDate : null; // compare dates using time value
            var dStartOld = $scope.dateHolderOriginal.startDate ? +$scope.dateHolderOriginal.startDate : null;
            var dEndNew   = $scope.dateHolder.endDate ? +$scope.dateHolder.endDate : null;
            var dEndOld   = $scope.dateHolderOriginal.endDate ? +$scope.dateHolderOriginal.endDate : null;

            if (dStartNew !== dStartOld) return true;
            if (dEndNew !== dEndOld) return true;
            var a = $scope.campaign;
            var b = $scope.originalCampaign;

            if (a.HHCampaignName !== b.HHCampaignName) return true;
            if (a.HHCampaignNumOfFreeDays !== b.HHCampaignNumOfFreeDays) return true;
            if (!!a.allowReminder !== !!b.allowReminder) return true;

            if (a.allowReminder && (a.HHCampaignReminderDaysBeforePaidRenewal !== b.HHCampaignReminderDaysBeforePaidRenewal)) {
                return true;
            }
            return false;
        }

        $scope.haveToneIdsChanged = function () {
            return !arraysEqual($scope.campaign.toneIds || [], $scope.originalToneIds || []);
        }

        $scope.isNotChanged = function () {
            return angular.equals($scope.dateHolder, $scope.dateHolderOriginal)
                && !$scope.hasCampaignBasicsChanged()
                && !$scope.haveToneIdsChanged();
        };

        $scope.cancel = function () {
            $state.go($scope.listState);
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


        $scope.$on('toneIdsUpdated', function (event, toneIdList) {
            $log.debug('Received toneIdsUpdated event with toneIds: ', toneIdList);

            // Update campaign.toneIds and trigger the watcher
            $scope.campaign.toneIds = toneIdList;
            // Manually mark the form control as dirty
            if ($scope.form && $scope.form.selectTones) {
                $scope.form.selectTones.$setDirty();
            }

        });

        $scope.$watch('campaign.toneIds', function (newValue, oldValue) {
            // at least one tone should be selected
            var minimumTones = $scope.campaign.toneIds && $scope.campaign.toneIds.length > 0;
            if ($scope.form && $scope.form.selectTones) {
                UtilService.setError($scope.form, 'selectTones', 'minimumTones', minimumTones);
            }
        });

        // Tone Selection callback
        var setToneSelection = function (selectedTones) {
            $scope.campaign.tones = selectedTones;
            $scope.campaign.toneIds = _.pluck(selectedTones, 'id');
            // Manually mark the form control as dirty
            if ($scope.form && $scope.form.selectTones) {
                $scope.form.selectTones.$setDirty();
            }
        };

        $scope.openToneSelection = function () {
            // Configuration for the tone selection modal
            var title = $translate.instant('Subsystems.ContentManagement.Operations.RBT.ContentMetadatas.Tones.Title');
            title += ' [Campaign = ' + ($scope.campaign.HHCampaignName ? $scope.campaign.HHCampaignName : 'New Campaign ')+']';

            var config = {
                titleKey: title,
                dateFilter: {
                    status: 'ACTIVE'
                },
                enableToneOrdering: $scope.enableToneOrdering,
                accessType: $scope.accessType,
                selectionLimit: 100,
                isAuthorized: true
            };
            $scope.openToneSelectionModal($scope.campaign.tones, setToneSelection, config)
        };


    });

    RBTCampaignsXDaysFreeModule.controller('RBTCampaignsXDaysFreeCtrl', function ($scope, $log, $q, $state, $stateParams, $controller, $uibModal, $filter, $translate, notification, NgTableParams, NgTableService,
                                                                                  Restangular,SSMSubscribersService, CMPFService, DateTimeConstants, campaigns) {
        $log.debug("RBTCampaignsXDaysFreeCtrl");

        $scope.title = "Services.RBT.Campaigns.XDaysFree";
        $scope.newState = "services.rbt.campaigns.xdaysfree.new";
        $scope.updateState = "services.rbt.campaigns.xdaysfree.update";

        $scope.campaignList = {
            list: [],
            tableParams: {}
        };

        var happyHourCampaignProfiles = CMPFService.getProfileAttributes(campaigns.profiles, CMPFService.OFFER_HAPPY_HOUR_CAMPAIGN_PROFILE);

        _.each(happyHourCampaignProfiles, function (campaign) {
            if(campaign.HHCampaignHasSelectedTones){

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
                // Delete the campaing content first. (campaignId context might be lost if the profile is removed from CMPF first.)
                return SSMSubscribersService.deleteCampaignContentList(profileId).then(function (ssmResponse) {
                    var d1 = ssmResponse && ssmResponse.errorCode ? ssmResponse : {};
                    if (d1.errorCode) {
                        $log.debug('Error deleting campaign content: ', d1.errorCode);;
                        notification({
                            type: 'warning',
                            text: $translate.instant('CommonMessages.GenericServerError')
                        });
                        return $q.reject({ stage: 'contentDelete', data: d1 });
                    }

                    return CMPFService.deleteOfferCampaign(profileId).then(function (cmpfResponse) {
                        var d2 = cmpfResponse && cmpfResponse.data ? cmpfResponse.data : {};
                        if (d2.errorCode) {
                            CMPFService.showApiError(cmpfResponse);
                            return $q.reject({ stage: 'campaignDelete', data: d2 });
                        }

                        var deletedListItem = _.findWhere($scope.campaignList.list, { profileId: profileId });
                        $scope.campaignList.list = _.without($scope.campaignList.list, deletedListItem);
                        $scope.campaignList.tableParams.reload();

                        notification({
                            type: 'success',
                            text: $translate.instant('CommonLabels.OperationSuccessful')
                        });

                        return cmpfResponse;

                    }, function (cmpfErr) {
                        $log.debug('Failed to delete campaign profile (cmpf - content offer): ', cmpfErr);
                        if (cmpfErr && cmpfErr.data && cmpfErr.data.errorDescription) {
                            notification({ type: 'warning', text: cmpfErr.data.errorDescription });
                        } else {
                            CMPFService.showApiError(cmpfErr);
                        }
                        return $q.reject({ stage: 'campaignDelete.http', error: cmpfErr });
                    });

                }, function (ssmErr) {
                    $log.debug('Failed to delete content list from ssm: ', ssmErr);
                    notification({
                        type: 'warning',
                        text: $translate.instant('CommonMessages.GenericServerError')
                    });
                    return $q.reject({ stage: 'contentDelete.http', error: ssmErr });
                });

            });
        };


    });
    RBTCampaignsXDaysFreeModule.controller('RBTCampaignsXDaysFreeNewCtrl', function ($scope, $log, $q, $state,$filter,  $stateParams, $translate, $controller, SessionService, notification, UtilService, CMPFService, SSMSubscribersService) {
        $log.debug("RBTCampaignsXDaysFreeNewCtrl");

        $controller('RBTCampaignsXDaysFreeCommonCtrl', {$scope: $scope});
        $controller('ContentManagementOperationsRBTCtrl', {$scope: $scope});

        $scope.dateHolder.startDate = null;
        $scope.dateHolder.endDate = null;

        $scope.campaign = {
            profileId:null,
            HHCampaignName: "",
            HHCampaignNumOfFreeDays:30,
            allowReminder: true,
            HHCampaignReminderDaysBeforePaidRenewal:2,
            HHCampaignHasSelectedTones: true
        };

        $scope.originalcampaign = angular.copy($scope.campaign);
        $scope.dateHolderOriginal = angular.copy($scope.dateHolder);
        // do not move up, intentionally not included in originalCampaign.
        $scope.campaign.tones = [];
        $scope.campaign.toneIds = [];
        $scope.originalToneIds = angular.copy($scope.campaign.toneIds);

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
                        "value": true
                    }
                ]
            };

            return happyHourCampaignProfileObj;
        };


        function getHHProfileId(resp, opts) {
            // opts: { name, start, end, requireSelectedTones:true/false }
            if (!resp || !resp.profiles) return null;
            opts = opts || {};

            var mm = function (p) {
                if (p.name !== 'HappyHourCampaignProfile') return false;

                var a = _.reduce(p.attributes || [], function (m, x) { m[x.name] = x.value; return m; }, {});

                var hasSelected = String(a.HHCampaignHasSelectedTones).toLowerCase() === 'true';
                if (opts.requireSelectedTones !== false && !hasSelected) return false;

                if (opts.name != null && a.HHCampaignName !== opts.name) return false;
                if (opts.start != null && a.HHCampaignStartDateTime !== opts.start) return false;
                if (opts.end   != null && a.HHCampaignEndDateTime   !== opts.end)   return false;

                return true;
            };

            var match = _.find(resp.profiles, mm);
            return match ? match.id : null;
        }

        $scope.save = function (campaign) {

            var happyHourCampaignProfile = $scope.generateHappyHourCampaignProfile(campaign);

            return CMPFService.createOfferCampaign(happyHourCampaignProfile).then(function (cmpfResponse) {
                // If any backend checks fail, CMPF returns with error details in the response.data obj
                var respData = cmpfResponse && cmpfResponse.data ? cmpfResponse.data : null;

                if (respData && respData.errorCode) {
                    notification({
                        type: 'danger',
                        text: $translate.instant('CommonMessages.ApiError', {
                            errorCode: respData.errorCode,
                            errorText: respData.errorDescription || 'Unknown error'
                        })
                    });
                    return $q.reject({ stage: 'createOfferCampaign', data: respData });
                }

                // The response will be a full list of profiles attached to the ContentOffer. Attempting to locate the created campaing profile
                var profileId = getHHProfileId(cmpfResponse, {
                    name: campaign.HHCampaignName,
                    start: $scope.dateHolder.startDate ? $filter('date')($scope.dateHolder.startDate, "yyyy-MM-dd'T'HH:mm:ss") : "",
                    end  : $scope.dateHolder.endDate   ? $filter('date')($scope.dateHolder.endDate,   "yyyy-MM-dd'T'HH:mm:ss") : "",
                    requireSelectedTones: true
                });

                if (!profileId) {
                    notification({
                        type: 'danger',
                        text: $translate.instant('CommonMessages.ProfileNotFound')
                    });
                    return $q.reject({ stage: 'profileLookup' });
                }

                // Validations should prevent this case.
                if (!campaign.toneIds || campaign.toneIds.length === 0) {
                    $state.go($scope.listState);
                    return;
                }


                var payload = {
                    campaignId: profileId,
                    contentList: campaign.toneIds,
                    status: 0,
                    id: 0
                };

                // Creating content list
                return SSMSubscribersService.createCampaignContentList(payload).then(function (campaignContentResponse) {
                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                    $state.go($scope.listState);
                    return campaignContentResponse;
                }, function (error) {

                    var errorCode = 'Unknown';
                    var errorText = 'Failed to create campaign content list';

                    if (error && error.data) {
                        if (error.data.errorCode) { errorCode = error.data.errorCode; }
                        if (error.data.errorDescription) { errorText = error.data.errorDescription; }
                    } else if (error && error.message) {
                        errorText = error.message;
                    }

                    notification({
                        type: 'danger',
                        text: $translate.instant('CommonMessages.ApiError', {
                            errorCode: errorCode,
                            errorText: errorText
                        })
                    });

                    return $q.reject({ stage: 'createCampaignContentList', error: error });
                });

            }, function (response) {
                var message;
                var data = response && response.data ? response.data : {};

                if (data.errorCode === 5022130) {
                    message = $translate.instant('Services.RBT.Campaigns.Messages.CampaignOverlappedError');
                } else {
                    message = data.errorDescription || $translate.instant('CommonMessages.GenericServerError');
                }

                notification({ type: 'warning', text: message });
                return $q.reject({ stage: 'createOfferCampaign.http', response: response });

            });
        };

    });

    RBTCampaignsXDaysFreeModule.controller('RBTCampaignsXDaysFreeUpdateCtrl', function ($scope, $log, $q, $state,$filter,Restangular,  $stateParams, $translate, $controller,SessionService, notification, DateTimeConstants, UtilService, CMPFService, SSMSubscribersService, profileId, campaigns, toneIds) {
        $log.debug("RBTCampaignsXDaysFreeUpdateCtrl");

        $controller('RBTCampaignsXDaysFreeCommonCtrl', {$scope: $scope});
        $controller('ContentManagementOperationsRBTCtrl', {$scope: $scope});

        var campaignProfile = CMPFService.findProfileById(campaigns.profiles,profileId);
        var campaignTones = Restangular.stripRestangular(toneIds);

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
            HHCampaignLastUpdatedDateTime: $filter('date')(new Date(campaignProfile.HHCampaignLastUpdatedDateTime), 'yyyy-MM-dd\'T\'HH:mm:ss'),
            HHCampaignHasSelectedTones: true
        };
        $scope.originalCampaign = angular.copy($scope.campaign);
        $scope.dateHolderOriginal = angular.copy($scope.dateHolder);

        // do not move up, intentionally not included in originalCampaign.
        $scope.campaign.tones = campaignTones.toneList;
        $scope.campaign.toneIds = campaignTones.contentList;
        $scope.originalToneIds = angular.copy($scope.campaign.toneIds);
        $scope.campaign.campaignContentListId = campaignTones.campaignContentListId;

        $scope.save = function (campaign) {
            var basicsChanged = $scope.hasCampaignBasicsChanged();
            var tonesChanged  = $scope.haveToneIdsChanged();

            if (!basicsChanged && !tonesChanged) {
                notification({
                    type: 'info',
                    text: $translate.instant('CommonMessages.NoChangesDetected') || 'No changes to save.'
                });
                return $q.when();
            }

            var doUpdateCampaign = function () {
                if (!basicsChanged) return $q.when(); // if campaign profile has not been changed, skip this request

                var updatedCampaignProfile = JSON.parse(angular.toJson(campaign));
                updatedCampaignProfile.HHCampaignHasSelectedTones = true;
                updatedCampaignProfile.HHCampaignStartDateTime = $filter('date')($scope.dateHolder.startDate, "yyyy-MM-dd'T'HH:mm:ss");
                updatedCampaignProfile.HHCampaignEndDateTime   = $filter('date')($scope.dateHolder.endDate,   "yyyy-MM-dd'T'HH:mm:ss");
                updatedCampaignProfile.HHCampaignLastUpdatedUser = SessionService.getUsername();
                updatedCampaignProfile.HHCampaignLastUpdatedDateTime = $filter('date')(new Date(), "yyyy-MM-dd'T'HH:mm:ss");
                updatedCampaignProfile.HHCampaignReminderDaysBeforePaidRenewal = (campaign.allowReminder ? campaign.HHCampaignReminderDaysBeforePaidRenewal : 0);

                // clean ui only fields
                delete updatedCampaignProfile.allowReminder;
                delete updatedCampaignProfile.tones;
                delete updatedCampaignProfile.toneIds;
                delete updatedCampaignProfile.campaignContentListId;

                var originalCampaignProfile = $scope.originalCampaignProfile;
                var campaignProfileArray = CMPFService.prepareProfile(updatedCampaignProfile, $scope.originalCampaignProfile);
                originalCampaignProfile.attributes = campaignProfileArray;

                return CMPFService.updateOfferCampaign(originalCampaignProfile, campaign.profileId).then(function (response) {
                    var d = response && response.data ? response.data : {};
                    if (d.errorCode) {
                        notification({
                            type: 'danger',
                            text: $translate.instant('CommonMessages.ApiError', {
                                errorCode: d.errorCode,
                                errorText: d.errorDescription || 'Unknown error'
                            })
                        });
                        return $q.reject({ stage: 'updateOfferCampaign', data: d });
                    }
                    return response;
                }, function (error) {
                    $log('Error in updating campaign: ', error);

                    var data = error && error.data ? error.data : {};
                    var message;
                    if (data.errorCode === 5022130) {
                        message = $translate.instant('Services.RBT.Campaigns.Messages.CampaignOverlappedError');
                    } else {
                        message = data.errorDescription || $translate.instant('CommonMessages.GenericServerError');
                    }
                    notification({ type: 'warning', text: message });
                    return $q.reject({ stage: 'updateOfferCampaign.http', error: error });
                });
            };

            var doUpdateTones = function () {
                if (!tonesChanged) return $q.when(); // if selected tones for the campaign have not been changed, skip this request

                var payload = {
                    campaignId: $scope.originalCampaign.profileId,
                    id: $scope.campaign.campaignContentListId,
                    contentList: $scope.campaign.toneIds,
                    status: 1
                };

                return SSMSubscribersService.updateCampaignContentList(payload).then(function (resp) {
                    var d = resp && resp.data ? resp.data : {};
                    if (d.errorCode) {
                        notification({
                            type: 'danger',
                            text: $translate.instant('CommonMessages.ApiError', {
                                errorCode: d.errorCode,
                                errorText: d.errorDescription || 'Unknown error'
                            })
                        });
                        return $q.reject({ stage: 'updateCampaignContentList', data: d });
                    }
                    return resp;
                }, function (error) {
                    $log('Error in updating campaign: ', error);
                    var errText = (error && error.data && error.data.errorDescription) ? error.data.errorDescription
                        : (error && error.message) ? error.message
                            : 'Failed to update campaign content list';

                    notification({ type: 'danger', text: $translate.instant('CommonMessages.ApiError', {
                            errorCode: (error && error.data && error.data.errorCode) ? error.data.errorCode : 'Unknown',
                            errorText: errText
                        })});
                    return $q.reject({ stage: 'updateCampaignContentList.http', error: error });
                });
            };

            // Safer to update campaign first, then tones
            var chain = $q.when()
                .then(doUpdateCampaign)
                .then(doUpdateTones)
                .then(function () {
                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                    $state.go($scope.listState);
                });

            return chain;
        };

    });

})();
