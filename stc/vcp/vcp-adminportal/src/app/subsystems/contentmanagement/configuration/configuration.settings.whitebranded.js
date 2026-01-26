(function () {

    'use strict';

    angular.module('adminportal.subsystems.contentmanagement.configuration.settings.whitebranded', []);

    var ContentManagementConfigurationSettingsWBModule = angular.module('adminportal.subsystems.contentmanagement.configuration.settings.whitebranded');

    ContentManagementConfigurationSettingsWBModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.contentmanagement.configuration.settings.whitebranded', {
            abstract: true,
            url: "/white-branded",
            templateUrl: "subsystems/contentmanagement/configuration/configuration.settings.whitebranded.html",
            resolve: {
                cmsConfig: function (RBTContentManagementService) {
                    return RBTContentManagementService.getConfig();
                }
            }
        }).state('subsystems.contentmanagement.configuration.settings.whitebranded.list', {
            url: "/list",
            templateUrl: "subsystems/contentmanagement/configuration/configuration.settings.whitebranded.list.html",
            controller: 'WhiteLabeledPortalConfigListCtrl',
            resolve: {
                partners: function ($q, RBTContentManagementService, CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    var deferred = $q.defer();
                    var result = {};

                    $q.all([
                        RBTContentManagementService.getWBPortalConfigList(),
                        CMPFService.getPartners(0, DEFAULT_REST_QUERY_LIMIT)
                    ]).then(function (responses) {
                        var configResponse = responses[0];
                        var partnerResponse = responses[1];
                        var configMap = {};
                        // map of partnerId to config item
                        angular.forEach(configResponse, function (configItem) {
                            configMap[configItem.partnerId] = configItem;
                        });

                        // Fill in partner list with additional data
                        var finalList = partnerResponse.partners.filter(function (partner) {
                            return configMap.hasOwnProperty(partner.id);
                        }).map(function (partner) {
                            // Merge partner data with its corresponding config
                            return angular.extend({}, partner, {
                                config: configMap[partner.id]
                            });
                        });
                        result.partners = finalList;

                        deferred.resolve(result);
                    }, function (error) {
                        deferred.reject(error);
                    });

                    return deferred.promise;
                }
            }
        }).state('subsystems.contentmanagement.configuration.settings.whitebranded.new', {
            url: "/new",
            templateUrl: "subsystems/contentmanagement/configuration/configuration.settings.whitebranded.detail.html",
            controller: 'WhiteLabeledPortalConfigNewCtrl',
            resolve: {
                partners: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getPartners(0, DEFAULT_REST_QUERY_LIMIT);
                },
                defaultOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_ORGANIZATION_NAME, true);
                }
            }
        }).state('subsystems.contentmanagement.configuration.settings.whitebranded.update', {
            url: "/update/:id",
            templateUrl: "subsystems/contentmanagement/configuration/configuration.settings.whitebranded.detail.html",
            controller: 'WhiteLabeledPortalConfigUpdateCtrl',
            resolve: {
                configuration: function ($stateParams, $q, RBTContentManagementService, CMPFService) {
                    var deferred = $q.defer();

                    RBTContentManagementService.getWBPortalConfig($stateParams.id).then(function (_config) {

                        CMPFService.getOperator(_config.partnerId, true).then(function (_organization) {
                            _config.organization = _organization;
                            deferred.resolve(_config);
                        });
                    });

                    return deferred.promise;
                }
            }
        }).state('subsystems.contentmanagement.configuration.settings.whitebranded.config', {
            url: "/url-settings",
            templateUrl: "subsystems/contentmanagement/configuration/configuration.settings.whitebranded.config.html",
            controller: 'WhiteLabeledPortalSettingsCtrl'
        });

    });

    ContentManagementConfigurationSettingsWBModule.controller('WhiteLabeledPortalConfigCommonCtrl', function ($scope, $log, $state, $translate, $uibModal, notification, Restangular,
                                                                                                              UtilService, RBTContentManagementService, FileDownloadService,
                                                                                                              CMS_RBT_WBP_CUSTOM_FONT_TYPES, CMS_RBT_WBP_FALLBACK_FONTS) {
        $log.debug('WhiteLabeledPortalConfigCommonCtrl');

        $scope.CMS_RBT_WBP_FALLBACK_FONTS = CMS_RBT_WBP_FALLBACK_FONTS;
        $scope.CMS_RBT_WBP_CUSTOM_FONT_TYPES = CMS_RBT_WBP_CUSTOM_FONT_TYPES;

        $scope.isNotChanged = function () {
            return angular.equals($scope.originalContentMetadata, $scope.contentMetadata);
        };

        $scope.downloadFile = function (fileId, fileName) {
            if (fileId) {
                FileDownloadService.downloadFile(fileId, fileName);
            } else {
                notification({
                    type: 'warning',
                    text: $translate.instant('CommonMessages.FileNotFound')
                });
            }
        };

        $scope.cancel = function () {
            $state.go('subsystems.contentmanagement.configuration.settings.whitebranded.list');
        };

        $scope.openOrganizations = function (config) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.organizations.html',
                controller: 'OrganizationsModalInstanceCtrl',
                size: 'lg',
                resolve: {
                    organizationParameter: function () {
                        return angular.copy(config.organization);
                    },
                    itemName: function () {
                        return config.name;
                    },
                    allOrganizations: function ($q, RBTContentManagementService, CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                        var deferred = $q.defer();

                        $q.all([
                            RBTContentManagementService.getWBPortalConfigList(),
                            CMPFService.getPartners(0, DEFAULT_REST_QUERY_LIMIT)
                        ]).then(function (responses) {
                            var configResponse = responses[0];
                            var partnerResponse = responses[1];
                            var configuredPartnerIds = _.pluck(configResponse, 'partnerId');

                            var available = _.filter(partnerResponse.partners, function (partner) {
                                return !_.some(configuredPartnerIds, function (id) {
                                    return id == partner.id; // id may be a string, partner.id is a number
                                });
                            });

                            deferred.resolve({ partners: available });

                        }, function (error) {
                            deferred.reject(error);
                        });

                        return deferred.promise;
                    },
                    organizationsModalTitleKey: function () {
                        return 'Subsystems.ContentManagement.Configuration.WhiteLabelPortalConfig.OrganizationsModalTitle';
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
                config.organization = selectedItem.organization;
                config.organizationId = selectedItem.organization.id;
            }, function () {
            });
        };
    });

    ContentManagementConfigurationSettingsWBModule.controller('WhiteLabeledPortalConfigListCtrl', function ($scope, $state, $log, $filter, $uibModal, $translate, notification, Restangular,
                                                                                                                                NgTableParams, NgTableService, CMPFService, partners, cmsConfig) {
        $log.debug('WhiteLabeledPortalConfigListCtrl');

        $scope.cmsConfig = cmsConfig || {};

        $scope.partners = Restangular.stripRestangular(partners);
        $scope.partners.partners = $filter('orderBy')($scope.partners.partners, 'id');

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'id',
                    headerKey: 'Subsystems.Provisioning.ServiceProviders.Id'
                },
                {
                    fieldName: 'name',
                    headerKey: 'Subsystems.Provisioning.ServiceProviders.Name'
                },
                {
                    fieldName: 'parentName',
                    headerKey: 'Subsystems.Provisioning.ServiceProviders.ParentOrganization'
                },
                {
                    fieldName: 'description',
                    headerKey: 'Subsystems.Provisioning.ServiceProviders.Description'
                },
                {
                    fieldName: 'orgType',
                    headerKey: 'Subsystems.Provisioning.ServiceProviders.Type'
                },
                {
                    fieldName: 'state',
                    headerKey: 'Subsystems.Provisioning.ServiceProviders.State'
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
            total: 0,
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.partners.partners);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.partners.partners;
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

        $scope.remove = function (partner) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                CMPFService.deletePartner(partner).then(function (response) {
                    $log.debug('Removed. Response: ', response);

                    if (response && response.errorCode) {
                        CMPFService.showApiError(response);
                    } else {
                        var deletedListItem = _.findWhere($scope.partners.partners, {id: partner.id});
                        $scope.partners.partners = _.without($scope.partners.partners, deletedListItem);

                        $scope.tableParams.reload();

                        notification({
                            type: 'success',
                            text: $translate.instant('CommonLabels.OperationSuccessful')
                        });
                    }
                }, function (response) {
                    $log.debug('Cannot remove partner list. Error: ', response);

                    if (response.data && response.data.errorDescription) {
                        var message = response.data.errorDescription;
                        if (response.data.errorDescription.indexOf('SCM_SERVICE') > -1) {
                            message = $translate.instant('CommonMessages.ThereAreLinkedServices');
                        } else if (response.data.errorDescription.indexOf('SCM_OFFER') > -1) {
                            message = $translate.instant('CommonMessages.ThereAreLinkedOffers');
                        }

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

    ContentManagementConfigurationSettingsWBModule.controller('WhiteLabeledPortalConfigNewCtrl', function ($scope, $log, $q, $state, $controller, $filter, $translate, notification, Restangular, UtilService, RBTContentManagementService,
                                                                                                                                         ContentManagementService, defaultOrganization, cmsConfig) {
        $log.debug('WhiteLabeledPortalConfigNewCtrl');
        $controller('WhiteLabeledPortalConfigCommonCtrl', {
            $scope: $scope
        });

        $scope.config = cmsConfig;
        $scope.contentMetadata = {
            partnerId: null,
            shortName: '',
            fonts: {
                fallback: null,
                isCustom: false,
                customFontName: '',
                customFontType: null,
                paths: {
                    regular300: '',
                    regular400: '',
                    regular500: '',
                    regular700: '',
                    italic300: '',
                    italic400: '',
                    italic500: '',
                    italic700: ''
                }
            },
            colors: {
                primary: '',
                secondary: ''
            },
            logo: null,
            favIcon: null,
            redirection: cmsConfig.subscriberPortalUrl,
        };

        $scope.save = function (contentMetadata) {
            $log.debug('Saving content metadata: ', contentMetadata);

            var configItem = {
                // Unchanged values
                "partnerId": contentMetadata.organization.id,
                // Changed values
                "shortName": contentMetadata.shortName,
                "fonts": {
                    "fallback": contentMetadata.fonts.fallback,
                    "isCustom": contentMetadata.fonts.isCustom,
                    "customFontName": contentMetadata.fonts.customFontName,
                    "customFontType": contentMetadata.fonts.customFontType,
                    "paths": {
                        "regular300": contentMetadata.fonts.paths.regular300,
                        "regular400": contentMetadata.fonts.paths.regular400,
                        "regular500": contentMetadata.fonts.paths.regular500,
                        "regular700": contentMetadata.fonts.paths.regular700,
                        "italic300": contentMetadata.fonts.paths.italic300,
                        "italic400": contentMetadata.fonts.paths.italic400,
                        "italic500": contentMetadata.fonts.paths.italic500,
                        "italic700": contentMetadata.fonts.paths.italic700
                    }
                },
                "colors": {
                    "primary": contentMetadata.colors.primary,
                    "secondary": contentMetadata.colors.secondary,
                },
                "logo": contentMetadata.logo,
                "favIcon": contentMetadata.favIcon,
                "redirection": contentMetadata.redirection
            };

            var logoFile, favIconFile;
            // logo
            logoFile = contentMetadata.logoFile;
            if (!logoFile || (logoFile && !logoFile.name)) {
                configItem.logo = null;
            } else if (logoFile instanceof File && !contentMetadata.logo) {
                configItem.logo = UtilService.generateObjectId();
            }

            // favIcon
            favIconFile = contentMetadata.favIconFile;
            if (!favIconFile || (favIconFile && !favIconFile.name)) {
                configItem.favIcon = null;
            } else if (favIconFile instanceof File && !configItem.favIcon) {
                configItem.favIcon = UtilService.generateObjectId();
            }


            // Font file keys
            var fontFileKeys = [
                'regular300', 'regular400', 'regular500', 'regular700',
                'italic300', 'italic400', 'italic500', 'italic700'
            ];

            fontFileKeys.forEach(function (key) {
                var file = contentMetadata.fonts.paths[key + 'File'];
                if(!file || (file && !file.name) || !contentMetadata.fonts.isCustom) {
                    // If no file is provided, set the path to null
                    configItem.fonts.paths[key] = null;
                } else {
                    // Only generate ID if one doesn't already exist
                    if (!configItem.fonts.paths[key]) {
                        configItem.fonts.paths[key] = UtilService.generateObjectId();
                    }
                }
            });

            $log.debug('Updating White-label Configuration: ', configItem);

            RBTContentManagementService.postWBPortalConfig(configItem).then(function (response) {

                if (response) {
                    if (response.errorCode) {
                        RBTContentManagementService.showApiError(response);
                    } else {
                        $log.debug('Save Success. Response: ', response);

                        var promises = [];

                        if (logoFile && logoFile.name && (logoFile instanceof File)) {
                            promises.push(ContentManagementService.uploadFile(logoFile, logoFile.name, configItem.logo));
                        }

                        if (favIconFile && favIconFile.name && (favIconFile instanceof File)) {
                            promises.push(ContentManagementService.uploadFile(favIconFile, favIconFile.name, configItem.favIcon));
                        }

                        // Upload custom fonts if isCustom is true
                        if (contentMetadata.fonts.isCustom) {
                            fontFileKeys.forEach(function (key) {
                                var file = contentMetadata.fonts.paths[key + 'File'];
                                if (file && file.name && file instanceof File) {
                                    promises.push(ContentManagementService.uploadFile(
                                        file,
                                        file.name,
                                        configItem.fonts.paths[key]
                                    ));
                                }
                            });
                        } else {
                            // If not custom, ensure paths are empty
                            fontFileKeys.forEach(function (key) {
                                configItem.fonts.paths[key] = '';
                            });
                        }


                        $q.all(promises).then(function () {
                            notification.flash({
                                type: 'success',
                                text: $translate.instant('Subsystems.ContentManagement.Configuration.WhiteLabelPortalConfig.Messages.UpdateFlowSuccess')
                            });

                            $scope.cancel();
                        });
                    }
                } else {
                    $log.debug('An error occured: ', error);

                    notification({
                        type: 'warning',
                        text: $translate.instant('CommonMessages.GenericServerError')
                    });
                }


            }, function (error) {

                $log.debug('An error occured: ', error);

                notification({
                    type: 'warning',
                    text: $translate.instant('CommonMessages.GenericServerError')
                });
            });


        };
    });

    ContentManagementConfigurationSettingsWBModule.controller('WhiteLabeledPortalConfigUpdateCtrl', function ($scope, $log, $q, $controller, $state, $filter, $translate, notification, Restangular, UtilService, RBTContentManagementService,
                                                                                                              ContentManagementService, FileDownloadService, configuration, cmsConfig) {
        $log.debug('WhiteLabeledPortalConfigUpdateCtrl');

        $controller('WhiteLabeledPortalConfigCommonCtrl', {
            $scope: $scope
        });

        $scope.config = cmsConfig;
        $scope.contentMetadata = configuration;
        if(!$scope.contentMetadata.colors) {
            $scope.contentMetadata.colors = {
                primary: '',
                secondary: ''
            };
        }
        if(!$scope.contentMetadata.fonts) {
            $scope.contentMetadata.fonts = {
                fallback: '',
                isCustom: true,
                customFontName: '',
                customFontType: '',
                paths: {
                    regular300: '',
                    regular400: '',
                    regular500: '',
                    regular700: '',
                    italic300: '',
                    italic400: '',
                    italic500: '',
                    italic700: ''
                }
            };
        }

        // Get the logoFile by id value.
        if ($scope.contentMetadata.logo) {
            $scope.contentMetadata.logoFile = {name: undefined};
            var srcUrl = ContentManagementService.generateFilePath($scope.contentMetadata.logo);
            FileDownloadService.downloadFileAndGetBlob(srcUrl, function (blob, fileName) {
                $scope.contentMetadata.logoFile = blob;
                if (blob) {
                    $scope.contentMetadata.logoFile.name = fileName;
                }
                $scope.originalContentMetadata = angular.copy($scope.contentMetadata);
            });
        }

        // Get the favIconFile by id value.
        if ($scope.contentMetadata.favIcon) {
            $scope.contentMetadata.favIconFile = {name: undefined};
            var srcUrl = ContentManagementService.generateFilePath($scope.contentMetadata.favIcon);
            FileDownloadService.downloadFileAndGetBlob(srcUrl, function (blob, fileName) {
                $scope.contentMetadata.favIconFile = blob;
                if (blob) {
                    $scope.contentMetadata.favIconFile.name = fileName;
                }
                $scope.originalContentMetadata = angular.copy($scope.contentMetadata);
            });
        }

        // Font file keys
        var fontFileKeys = [
            'regular300', 'regular400', 'regular500', 'regular700',
            'italic300', 'italic400', 'italic500', 'italic700'
        ];

        fontFileKeys.forEach(function (key) {
            if($scope.contentMetadata.fonts.paths[key]) {
                $scope.contentMetadata.fonts.paths[key + 'File'] = {name: undefined};
                var srcUrl = ContentManagementService.generateFilePath($scope.contentMetadata.fonts.paths[key]);
                FileDownloadService.downloadFileAndGetBlob(srcUrl, function (blob, fileName) {
                    $scope.contentMetadata.fonts.paths[key + 'File'] = blob;
                    if (blob) {
                        $scope.contentMetadata.fonts.paths[key + 'File'].name = fileName;
                    }
                    $scope.originalContentMetadata = angular.copy($scope.contentMetadata);
                });
            }
        });

        $scope.originalContentMetadata = angular.copy(configuration);


        $scope.save = function (contentMetadata) {
            $log.debug('Saving content metadata: ', contentMetadata);

            var configItem = {
                // Unchanged values
                "partnerId": $scope.originalContentMetadata.partnerId,
                // Changed values
                "shortName": contentMetadata.shortName,
                "fonts": {
                    "fallback": contentMetadata.fonts.fallback,
                    "isCustom": contentMetadata.fonts.isCustom,
                    "customFontName": contentMetadata.fonts.customFontName,
                    "customFontType": contentMetadata.fonts.customFontType,
                    "paths": {
                        "regular300": contentMetadata.fonts.paths.regular300,
                        "regular400": contentMetadata.fonts.paths.regular400,
                        "regular500": contentMetadata.fonts.paths.regular500,
                        "regular700": contentMetadata.fonts.paths.regular700,
                        "italic300": contentMetadata.fonts.paths.italic300,
                        "italic400": contentMetadata.fonts.paths.italic400,
                        "italic500": contentMetadata.fonts.paths.italic500,
                        "italic700": contentMetadata.fonts.paths.italic700
                    }
                },
                "colors": {
                    "primary": contentMetadata.colors.primary,
                    "secondary": contentMetadata.colors.secondary,
                },
                "logo": contentMetadata.logo,
                "favIcon": contentMetadata.favIcon,
                "redirection": contentMetadata.redirection
            };

            var logoFile, favIconFile;
            // logo
            logoFile = contentMetadata.logoFile;
            if (!logoFile || (logoFile && !logoFile.name)) {
                configItem.logo = null;
            } else if (logoFile instanceof File && !contentMetadata.logo) {
                configItem.logo = UtilService.generateObjectId();
            }

            // favIcon
            favIconFile = contentMetadata.favIconFile;
            if (!favIconFile || (favIconFile && !favIconFile.name)) {
                configItem.favIcon = null;
            } else if (favIconFile instanceof File && !configItem.favIcon) {
                configItem.favIcon = UtilService.generateObjectId();
            }


            // Font file keys
            var fontFileKeys = [
                'regular300', 'regular400', 'regular500', 'regular700',
                'italic300', 'italic400', 'italic500', 'italic700'
            ];
            // Ensure all font paths are set correctly
            fontFileKeys.forEach(function (key) {
                var file = contentMetadata.fonts.paths[key + 'File'];
                if(!file || (file && !file.name) || !contentMetadata.fonts.isCustom) {
                    // If no file is provided, set the path to null
                    configItem.fonts.paths[key] = null;
                } else {
                    // Only generate ID if one doesn't already exist
                    if (!configItem.fonts.paths[key]) {
                        configItem.fonts.paths[key] = UtilService.generateObjectId();
                    }
                }
            });

            $log.debug('Updating White-label Configuration: ', configItem);

            RBTContentManagementService.postWBPortalConfig(configItem).then(function (response) {

                if (response) {
                    if (response.errorCode) {
                        RBTContentManagementService.showApiError(response);
                    } else {
                        $log.debug('Save Success. Response: ', response);

                        var promises = [];

                        if (logoFile && logoFile.name && (logoFile instanceof File)) {
                            promises.push(ContentManagementService.uploadFile(logoFile, logoFile.name, configItem.logo));
                        }

                        if (favIconFile && favIconFile.name && (favIconFile instanceof File)) {
                            promises.push(ContentManagementService.uploadFile(favIconFile, favIconFile.name, configItem.favIcon));
                        }

                        // Upload custom fonts if isCustom is true
                        if (contentMetadata.fonts.isCustom) {
                            fontFileKeys.forEach(function (key) {
                                var file = contentMetadata.fonts.paths[key + 'File'];
                                if (file && file.name && file instanceof File) {
                                    promises.push(ContentManagementService.uploadFile(
                                        file,
                                        file.name,
                                        configItem.fonts.paths[key]
                                    ));
                                }
                            });
                        } else {
                            // If not custom, ensure paths are empty
                            fontFileKeys.forEach(function (key) {
                                configItem.fonts.paths[key] = '';
                            });
                        }

                        $q.all(promises).then(function () {
                            notification.flash({
                                type: 'success',
                                text: $translate.instant('Subsystems.ContentManagement.Configuration.WhiteLabelPortalConfig.Messages.UpdateFlowSuccess')
                            });

                            $scope.cancel();
                        });
                    }
                } else {

                    $log.debug('An error occured: ', error);

                    notification({
                        type: 'warning',
                        text: $translate.instant('CommonMessages.GenericServerError')
                    });
                }


            }, function (error) {

                $log.debug('An error occured: ', error);

                notification({
                    type: 'warning',
                    text: $translate.instant('CommonMessages.GenericServerError')
                });
            });

        };

    });

   ContentManagementConfigurationSettingsWBModule.controller('WhiteLabeledPortalSettingsCtrl', function ($q, $scope, $state, $log, $translate, notification, CMPFService, RBTContentManagementService, Restangular, cmsConfig) {

       $log.debug('SubscriptionManagementConfigurationCtrl');

       // CMS Configuration Related (VAT, Portal Base URLs etc)
       $scope.config = cmsConfig;
       $scope.originalConfig = angular.copy($scope.config);

       $scope.isNotChanged = function () {
           return angular.equals($scope.originalConfig, $scope.config);
       };

       var updateBaseUrl = function () {
           var body = {
               subscriberPortalUrl: $scope.config.subscriberPortalUrl,
               wbpPortalUrl: $scope.config.wbpPortalUrl
           };

           return RBTContentManagementService.updateConfig(body);
       };

       $scope.saveConfiguration = function () {
           updateBaseUrl().then(function (response) {
               $log.debug('Updated configuration: ', response);

               // Check if body has error
               if(response.data && response.data.errorCode){
                   notification({
                       type: 'danger',
                       text: $translate.instant('CommonMessages.ApiError', {
                           errorCode: response.data.errorCode,
                           errorText: response.data.errorDescription
                       })
                   });

               } else {

                   notification({
                       type: 'success',
                       text: $translate.instant('CommonLabels.OperationSuccessful')
                   });

                   $state.go('subsystems.contentmanagement.configuration.settings.whitebranded.list');
               }

           }, function (error) {
               $log.debug('Cannot update configuration: ', error);
               notification({
                   type: 'warning',
                   text: $translate.instant('CommonMessages.GenericServerError')
               });
           });
       };

       $scope.cancel = function () {
           $state.go('subsystems.contentmanagement.configuration.settings.whitebranded.list');
       };
   });


})();
