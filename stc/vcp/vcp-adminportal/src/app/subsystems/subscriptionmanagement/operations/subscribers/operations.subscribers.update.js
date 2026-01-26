(function () {

    'use strict';

    angular.module('adminportal.subsystems.subscriptionmanagement.operations.subscribers.update', []);

    var SubscriptionManagementOperationsSubscribersUpdateModule = angular.module('adminportal.subsystems.subscriptionmanagement.operations.subscribers.update');

    SubscriptionManagementOperationsSubscribersUpdateModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.subscriptionmanagement.operations.subscribers.update', {
            url: "/:msisdn",
            templateUrl: "subsystems/subscriptionmanagement/operations/subscribers/operations.subscribers.detail.html",
            controller: 'SubscriptionManagementOperationsSubscribersUpdateCtrl',
            resolve: {
                subscriber: function ($stateParams, SSMSubscribersService) {
                    var msisdn = $stateParams.msisdn;

                    return SSMSubscribersService.getSubscriber(msisdn);
                }
            }
        });

    });

    SubscriptionManagementOperationsSubscribersUpdateModule.controller('SubscriptionManagementOperationsSubscribersUpdateCtrl', function ($scope, $rootScope, $log, $filter, $controller, $timeout, $translate, notification, Restangular, DateTimeConstants, UtilService,
                                                                                                                                          SSMSubscribersService, ContentManagementService, FileDownloadService, subscriber, PROVISIONING_PAYMENT_TYPES_NGSSM, PROVISIONING_LANGUAGES, PROVISIONING_STATES,
                                                                                                                                          PROVISIONING_STATUSES, PROVISIONING_TYPES, PROVISIONING_GENDERS) {
        $log.debug('SubscriptionManagementOperationsSubscribersUpdateCtrl');

        // Calling screening management controllers for using black listing functionality.
        //$controller('ScreeningManagementOperationsScreeningListsGlobalMsisdnCtrl', {$scope: $scope});
        $scope.subscriber = Restangular.stripRestangular(subscriber);
        if(_.isUndefined($scope.subscriber.personalInfo)|| _.isEmpty($scope.subscriber.personalInfo)) {
            $scope.subscriber.personalInfo = {
                name: '',
                email: ''
            };
        }


        // Get the profilePicCmsFile by id value.
        if($scope.subscriber.personalInfo &&  $scope.subscriber.personalInfo.profilePicCmsFileId) {
            $scope.subscriber.personalInfo.profilePicCmsFile = {name: undefined};
            var srcUrl = ContentManagementService.generateFilePath($scope.subscriber.personalInfo.profilePicCmsFileId);
            FileDownloadService.downloadFileAndGetBlob(srcUrl, function (blob, fileName) {
                $scope.subscriber.personalInfo.profilePicCmsFile = blob;
                if (blob) {
                    $scope.subscriber.personalInfo.profilePicCmsFile.name = fileName;
                }
            });
        }
        $scope.subscriber.lang = ((_.isUndefined($scope.subscriber.lang) || _.isEmpty($scope.subscriber.lang)) ? null : $scope.subscriber.lang);

        $scope.PROVISIONING_PAYMENT_TYPES = PROVISIONING_PAYMENT_TYPES_NGSSM;
        $scope.PROVISIONING_LANGUAGES = PROVISIONING_LANGUAGES;
        $scope.PROVISIONING_STATES = PROVISIONING_STATES;
        $scope.PROVISIONING_STATUSES = PROVISIONING_STATUSES;
        $scope.PROVISIONING_TYPES = PROVISIONING_TYPES;
        $scope.PROVISIONING_GENDERS = PROVISIONING_GENDERS;
        // $scope.PROVISIONING_CUSTOMER_CATEGORIES = PROVISIONING_CUSTOMER_CATEGORIES;
        // $scope.PROVISIONING_CREDIT_SEGMENTS = PROVISIONING_CREDIT_SEGMENTS;
        // $scope.PROVISIONING_VIP_CATEGORIES = PROVISIONING_VIP_CATEGORIES;
        // $scope.PROVISIONING_VIP_SUB_CATEGORIES = PROVISIONING_VIP_SUB_CATEGORIES;
        // $scope.PROVISIONING_PACKAGE_CATEGORIES = PROVISIONING_PACKAGE_CATEGORIES;

        // 3 means the category is FTTH
        if ($scope.subscriber.packageInfo && $scope.subscriber.packageInfo.category === 3) {
            $scope.PROVISIONING_STATUSES = PROVISIONING_STATUSES_FTTH;
            $scope.PROVISIONING_PACKAGE_CATEGORIES = PROVISIONING_PACKAGE_CATEGORIES_FTTH;
        }

        if ($scope.subscriber.personalInfo.birthDate) {
            $scope.subscriber.personalInfo.birthDate = new Date($scope.subscriber.personalInfo.birthDate);
        }



        $scope.dateFormat = 'MMMM d, y';
        $scope.dateOptions = {
            formatYear: 'yy',
            startingDay: 1,
            showWeeks: false
        };

        $scope.birthDatePicker = {opened: false};

        $scope.openDatePicker = function (datePicker, $event) {
            $event.preventDefault();
            $event.stopPropagation();

            datePicker.opened = true;
        };

        $scope.subscriberOriginal = angular.copy($scope.subscriber);

        $scope.isNotChanged = function () {
            return angular.equals($scope.subscriber, $scope.subscriberOriginal);
        };

        $scope.save = function (subscriber) {
            $log.debug('Updating subscriber: ', subscriber);

            // var subscriberItem = angular.copy(subscriber);
            var subscriberItem =
                {
                    attributes: subscriber.attributes,
                    lang: subscriber.lang,
                    msisdn: $scope.subscriberOriginal.msisdn,
                    paymentType: subscriber.paymentType.toUpperCase(),
                    personalInfo: subscriber.personalInfo,
                    state: subscriber.state,
                    version: subscriber.version
                }

            subscriberItem.id = $scope.subscriberOriginal.id;

            // Format the date time objects
            if (subscriber.personalInfo.birthDate) {
                subscriberItem.personalInfo.birthDate = $filter('date')(subscriber.personalInfo.birthDate, 'yyyy-MM-dd', DateTimeConstants.OFFSET);
            }

            // // ProfilePicture
            // // personalInfo.profilePicCmsFileId
            // var profilePic;
            // profilePic = subscriberItem.personalInfo.profilePicCmsFile;
            // $log.debug('Profile picture: ', profilePic);
            // if (!profilePic || (profilePic && !profilePic.name)) {
            //     subscriberItem.personalInfo.profilePicCmsFileId = null;
            // } else if (profilePic instanceof File && !subscriberItem.personalInfo.profilePicCmsFileId) {
            //     subscriberItem.personalInfo.profilePicCmsFileId = UtilService.generateObjectId();
            // }

            subscriberItem.personalInfo = {
                name: subscriberItem.personalInfo.name,
                email: subscriberItem.personalInfo.email,
                gender: subscriberItem.personalInfo.gender,
                birthDate: subscriberItem.personalInfo.birthDate,
                profilePicCmsFileId: subscriberItem.personalInfo.profilePicCmsFileId
            };

            // Update subscriber.
            SSMSubscribersService.updateSubscriber(subscriberItem).then(function (response) {
                $log.debug('Updated subscriber: ', response);


                notification.flash({
                    type: 'success',
                    text: $translate.instant('Subsystems.SubscriptionManagement.Operations.Subscribers.Messages.SubscriberUpdatingSucceded')
                });

                $scope.go('subsystems.subscriptionmanagement.operations.subscribers.list');

                // if (profilePic && profilePic.name && (profilePic instanceof File)) {
                //     ContentManagementService.uploadFile(profilePic, profilePic.name, subscriberItem.personalInfo.profilePicCmsFileId).then(function (response) {
                //         $log.debug('Profile picture uploaded: ', response);
                //         notification.flash({
                //             type: 'success',
                //             text: $translate.instant('Subsystems.SubscriptionManagement.Operations.Subscribers.Messages.SubscriberUpdatingSucceded')
                //         });
                //
                //         $scope.go('subsystems.subscriptionmanagement.operations.subscribers.list');
                //
                //     }, function (response) {
                //         // Dismiss Error message if the profile picture is not uploaded, user can always try again?
                //     });
                // } else {
                //     notification.flash({
                //         type: 'success',
                //         text: $translate.instant('Subsystems.SubscriptionManagement.Operations.Subscribers.Messages.SubscriberUpdatingSucceded')
                //     });
                //
                //     $scope.go('subsystems.subscriptionmanagement.operations.subscribers.list');
                // }


                return response;
            }, function (response) {
                $log.debug('Cannot update the subscriber. Error: ', response);

                if (!_.isUndefined(response.data) && !_.isUndefined(response.data.message)) {
                    notification({
                        type: 'danger',
                        text: response.data.message
                    });
                } else {
                    notification({
                        type: 'danger',
                        text: $translate.instant('Subsystems.SubscriptionManagement.Operations.Subscribers.Messages.SubscriberUpdatingError')
                    });
                }
            });
        };

        $scope.cancel = function () {
            $scope.go('subsystems.subscriptionmanagement.operations.subscribers.list');
        };

    })
    ;

})();
