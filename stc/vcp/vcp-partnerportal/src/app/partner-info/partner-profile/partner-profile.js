(function () {

    'use strict';

    angular.module('partnerportal.partner-info.partner-profile', []);

    var PartnerInfoPartnerProfileModule = angular.module('partnerportal.partner-info.partner-profile');

    PartnerInfoPartnerProfileModule.config(function ($stateProvider) {

        $stateProvider.state('partner-info.partner-profile', {
            url: "/partner-profile",
            templateUrl: "partner-info/partner-profile/partner-profile.html",
            controller: 'PartnerInfoPartnerProfileCtrl',
            data: {
                permissions: [
                    'PRM__PROFILE_READ'
                ]
            },
            resolve: {
                userInfo: function (SessionService, CMPFService){
                    var uid = SessionService.getUserId();
                    return CMPFService.getUserAccount(uid, true, true);
                },
                organizationInfo: function (SessionService, CMPFService) {
                    var sessionOrganization = SessionService.getSessionOrganization();
                    return CMPFService.getPartnerById(sessionOrganization.id);
                },
                categoryList: function ($log, ContentManagementService, CMS_ACCESS_CHANNELS, DEFAULT_REST_QUERY_LIMIT) {
                    var accessChannels = CMS_ACCESS_CHANNELS.find(function (channel) {
                        return channel.label === 'GENERAL';
                    });
                    accessChannels = (accessChannels) ? accessChannels.value : null;
                    $log.debug('accessChannels: ', accessChannels);
                    return ContentManagementService.getContentCategoriesRBT(0, DEFAULT_REST_QUERY_LIMIT, null, null, null, null, accessChannels);
                },
                subCategoryList: function(ContentManagementService, CMS_ACCESS_CHANNELS, DEFAULT_REST_QUERY_LIMIT) {
                    // Filter CMS_ACCESS_CHANNELS to find the matching entry
                    var accessChannels = CMS_ACCESS_CHANNELS.find(function (channel) {
                        return (channel.label === 'GENERAL') ? channel.value : null;
                    });
                    accessChannels = (accessChannels) ? accessChannels.value : null;
                    return ContentManagementService.getSubcategoriesRBT(0, DEFAULT_REST_QUERY_LIMIT, null, null, null, null, accessChannels);
                },
            }
        });

    });

    PartnerInfoPartnerProfileModule.controller('PartnerInfoPartnerProfileCtrl', function ($scope, $log, $filter, $uibModal, $controller, DateTimeConstants, Restangular, UtilService, CMPFService, ContentManagementService, FileDownloadService,
                                                                                          STATUS_TYPES, categoryList, subCategoryList, userInfo, organizationInfo) {
        $log.debug('PartnerInfoPartnerProfileCtrl');
        $controller('AllowedCategoriesCommonCtrl', {$scope: $scope});

        $scope.STATUS_TYPES = STATUS_TYPES;
        $scope.user = Restangular.stripRestangular(userInfo);
        $scope.provider = Restangular.stripRestangular(organizationInfo);
        $scope.categoryList = categoryList.items;
        $scope.subCategoryList = subCategoryList.items;

        $scope.getCategoryString = function (categoryProfile) {
            var resultStr = 'Category: ' + categoryProfile.categoryName + ', Subcategory: ' + categoryProfile.subCategoryName ;
            return resultStr;
        };
        $scope.getSubcategoryId = function (categoryProfile) {
            var resultStr = 'Subcategory ID: ' + categoryProfile.subcategory.id ;
            return resultStr;
        };

        CMPFService.initializeProviderProfiles($scope.provider, $scope.categoryList, $scope.subCategoryList);
        CMPFService.initializeUserProfiles($scope.user);

        $scope.showCategories = function () {

            var config = { disableSelection: true, readOnly: true };

            // Read-only mode
            $scope.showAllowedCategories([], null, {
                disableSelection: true,
                readOnly: true
            });

        }

    });


})();
