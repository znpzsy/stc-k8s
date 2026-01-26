(function () {

    'use strict';

    angular.module('ccportal.subscriber-info.services', [
        'ccportal.subscriber-info.services.constants',
        'ccportal.subscriber-info.services.filters',
        'ccportal.subscriber-info.services.directives'
    ]);

    var ServicesModule = angular.module('ccportal.subscriber-info.services');

    ServicesModule.config(function ($stateProvider) {

        $stateProvider.state('subscriber-info.services', {
            url: "/services",
            templateUrl: 'subscriber-info/services/services.html',
            controller: 'ServicesListCtrl',
            data: {
                headerKey: 'Dashboard.PageHeader'
            },
            resolve: {
                services: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllServices(true);
                },
                organizations: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizations();
                },
                serviceCategoriesOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_SERVICE_CATEGORIES_ORGANIZATION_NAME);
                }
            }
        });

    });

    ServicesModule.controller('ServicesListCtrl', function ($log, $q, $scope, $filter, $uibModal, NgTableParams, NgTableService, CMPFService, DEFAULT_REST_QUERY_LIMIT,
                                                            SERVICE_TYPES, services, organizations, serviceCategoriesOrganization) {
        $log.debug('ServicesListCtrl');

        $scope.SERVICE_TYPES = SERVICE_TYPES;

        var organizationList = organizations.organizations;
        $scope.organizationList = $filter('orderBy')(organizationList, ['name']);

        $scope.serviceSubCategories = [];
        if (serviceCategoriesOrganization.organizations && serviceCategoriesOrganization.organizations.length > 0) {
            $scope.serviceCategoriesOrganization = serviceCategoriesOrganization.organizations[0];

            // ServiceMainCategoryProfile
            var serviceMainCategoryProfiles = CMPFService.getMainServiceCategories($scope.serviceCategoriesOrganization);

            // Filter out the related sub categories.
            $scope.serviceSubCategories = CMPFService.getSubServiceCategories($scope.serviceCategoriesOrganization);
            $scope.serviceSubCategories = _.each($scope.serviceSubCategories, function (serviceSubCategory) {
                if (serviceMainCategoryProfiles.length > 0) {
                    var foundServiceMainCategory = _.findWhere(serviceMainCategoryProfiles, {"profileId": Number(serviceSubCategory.MainCategoryID)});
                    serviceSubCategory.serviceCategory = angular.copy(foundServiceMainCategory);
                }

                return serviceSubCategory;
            });
            $scope.serviceSubCategories = $filter('orderBy')($scope.serviceSubCategories, ['serviceCategory.Name', 'Name']);
        }

        $scope.originalServiceList = services ? services.services : [];

        $scope.serviceList = {
            list: $scope.originalServiceList,
            tableParams: {}
        };

        $scope.serviceList.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "id": 'asc'
            }
        }, {
            $scope: $scope,
            total: 0,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.serviceList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.serviceList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.serviceList.tableParams.settings().$scope.filterText = filterText;
            $scope.serviceList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.serviceList.tableParams.page(1);
            $scope.serviceList.tableParams.reload();
        }, 500);

        $scope.filterOutServiceList = function (filterType) {
            var deferred = $q.defer();

            if ($scope.filter) {
                if (filterType === 'ORGANIZATION' && $scope.filter.organization) {
                    delete $scope.filter.category;
                    delete $scope.filter.type;

                    var filteredServiceList = _.filter($scope.originalServiceList, {organizationId: $scope.filter.organization.id});
                    deferred.resolve(filteredServiceList);
                } else if (filterType === 'CATEGORY' && $scope.filter.category) {
                    delete $scope.filter.organization;
                    delete $scope.filter.type;

                    CMPFService.getServiceByCategory($scope.filter.category.profileId, 0, DEFAULT_REST_QUERY_LIMIT, true).then(function (response) {
                        deferred.resolve(response.services);
                    });
                } else if (filterType === 'TYPE' && $scope.filter.type) {
                    delete $scope.filter.organization;
                    delete $scope.filter.category;

                    CMPFService.getServiceByType($scope.filter.type.value, 0, DEFAULT_REST_QUERY_LIMIT, true).then(function (response) {
                        deferred.resolve(response.services);
                    });
                } else {
                    delete $scope.filter.organization;
                    delete $scope.filter.category;
                    delete $scope.filter.type;

                    $scope.serviceList.list = $scope.originalServiceList;
                    $scope.serviceList.tableParams.page(1);
                    $scope.serviceList.tableParams.reload();
                }
            } else {
                $scope.serviceList.list = $scope.originalServiceList;
                $scope.serviceList.tableParams.page(1);
                $scope.serviceList.tableParams.reload();
            }

            deferred.promise.then(function (response) {
                $scope.serviceList.list = response;

                if ($scope.filter.organization) {
                    _.each($scope.serviceList.list, function (service) {
                        service.organization = $scope.filter.organization;
                    });
                }

                $scope.serviceList.tableParams.page(1);
                $scope.serviceList.tableParams.reload();
            });
        };

        // Task details modal window.
        $scope.showService = function (service) {
            service.rowSelected = true;

            var modalInstance = $uibModal.open({
                animation: false,
                templateUrl: 'partials/modal/empty.modal.html',
                controller: function ($scope, $controller, $translate, $uibModalInstance, allOrganizations, taskDetail) {
                    $controller('ServiceDetailCtrl', {
                        $scope: $scope,
                        allOrganizations: allOrganizations,
                        taskDetail: taskDetail,
                        $uibModalInstance: $uibModalInstance
                    });

                    $scope.modalTitle = $translate.instant('SubscriberInfo.Services.Details.DetailsModalTitle');
                    $scope.templateUrl = 'subscriber-info/services/services.detail.html';

                    $scope.close = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                size: 'lg',
                resolve: {
                    allOrganizations: function (CMPFService, DEFAULT_REST_QUERY_LIMIT, UtilService) {
                        return CMPFService.getAllOrganizations(false, true, [CMPFService.OPERATOR_PROFILE]);
                    },
                    taskDetail: function () {
                        var deferred = $q.defer();

                        CMPFService.getService(service.id).then(function (response) {
                            deferred.resolve({
                                serviceTask: {
                                    objectDetail: response
                                }
                            });
                        });

                        return deferred.promise;
                    }
                }
            });

            modalInstance.result.then(function () {
                service.rowSelected = false;
            }, function () {
                service.rowSelected = false;
            });
        };

        $scope.showContents = function (entity) {
            entity.rowSelected = true;

            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.contents.html',
                controller: 'ContentsModalInstanceCtrl',
                size: 'lg',
                resolve: {
                    modalTitleKey: function () {
                        return 'SubscriberInfo.Services.Contents.ContentsModalTitle';
                    },
                    entityParameter: function () {
                        return entity;
                    },
                    contents: function ($q, ContentManagementService, DEFAULT_REST_QUERY_LIMIT) {
                        var deferred = $q.defer();

                        var filter = {
                            serviceId: entity.id,
                            page: 0,
                            size: DEFAULT_REST_QUERY_LIMIT
                        };

                        ContentManagementService.getContentMetadatas(filter).then(function (contents) {
                            if (contents && contents.detail) {
                                deferred.resolve(contents);
                            } else {
                                deferred.resolve({
                                    detail: {
                                        contentList: []
                                    }
                                });
                            }
                        }, function (response) {
                            deferred.resolve({
                                detail: {
                                    contentList: []
                                }
                            });
                        });

                        return deferred.promise;
                    }
                }
            });

            modalInstance.result.then(function () {
                entity.rowSelected = false;
            }, function () {
                entity.rowSelected = false;
            });
        };

        $scope.showOffers = function (entity) {
            entity.rowSelected = true;

            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.offers.html',
                controller: 'OffersModalInstanceCtrl',
                size: 'lg',
                resolve: {
                    modalTitleKey: function () {
                        return 'SubscriberInfo.Services.Offers.OffersModalTitle';
                    },
                    entityParameter: function () {
                        return entity;
                    },
                    offers: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                        return CMPFService.getOffersByServiceName(0, DEFAULT_REST_QUERY_LIMIT, entity.name);
                    }
                }
            });

            modalInstance.result.then(function () {
                entity.rowSelected = false;
            }, function () {
                entity.rowSelected = false;
            });
        };
    });

    ServicesModule.controller('ServiceDetailCtrl', function ($scope, $log, $filter, $uibModalInstance, $translate, notification, Restangular, UtilService, FileDownloadService, CMPFService,
                                                             DateTimeConstants, ContentManagementService, allOrganizations, taskDetail, DEFAULT_REST_QUERY_LIMIT, DAYS_OF_WEEK) {
        $log.debug("ServiceDetailCtrl");

        $scope.DAYS_OF_WEEK = DAYS_OF_WEEK;

        $scope.task = Restangular.stripRestangular(taskDetail);

        var currentTask = $scope.task.serviceTask;
        var currentDetail = currentTask.objectDetail;

        // Find the organization of the task item.
        var foundOrganization = _.findWhere(allOrganizations.organizations, {"id": s.toNumber(currentDetail.organizationId)});
        currentDetail.serviceProviderName = _.isUndefined(foundOrganization) ? 'N/A' : foundOrganization.name;

        // Servicei18nProfile
        var servicei18nProfiles = CMPFService.getProfileAttributes(currentDetail.profiles, CMPFService.SERVICE_I18N_PROFILE);
        currentDetail.servicei18nProfiles = [];
        if (servicei18nProfiles.length > 0) {
            var servicei18nProfilesEn = _.findWhere(servicei18nProfiles, {Language: 'EN'});
            if (servicei18nProfilesEn) {
                currentDetail.servicei18nProfiles.push(servicei18nProfilesEn);
            } else {
                currentDetail.servicei18nProfiles.push({
                    Language: 'EN',
                    Name: '',
                    Description: '',
                    SearchKeyword: '',
                    IsDefault: false
                });
            }

            var servicei18nProfilesAr = _.findWhere(servicei18nProfiles, {Language: 'AR'});
            if (servicei18nProfilesAr) {
                currentDetail.servicei18nProfiles.push(servicei18nProfilesAr);
            } else {
                currentDetail.servicei18nProfiles.push({
                    Language: 'AR',
                    Name: '',
                    Description: '',
                    SearchKeyword: '',
                    IsDefault: false
                });
            }
        }

        // ServiceProfile
        var serviceProfiles = CMPFService.getProfileAttributes(currentDetail.profiles, CMPFService.SERVICE_PROFILE);
        if (serviceProfiles.length > 0) {
            currentDetail.serviceProfile = angular.copy(serviceProfiles[0]);

            CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_ORGANIZATION_NAME + ' ').then(function (response) {
                // Get business types.
                var businessTypesOrganization = _.findWhere(response.organizations, {name: CMPFService.DEFAULT_BUSINESS_TYPES_ORGANIZATION_NAME});
                var businessTypes = CMPFService.getBusinessTypes(businessTypesOrganization);
                currentDetail.serviceProfile.businessType = _.findWhere(businessTypes, {profileId: Number(currentDetail.serviceProfile.BusinessTypeID)});

                // Get settlement types.
                var settlementTypesOrganization = _.findWhere(response.organizations, {name: CMPFService.DEFAULT_SETTLEMENT_TYPES_ORGANIZATION_NAME});
                $scope.settlementTypes = CMPFService.getSettlementTypes(settlementTypesOrganization);
                currentDetail.serviceProfile.settlementType = _.findWhere($scope.settlementTypes, {profileId: Number(currentDetail.serviceProfile.SettlementTypeID)});

                // Get sub categories.
                var serviceCategoriesOrganization = _.findWhere(response.organizations, {name: CMPFService.DEFAULT_SERVICE_CATEGORIES_ORGANIZATION_NAME});
                var subServiceCategories = CMPFService.getSubServiceCategories(serviceCategoriesOrganization);
                currentDetail.serviceProfile.category = _.findWhere(subServiceCategories, {profileId: Number(currentDetail.serviceProfile.CategoryID)});

                // Get labels.
                var serviceLabelsOrganization = _.findWhere(response.organizations, {name: CMPFService.DEFAULT_SERVICE_LABELS_ORGANIZATION_NAME});
                var serviceLabels = CMPFService.getServiceLabels(serviceLabelsOrganization);
                currentDetail.serviceProfile.label = _.findWhere(serviceLabels, {profileId: Number(currentDetail.serviceProfile.LabelID)});
            });

            if (currentDetail.serviceProfile.WEBIconID) {
                var srcUrl = ContentManagementService.generateFilePath(currentDetail.serviceProfile.WEBIconID);
                FileDownloadService.downloadFileAndGenerateUrl(srcUrl, function (blobUrl, fileName) {
                    currentDetail.serviceProfile.WEBIconBlobUrl = blobUrl;
                    currentDetail.serviceProfile.WEBIconName = fileName;
                });
            }

            if (currentDetail.serviceProfile.WAPIconID) {
                var srcUrl = ContentManagementService.generateFilePath(currentDetail.serviceProfile.WAPIconID);
                FileDownloadService.downloadFileAndGenerateUrl(srcUrl, function (blobUrl, fileName) {
                    currentDetail.serviceProfile.WAPIconBlobUrl = blobUrl;
                    currentDetail.serviceProfile.WAPIconName = fileName;
                });
            }
        }

        // ServiceCapabilityAccessProfile
        var serviceCapabilityAccessProfiles = CMPFService.getProfileAttributes(currentDetail.profiles, CMPFService.SERVICE_CAPABILITY_ACCESS_PROFILE);
        currentDetail.serviceCapabilityAccessProfileList = [];
        if (serviceCapabilityAccessProfiles.length > 0) {
            _.each(serviceCapabilityAccessProfiles, function (serviceCapabilityAccessProfile) {
                var serviceCapabilityAccessProfileItem = _.extend({id: _.uniqueId()}, serviceCapabilityAccessProfile);

                currentDetail.serviceCapabilityAccessProfileList.push(serviceCapabilityAccessProfileItem);
            });

            currentDetail.serviceCapabilityAccessProfileList = $filter('orderBy')(currentDetail.serviceCapabilityAccessProfileList, ['CapabilityName']);

            $scope.getServiceCapabilityAccessProfileString = function (serviceCapabilityAccessProfile) {
                var resultStr = serviceCapabilityAccessProfile.CapabilityName;

                return resultStr;
            };
        }

        // MOChargingProfile
        var moChargingProfiles = CMPFService.getProfileAttributes(currentDetail.profiles, CMPFService.SERVICE_MO_CHARGING_PROFILE);
        if (moChargingProfiles.length > 0) {
            currentDetail.moChargingProfile = angular.copy(moChargingProfiles[0]);
        }

        // MTChargingProfile
        var mtChargingProfiles = CMPFService.getProfileAttributes(currentDetail.profiles, CMPFService.SERVICE_MT_CHARGING_PROFILE);
        currentDetail.mtChargingProfileList = [];
        if (mtChargingProfiles && mtChargingProfiles.length > 0) {
            _.each(mtChargingProfiles, function (mtChargingProfile) {
                var mtChargingProfileItem = _.extend({id: _.uniqueId()}, mtChargingProfile);

                currentDetail.mtChargingProfileList.push(mtChargingProfileItem);
            });

            $scope.getMTServiceFeeProfileString = function (serviceFeeProfile) {
                var resultStr = 'MT Short Code: ' + serviceFeeProfile.ShortCode +
                    ', MT Service Fee (SAR): ' + serviceFeeProfile.Fee;

                return resultStr;
            };
        }

        // Template attributes
        if (currentDetail.serviceProfile && currentDetail.serviceProfile.Type && currentDetail.serviceProfile.Type.startsWith('STANDARD_')) {
            if (currentDetail.serviceProfile.Template === 'ALERTS' || currentDetail.serviceProfile.Template === 'SEQUENTIAL') {
                // AlertTemplateProfile
                var alertTemplateProfiles = CMPFService.getProfileAttributes(currentDetail.profiles, CMPFService.SERVICE_ALERT_TEMPLATE_PROFILE);
                if (alertTemplateProfiles.length > 0) {
                    currentDetail.templateAttributes = angular.copy(alertTemplateProfiles[0]);

                    if (currentDetail.templateAttributes.TimesOfDay) {
                        currentDetail.templateAttributes.TimesOfDay = currentDetail.templateAttributes.TimesOfDay.split(';');
                    } else {
                        currentDetail.templateAttributes.TimesOfDay = [];
                    }
                    if (currentDetail.templateAttributes.DaysOfWeek) {
                        currentDetail.templateAttributes.DaysOfWeek = currentDetail.templateAttributes.DaysOfWeek.split(';');

                        currentDetail.templateAttributes.dummyDaysOfWeek = [];
                        _.each($scope.DAYS_OF_WEEK, function (dayOfWeek, index) {
                            currentDetail.templateAttributes.dummyDaysOfWeek[index] = _.contains(currentDetail.templateAttributes.DaysOfWeek, dayOfWeek.abbr);
                        });
                    } else {
                        currentDetail.templateAttributes.DaysOfWeek = [];
                    }
                    if (currentDetail.templateAttributes.DaysOfMonth) {
                        currentDetail.templateAttributes.DaysOfMonth = currentDetail.templateAttributes.DaysOfMonth.toString();
                        currentDetail.templateAttributes.DaysOfMonth = currentDetail.templateAttributes.DaysOfMonth.split(';');
                    } else {
                        currentDetail.templateAttributes.DaysOfMonth = [];
                    }
                }
            } else if (currentDetail.serviceProfile.Template === 'ON_DEMAND') {
                // OnDemandTemplateProfile
                var onDemandTemplateProfiles = CMPFService.getProfileAttributes(currentDetail.profiles, CMPFService.SERVICE_ON_DEMAND_TEMPLATE_PROFILE);
                if (onDemandTemplateProfiles.length > 0) {
                    currentDetail.templateAttributes = angular.copy(onDemandTemplateProfiles[0]);
                }
            } else if (currentDetail.serviceProfile.Template === 'OTHER') {
                // OtherTemplateProfile
                var otherTemplateProfiles = CMPFService.getProfileAttributes(currentDetail.profiles, CMPFService.SERVICE_OTHER_TEMPLATE_PROFILE);
                if (otherTemplateProfiles.length > 0) {
                    currentDetail.templateAttributes = angular.copy(otherTemplateProfiles[0]);
                }
            }

            if (currentDetail.templateAttributes && currentDetail.templateAttributes.ServiceProposalFileID) {
                var srcUrl = ContentManagementService.generateFilePath(currentDetail.templateAttributes.ServiceProposalFileID);
                FileDownloadService.downloadFileAndGetBlob(srcUrl, function (blob, fileName) {
                    currentDetail.templateAttributes.ServiceProposalFile = blob;
                    currentDetail.templateAttributes.ServiceProposalFileName = fileName;
                });
            }
        }

        // ProductProfile
        var productProfiles = CMPFService.getProfileAttributes(currentDetail.profiles, CMPFService.SERVICE_PRODUCT_PROFILE);
        if (productProfiles.length > 0) {
            currentDetail.productProfile = angular.copy(productProfiles[0]);
        }

        // DCBServiceProfile
        var dcbServiceProfiles = CMPFService.getProfileAttributes(currentDetail.profiles, CMPFService.SERVICE_DCB_SERVICE_PROFILE);
        if (dcbServiceProfiles.length > 0) {
            currentDetail.dcbServiceProfile = angular.copy(dcbServiceProfiles[0]);
        }

        // DCBServiceActivationProfile
        var dcbServiceActivationProfiles = CMPFService.getProfileAttributes(currentDetail.profiles, CMPFService.SERVICE_DCB_SERVICE_ACTIVATION_PROFILE);
        if (dcbServiceActivationProfiles.length > 0) {
            currentDetail.dcbServiceActivationProfile = angular.copy(dcbServiceActivationProfiles[0]);
        }

        // KeywordChapterMappingProfile
        var keywordChapterMappingProfiles = CMPFService.getProfileAttributes(currentDetail.profiles, CMPFService.SERVICE_KEYWORD_CHAPTER_MAPPING_PROFILE);
        currentDetail.keywordChapterMappingProfileList = [];
        if (keywordChapterMappingProfiles && keywordChapterMappingProfiles.length > 0) {
            _.each(keywordChapterMappingProfiles, function (keywordChapterMappingProfile) {
                var keywordChapterMappingProfileItem = _.extend({id: _.uniqueId()}, keywordChapterMappingProfile);

                currentDetail.keywordChapterMappingProfileList.push(keywordChapterMappingProfileItem);
            });

            $scope.getKeywordChapterMappingProfileString = function (keywordChapterMappingProfile) {
                var resultStr = 'Chapter Keyword: ' + keywordChapterMappingProfile.ChapterKeyword +
                    ', Chapter ID: ' + keywordChapterMappingProfile.ChapterId;

                return resultStr;
            };
        }

        // OnDemandi18nProfile
        var onDemandi18nProfiles = CMPFService.getProfileAttributes(currentDetail.profiles, CMPFService.SERVICE_ON_DEMAND_I18N_PROFILE);
        currentDetail.onDemandi18nProfileList = [];
        if (onDemandi18nProfiles && onDemandi18nProfiles.length > 0) {
            _.each(onDemandi18nProfiles, function (onDemandi18nProfile) {
                var onDemandi18nProfileItem = _.extend({id: _.uniqueId()}, onDemandi18nProfile);

                currentDetail.onDemandi18nProfileList.push(onDemandi18nProfileItem);
            });

            $scope.getOnDemandi18nProfileString = function (onDemandi18nProfile) {
                var languageStr = $translate.instant('Languages.' + onDemandi18nProfile.Language);

                var resultStr = 'Lang.: ' + languageStr;

                if (onDemandi18nProfile.OnDemandShortCode) {
                    resultStr += ', Short Code: ' + onDemandi18nProfile.OnDemandShortCode;
                }
                if (onDemandi18nProfile.OnDemandCommands) {
                    resultStr += ', Keywords: ' + onDemandi18nProfile.OnDemandCommands;
                }
                if (onDemandi18nProfile.OnDemandResponseMessage) {
                    resultStr += ', Response Message: ' + onDemandi18nProfile.OnDemandResponseMessage;
                }

                return resultStr;
            };
        }

        // SenderIdProfile
        var senderIdProfiles = CMPFService.getProfileAttributes(currentDetail.profiles, CMPFService.SERVICE_SENDER_ID_PROFILE);
        if (senderIdProfiles.length > 0) {
            currentDetail.senderIdProfile = angular.copy(senderIdProfiles[0]);
        }

        // SubscriptionNotificationProfile
        var subscriptionNotificationProfiles = CMPFService.getProfileAttributes(currentDetail.profiles, CMPFService.SERVICE_SUBSCRIPTION_NOTIFICATION_PROFILE);
        if (subscriptionNotificationProfiles.length > 0) {
            currentDetail.subscriptionNotificationProfile = angular.copy(subscriptionNotificationProfiles[0]);
        }

        // ServiceCopyrightFileProfile
        var serviceCopyrightFileProfiles = CMPFService.getProfileAttributes(currentDetail.profiles, CMPFService.SERVICE_COPYRIGHT_FILE_PROFILE);
        currentDetail.serviceCopyrightFileProfileList = [];
        if (serviceCopyrightFileProfiles.length > 0) {
            _.each(serviceCopyrightFileProfiles, function (serviceCopyrightFileProfile) {
                var serviceCopyrightFileProfileItem = angular.copy(serviceCopyrightFileProfile);
                if (serviceCopyrightFileProfileItem.ValidFrom) {
                    serviceCopyrightFileProfileItem.ValidFrom = new Date(moment(serviceCopyrightFileProfileItem.ValidFrom).utcOffset(DateTimeConstants.OFFSET).format('YYYY/MM/DD HH:mm:ss'));
                }
                if (serviceCopyrightFileProfileItem.ValidTo) {
                    serviceCopyrightFileProfileItem.ValidTo = new Date(moment(serviceCopyrightFileProfileItem.ValidTo).utcOffset(DateTimeConstants.OFFSET).format('YYYY/MM/DD HH:mm:ss'));
                }

                // Get the CopyrightFile by id value.
                serviceCopyrightFileProfileItem.copyrightFile = {name: undefined};
                if (serviceCopyrightFileProfileItem.CopyrightFileID) {
                    var srcUrl = ContentManagementService.generateFilePath(serviceCopyrightFileProfileItem.CopyrightFileID);
                    FileDownloadService.downloadFileAndGetBlob(srcUrl, function (blob, fileName) {
                        serviceCopyrightFileProfileItem.copyrightFile = blob;
                        if (blob) {
                            serviceCopyrightFileProfileItem.copyrightFile.name = fileName;
                        }
                        currentDetail.serviceCopyrightFileProfileList = $filter('orderBy')(currentDetail.serviceCopyrightFileProfileList, ['copyrightFile.name']);
                    });
                }

                currentDetail.serviceCopyrightFileProfileList.push(serviceCopyrightFileProfileItem);
            });
        }

        // ServiceVATProfile
        var serviceVATProfiles = CMPFService.getProfileAttributes(currentDetail.profiles, CMPFService.SERVICE_VAT_PROFILE);
        if (serviceVATProfiles.length > 0) {
            currentDetail.serviceVATProfile = angular.copy(serviceVATProfiles[0]);
        }

        // ServiceContentBasedSettlementProfile
        var serviceContentBasedSettlementProfiles = CMPFService.getProfileAttributes(currentDetail.profiles, CMPFService.SERVICE_CONTENT_BASED_SETTLEMENT_PROFILE);
        currentDetail.serviceContentBasedSettlementProfileList = [];
        if (serviceContentBasedSettlementProfiles && serviceContentBasedSettlementProfiles.length > 0) {
            _.each(serviceContentBasedSettlementProfiles, function (serviceContentBasedSettlementProfile) {
                var serviceContentBasedSettlementProfileItem = _.extend({id: _.uniqueId()}, serviceContentBasedSettlementProfile);

                currentDetail.serviceContentBasedSettlementProfileList.push(serviceContentBasedSettlementProfileItem);
            });

            $scope.getServiceContentBasedSettlementProfileString = function (serviceContentBasedSettlementProfile) {
                var foundSettlementType = _.findWhere($scope.settlementTypes, {profileId: serviceContentBasedSettlementProfile.SettlementTypeID});
                if (!foundSettlementType) {
                    foundSettlementType = {
                        Name: 'N/A'
                    }
                }

                var resultStr = serviceContentBasedSettlementProfile.ContentTypeName +
                    (serviceContentBasedSettlementProfile.ContentTypeID ? ', ' + serviceContentBasedSettlementProfile.ContentTypeID : '') +
                    (serviceContentBasedSettlementProfile.ProductCategoryID ? ', ' + serviceContentBasedSettlementProfile.ProductCategoryID : '') +
                    ', ' + foundSettlementType.Name;

                return resultStr;
            };
        }

        $scope.ok = function () {
            $uibModalInstance.close();
        };
    });


})();
