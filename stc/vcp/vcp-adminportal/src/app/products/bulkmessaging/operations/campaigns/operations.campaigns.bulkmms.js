(function () {

    'use strict';

    angular.module('adminportal.products.bulkmessaging.operations.campaigns.bulkmms', []);

    var BulkMessagingCampaignsBulkMmsOperationsModule = angular.module('adminportal.products.bulkmessaging.operations.campaigns.bulkmms');

    BulkMessagingCampaignsBulkMmsOperationsModule.config(function ($stateProvider) {

        $stateProvider.state('products.bulkmessaging.operations.campaigns.bulkmms', {
            url: "/bulkmms",
            templateUrl: "products/bulkmessaging/operations/campaigns/operations.campaigns.bulkmms.detail.html",
            controller: 'BulkMessagingCampaignsOperationsBulkMMSCtrl',
            data: {
                pageHeaderKey: 'Products.BulkMessaging.Operations.Campaigns.Title',
                subPageHeaderKey: 'Products.BulkMessaging.BulkMMS.Title'
            },
            resolve: {
                operator: function ($rootScope, CMPFService) {
                    return CMPFService.getOperator($rootScope.systemUserOrganizationId, true);
                },
                userAccount: function ($rootScope, CMPFService) {
                    return CMPFService.getUserAccount($rootScope.systemUserId, true);
                },
                settings: function ($stateParams, BulkMessagingConfService) {
                    return BulkMessagingConfService.getMMSConfig();
                },
                globalWhiteLists: function (BulkMessagingOperationsService) {
                    return BulkMessagingOperationsService.getGlobalWhiteLists();
                },
                orgDistributionLists: function ($rootScope, BulkMessagingOperationsService) {
                    return BulkMessagingOperationsService.getDistributionListsPerOrganization($rootScope.systemUserOrganizationId, 'USER_LIST');
                },
                userDistributionLists: function ($rootScope, BulkMessagingOperationsService) {
                    return BulkMessagingOperationsService.getDistributionListsPerUser($rootScope.systemUserId, 'USER_LIST');
                }
            }
        });

    });

    BulkMessagingCampaignsBulkMmsOperationsModule.directive('slideRemoveButton', function () {
        return {
            restrict: 'C',
            scope: true,
            replace: true,
            template: function (elem, attr) {
                return "<button class=\"btn btn-default btn-xs pull-right\" style=\"margin-bottom: -5px;\" ng-click=\"removeSlideItem()\" ng-transclude><i class=\"fa fa-times\" aria-hidden=\"true\"></i></button>";
            },
            transclude: true,
            link: function (scope, elem, attr, ctrl) {
                if (scope.removeSlideItem === undefined) {
                    scope.removeSlideItem = function () {
                        // Find index of the slide page
                        var index = Number(elem.parent().parent().parent().parent().attr('data-slick-index'));

                        // Call the real removeSlide method with the slide index
                        scope.$parent.removeSlide(index);
                    };
                }
            }
        };
    });

    BulkMessagingCampaignsBulkMmsOperationsModule.directive('slidePreview', function ($compile, $timeout) {
        return {
            restrict: 'A',
            scope: true,
            link: function (scope, elem, attr, ctrl) {
                var autoplaySpeedInMSec = scope.$parent.slickViewer.autoplaySpeed / 1000;

                $timeout(function () {
                    // Find index value
                    var index = Number(elem.attr('data-slick-index'));

                    // Set text of the preview header
                    elem.find('.panel-title span.header-text').text('Page - ' + (index + 1));
                }, 100);

                // Listen the autoplay speed value.
                scope.autoplaySpeed = {
                    value: autoplaySpeedInMSec
                };

                scope.addTextToSlide = function () {
                    // textarea add and remove methods
                    scope.text = '';
                };

                scope.removeText = function () {
                    delete scope.text;
                };
            }
        };
    });

    BulkMessagingCampaignsBulkMmsOperationsModule.directive('textCounter', function () {
        return {
            restrict: 'C',
            scope: false,
            template: "<span ng-bind=\"text.length\"></span>/<span ng-bind=\"maxTextLength\"></span> <span>{{ 'CommonLabels.Characters' | translate }}</span>"
        };
    });

    BulkMessagingCampaignsBulkMmsOperationsModule.directive('slideNavigator', function ($timeout) {
        return {
            restrict: 'A',
            scope: true,
            link: function (scope, elem, attr, ctrl) {
                $timeout(function () {
                    // Find index value
                    var index = Number(elem.attr('data-slick-index'));

                    // Set text of the navigator item
                    elem.find('.slick-page-selector').text(index + 1);

                }, 100);
            }
        };
    });

    BulkMessagingCampaignsBulkMmsOperationsModule.controller('BulkMessagingCampaignsOperationsBulkMMSCtrl', function ($rootScope, $scope, $log, $controller, $compile, $timeout, $interval, $state, $uibModal, $filter, notification, $translate, CMPFService,
                                                                                                                      SessionService, WorkflowsService, DateTimeConstants, Restangular, BulkMessagingOperationsService, operator, userAccount, settings,
                                                                                                                      globalWhiteLists, orgDistributionLists, userDistributionLists) {
        $log.debug("BulkMessagingCampaignsOperationsBulkMMSCtrl");

        $controller('BulkMessagingCampaignsCommonCtrl', {
            $scope: $scope,
            operator: operator,
            userAccount: userAccount,
            globalWhiteLists: globalWhiteLists,
            orgDistributionLists: orgDistributionLists,
            userDistributionLists: userDistributionLists
        });

        // Begin - MMS Composer section
        $scope.slidePages = [];
        $scope.currentPage = 0;

        $scope.currentSlick1;
        $scope.currentSlick2;

        var MAX_ALLOWED_PAGE_COUNT = 12;

        $scope.isAllowingNewPage = function () {
            return $scope.currentSlick1 && ($scope.currentSlick1.slideCount < MAX_ALLOWED_PAGE_COUNT);
        };

        $scope.removeSlide = function (index) {
            // Remove pages from the two slider one by one
            $scope.slickViewer.method.slickRemove(index);
            $scope.currentSlick1.refresh();
            $scope.slickNavigator.method.slickRemove(index);
            $scope.currentSlick2.refresh();

            // Reindex slider pages and headers after the deletion
            _.each($scope.currentSlick1.$slides, function (slide, index) {
                $(slide).find('.panel-title span.header-text').text('Page - ' + (index + 1));
            });
            _.each($scope.currentSlick2.$slides, function (slide, index) {
                $(slide).find('.slick-page-selector').text(index + 1);
            });
        };

        $scope.addNewSlide = function () {
            if (!$scope.isAllowingNewPage()) {
                return;
            }

            // Check this site to support video formats to play: https://tools.woolyss.com/html5-audio-video-tester/
            var viewerElement = $("" +
                "<div class=\"panel-primary\" slide-preview>" +
                " <div class=\"panel-heading\">" +
                "   <div class=\"row panel-title\">" +
                "     <div class=\"col-md-6\">" +
                "       <span class=\"header-text\"></span>" +
                "     </div>" +
                "     <div class=\"col-md-6\">" +
                "      <button title=\"{{ 'Products.BulkMessaging.Composer.RemovePage' | translate }}\" class=\"slide-remove-button pull-right\"></button>" +
                "      <span class=\"counter-text pull-right\"></span>" +
                "     </div>" +
                "   </div>" +
                " </div>" +
                " <div class=\"panel-body\">" +

                "   <div class=\"slick-page-image-wrapper\" ng-if=\"imageFile.file\">" +
                "     <img ngf-thumbnail=\"imageFile.file\">" +
                "     <button class=\"slick-object-remove-button btn btn-xs btn-primary\" ng-click=\"imageFile.file = null;\" ng-if=\"imageFile.file\"><i class=\"fa fa-times\" aria-hidden=\"true\"></i></button>" +
                "   </div>" +

                "   <div class=\"slick-page-video-wrapper\" ng-if=\"videoFile.file\">" +
                "     <video height=\"190\" controls controlsList=\"nodownload\" ngf-src=\"videoFile.file\">Video not supported.</video>" +
                "     <button class=\"slick-object-remove-button btn btn-xs btn-primary\" ng-click=\"videoFile.file = null;\" ng-if=\"videoFile.file\"><i class=\"fa fa-times\" aria-hidden=\"true\"></i></button>" +
                "   </div>" +

                "   <div class=\"slick-page-audio-wrapper\" ng-if=\"audioFile.file\">" +
                "     <audio controls controlsList=\"nodownload\" ngf-src=\"audioFile.file\"></audio>" +
                "     <button class=\"slick-object-remove-button btn btn-xs btn-primary\" ng-click=\"audioFile.file = null;\" ng-if=\"audioFile.file\"><i class=\"fa fa-times\" aria-hidden=\"true\"></i></button>" +
                "   </div>" +

                "   <div class=\"slick-page-text-wrapper form-group\" ng-if=\"text !== undefined\" style=\"margin: 0 0 0 10px;\">" +
                "     <textarea name=\"text\" ng-model=\"$parent.text\" ng-init=\"maxTextLength = 256;\" ng-maxlengh=\"256\" maxlength=\"256\" dir=\"auto\"></textarea>" +
                "     <ul ng-class=\"{ 'parsley-error-list': form.text.$dirty && form.text.$invalid }\"\n" +
                "         ng-show=\"form.text.$dirty && form.text.$invalid\">\n" +
                "         <li class=\"required\" style=\"display: list-item;\" ng-show=\"form.text.$error.maxlength\">{{ 'CommonMessages.MaxLengthError' | translate:{max_length: 256} }}</li>\n" +
                "     </ul>\n" +
                "     <span class=\"text-counter\"></span>" +
                "     <button class=\"slick-object-remove-button btn btn-xs btn-primary\" ng-click=\"removeText();\" ng-if=\"text !== undefined\"><i class=\"fa fa-times\" aria-hidden=\"true\"></i></button>" +
                "   </div>" +

                " </div>" +
                " <div class=\"panel-footer\" style=\"height: 52px;\">" +
                "  <div class=\"row\">" +
                "   <div class=\"col-md-12\">" +
                "     <div class=\"col-md-6 pull-left\">" +
                "        <button name=\"imageFileAttachment\" type=\"file\"" +
                "                title=\"{{ 'Products.BulkMessaging.Composer.AddImage' | translate }}\"" +
                "                ng-disabled=\"videoFile.file || audioFile.file\"" +
                "                ngf-select" +
                "                ng-model=\"imageFile.file\"" +
                "                class=\"btn btn-xs btn-default\"" +
                "                ngf-accept=\"'.jpg,.jpeg,.png,.gif'\"" +
                "                ngf-max-size=\"20MB\"" +
                "                ngf-model-invalid=\"errorFile\"" +
                "                ng-disabled=\"\">" +
                "            <i class=\"fa fa-image\" aria-hidden=\"true\"></i>" +
                "        </button>" +
                "        <button name=\"videoFileAttachment\" type=\"file\"" +
                "                title=\"{{ 'Products.BulkMessaging.Composer.AddVideo' | translate }}\"" +
                "                ng-disabled=\"imageFile.file || audioFile.file\"" +
                "                ngf-select" +
                "                ng-model=\"videoFile.file\"" +
                "                class=\"btn btn-xs btn-default\"" +
                "                ngf-accept=\"'.mp4,.mpeg,.x-wav,.mid,.3gpp'\"" +
                "                ngf-max-size=\"20MB\"" +
                "                ngf-model-invalid=\"errorFile\"" +
                "                ng-disabled=\"\">" +
                "            <i class=\"fa fa-video-camera\" aria-hidden=\"true\"></i>" +
                "        </button>" +
                "        <button name=\"audioFileAttachment\" type=\"file\"" +
                "                title=\"{{ 'Products.BulkMessaging.Composer.AddAudio' | translate }}\"" +
                "                ng-disabled=\"imageFile.file || videoFile.file\"" +
                "                ngf-select" +
                "                ng-model=\"audioFile.file\"" +
                "                class=\"btn btn-xs btn-default\"" +
                "                ngf-accept=\"'.3gpp,.mp3'\"" +
                "                ngf-max-size=\"20MB\"" +
                "                ngf-model-invalid=\"errorFile\"" +
                "                ng-disabled=\"\">" +
                "            <i class=\"fa fa-music\" aria-hidden=\"true\"></i>" +
                "        </button>" +
                "        <button type=\"button\" class=\"btn btn-default btn-xs\" ng-click=\"addTextToSlide()\" " +
                "                ng-disabled=\"text !== undefined\"" +
                "                title=\"{{ 'Products.BulkMessaging.Composer.AddText' | translate }}\"><i class=\"fa fa-reorder\" aria-hidden=\"true\"></i></button>" +
                "     </div>" +
                "     <div class=\"col-md-6 pull-right\">" +
                "        <form class=\"form-horizontal\" novalidate id=\"form\" name=\"form\" method=\"post\" enctype=\"multipart/form-data\">" +
                "          <div class=\"form-group pull-left\" style=\"margin-bottom: 0;\">\n" +
                "              <div class=\"input-group\" style=\"width: 145px;\">\n" +
                "                  <input id=\"autoplaySpeed\" name=\"autoplaySpeed\" type=\"number\" class=\"form-control input-sm\"\n" +
                "                         ng-model=\"autoplaySpeed.value\"\n" +
                "                         min=\"1\" max=\"60\" ng-required=\"true\"/>\n" +
                "                  <span class=\"input-group-addon\">sec</span>\n" +
                "              </div>\n" +
                "              <ul ng-class=\"{ 'parsley-error-list': form.autoplaySpeed.$dirty && form.autoplaySpeed.$invalid }\"\n" +
                "                  ng-show=\"form.autoplaySpeed.$dirty && form.autoplaySpeed.$invalid\" style=\"z-index: 9999;\">\n" +
                "                  <li class=\"required\" ng-show=\"form.autoplaySpeed.$error.min\">{{ 'CommonMessages.MinValueError' | translate:{min: 1} }}</li>\n" +
                "                  <li class=\"required\" ng-show=\"form.autoplaySpeed.$error.max\">{{ 'CommonMessages.MaxValueError' | translate:{max: 60} }}</li>\n" +
                "                  <li class=\"required\" ng-show=\"form.autoplaySpeed.$error.required\">{{ 'CommonMessages.RequiredFieldError' | translate }}</li>\n" +
                "                  <li class=\"required\" ng-show=\"form.autoplaySpeed.$error.number\">{{ 'CommonMessages.NumericFieldError' | translate }}</li>\n" +
                "              </ul>\n" +
                "          </div>\n" +
                "        </form>" +
                "     </div>" +
                "   </div>" +
                "  </div>" +
                " </div>" +
                "</div>");
            $compile(viewerElement)($scope);
            $scope.slickViewer.method.slickAdd(viewerElement);

            var sliderElement = $("<div slide-navigator><h3 class=\"slick-page-selector\"></h3></div>");
            $compile(sliderElement)($scope);
            $scope.slickNavigator.method.slickAdd(sliderElement);
        };

        $scope.slickViewer = {
            enabled: true,
            autoplay: false,
            draggable: false,
            slidesToShow: 1,
            slidesToScroll: 1,
            arrows: false,
            fade: false,
            asNavFor: '.slider-nav',
            centerMode: false,
            focusOnSelect: true,
            autoplaySpeed: 10000, // 10 seconds
            speed: 0,
            method: {},
            event: {
                init: function (event, slick) {
                    $scope.currentSlick1 = slick;
                    slick.slickGoTo($scope.currentPage); // slide to correct index when init
                },
                afterChange: function (event, slick, currentSlide, nextSlide) {
                    $scope.currentPage = currentSlide; // save current index each time
                }
            }
        };

        $scope.slickNavigator = {
            enabled: true,
            autoplay: false,
            draggable: false,
            slidesToShow: 4,
            slidesToScroll: 1,
            arrows: false,
            asNavFor: '.slider-for',
            dots: true,
            centerMode: false,
            focusOnSelect: true,
            pauseOnFocus: false,
            pauseOnHover: false,
            method: {},
            event: {
                init: function (event, slick) {
                    $scope.currentSlick2 = slick;
                    slick.slickGoTo($scope.currentPage); // slide to correct index when init
                },
                afterChange: function (event, slick, currentSlide, nextSlide) {
                    $scope.currentPage = currentSlide; // save current index each time
                }
            }
        };

        // Slider playing related methods
        var getCurrentSliderScope = function () {
            var currentSlider = $scope.currentSlick1.$slider.get(0);
            return angular.element(currentSlider).find('.slick-current .panel-footer #autoplaySpeed').scope();
        };
        var getAllSlides = function () {
            return $scope.currentSlick1.$slides;
        };
        var getCurrentAutoplaySpeedInMSec = function (scope) {
            var autoplaySpeed = scope.autoplaySpeed.value * 1000; // Convert to milisecond

            return autoplaySpeed;
        };

        var playerTimerPromise, countdownIntervalPromise;
        // Slide changer method. Calls itself recursively until the timer stopped.
        var changeSlide = function () {
            var currentSliderScope = getCurrentSliderScope();
            var autoplaySpeedInMSec = getCurrentAutoplaySpeedInMSec(currentSliderScope);

            // Initialize the counter
            $interval.cancel(countdownIntervalPromise);
            currentSliderScope.counter = autoplaySpeedInMSec / 1000;
            angular.element('.panel-title span.counter-text').text(''); // Clear all the counter texts.
            var counterElement = angular.element($scope.currentSlick1.$slider.get(0)).find('.slick-current .panel-title span.counter-text');
            counterElement.text(currentSliderScope.counter + ' seconds');

            // Counter timer
            countdownIntervalPromise = $interval(function () {
                currentSliderScope.counter--;

                counterElement.text(currentSliderScope.counter + ' seconds');
            }, 1000);

            // Sliding timer
            playerTimerPromise = $timeout(function () {
                $scope.slickViewer.method.slickNext();

                changeSlide();
            }, autoplaySpeedInMSec);
        };

        // Watch the playing state variable
        $scope.slidePlaying = false;
        $scope.playSlide = function () {
            $scope.slidePlaying = true;
        };
        $scope.pauseSlide = function () {
            $scope.slidePlaying = false;
        };
        $scope.$watch('slidePlaying', function (newVal, oldVal) {
            if (newVal !== undefined) {
                if (newVal) {
                    $scope.slickViewer.method.slickGoTo(0);

                    // Start playing
                    changeSlide();

                    // Hide the control buttons
                    angular.element('.panel-footer div.row, .panel-heading .slide-remove-button, .add-new-slide-button, .panel-body .slick-object-remove-button').css('display', 'none');

                    // Show the counter text
                    angular.element('.panel-title span.counter-text').css('display', 'block');
                } else {
                    // Cancel the autoplay timer and go to the first page
                    if (playerTimerPromise) {
                        $timeout.cancel(playerTimerPromise);
                        $interval.cancel(countdownIntervalPromise);
                        $scope.slickViewer.method.slickGoTo(0);

                        // Show the control buttons
                        angular.element('.panel-footer div.row, .panel-heading .slide-remove-button, .add-new-slide-button, .panel-body .slick-object-remove-button').css('display', 'block');

                        // Hide the counter text
                        angular.element('.panel-title span.counter-text').css('display', 'none');
                    }
                }
            }
        }, true);
        // End - MMS Composer section

        // Initialize Campaign
        $scope.isBulkMmsUser = true;
        if (!$scope.bulkOrganizationProfile || !$scope.bulkUserProfile || !$scope.bulkUserProfile.isBulkMmsUser) {
            $scope.isBulkMmsUser = false;
            return;
        }

        $scope.campaign = {
            maxRetryCount: 0,
            campaignExpiryInterval: 1,
            forceExpiryDate: false,
            campaignBlackLists: []
        };
        $scope.listType = undefined;

        $scope.maxMaxRetryCount = settings.notifyRetryMaxCount;
        //$scope.blackListEnabled = settings.blackListEnabled;
        $scope.blackListEnabled = true;

        $scope.bulkUserPolicyProfile = CMPFService.extractBulkUserPolicyProfile($scope.userAccount);

        $scope.bulkMMSPolicyProfile = CMPFService.extractBulkMMSPolicyProfile($scope.userAccount);
        $scope.bulkMMSPolicyProfile.PermissibleAlphanumericSenders = $filter('orderBy')($scope.bulkMMSPolicyProfile.PermissibleAlphanumericSenders, ['value']);

        $scope.isOffNetDeliveryAllowed = angular.copy($scope.bulkMMSPolicyProfile.isOffNetDeliveryAllowed);
        $scope.isDisableChargingAllowed = angular.copy($scope.bulkMMSPolicyProfile.isDisableChargingAllowed);
        $scope.isForwardTrackingAllowed = angular.copy($scope.bulkMMSPolicyProfile.isForwardTrackingAllowed);

        // Override the predefined flags as false.
        $scope.bulkMMSPolicyProfile.isTimeConstraintEnforced = false;
        $scope.bulkMMSPolicyProfile.isScreeningListsEnforced = false;
        $scope.bulkMMSPolicyProfile.isOffNetDeliveryAllowed = false;
        $scope.bulkMMSPolicyProfile.isDisableChargingAllowed = false;
        $scope.bulkMMSPolicyProfile.isForwardTrackingAllowed = false;
        // -------

        $scope.start = function (campaign, dateHolder, bulkMMSPolicyProfile) {
            if (!$scope.bulkMMSPolicyProfile || !$scope.bulkMMSPolicyProfile.ChargingMsisdn) {
                notification({
                    type: 'warning',
                    text: $translate.instant('Products.BulkMessaging.Messages.SenderNumberRequired')
                });

                return;
            }

            var campaignItem = {
                "from": {
                    "isAdmin": $rootScope.isAdminUser,
                    "userId": $scope.username,
                    "orgId": $scope.sessionOrganization.name,
                    "groupId": null
                },
                "to": {
                    "userId": null,
                    "orgId": null,
                    "groupId": CMPFService.DSP_MARKETING_ADMIN_GROUP
                },
                "mmsCampaignDetails": {}
            };

            var mmsCampaignJson = {
                "campaignStatusBpms": "SCHEDULED",
                "campaignUserId": $scope.userId,
                "campaignOrgId": $scope.sessionOrganization.id,
                "campaignFrom": $scope.bulkMMSPolicyProfile.ChargingMsisdn,
                "name": campaign.campaignName,
                "campaignSubject": campaign.campaignName,
                "campaignDescription": campaign.campaignName,
                "campaignListId": campaign.to,
                // Extra fields
                "campaignOffnetEnabled": $scope.isOffNetDeliveryAllowed ? bulkMMSPolicyProfile.isOffNetDeliveryAllowed : false,
                "campaignTrackForwards": $scope.isForwardTrackingAllowed ? bulkMMSPolicyProfile.isForwardTrackingAllowed : false,
                "campaignChargingDisabled": $scope.isDisableChargingAllowed ? bulkMMSPolicyProfile.isDisableChargingAllowed : false,
                "campaignMaxRetryCount": campaign.maxRetryCount,
                "slides": []
            };

            // If black list settings is enabled and there are defined black list items.
            if ($scope.blackListEnabled && bulkMMSPolicyProfile.isScreeningListsEnforced && campaign.campaignBlackLists && campaign.campaignBlackLists.length > 0) {
                mmsCampaignJson.campaignBlackListId = _.pluck(campaign.campaignBlackLists, 'id');
            }

            // Date time preparation
            mmsCampaignJson.campaignStartTime = $filter('date')(dateHolder.startDate, 'yyyy-MM-dd\'T\'HH:mm:ss' + DateTimeConstants.OFFSET_WITH_COLON);
            mmsCampaignJson.campaignExpiryTime = $filter('date')(moment(dateHolder.endDate).add(1, 'years').toDate(), 'yyyy-MM-dd\'T\'HH:mm:ss' + DateTimeConstants.OFFSET_WITH_COLON);
            // If selected the expiry forcing option.
            if (campaign.forceExpiryDate) {
                mmsCampaignJson.campaignExpiryTime = $filter('date')(dateHolder.endDate, 'yyyy-MM-dd\'T\'HH:mm:ss' + DateTimeConstants.OFFSET_WITH_COLON);
            }

            // If timesconstraint values are specified, add them to the campaign object.
            if (bulkMMSPolicyProfile.isTimeConstraintEnforced && bulkMMSPolicyProfile.TimeConstraints && bulkMMSPolicyProfile.TimeConstraints.length > 0) {
                mmsCampaignJson.timeConstraints = [];
                _.each(bulkMMSPolicyProfile.TimeConstraints, function (timeConstraint) {
                    if (timeConstraint.value && timeConstraint.value.split('-').length > 1) {
                        var timeConstraints = timeConstraint.value.split('-');
                        mmsCampaignJson.timeConstraints.push({
                            "startMinuteInWeek": Number(timeConstraints[0]),
                            "endMinuteInWeek": Number(timeConstraints[1]),
                            "finalConstraint": false
                        });
                    }
                });
            }

            // If there is an alphanumeric sender selection.
            if (bulkMMSPolicyProfile.isAlphanumericSenderListRestricted) {
                mmsCampaignJson.campaignFrom = campaign.from;
            }

            // The form data object that will be send as request.
            var formData = new FormData();

            // Reading data from the pages of the slider.
            var allSlides = getAllSlides();
            _.each(allSlides, function (slide) {
                var currentSliderScope = angular.element(slide).scope();

                var autoplaySpeedInSec = getCurrentAutoplaySpeedInMSec(currentSliderScope) / 1000;
                var sliderObject = {
                    "duration": autoplaySpeedInSec
                };

                var attachmentText = currentSliderScope.text;
                // Add text if defined text message.
                if (attachmentText) {
                    sliderObject.attachmentText = {
                        "content": attachmentText
                    }
                }

                var currentFileWrapper = (currentSliderScope.imageFile || currentSliderScope.videoFile || currentSliderScope.audioFile);
                if (currentFileWrapper) {
                    var currentFile = currentFileWrapper.file;

                    // Add the current file.
                    formData.append('files', currentFile);

                    var currentFileMimeType = currentFile.type;
                    var currentFileMimeSubType = currentFile.type.substr(currentFile.type.lastIndexOf('/') + 1);

                    // Add image file if selected an image file for the current slide.
                    if (currentSliderScope.imageFile) {
                        sliderObject.attachmentImage = {
                            "fileName": currentFile.name,
                            "size": currentFile.size,
                            "imageMimeSubType": currentFileMimeSubType
                        }
                    }

                    // Add video file if selected a video file for the current slide.
                    if (currentSliderScope.videoFile) {
                        sliderObject.attachmentVideo = {
                            "fileName": currentFile.name,
                            "size": currentFile.size,
                            "videoMimeSubType": currentFileMimeSubType
                        }
                    }

                    // Add audio file if selected an audio file for the current slide.
                    if (currentSliderScope.audioFile) {
                        sliderObject.attachmentAudio = {
                            "fileName": currentFile.name,
                            "size": currentFile.size,
                            "audioMimeSubType": currentFileMimeSubType
                        }
                    }
                }

                if (sliderObject.attachmentText || sliderObject.attachmentImage || sliderObject.attachmentVideo || sliderObject.attachmentAudio) {
                    mmsCampaignJson.slides.push(sliderObject)
                }
            });

            // Add json object to the request at the end.
            // Call workflow service
            campaignItem.mmsCampaignDetails = mmsCampaignJson;
            var mmsCampaignStr = JSON.stringify(campaignItem);
            formData.append('mmsCampaign', mmsCampaignStr);

            // For workflow
            // Campaign create method of the flow service.
            WorkflowsService.createCampaignMms(formData).then(function (response) {
                if (response && response.code === 2001) {
                    notification.flash({
                        type: 'success',
                        text: $translate.instant('Products.BulkMessaging.Messages.CampaignCreateFlowStartedSuccessful' + ($rootScope.isAdminUser ? 'ForAdmin' : ''))
                    });

                    $state.transitionTo($state.current, {}, {reload: true, inherit: true, notify: true});
                } else {
                    WorkflowsService.showApiError(response);
                }
            }, function (response) {
                $log.error('Cannot call the campaign create flow. Error: ', response);

                if (response && response.data && response.data.message) {
                    WorkflowsService.showApiError(response);
                } else {
                    notification({
                        type: 'warning',
                        text: $translate.instant('Products.BulkMessaging.Messages.CampaignCreateFlowError')
                    });
                }
            });
        };
    });

})();
