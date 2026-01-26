(function () {

    'use strict';

    angular.module('adminportal.subsystems.contentmanagement.operations.rbt.contentmetadatas.services', []);

    var ContentManagementOperationsServicesModule = angular.module('adminportal.subsystems.contentmanagement.operations.rbt.contentmetadatas.services');

    ContentManagementOperationsServicesModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.contentmanagement.operations.rbt.contentmetadatas.services', {
            abstract: true,
            url: "",
            template: "<div ui-view></div>"
        }).state('subsystems.contentmanagement.operations.rbt.contentmetadatas.services.list', {
            url: "/services",
            templateUrl: "subsystems/contentmanagement/operations/rbt/operations.contentmetadatas.services.html",
            controller: 'ContentManagementOperationsContentMetadatasRBTServicesCtrl',
            resolve: {
                organizations: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizations(0, DEFAULT_REST_QUERY_LIMIT);
                },
                cmpfServices: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getServices(0, DEFAULT_REST_QUERY_LIMIT, false, true);
                },
                cmsServices: function (RBTContentManagementService) {
                    return RBTContentManagementService.getServices();
                }
            }
        }).state('subsystems.contentmanagement.operations.rbt.contentmetadatas.services.serviceUpdate', {
            url: "/services/:id",
            templateUrl: "subsystems/contentmanagement/operations/rbt/operations.contentmetadatas.services.detail.html",
            controller: 'ContentManagementOperationsContentMetadatasRBTUpdateServiceCtrl',
            resolve: {
                service: function ($stateParams, $q, $log, UtilService, CMPFService, RBTContentManagementService) {
                    return RBTContentManagementService.getService($stateParams.id);

                    /*var deferred = $q.defer();
                    RBTContentManagementService.getService($stateParams.id).then(function (response) {
                        var service = response.serviceDTO ? response.serviceDTO : response;
                        if (service.subscriptionCode) {
                            CMPFService.getService(service.subscriptionCode).then(function (cmpfResponse) {
                                service.cmpfService = cmpfResponse;
                                deferred.resolve(service);
                            }, function (cmpfResponse) {
                                service.cmpfService = {
                                    organization: {name: 'N/A'}
                                };
                                deferred.resolve(service);
                            });
                        } else {
                            deferred.resolve(service);
                        }

                    }, function (response) {
                        deferred.resolve({id: null, cmpfService:{}});
                    });

                    UtilService.addPromiseToTracker(deferred.promise);
                    return deferred.promise;*/
                }
            }
        });

    });

    ContentManagementOperationsServicesModule.controller('ContentManagementOperationsRBTServicesCommonCtrl', function ($scope, $state, $log, $uibModal, $controller, CMPFService, Restangular, UtilService, STATUS_TYPES, DURATION_UNITS) {
        $log.debug('ContentManagementOperationsRBTServicesCommonCtrl');

        $controller('GenericDateTimeCtrl', {$scope: $scope});

        $scope.dateFilter.startDate = $scope.getTodayBegin();
        $scope.dateFilter.startTime = $scope.getTodayBegin();
        $scope.dateFilter.endDate = $scope.getTodayBegin();
        $scope.dateFilter.endTime = $scope.getTodayBegin();

        $scope.STATUS_TYPES = STATUS_TYPES;
        $scope.DURATION_UNITS = DURATION_UNITS;

        $scope.service = {
            name: '',
            subscriptionCode: '',
            cmpfService: {},
            names: [],
            descriptions: [],
            benefits: [],
            detailDescription: [],
            chargingDetails: {
                price: '',
                originalPrice: '',
                chargingPeriod: {value: 1, unit: 'MONTH'}
            }

        };

        $scope.getAttribute = function (list, attrKey, attr, attrValue) {
            var foundValue = list.find(function(obj) {
                return obj[attrKey] === attr;
            });
            return foundValue ? foundValue[attrValue] : 'N/A';
        };

        $scope.getAttributes = function (list, attrKey, attr, attrValue) {
            var arr = [];
            var foundValue = list.filter(function(obj) {
                return obj[attrKey] === attr;
            });
            return foundValue ? foundValue : 'N/A';
        };

        $scope.setAttribute = function (attrKey, attr, attrValue, value) {
            var item = {};
            item[attrKey] = attr;
            item[attrValue] = value;
            return item;
        };


        /*$scope.showServiceOptions = function () {
            var modalInstance = $uibModal.open({
                templateUrl: 'subsystems/contentmanagement/operations/rbt/operations.contentmetadatas.services.modal.html',
                controller: 'CMPFServicesModalInstanceCtrl',
                size: 'lg',
                resolve: {
                    organizationParameter: function () {
                        return $scope.service.organization;
                    },
                    itemName: function () {
                        return $scope.service.title;
                    },
                    allOrganizations: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                        return CMPFService.getAllOrganizations(0, DEFAULT_REST_QUERY_LIMIT);
                    },
                    allServices: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                        return CMPFService.getServices(0, DEFAULT_REST_QUERY_LIMIT);
                    },
                    servicesModalTitleKey: function () {
                        return 'Subsystems.ContentManagement.Operations.RBT.ContentMetadatas.Services.Title';
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
                $scope.service.cmpfService = selectedItem.service;
                $scope.service.subscriptionCode = selectedItem.service.id;
                $scope.service.organization = selectedItem.service.organization;
                $scope.service.organizationId = selectedItem.service.organization.id;
                $scope.service.organizationName = selectedItem.service.organization.name;
                $scope.service.subscriptionCode = selectedItem.service.id;
            }, function () {
                //
            });
        };*/

        $scope.cancel = function () {
            $scope.go('subsystems.contentmanagement.operations.rbt.contentmetadatas.services.list', {}, {reload: true});
        };

        $scope.$watch('service.chargingDetails.price', function (newValue, oldValue) {
            // original price should be greater than the price
            var originalPriceValid = false;
            if(newValue == null && oldValue == null){
                originalPriceValid = true;
            } else if($scope.service.chargingDetails.originalPrice && $scope.service.chargingDetails.originalPrice >= 0) {
                originalPriceValid = $scope.service.chargingDetails.originalPrice > $scope.service.chargingDetails.price;
            } else {
                originalPriceValid = !$scope.form.originalprice.$modelValue  ? true : ($scope.form.originalprice.$modelValue > newValue);
                // 0 > 0  = false , check for zeros
                originalPriceValid = ($scope.form.originalprice.$modelValue == 0) ? $scope.form.originalprice.$modelValue > newValue : originalPriceValid;
            }

            UtilService.setError($scope.form, 'originalprice', 'pricerange', originalPriceValid);

        });

        $scope.$watch('service.chargingDetails.originalPrice', function (newValue, oldValue) {

            // original price should be greater than the price
            var originalPriceValid = false;

            if(newValue == null && oldValue == null){
                originalPriceValid = true;
            } else if ($scope.service.chargingDetails.originalPrice && $scope.service.chargingDetails.originalPrice >= 0) {
                originalPriceValid = $scope.service.chargingDetails.originalPrice > $scope.service.chargingDetails.price;
            } else {
                originalPriceValid = (newValue == null || newValue == undefined || newValue == 0) ? true : $scope.form.price.$modelValue < newValue;
                // 0 < 0  = false , check for zeros
                originalPriceValid = (newValue == 0) ? $scope.form.price.$modelValue < newValue : originalPriceValid;
            }
            UtilService.setError($scope.form, 'originalprice', 'pricerange', originalPriceValid);
        });
    });

    ContentManagementOperationsServicesModule.controller('ContentManagementOperationsContentMetadatasRBTServicesCtrl', function ($scope, $state, $log, $uibModal, $filter, $translate, notification, NgTableParams,
                                                                                            NgTableService, AuthorizationService, Restangular, RBTContentManagementService, CMPFService, organizations,
                                                                                            cmpfServices, cmsServices, DEFAULT_REST_QUERY_LIMIT, STATUS_TYPES) {
        $log.debug('ContentManagementOperationsContentMetadatasRBTServicesCtrl');
        $scope.originalCmpfServices = angular.copy(cmpfServices);

        var cmsServices = Restangular.stripRestangular(cmsServices);
        $scope.cmsServiceList = $filter('orderBy')(cmsServices.serviceDTOList, 'id');

        _.each($scope.cmsServiceList, function (service) {
            var foundCmpfService = service.subscriptionCode ? _.findWhere(cmpfServices.services, {"id": s.toNumber(service.subscriptionCode)}) : undefined;
            var foundOrganization = _.isUndefined(foundCmpfService) ? {name: 'N/A'} : _.findWhere(organizations.organizations, {"id": s.toNumber(foundCmpfService.organizationId)});
            service.organization = {
                name: _.isUndefined(foundOrganization) ? CMPFService.DEFAULT_ORGANIZATION_NAME : foundOrganization.name
            };
            service.cmpfService = foundCmpfService;
            service.state = foundCmpfService ? foundCmpfService.state : 'N/A';
        });

        $scope.originalCmsServiceList = angular.copy($scope.cmsServiceList);

        $scope.STATUS_TYPES = STATUS_TYPES;

        $scope.stateFilter = 'ALL';
        $scope.stateFilterChange = function (state) {
            if (state !== 'ALL') {
                $scope.cmsServiceList = _.where($scope.originalCmsServiceList, {state: state});
            } else {
                $scope.cmsServiceList = angular.copy($scope.originalCmsServiceList);
            }

            $scope.tableParams.page(1);
            $scope.tableParams.reload();
        };

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'id',
                    headerKey: 'Subsystems.ContentManagement.Operations.RBT.ContentMetadatas.Services.Id'
                },
                {
                    fieldName: 'title',
                    headerKey: 'Subsystems.ContentManagement.Operations.RBT.ContentMetadatas.Services.ServiceTitle'
                },
                {
                    fieldName: 'organization.name',
                    headerKey: 'Subsystems.ContentManagement.Operations.RBT.ContentMetadatas.Services.Organization'
                },
                {
                    fieldName: 'cmpfService.state',
                    headerKey: 'Subsystems.ContentManagement.Operations.RBT.ContentMetadatas.Services.State'
                }
            ]
        };

        $scope.tableParams = new NgTableParams({
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
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.cmsServiceList);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.cmsServiceList;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.tableParams.settings().$scope.filterText = filterText;
            $scope.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.tableParams.page(1);
            $scope.tableParams.reload();
        }, 500);

    });

    ContentManagementOperationsServicesModule.controller('ContentManagementOperationsContentMetadatasRBTUpdateServiceCtrl', function ($scope, $log, $controller, $filter, $uibModal, $q, notification, $translate, Restangular,
                                                                                                 AuthorizationService, ContentManagementService, RBTContentManagementService, UtilService, FileDownloadService, CMPFService, service) {
        $log.debug('ContentManagementOperationsContentMetadatasRBTUpdateServiceCtrl');

        $controller('ContentManagementOperationsRBTServicesCommonCtrl', {$scope: $scope});

        var service = service.serviceDTO;

        $scope.service = {
            id: service.id,
            title: service.title,
            names: service.names ? service.names : [],
            key: service.key,
            descriptions: service.descriptions ? service.descriptions : [],
            detailDescription: service.detailDescription ? service.detailDescription : [],
            benefits: service.benefits ? service.benefits : [],
            price: service.price,
            originalPrice: service.originalPrice,
            validity: service.validity,
            chargingPeriod: service.chargingPeriod,
            chargingPeriodDetail: service.chargingPeriodDetail,
            coverImageId: service.coverImageId,
            cardImageId: service.cardImageId,
            thumbnailId: service.thumbnailId,
            parentId: service.parentId,
            parentName: service.parentName,
            subscriptionCode: s.toNumber(service.subscriptionCode) // Was related to CMPF service (id) - this relationship is maintained by CMS now

        };

        if ($scope.service.chargingPeriodDetail) {
            $scope.service.chargingDetails = {
                chargingPeriod: UtilService.convertPeriodStringToSimpleObject(service.chargingPeriodDetail),
                price: Number(service.price),
                originalPrice: service.originalPrice ? Number(service.originalPrice) : null,
                subscriptionCode: service.subscriptionCode
            };
        } else {
            $scope.service.chargingDetails = {
                chargingPeriod: {value: 1, unit: 'MONTH'},
                price: Number(service.price),
                originalPrice: service.originalPrice ? Number(service.originalPrice) : null,
                subscriptionCode: service.subscriptionCode
            };
        }

        if ($scope.service.names && $scope.service.names.length > 0) {
            $scope.service.nameEn = $scope.getAttribute($scope.service.names, 'lang', 'en', 'name');
            $scope.service.nameAr = $scope.getAttribute($scope.service.names, 'lang', 'ar', 'name');
        }
        if ($scope.service.descriptions && $scope.service.descriptions.length > 0) {
            $scope.service.descriptionEn = $scope.getAttributes($scope.service.descriptions, 'lang', 'en', 'description');
            $scope.service.descriptionAr = $scope.getAttributes($scope.service.descriptions, 'lang', 'ar', 'description');
        }
        if ($scope.service.benefits && $scope.service.benefits.length > 0) {
            $scope.service.benefitsEn = $scope.getAttributes($scope.service.benefits, 'lang', 'en', 'value');
            $scope.service.benefitsAr = $scope.getAttributes($scope.service.benefits, 'lang', 'ar', 'value');
        } else {
            $scope.service.benefitsEn = [{ lang: 'en', value: '' }];
            $scope.service.benefitsAr = [{ lang: 'ar', value: ''}];
        }
        if ($scope.service.detailDescription && $scope.service.benefits.length > 0) {
            $scope.service.detailDescriptionEn =$scope.getAttributes($scope.service.detailDescription, 'lang', 'en', 'description');
            $scope.service.detailDescriptionAr = $scope.getAttributes($scope.service.detailDescription, 'lang', 'ar', 'description');
        } else {
            $scope.service.detailDescriptionEn = [{ lang: 'en', description: '' }];
            $scope.service.detailDescriptionAr = [{ lang: 'ar', description: ''}];
        }

        // Get the coverImage by id value.
        if ($scope.service.coverImageId) {
            $scope.service.coverImage = {name: undefined};
            var srcUrl = ContentManagementService.generateFilePath($scope.service.coverImageId);
            FileDownloadService.downloadFileAndGetBlob(srcUrl, function (blob, fileName) {
                $scope.service.coverImage = blob;
                if (blob) {
                    $scope.service.coverImage.name = fileName;
                }
                $scope.originalService = angular.copy($scope.service);
            });
        }
        // Get the cardImage by id value.
        if ($scope.service.cardImageId) {
            $scope.service.cardImage = {name: undefined};
            var srcUrl = ContentManagementService.generateFilePath($scope.service.cardImageId);
            FileDownloadService.downloadFileAndGetBlob(srcUrl, function (blob, fileName) {
                $scope.service.cardImage = blob;
                if (blob) {
                    $scope.service.cardImage.name = fileName;
                }
                $scope.originalService = angular.copy($scope.service);
            });
        }
        // Get the thumbnail by id value.
        if ($scope.service.thumbnailId) {
            $scope.service.thumbnail = {name: undefined};
            var srcUrl = ContentManagementService.generateFilePath($scope.service.thumbnailId);
            FileDownloadService.downloadFileAndGetBlob(srcUrl, function (blob, fileName) {
                $scope.service.thumbnail = blob;
                if (blob) {
                    $scope.service.thumbnail.name = fileName;
                }
                $scope.originalService = angular.copy($scope.service);
            });
        }

        $scope.originalService = angular.copy($scope.service);
        $scope.originalDateHolder = angular.copy($scope.dateHolder);
        $scope.isNotChanged = function () {
            return angular.equals($scope.service, $scope.originalService)
                && angular.equals($scope.dateHolder, $scope.originalDateHolder);
        };

        $scope.deleteFromList = function(index, list) {
            list.splice(index, 1);
        };

        $scope.addToList = function (lang, list, attr) {
            var item = $scope.setAttribute('lang', lang, attr, '');
            list.push(item);
        };

        $scope.save = function (service) {
            var original = $scope.originalService;
            var serviceItem = {
                // original values preserved for the update operation
                id: original.id,
                subscriptionCode: original.subscriptionCode,
                key: original.key,
                // below will be edited if the file is changed
                coverImageId: original.coverImageId,
                cardImageId: original.cardImageId,
                thumbnailId: original.thumbnailId,
                // edited values
                title: service.title,
                chargingPeriod: service.chargingPeriod,
                chargingPeriodDetail: service.chargingPeriodDetail,
                price: service.price,
                originalPrice: service.originalPrice,
                // will be filled with en & ar values
                names: [],
                descriptions: [],
                benefits: [],
                detailDescription: service.detailDescription ? service.detailDescription : [],
                validity: service.validity,
                parentId: service.parentId,
                parentName: service.parentName
            };
            serviceItem.names.push($scope.setAttribute('lang', 'en', 'name', service.nameEn));
            serviceItem.names.push($scope.setAttribute('lang', 'ar', 'name', service.nameAr));
            serviceItem.descriptions = service.descriptionEn.concat(service.descriptionAr);
            serviceItem.benefits = service.benefitsEn.concat(service.benefitsAr);
            serviceItem.detailDescription = service.detailDescriptionEn.concat(service.detailDescriptionAr);

            /*// subscriptionCode should only be updated if the user has the permission to do so. (deployment)
            if (AuthorizationService.canRBTOperationsServiceUpdate()) {
                serviceItem.subscriptionCode = service.subscriptionCode;
            }
            */

            // Charging Details
            if (service.chargingDetails) {

                serviceItem.chargingPeriodDetail = UtilService.convertSimpleObjectToPeriod(service.chargingDetails.chargingPeriod);
                serviceItem.chargingPeriod = service.chargingDetails.chargingPeriod.duration;
                serviceItem.price = service.chargingDetails.price;
                serviceItem.originalPrice = service.chargingDetails.originalPrice;
                serviceItem.chargingPeriod = service.chargingDetails.chargingPeriod.duration;
            }

            // Image File Handling
            var coverImage = service.coverImage;
            var cardImage = service.cardImage;

            var originalCoverId = original.coverImageId;
            var originalCardId = original.cardImageId;

            var preUploadedCard = false;
            var newCardId = null;

            var postUploadTasks = [];
            var filesToDeleteAfterSuccess = [];

            function bestEffortDelete(fileId) {
                if (!fileId) return $q.when();
                return ContentManagementService.deleteFile(fileId)["catch"](angular.noop);
            }

            // Card Image
            var cardRemoved  = (!cardImage || !cardImage.name) && !!originalCardId; // User cleared card image
            var cardReplaced = (cardImage && cardImage.name && (cardImage instanceof File)); // User updated card image

            if (cardRemoved) {
                serviceItem.cardImageId = null;
                filesToDeleteAfterSuccess.push(originalCardId);
            } else if (cardReplaced) {
                newCardId = UtilService.generateObjectId();
                serviceItem.cardImageId = newCardId;

                if (originalCardId) {
                    filesToDeleteAfterSuccess.push(originalCardId);
                }
            } else {
                serviceItem.cardImageId = originalCardId;
            }

            // Cover Image
            var coverRemoved  = (!coverImage || !coverImage.name) && !!originalCoverId;
            var coverReplaced = (coverImage && coverImage.name && (coverImage instanceof File));

            if (coverRemoved) {
                serviceItem.coverImageId = null;
                filesToDeleteAfterSuccess.push(originalCoverId);
            } else if (coverReplaced) {
                // Reuse existing ID if present, otherwise assign new id.
                serviceItem.coverImageId = originalCoverId || UtilService.generateObjectId();

                postUploadTasks.push(function () {
                    return ContentManagementService.uploadFile(
                        coverImage,
                        coverImage.name,
                        serviceItem.coverImageId
                    );
                });
            } else {
                serviceItem.coverImageId = originalCoverId;
            }

            $log.debug('Updating playlist (with resolved image IDs): ', serviceItem);

            // PROMISE CHAIN
            var preUploadPromise = $q.when();
            if (cardReplaced) {
                preUploadPromise = ContentManagementService
                    .uploadFile(cardImage, cardImage.name, newCardId)
                    .then(function () {
                        preUploadedCard = true;
                    });
            }

            preUploadPromise
                .then(function () {
                    return RBTContentManagementService.updateService(serviceItem);
                })
                .then(function (response) {
                    if (!response || (response && response.errorCode)) {
                        var err = new Error('Update failed');
                        err.apiResponse = response;
                        throw err;
                    }

                    $log.debug('Update Success. Response: ', response);

                    // After successful metadata update:
                    //    - upload cover/thumbnail (if any)
                    //    - delete old files that were removed/replaced
                    var followUps = [];

                    angular.forEach(postUploadTasks, function (fn) {
                        followUps.push(fn());
                    });

                    angular.forEach(filesToDeleteAfterSuccess, function (fileId) {
                        followUps.push(bestEffortDelete(fileId));
                    });

                    return $q.all(followUps).then(function () {

                        notification.flash({
                            type: 'success',
                            text: $translate.instant('CommonLabels.OperationSuccessful')
                        });

                        $scope.cancel();
                    });
                })
                .catch(function (err) {
                    // Rollback if metadata update failed
                    $log.error('Cannot complete content category update flow. Error: ', err);

                    var cleanup = [];

                    if (preUploadedCard && newCardId) {
                        cleanup.push(bestEffortDelete(newCardId));
                    }

                    return $q.all(cleanup).finally(function () {
                        var res = err && err.apiResponse ? err.apiResponse : err;

                        if (res && res.data && res.data.message) {
                            ContentManagementService.showApiError(res);
                        } else if (res && res.apiResponse) {
                            ContentManagementService.showApiError(res);
                        } else {
                            notification({
                                type: 'warning',
                                text: $translate.instant(
                                    'Subsystems.ContentManagement.Operations.RBT.ContentCategories.Messages.UpdateFlowError'
                                )
                            });
                        }
                    });
                });

        };

    });



    /*// Ctrl for CMPF Services Modal
    ContentManagementOperationsServicesModule.controller('CMPFServicesModalInstanceCtrl', function ($scope, $uibModalInstance, $log, $filter, NgTableParams, NgTableService, CMPFService,
                                                                                  Restangular, organizationParameter, itemName, allServices, allOrganizations, servicesModalTitleKey) {
        $log.debug('CMPFServicesModalInstanceCtrl');

        $scope.selected = {
            organization: organizationParameter
        };

        $scope.itemName = itemName;
        $scope.servicesModalTitleKey = servicesModalTitleKey;

        $scope.allServices = Restangular.stripRestangular(allServices);
        $scope.allOrganizations = Restangular.stripRestangular(allOrganizations);


        _.each($scope.allServices.services, function (service) {
            var foundOrganization = _.findWhere($scope.allOrganizations.organizations, {"id": service.organizationId});
            service.organization = foundOrganization;
        });

        $scope.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "id": 'asc'
            }
        }, {
            $scope: $scope,
            total: 0,
            getData: function ($defer, params) {
                var services = angular.copy($scope.allServices.services);

                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, services);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : services;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.tableParams.settings().$scope.filterText = filterText;
            $scope.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.tableParams.page(1);
            $scope.tableParams.reload();
        }, 500);

        $scope.removeSelection = function () {
            $scope.selected.organization = {};
        };

        $scope.ok = function () {
            $uibModalInstance.close($scope.selected);
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

    });

*/
})();
