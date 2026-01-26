(function () {

    'use strict';

    angular.module('adminportal.workflows.operations.tasks', []);

    var WorkflowsOperationsTasksModule = angular.module('adminportal.workflows.operations.tasks');

    WorkflowsOperationsTasksModule.config(function ($stateProvider) {

        $stateProvider.state('workflows.operations.tasks', {
            url: "/:taskStatus/:taskType",
            templateUrl: 'workflows/operations/operations.tasks.html',
            controller: 'WorkflowsOperationsTasksCtrl',
            resolve: {
                tasks: function ($stateParams, WorkflowsService, WORKFLOWS_STATUSES) {
                    var taskStatus = $stateParams.taskStatus;
                    var taskType = $stateParams.taskType;

                    var queryStatus = WORKFLOWS_STATUSES.PENDING;
                    if (taskStatus === 'approved') {
                        queryStatus = WORKFLOWS_STATUSES.COMPLETED;
                    } else if (taskStatus === 'rejected') {
                        queryStatus = WORKFLOWS_STATUSES.COMPLETED;
                    } else if (taskStatus === 'deleted') {
                        queryStatus = WORKFLOWS_STATUSES.DELETED;
                    } else {
                        $stateParams.taskStatus = 'pending';
                    }

                    return WorkflowsService.getTasks(0, 100, queryStatus, taskType);
                }
            }
        }).state('workflows.operations.tasks-detail', {
            abstract: true,
            url: "/:taskStatus/:taskType/:taskId",
            template: '<div ui-view></div>',
            resolve: {
                allOrganizations: function (CMPFService, DEFAULT_REST_QUERY_LIMIT, UtilService) {
                    return CMPFService.getAllOrganizationsCustom(false, true, [CMPFService.OPERATOR_PROFILE]);
                },
                task: function ($stateParams, WorkflowsService, UtilService) {
                    return WorkflowsService.getTask($stateParams.taskId);
                }
            }
        }).state('workflows.operations.tasks-detail.service', {
            url: "/service",
            templateUrl: 'workflows/operations/operations.tasks.services.detail.html',
            controller: 'WorkflowsOperationsTasksDetailServiceCtrl',
            resolve: {
                taskDetail: function ($q, task, Restangular, WorkflowsService, UtilService) {
                    var deferred = $q.defer();

                    WorkflowsService.getService(task.serviceId).then(function (serviceResponse) {
                        task.serviceTask = Restangular.stripRestangular(serviceResponse);

                        deferred.resolve(task);
                    }, function (errorResponse) {
                        deferred.reject(errorResponse);
                    });

                    return deferred.promise;
                }
            }
        }).state('workflows.operations.tasks-detail.offer', {
            url: "/offer",
            templateUrl: 'workflows/operations/operations.tasks.offers.detail.html',
            controller: 'WorkflowsOperationsTasksDetailOfferCtrl',
            resolve: {
                taskDetail: function ($q, task, Restangular, WorkflowsService) {
                    var deferred = $q.defer();

                    WorkflowsService.getOffer(task.offerId).then(function (offerResponse) {
                        task.offerTask = Restangular.stripRestangular(offerResponse);

                        deferred.resolve(task);
                    }, function (errorResponse) {
                        deferred.reject(errorResponse);
                    });

                    return deferred.promise;
                }
            }
        }).state('workflows.operations.tasks-detail.partner', {
            url: "/partner",
            templateUrl: 'workflows/operations/operations.tasks.partners.detail.html',
            controller: 'WorkflowsOperationsTasksDetailPartnerCtrl',
            resolve: {
                taskDetail: function ($q, task, Restangular, WorkflowsService) {
                    var deferred = $q.defer();

                    WorkflowsService.getPartner(task.partnerId).then(function (partnerResponse) {
                        task.partnerTask = Restangular.stripRestangular(partnerResponse);

                        deferred.resolve(task);
                    }, function (errorResponse) {
                        deferred.reject(errorResponse);
                    });

                    return deferred.promise;
                }
            }
        }).state('workflows.operations.tasks-detail.content_metadata', {
            url: "/content-metadata",
            templateUrl: 'workflows/operations/operations.tasks.contentmetadatas.detail.html',
            controller: 'WorkflowsOperationsTasksDetailContentMetadataCtrl',
            resolve: {
                services: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllServices(true);
                },
                contentCategories: function (ContentManagementService) {
                    return ContentManagementService.getContentCategories();
                },
                contentTypes: function (ContentManagementService) {
                    return ContentManagementService.getContentTypes();
                },
                taskDetail: function ($q, task, Restangular, WorkflowsService) {
                    var deferred = $q.defer();

                    WorkflowsService.getContentMetadata(task.contentMetadataId).then(function (contentMetadataResponse) {
                        task.contentMetadataTask = Restangular.stripRestangular(contentMetadataResponse);

                        deferred.resolve(task);
                    }, function (errorResponse) {
                        deferred.reject(errorResponse);
                    });

                    return deferred.promise;
                }
            }
        }).state('workflows.operations.tasks-detail.content_file', {
            url: "/content-file",
            templateUrl: 'workflows/operations/operations.tasks.contentfiles.detail.html',
            controller: 'WorkflowsOperationsTasksDetailContentFileCtrl',
            resolve: {
                taskDetail: function ($q, task, Restangular, WorkflowsService, ContentManagementService) {
                    var deferred = $q.defer();

                    WorkflowsService.getContentFile(task.contentFileId).then(function (contentFileResponse) {
                        task.contentFileTask = Restangular.stripRestangular(contentFileResponse);

                        ContentManagementService.getContentMetadata(task.contentFileTask.objectDetail.contentId).then(function (contentMetadataResponse) {
                            task.contentFileTask.contentMetadata = contentMetadataResponse;

                            deferred.resolve(task);
                        });
                    }, function (errorResponse) {
                        deferred.reject(errorResponse);
                    });

                    return deferred.promise;
                }
            }
        }).state('workflows.operations.tasks-detail.short_code', {
            url: "/short-code",
            templateUrl: 'workflows/operations/operations.tasks.shortcodes.detail.html',
            controller: 'WorkflowsOperationsTasksDetailShortCodeCtrl',
            resolve: {
                taskDetail: function ($q, task, Restangular, WorkflowsService, ContentManagementService) {
                    var deferred = $q.defer();

                    WorkflowsService.getShortCode(task.shortCodeId).then(function (shortCodeResponse) {
                        task.shortCodeTask = Restangular.stripRestangular(shortCodeResponse);

                        deferred.resolve(task);
                    }, function (errorResponse) {
                        deferred.reject(errorResponse);
                    });

                    return deferred.promise;
                }
            }
        }).state('workflows.operations.tasks-detail.campaign_sms', {
            url: "/campaign-sms",
            templateUrl: 'workflows/operations/operations.tasks.campaignsms.detail.html',
            controller: 'WorkflowsOperationsTasksDetailCampaignSmsCtrl',
            resolve: {
                userAccounts: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getUserAccounts(0, DEFAULT_REST_QUERY_LIMIT, true, true);
                },
                taskDetail: function ($q, task, Restangular, WorkflowsService, ContentManagementService) {
                    var deferred = $q.defer();

                    WorkflowsService.getCampaignSms(task.campaignId).then(function (campaignResponse) {
                        task.campaignTask = Restangular.stripRestangular(campaignResponse);

                        deferred.resolve(task);
                    }, function (errorResponse) {
                        deferred.reject(errorResponse);
                    });

                    return deferred.promise;
                }
            }
        }).state('workflows.operations.tasks-detail.campaign_mms', {
            url: "/campaign-mms",
            templateUrl: 'workflows/operations/operations.tasks.campaignmms.detail.html',
            controller: 'WorkflowsOperationsTasksDetailCampaignMmsCtrl',
            resolve: {
                userAccounts: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getUserAccounts(0, DEFAULT_REST_QUERY_LIMIT, true, true);
                },
                taskDetail: function ($q, task, Restangular, WorkflowsService) {
                    var deferred = $q.defer();

                    WorkflowsService.getCampaignMms(task.campaignId).then(function (campaignResponse) {
                        task.campaignTask = Restangular.stripRestangular(campaignResponse);

                        deferred.resolve(task);
                    }, function (errorResponse) {
                        deferred.reject(errorResponse);
                    });

                    return deferred.promise;
                }
            }
        }).state('workflows.operations.tasks-detail.campaign_ivr', {
            url: "/campaign-ivr",
            templateUrl: 'workflows/operations/operations.tasks.campaignivr.detail.html',
            controller: 'WorkflowsOperationsTasksDetailCampaignIvrCtrl',
            resolve: {
                userAccounts: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getUserAccounts(0, DEFAULT_REST_QUERY_LIMIT, true, true);
                },
                taskDetail: function ($q, task, Restangular, WorkflowsService) {
                    var deferred = $q.defer();

                    WorkflowsService.getCampaignIvr(task.campaignId).then(function (campaignResponse) {
                        task.campaignTask = Restangular.stripRestangular(campaignResponse);

                        deferred.resolve(task);
                    }, function (errorResponse) {
                        deferred.reject(errorResponse);
                    });

                    return deferred.promise;
                }
            }
        }).state('workflows.operations.tasks-detail.interactive_campaign_sms', {
            url: "/interactive-campaign-sms",
            templateUrl: 'workflows/operations/operations.tasks.interactivecampaignsms.detail.html',
            controller: 'WorkflowsOperationsTasksDetailInteractiveCampaignSmsCtrl',
            resolve: {
                userAccounts: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getUserAccounts(0, DEFAULT_REST_QUERY_LIMIT, true, true);
                },
                taskDetail: function ($q, task, Restangular, WorkflowsService) {
                    var deferred = $q.defer();

                    WorkflowsService.getInteractiveCampaignSms(task.campaignId).then(function (campaignResponse) {
                        task.campaignTask = Restangular.stripRestangular(campaignResponse);

                        deferred.resolve(task);
                    }, function (errorResponse) {
                        deferred.reject(errorResponse);
                    });

                    return deferred.promise;
                }
            }
        }).state('workflows.operations.tasks-detail.interactive_campaign_ivr', {
            url: "/interactive-campaign-ivr",
            templateUrl: 'workflows/operations/operations.tasks.interactivecampaignivr.detail.html',
            controller: 'WorkflowsOperationsTasksDetailInteractiveCampaignIvrCtrl',
            resolve: {
                userAccounts: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getUserAccounts(0, DEFAULT_REST_QUERY_LIMIT, true, true);
                },
                taskDetail: function ($q, task, Restangular, WorkflowsService) {
                    var deferred = $q.defer();

                    WorkflowsService.getInteractiveCampaignIvr(task.campaignId).then(function (campaignResponse) {
                        task.campaignTask = Restangular.stripRestangular(campaignResponse);

                        deferred.resolve(task);
                    }, function (errorResponse) {
                        deferred.reject(errorResponse);
                    });

                    return deferred.promise;
                }
            }
        }).state('workflows.operations.tasks-detail.interactive_campaign_fast_key', {
            url: "/interactive-campaign-ivr",
            templateUrl: 'workflows/operations/operations.tasks.interactivecampaignivr.detail.html',
            controller: 'WorkflowsOperationsTasksDetailInteractiveCampaignIvrCtrl',
            resolve: {
                userAccounts: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getUserAccounts(0, DEFAULT_REST_QUERY_LIMIT, true, true);
                },
                taskDetail: function ($q, task, Restangular, WorkflowsService) {
                    var deferred = $q.defer();

                    WorkflowsService.getInteractiveCampaignFastKey(task.campaignId).then(function (campaignResponse) {
                        task.campaignTask = Restangular.stripRestangular(campaignResponse);

                        deferred.resolve(task);
                    }, function (errorResponse) {
                        deferred.reject(errorResponse);
                    });

                    return deferred.promise;
                }
            }
        }).state('workflows.operations.tasks-detail.rbt_category', {
            url: "/rbt-category",
            templateUrl: 'workflows/operations/operations.tasks.rbtcategories.detail.html',
            controller: 'WorkflowsOperationsTasksDetailRBTCategoryCtrl',
            resolve: {
                taskDetail: function ($q, task, Restangular, WorkflowsService, ContentManagementService) {
                    var deferred = $q.defer();

                    WorkflowsService.getContentCategoryRBT(task.rbtContentId).then(function (rbtCategoryResponse) {
                        task.rbtCategoryTask = Restangular.stripRestangular(rbtCategoryResponse);

                        if (task.rbtCategoryTask && task.rbtCategoryTask.objectDetail) {
                            ContentManagementService.getTone(task.rbtCategoryTask.objectDetail.defaultToneId).then(function (response) {
                                task.rbtCategoryTask.objectDetail.defaultTone = response.tone;

                                deferred.resolve(task);
                            }, function (response) {
                                task.rbtCategoryTask.objectDetail.defaultTone = {name: 'N/A'};

                                deferred.resolve(task);
                            });
                        } else {
                            deferred.resolve(task);
                        }
                    }, function (errorResponse) {
                        deferred.reject(errorResponse);
                    });

                    return deferred.promise;
                }
            }
        }).state('workflows.operations.tasks-detail.rbt_mood', {
            url: "/rbt-mood",
            templateUrl: 'workflows/operations/operations.tasks.rbtmoods.detail.html',
            controller: 'WorkflowsOperationsTasksDetailRBTMoodCtrl',
            resolve: {
                taskDetail: function ($q, task, Restangular, WorkflowsService, ContentManagementService) {
                    var deferred = $q.defer();

                    WorkflowsService.getMoodRBT(task.rbtContentId).then(function (rbtCategoryResponse) {
                        task.moodTask = Restangular.stripRestangular(rbtCategoryResponse);

                        if (task.moodTask && task.moodTask.objectDetail) {
                            ContentManagementService.getTone(task.moodTask.objectDetail.defaultToneId).then(function (response) {
                                task.moodTask.objectDetail.defaultTone = response.tone;

                                deferred.resolve(task);
                            }, function (response) {
                                task.moodTask.objectDetail.defaultTone = {name: 'N/A'};

                                deferred.resolve(task);
                            });
                        } else {
                            deferred.resolve(task);
                        }
                    }, function (errorResponse) {
                        deferred.reject(errorResponse);
                    });

                    return deferred.promise;
                }
            }
        }).state('workflows.operations.tasks-detail.rbt_tone', {
            url: "/rbt-tone",
            templateUrl: 'workflows/operations/operations.tasks.rbttones.detail.html',
            controller: 'WorkflowsOperationsTasksDetailRBTToneCtrl',
            resolve: {
                moods: function (ContentManagementService, DEFAULT_REST_QUERY_LIMIT) {
                    return ContentManagementService.getMoods(0, DEFAULT_REST_QUERY_LIMIT);
                },
                artists: function (ContentManagementService, DEFAULT_REST_QUERY_LIMIT) {
                    return ContentManagementService.getArtists(0, DEFAULT_REST_QUERY_LIMIT);
                },
                albums: function (ContentManagementService, DEFAULT_REST_QUERY_LIMIT) {
                    return ContentManagementService.getAlbums(0, DEFAULT_REST_QUERY_LIMIT);
                },
                contentCategories: function (DEFAULT_REST_QUERY_LIMIT, ContentManagementService) {
                    return ContentManagementService.getContentCategoriesRBT(0, DEFAULT_REST_QUERY_LIMIT);
                },
                taskDetail: function ($q, task, Restangular, WorkflowsService) {
                    var deferred = $q.defer();

                    WorkflowsService.getToneRBT(task.rbtContentId).then(function (rbtCategoryResponse) {
                        task.toneTask = Restangular.stripRestangular(rbtCategoryResponse);

                        deferred.resolve(task);
                    }, function (errorResponse) {
                        deferred.reject(errorResponse);
                    });

                    return deferred.promise;
                }
            }
        }).state('workflows.operations.tasks-detail.rbt_artist', {
            url: "/rbt-artist",
            templateUrl: 'workflows/operations/operations.tasks.rbtartists.detail.html',
            controller: 'WorkflowsOperationsTasksDetailRBTArtistCtrl',
            resolve: {
                taskDetail: function ($q, task, Restangular, WorkflowsService, ContentManagementService) {
                    var deferred = $q.defer();

                    WorkflowsService.getArtistRBT(task.rbtContentId).then(function (rbtCategoryResponse) {
                        task.artistTask = Restangular.stripRestangular(rbtCategoryResponse);

                        if (task.artistTask && task.artistTask.objectDetail) {
                            ContentManagementService.getTone(task.artistTask.objectDetail.defaultToneId).then(function (response) {
                                task.artistTask.objectDetail.defaultTone = response.tone;

                                deferred.resolve(task);
                            }, function (response) {
                                task.artistTask.objectDetail.defaultTone = {name: 'N/A'};

                                deferred.resolve(task);
                            });
                        } else {
                            deferred.resolve(task);
                        }
                    }, function (errorResponse) {
                        deferred.reject(errorResponse);
                    });

                    return deferred.promise;
                }
            }
        }).state('workflows.operations.tasks-detail.rbt_album', {
            url: "/rbt-album",
            templateUrl: 'workflows/operations/operations.tasks.rbtalbums.detail.html',
            controller: 'WorkflowsOperationsTasksDetailRBTAlbumCtrl',
            resolve: {
                moods: function (ContentManagementService, DEFAULT_REST_QUERY_LIMIT) {
                    return ContentManagementService.getMoods(0, DEFAULT_REST_QUERY_LIMIT);
                },
                contentCategories: function (DEFAULT_REST_QUERY_LIMIT, ContentManagementService) {
                    return ContentManagementService.getContentCategoriesRBT(0, DEFAULT_REST_QUERY_LIMIT);
                },
                taskDetail: function ($q, task, Restangular, WorkflowsService, ContentManagementService) {
                    var deferred = $q.defer();

                    WorkflowsService.getAlbumRBT(task.rbtContentId).then(function (rbtCategoryResponse) {
                        task.albumTask = Restangular.stripRestangular(rbtCategoryResponse);

                        if (task.albumTask && task.albumTask.objectDetail) {
                            ContentManagementService.getTone(task.albumTask.objectDetail.defaultToneId).then(function (response) {
                                task.albumTask.objectDetail.defaultTone = response.tone;

                                deferred.resolve(task);
                            }, function (response) {
                                task.albumTask.objectDetail.defaultTone = {name: 'N/A'};

                                deferred.resolve(task);
                            });
                        } else {
                            deferred.resolve(task);
                        }
                    }, function (errorResponse) {
                        deferred.reject(errorResponse);
                    });

                    return deferred.promise;
                }
            }
        });
    });

    WorkflowsOperationsTasksModule.controller('WorkflowsOperationsTasksCommonCtrl', function ($scope, $log, $controller, $state, $stateParams, $uibModal, $translate, notification, Restangular,
                                                                                              SessionService, WorkflowsService, WORKFLOWS_STATUSES, AdmPortalNotificationListPromiseTracker) {
        $controller('WorkflowsTaskListOperationsCommonCtrl', {$scope: $scope});

        $scope.WORKFLOWS_STATUSES = WORKFLOWS_STATUSES;
        $scope.BLOCK_SCROLL = false;

        $scope.deleteTask = function (task) {
            task.taskSelected = true;

            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                $log.debug('Removing task: ', task);

                var cancelMethod = WorkflowsService.cancelService;
                var itemId = task.serviceId;
                if (task.type === 'OFFER') {
                    cancelMethod = WorkflowsService.cancelOffer;
                    itemId = task.offerId;
                } else if (task.type === 'PARTNER') {
                    cancelMethod = WorkflowsService.cancelPartner;
                    itemId = task.partnerId;
                } else if (task.type === 'CONTENT_METADATA') {
                    cancelMethod = WorkflowsService.cancelContentMetadata;
                    itemId = task.contentMetadataId;
                } else if (task.type === 'CONTENT_FILE') {
                    cancelMethod = WorkflowsService.cancelContentFile;
                    itemId = task.contentFileId;
                } else if (task.type === 'SHORT_CODE') {
                    cancelMethod = WorkflowsService.cancelShortCode;
                    itemId = task.shortCodeId;
                } else if (task.type === 'CAMPAIGN_SMS') {
                    cancelMethod = WorkflowsService.cancelCampaignSms;
                    itemId = task.campaignId;
                } else if (task.type === 'CAMPAIGN_MMS') {
                    cancelMethod = WorkflowsService.cancelCampaignMms;
                    itemId = task.campaignId;
                } else if (task.type === 'CAMPAIGN_IVR') {
                    cancelMethod = WorkflowsService.cancelCampaignIvr;
                    itemId = task.campaignId;
                } else if (task.type === 'INTERACTIVE_CAMPAIGN_SMS') {
                    cancelMethod = WorkflowsService.cancelInteractiveCampaignSms;
                    itemId = task.campaignId;
                } else if (task.type === 'INTERACTIVE_CAMPAIGN_IVR') {
                    cancelMethod = WorkflowsService.cancelInteractiveCampaignIvr;
                    itemId = task.campaignId;
                } else if (task.type === 'INTERACTIVE_CAMPAIGN_FAST_KEY') {
                    cancelMethod = WorkflowsService.cancelInteractiveCampaignFastKey;
                    itemId = task.campaignId;
                } else if (task.type === 'RBT_CATEGORY') {
                    cancelMethod = WorkflowsService.cancelContentCategoryRBT;
                    itemId = task.rbtContentId;
                } else if (task.type === 'RBT_MOOD') {
                    cancelMethod = WorkflowsService.cancelMoodRBT;
                    itemId = task.rbtContentId;
                } else if (task.type === 'RBT_TONE') {
                    cancelMethod = WorkflowsService.cancelToneRBT;
                    itemId = task.rbtContentId;
                } else if (task.type === 'RBT_ARTIST') {
                    cancelMethod = WorkflowsService.cancelArtistRBT;
                    itemId = task.rbtContentId;
                } else if (task.type === 'RBT_ALBUM') {
                    cancelMethod = WorkflowsService.cancelAlbumRBT;
                    itemId = task.rbtContentId;
                }

                cancelMethod(itemId).then(function (response) {
                    $log.debug('Removed task: ', response);

                    var apiResponse = Restangular.stripRestangular(response);

                    if (apiResponse && apiResponse.errorCode) {
                        WorkflowsService.showApiError(apiResponse);
                    } else {
                        notification.flash({
                            type: 'success',
                            text: $translate.instant('CommonLabels.OperationSuccessful')
                        });

                        $state.go('workflows.operations.tasks', {
                            taskStatus: $stateParams.taskStatus,
                            taskType: $stateParams.taskType
                        }, {reload: true});
                    }
                }, function (response) {
                    $log.debug('Cannot delete task: ', response);

                    WorkflowsService.showApiError(response);
                });

                task.taskSelected = false;
            }, function () {
                task.taskSelected = false;
            });
        };

        var completeTask = function (task, response) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: function ($scope, $uibModalInstance, $translate, $controller, $sce) {
                    var message = '';
                    if (response === 'APPROVE') {
                        message = $translate.instant('Workflows.Operations.Messages.ApproveConfirmationMessage');
                    } else if (response === 'REJECT') {
                        message = $translate.instant('Workflows.Operations.Messages.RejectConfirmationMessage');
                        $scope.requireReason = true;
                    }
                    $scope.confirmationMessage = $sce.trustAsHtml(message);

                    $controller('ConfirmationModalInstanceCtrl', {
                        $scope: $scope,
                        $uibModalInstance: $uibModalInstance
                    });

                    $scope.ok = function () {
                        $uibModalInstance.close($scope.reason);
                    };
                }
            });

            modalInstance.result.then(function (reason) {
                $log.debug('Completing workflow task: ', task, ', with the response: ', response);

                var completeMethod = WorkflowsService.approveTask;
                if (response === 'REJECT') {
                    completeMethod = WorkflowsService.rejectTask;
                }

                // Assign the task first.
                WorkflowsService.assignTask(task.id, SessionService.getUsername()).then(function (response) {
                    $log.debug('Assigned task: ', response);

                    var apiResponse = Restangular.stripRestangular(response);

                    if (apiResponse && apiResponse.errorCode) {
                        WorkflowsService.showApiError(apiResponse);
                    } else {
                        completeMethod(task.id, reason).then(function (completeResponse) {
                            $log.debug('Completed task: ', completeResponse);

                            var apiResponse = Restangular.stripRestangular(completeResponse);

                            if (apiResponse && apiResponse.errorCode) {
                                WorkflowsService.showApiError(apiResponse);
                            } else {
                                notification.flash({
                                    type: 'success',
                                    text: $translate.instant('CommonLabels.OperationSuccessful')
                                });

                                $state.go('workflows.operations.tasks', {
                                    taskStatus: $stateParams.taskStatus,
                                    taskType: $stateParams.taskType
                                }, {reload: true});
                            }
                        }, function (response) {
                            $log.debug('Cannot complete task: ', response);

                            notification({
                                type: 'warning',
                                text: $translate.instant('Workflows.Operations.Messages.TaskCannotBeCompleted')
                            });
                        });
                    }
                }, function (response) {
                    $log.debug('Cannot complete task: ', response);

                    WorkflowsService.showApiError(response);
                });
            });
        };

        var assignAndCompleteTask = function (task, taskType) {
            completeTask(task, taskType);
        };

        $scope.approveTask = function (task) {
            assignAndCompleteTask(task, 'APPROVE');
        };

        $scope.rejectTask = function (task) {
            assignAndCompleteTask(task, 'REJECT');
        };

        $scope.cancel = function () {
            $state.go('workflows.operations.tasks', {
                taskStatus: $stateParams.taskStatus,
                taskType: $stateParams.taskType
            }, {reload: true});
        };

        var taskStatus = $stateParams.taskStatus;
        var taskType = $stateParams.taskType;

        $scope.arrangeNote = function (taskList) {
            _.each(taskList, function (task) {
                // Find the user of the task item.
                if (taskStatus === 'pending') {
                    var noteKey = 'Workflows.Operations.Messages.PendingNote';
                    task.note = $translate.instant(noteKey, {
                        user: task.from ? task.from.userId : '',
                        serviceProvider: task.from ? task.from.orgId : ''
                    });
                } else {
                    var noteKey = 'Workflows.Operations.Messages.' + s.capitalize(taskStatus) + 'Note';
                    task.note = $translate.instant(noteKey, {
                        user: task.to ? task.to.userId : '',
                        group: task.to ? task.to.groupId : ''
                    });
                }

                if (task.status === WORKFLOWS_STATUSES.NOTIFICATION) {
                    if (task.notification.newState !== task.notification.oldState) {
                        task.note = $translate.instant('Workflows.Operations.Messages.NotificationStateChangeNote', {
                            type: s.titleize(task.type),
                            oldState: s.titleize(task.notification.oldState),
                            newState: s.titleize(task.notification.newState)
                        });
                    } else {
                        task.note = $translate.instant('Workflows.Operations.Messages.NotificationUpdateNote', {
                            type: s.titleize(task.type),
                            currentState: s.titleize(task.notification.newState)
                        });
                    }
                }
            });
        };


        // Lazy load task items
        var page = 1;
        $scope.lazyLoad = function () {
            $scope.BLOCK_SCROLL = true;

            var queryStatus = WORKFLOWS_STATUSES.PENDING;
            if (taskStatus === 'approved') {
                queryStatus = WORKFLOWS_STATUSES.COMPLETED;
            } else if (taskStatus === 'rejected') {
                queryStatus = WORKFLOWS_STATUSES.COMPLETED;
            } else if (taskStatus === 'deleted') {
                queryStatus = WORKFLOWS_STATUSES.DELETED;
            } else {
                $stateParams.taskStatus = 'pending';
            }

            if ($scope.tasks && $scope.tasks.length < $scope.totalRecords) {
                WorkflowsService.getTasks(page, 100, queryStatus, taskType, AdmPortalNotificationListPromiseTracker)
                    .then(function (ts) {
                            page++;
                            var taskList = (ts && ts.detail) ? ts.detail.items : [];
                            $scope.arrangeNote(taskList);
                            $scope.tasks = $scope.tasks.concat(taskList);
                            $scope.BLOCK_SCROLL = false;
                        },
                        function (errorResponse) {
                            $log.debug('Cannot complete task: ', errorResponse);

                            notification({
                                type: 'warning',
                                text: $translate.instant('Workflows.Operations.Messages.TaskCannotBeCompleted')
                            });
                        });
            }
        };
    });

    WorkflowsOperationsTasksModule.controller('WorkflowsOperationsTasksCtrl',
        function ($scope, $log, $controller, $state, $stateParams, $translate, Restangular, tasks, WorkflowsService, WORKFLOWS_STATUSES, AdmPortalNotificationListPromiseTracker) {

            $log.debug("WorkflowsOperationsTasksCtrl");
            $log.debug('Operations Controller Loaded - tasks', tasks);

            $controller('WorkflowsOperationsTasksCommonCtrl', {$scope: $scope});

            var taskStatus = $stateParams.taskStatus;
            var taskType = $stateParams.taskType;

            $scope.resourceTypeFilter = taskType ? taskType : 'ALL';
            $scope.resourceTypeFilterChange = function (resourceType) {
                $state.go('workflows.operations.tasks', {
                    taskStatus: taskStatus,
                    taskType: resourceType
                }, {reload: true});
            };

            $scope.tasks = (tasks && tasks.detail) ? tasks.detail.items : [];
            $scope.totalRecords = (tasks && tasks.detail) ? tasks.detail.total : 0;

            $scope.arrangeNote($scope.tasks);

            if (taskStatus === 'approved') {
                $scope.tasks = _.filter($scope.tasks, function (task) {
                    return task.response === 'APPROVE';
                });
            } else if (taskStatus === 'rejected') {
                $scope.tasks = _.filter($scope.tasks, function (task) {
                    return task.response === 'REJECT';
                });
            }

            $scope.showDetail = function (taskType, taskId) {
                var url = '';

                if (taskType === 'SERVICE') {
                    url = 'workflows.operations.tasks-detail.service';
                } else if (taskType === 'OFFER') {
                    url = 'workflows.operations.tasks-detail.offer';
                } else if (taskType === 'PARTNER') {
                    url = 'workflows.operations.tasks-detail.partner';
                } else if (taskType === 'CONTENT_METADATA') {
                    url = 'workflows.operations.tasks-detail.content_metadata';
                } else if (taskType === 'CONTENT_FILE') {
                    url = 'workflows.operations.tasks-detail.content_file';
                } else if (taskType === 'SHORT_CODE') {
                    url = 'workflows.operations.tasks-detail.short_code';
                } else if (taskType === 'CAMPAIGN_SMS') {
                    url = 'workflows.operations.tasks-detail.campaign_sms';
                } else if (taskType === 'CAMPAIGN_MMS') {
                    url = 'workflows.operations.tasks-detail.campaign_mms';
                } else if (taskType === 'CAMPAIGN_IVR') {
                    url = 'workflows.operations.tasks-detail.campaign_ivr';
                } else if (taskType === 'INTERACTIVE_CAMPAIGN_SMS') {
                    url = 'workflows.operations.tasks-detail.interactive_campaign_sms';
                } else if (taskType === 'INTERACTIVE_CAMPAIGN_IVR') {
                    url = 'workflows.operations.tasks-detail.interactive_campaign_ivr';
                } else if (taskType === 'INTERACTIVE_CAMPAIGN_FAST_KEY') {
                    url = 'workflows.operations.tasks-detail.interactive_campaign_fast_key';
                } else if (taskType === 'RBT_CATEGORY') {
                    url = 'workflows.operations.tasks-detail.rbt_category';
                } else if (taskType === 'RBT_MOOD') {
                    url = 'workflows.operations.tasks-detail.rbt_mood';
                } else if (taskType === 'RBT_TONE') {
                    url = 'workflows.operations.tasks-detail.rbt_tone';
                } else if (taskType === 'RBT_ARTIST') {
                    url = 'workflows.operations.tasks-detail.rbt_artist';
                } else if (taskType === 'RBT_ALBUM') {
                    url = 'workflows.operations.tasks-detail.rbt_album';
                }

                $state.go(url, {
                    taskStatus: $stateParams.taskStatus,
                    taskType: $stateParams.taskType,
                    taskId: taskId
                }, {reload: true});
            };
        });

    WorkflowsOperationsTasksModule.controller('WorkflowsOperationsTasksDetailServiceCtrl', function ($scope, $log, $controller, $filter, Restangular, UtilService, FileDownloadService, CMPFService, DateTimeConstants,
                                                                                                     ContentManagementService, allOrganizations, taskDetail, DEFAULT_REST_QUERY_LIMIT, DAYS_OF_WEEK) {
        $log.debug("WorkflowsOperationsTasksDetailServiceCtrl");

        $controller('WorkflowsOperationsTasksCommonCtrl', {$scope: $scope});

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

            CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_ORGANIZATION_NAME + ' ', true).then(function (response) {
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

            $controller('ProvisioningOperationsServiceCapabilityAccessCtrl', {$scope: $scope});
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

            $controller('ProvisioningOperationsServicesFeesCtrl', {$scope: $scope});
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

            $controller('ProvisioningOperationsKeywordChapterMappingCtrl', {$scope: $scope});
        }

        // OnDemandi18nProfile
        var onDemandi18nProfiles = CMPFService.getProfileAttributes(currentDetail.profiles, CMPFService.SERVICE_ON_DEMAND_I18N_PROFILE);
        currentDetail.onDemandi18nProfileList = [];
        if (onDemandi18nProfiles && onDemandi18nProfiles.length > 0) {
            _.each(onDemandi18nProfiles, function (onDemandi18nProfile) {
                var onDemandi18nProfileItem = _.extend({id: _.uniqueId()}, onDemandi18nProfile);

                currentDetail.onDemandi18nProfileList.push(onDemandi18nProfileItem);
            });

            $controller('ProvisioningOperationsOnDemandi18nCtrl', {$scope: $scope});
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

            $controller('ProvisioningOperationsServiceContentBasedSettlementProfileCtrl', {$scope: $scope});
        }
    });

    WorkflowsOperationsTasksModule.controller('WorkflowsOperationsTasksDetailOfferCtrl', function ($scope, $log, $controller, $filter, Restangular, UtilService, CMPFService, allOrganizations,
                                                                                                   ContentManagementService, FileDownloadService, DEFAULT_REST_QUERY_LIMIT, taskDetail) {
        $log.debug("WorkflowsOperationsTasksDetailOfferCtrl");

        $controller('WorkflowsOperationsTasksCommonCtrl', {$scope: $scope});

        $scope.task = Restangular.stripRestangular(taskDetail);

        var currentTask = $scope.task.offerTask;
        var currentDetail = currentTask.objectDetail;

        // Find the organization of the task item.
        var foundOrganization = _.findWhere(allOrganizations.organizations, {"id": s.toNumber(currentDetail.organizationId)});
        currentDetail.serviceProviderName = _.isUndefined(foundOrganization) ? 'N/A' : foundOrganization.name;

        // Offeri18nProfile
        var offeri18nProfiles = CMPFService.getProfileAttributes(currentDetail.profiles, CMPFService.OFFER_I18N_PROFILE);
        currentDetail.offeri18nProfiles = [];
        if (offeri18nProfiles.length > 0) {
            var offeri18nProfilesEn = _.findWhere(offeri18nProfiles, {Language: 'EN'});
            if (offeri18nProfilesEn) {
                currentDetail.offeri18nProfiles.push(offeri18nProfilesEn);
            } else {
                currentDetail.offeri18nProfiles.push({
                    Language: 'EN',
                    Name: '',
                    Description: '',
                    SearchKeyword: '',
                    SubscriptionDescription: '',
                    UnsubscriptionDescription: ''
                });
            }

            var offeri18nProfilesAr = _.findWhere(offeri18nProfiles, {Language: 'AR'});
            if (offeri18nProfilesAr) {
                currentDetail.offeri18nProfiles.push(offeri18nProfilesAr);
            } else {
                currentDetail.offeri18nProfiles.push({
                    Language: 'AR',
                    Name: '',
                    Description: '',
                    SearchKeyword: '',
                    SubscriptionDescription: '',
                    UnsubscriptionDescription: ''
                });
            }
        }

        // XsmOfferProfile
        var xsmOfferProfiles = CMPFService.getProfileAttributes(currentDetail.profiles, CMPFService.XSM_OFFER_PROFILE);
        if (xsmOfferProfiles.length > 0) {
            currentDetail.xsmOfferProfile = angular.copy(xsmOfferProfiles[0]);

            currentDetail.xsmOfferProfile.NotificationEventDurationString = UtilService.convertPeriodStringToHumanReadable(currentDetail.xsmOfferProfile.NotificationEventDuration);
            currentDetail.xsmOfferProfile.ConfirmationEventDurationString = UtilService.convertPeriodStringToHumanReadable(currentDetail.xsmOfferProfile.ConfirmationEventDuration);

            // Get the coverImage by CoverImageID value.

            if (currentDetail.xsmOfferProfile.IsRbt) {
                if (currentDetail.xsmOfferProfile.CoverImageID) {
                    var coverImageSrcUrl = ContentManagementService.generateFilePath(currentDetail.xsmOfferProfile.CoverImageID);
                    FileDownloadService.downloadFileAndGenerateUrl(coverImageSrcUrl, function (blobUrl, fileName) {
                        currentDetail.xsmOfferProfile.coverImageBlobUrl = blobUrl;
                        currentDetail.xsmOfferProfile.coverImageName = fileName;
                    });
                }
                if (currentDetail.xsmOfferProfile.CardImageID) {
                    // Get the cardImage by CardImageID value.
                    var cardImageSrcUrl = ContentManagementService.generateFilePath(currentDetail.xsmOfferProfile.CardImageID);
                    FileDownloadService.downloadFileAndGenerateUrl(cardImageSrcUrl, function (blobUrl, fileName) {
                        currentDetail.xsmOfferProfile.cardImageBlobUrl = blobUrl;
                        currentDetail.xsmOfferProfile.cardImageName = fileName;
                    });
                }
                if (currentDetail.xsmOfferProfile.ThumbnailID) {
                    // Get the thumbnail by ThumbnailID value.
                    var thumbnailSrcUrl = ContentManagementService.generateFilePath(currentDetail.xsmOfferProfile.ThumbnailID);
                    FileDownloadService.downloadFileAndGenerateUrl(thumbnailSrcUrl, function (blobUrl, fileName) {
                        currentDetail.xsmOfferProfile.thumbnailBlobUrl = blobUrl;
                        currentDetail.xsmOfferProfile.thumbnailName = fileName;
                    });
                }
            }
        }

        // XsmChargingProfile
        var xsmChargingProfiles = CMPFService.getProfileAttributes(currentDetail.profiles, CMPFService.XSM_CHARGING_PROFILE);
        if (xsmChargingProfiles.length > 0) {
            currentDetail.xsmChargingProfile = angular.copy(xsmChargingProfiles[0]);

            currentDetail.xsmChargingProfile.ChargingPeriodString = UtilService.convertPeriodStringToHumanReadable(currentDetail.xsmChargingProfile.ChargingPeriod);
            currentDetail.xsmChargingProfile.RetryPeriodString = UtilService.convertPeriodStringToHumanReadable(currentDetail.xsmChargingProfile.RetryPeriod);
            currentDetail.xsmChargingProfile.MicroChargingPeriodString = UtilService.convertPeriodStringToHumanReadable(currentDetail.xsmChargingProfile.MicroChargingPeriod);
        }

        // XsmRenewalProfile
        var xsmRenewalProfiles = CMPFService.getProfileAttributes(currentDetail.profiles, CMPFService.XSM_RENEWAL_PROFILE);
        if (xsmRenewalProfiles.length > 0) {
            currentDetail.xsmRenewalProfile = angular.copy(xsmRenewalProfiles[0]);
        }

        // XsmTrialProfile
        var xsmTrialProfiles = CMPFService.getProfileAttributes(currentDetail.profiles, CMPFService.XSM_TRIAL_PROFILE);
        if (xsmTrialProfiles.length > 0) {
            currentDetail.xsmTrialProfile = angular.copy(xsmTrialProfiles[0]);

            currentDetail.xsmTrialProfile.TrialPeriodString = UtilService.convertPeriodStringToHumanReadable(currentDetail.xsmTrialProfile.TrialPeriod);
            currentDetail.xsmTrialProfile.NextAllowedTrialUsagePeriodString = UtilService.convertPeriodStringToHumanReadable(currentDetail.xsmTrialProfile.NextAllowedTrialUsagePeriod);
        }

        // SMSPortali18nProfile
        var smsPortali18nProfiles = CMPFService.getProfileAttributes(currentDetail.profiles, CMPFService.SMS_PORTAL_I18N_PROFILE);
        currentDetail.smsPortali18nProfileList = [];
        if (smsPortali18nProfiles && smsPortali18nProfiles.length > 0) {
            _.each(smsPortali18nProfiles, function (smsPortali18nProfile) {
                currentDetail.smsPortali18nProfileList.push(smsPortali18nProfile);
            });

            $controller('SubscriptionManagementOperationsOffersSMSPortali18nProfileCtrl', {$scope: $scope});
        }

        // OfferEligibilityProfile
        var offerEligibilityProfiles = CMPFService.getProfileAttributes(currentDetail.profiles, CMPFService.OFFER_ELIGIBILITY_PROFILE);
        if (offerEligibilityProfiles.length > 0) {
            currentDetail.offerEligibilityProfile = angular.copy(offerEligibilityProfiles[0]);
        }

        // SubscriptionRenewalNotificationProfile
        var subscriptionRenewalNotificationProfiles = CMPFService.getProfileAttributes(currentDetail.profiles, CMPFService.SUBSCRIPTION_RENEWAL_NOTIFICATION_PROFILE);
        if (subscriptionRenewalNotificationProfiles.length > 0) {
            currentDetail.subscriptionRenewalNotificationProfile = angular.copy(subscriptionRenewalNotificationProfiles[0]);

            if (currentDetail.subscriptionRenewalNotificationProfile.RecurRenewalCount && currentDetail.subscriptionRenewalNotificationProfile.RecurRenewalCount >= 1) {
                currentDetail.subscriptionRenewalNotificationProfile.RecurRenewalCount = 1;
            } else {
                currentDetail.subscriptionRenewalNotificationProfile.RecurRenewalCount = 0;
            }
        }

        // BundleOfferProfile
        var bundleOfferProfiles = CMPFService.getProfileAttributes(currentDetail.profiles, CMPFService.BUNDLE_OFFER_PROFILE);
        if (bundleOfferProfiles.length > 0) {
            currentDetail.bundleOfferProfile = angular.copy(bundleOfferProfiles[0]);

            CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_ORGANIZATION_NAME + ' ', true).then(function (response) {
                // Get business types.
                var businessTypesOrganization = _.findWhere(response.organizations, {name: CMPFService.DEFAULT_BUSINESS_TYPES_ORGANIZATION_NAME});
                var businessTypes = CMPFService.getBusinessTypes(businessTypesOrganization);
                currentDetail.bundleOfferProfile.businessType = _.findWhere(businessTypes, {profileId: Number(currentDetail.bundleOfferProfile.BusinessTypeID)});

                // Get settlement types.
                var settlementTypesOrganization = _.findWhere(response.organizations, {name: CMPFService.DEFAULT_SETTLEMENT_TYPES_ORGANIZATION_NAME});
                var settlementTypes = CMPFService.getSettlementTypes(settlementTypesOrganization);
                currentDetail.bundleOfferProfile.settlementType = _.findWhere(settlementTypes, {profileId: Number(currentDetail.bundleOfferProfile.SettlementTypeID)});

                // Get sub categories.
                var serviceCategoriesOrganization = _.findWhere(response.organizations, {name: CMPFService.DEFAULT_SERVICE_CATEGORIES_ORGANIZATION_NAME});
                var subServiceCategories = CMPFService.getSubServiceCategories(serviceCategoriesOrganization);
                currentDetail.bundleOfferProfile.category = _.findWhere(subServiceCategories, {profileId: Number(currentDetail.bundleOfferProfile.CategoryID)});
            });
        }

        // OfferBundlingProfile
        var offerBundlingProfiles = CMPFService.getProfileAttributes(currentDetail.profiles, CMPFService.OFFER_BUNDLING_PROFILE);
        if (offerBundlingProfiles.length > 0) {
            currentDetail.offerBundlingProfile = angular.copy(offerBundlingProfiles[0]);

            $scope.mainOfferList = [];
            $scope.eligibilityEvalCustomerProfiles = [];

            if (currentDetail.offerBundlingProfile.BundlingEnabled) {
                // MainOfferList conversions
                var copyMainOfferList = angular.copy(currentDetail.offerBundlingProfile.MainOfferList);
                if (copyMainOfferList) {
                    currentDetail.offerBundlingProfile.MainOfferList = [];
                    _.each(copyMainOfferList.toString().split('|'), function (mainOfferId) {
                        CMPFService.getOffer(Number(mainOfferId)).then(function (offer) {
                            currentDetail.offerBundlingProfile.MainOfferList.push(Number(mainOfferId));

                            $scope.mainOfferList.push(offer);
                        });
                    });
                }

                // EligibilityEvalCustomerProfiles conversions
                var copyEligibilityEvalCustomerProfiles = angular.copy(currentDetail.offerBundlingProfile.EligibilityEvalCustomerProfiles);
                if (copyEligibilityEvalCustomerProfiles && !_.isArray(copyEligibilityEvalCustomerProfiles)) {
                    currentDetail.offerBundlingProfile.EligibilityEvalCustomerProfiles = [];
                    _.each(copyEligibilityEvalCustomerProfiles.toString().split('|'), function (profileName) {
                        var eligibilityEvalCustomerProfile = {'Name': profileName};

                        currentDetail.offerBundlingProfile.EligibilityEvalCustomerProfiles.push(eligibilityEvalCustomerProfile);

                        $scope.eligibilityEvalCustomerProfiles.push(eligibilityEvalCustomerProfile);
                    });
                }
            }
        } else {
            currentDetail.offerBundlingProfile = {BundlingEnabled: false};
        }
    });

    WorkflowsOperationsTasksModule.controller('WorkflowsOperationsTasksDetailPartnerCtrl', function ($scope, $log, $controller, $filter, Restangular, FileDownloadService, CMPFService, DateTimeConstants,
                                                                                                     ContentManagementService, allOrganizations, taskDetail, DEFAULT_REST_QUERY_LIMIT, SERVICE_PROVIDER_LEGAL_FILE_TYPES) {
        $log.debug("WorkflowsOperationsTasksDetailPartnerCtrl");

        $controller('WorkflowsOperationsTasksCommonCtrl', {$scope: $scope});

        $scope.task = Restangular.stripRestangular(taskDetail);

        // Find current task and detail of it.
        var currentTask = $scope.task.partnerTask;
        var currentDetail = currentTask.objectDetail;

        // Find the organization of the task item.
        var foundOrganization = _.findWhere(allOrganizations.organizations, {"id": s.toNumber(currentDetail.id)});
        if (foundOrganization) {
            currentDetail.name = foundOrganization.name;
            currentDetail.parentName = foundOrganization.parentName;
        }

        // Provideri18nProfile
        var serviceProvideri18nProfiles = CMPFService.getProfileAttributes(currentDetail.profiles, CMPFService.SERVICE_PROVIDER_I18N_PROFILE);
        currentDetail.serviceProvideri18nProfiles = [];
        if (serviceProvideri18nProfiles.length > 0) {
            var serviceProvideri18nProfilesEn = _.findWhere(serviceProvideri18nProfiles, {Language: 'EN'});
            if (serviceProvideri18nProfilesEn) {
                currentDetail.serviceProvideri18nProfiles.push(serviceProvideri18nProfilesEn);
            } else {
                currentDetail.serviceProvideri18nProfiles.push({
                    Language: 'EN',
                    Name: '',
                    Description: '',
                    IsDefault: false
                });
            }

            var serviceProvideri18nProfilesAr = _.findWhere(serviceProvideri18nProfiles, {Language: 'AR'});
            if (serviceProvideri18nProfilesAr) {
                currentDetail.serviceProvideri18nProfiles.push(serviceProvideri18nProfilesAr);
            } else {
                currentDetail.serviceProvideri18nProfiles.push({
                    Language: 'AR',
                    Name: '',
                    Description: '',
                    IsDefault: false
                });
            }
        }

        // ServiceProviderProfile
        var serviceProviderProfiles = CMPFService.getProfileAttributes(currentDetail.profiles, CMPFService.SERVICE_PROVIDER_PROFILE);
        if (serviceProviderProfiles.length > 0) {
            currentDetail.serviceProviderProfile = angular.copy(serviceProviderProfiles[0]);

            if (currentDetail.serviceProviderProfile.CMSCompanyLogoID) {
                var srcUrl = ContentManagementService.generateFilePath(currentDetail.serviceProviderProfile.CMSCompanyLogoID);
                FileDownloadService.downloadFileAndGenerateUrl(srcUrl, function (blobUrl, fileName) {
                    currentDetail.serviceProviderProfile.CMSCompanyLogoBlobUrl = blobUrl;
                    currentDetail.serviceProviderProfile.CMSCompanyLogoName = fileName;
                });
            }
        }

        // ProviderAuthProfile
        var providerAuthProfiles = CMPFService.getProfileAttributes(currentDetail.profiles, CMPFService.SERVICE_PROVIDER_AUTH_PROFILE);
        if (providerAuthProfiles.length > 0) {
            currentDetail.providerAuthProfile = angular.copy(providerAuthProfiles[0]);
        }

        // ProviderRegistrationProfile
        var providerRegistrationProfiles = CMPFService.getProfileAttributes(currentDetail.profiles, CMPFService.SERVICE_PROVIDER_REGISTRATION_PROFILE);
        if (providerRegistrationProfiles.length > 0) {
            currentDetail.providerRegistrationProfile = angular.copy(providerRegistrationProfiles[0]);
        }

        // ProviderContactsProfile
        var providerContactsProfiles = CMPFService.getProfileAttributes(currentDetail.profiles, CMPFService.SERVICE_PROVIDER_CONTACTS_PROFILE);
        if (providerContactsProfiles.length > 0) {
            currentDetail.providerContactsProfile = angular.copy(providerContactsProfiles[0]);
        }

        // ProviderBankAccountProfile
        var providerBankAccountProfiles = CMPFService.getProfileAttributes(currentDetail.profiles, CMPFService.SERVICE_PROVIDER_BANK_ACCOUNT_PROFILE);
        if (providerBankAccountProfiles.length > 0) {
            currentDetail.providerBankAccountProfile = angular.copy(providerBankAccountProfiles[0]);
        }

        // ProviderBusinessTypeProfile
        var providerBusinessTypeProfiles = CMPFService.getProfileAttributes(currentDetail.profiles, CMPFService.SERVICE_PROVIDER_BUSINESS_TYPE_PROFILE);
        currentDetail.providerBusinessTypeProfiles = [];
        if (providerBusinessTypeProfiles.length > 0) {
            // ProviderSettlementTypeProfile
            var providerSettlementTypeProfiles = CMPFService.getProfileAttributes(currentDetail.profiles, CMPFService.SERVICE_PROVIDER_SETTLEMENT_TYPE_PROFILE);
            if (providerSettlementTypeProfiles.length > 0) {
                // Get business types.
                CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_ORGANIZATION_NAME + ' ').then(function (response) {
                    var businessTypesOrganization = _.findWhere(response.organizations, {name: CMPFService.DEFAULT_BUSINESS_TYPES_ORGANIZATION_NAME});
                    var businessTypes = CMPFService.getBusinessTypes(businessTypesOrganization);

                    var settlementTypesOrganization = _.findWhere(response.organizations, {name: CMPFService.DEFAULT_SETTLEMENT_TYPES_ORGANIZATION_NAME});
                    var settlementTypes = CMPFService.getSettlementTypes(settlementTypesOrganization);

                    var providerSettlementTypeProfileIds = _.pluck(providerSettlementTypeProfiles, 'SettlementTypeID');
                    _.each(providerBusinessTypeProfiles, function (providerBusinessTypeProfile) {
                        var selectedBusinessType = _.findWhere(businessTypes, {profileId: Number(providerBusinessTypeProfile.BusinessTypeID)});
                        if (selectedBusinessType) {
                            selectedBusinessType.selectedSettlementTypes = [];
                            currentDetail.providerBusinessTypeProfiles.push(selectedBusinessType);

                            _.each(selectedBusinessType.SettlementTypes, function (businessTypesSettlementType) {
                                var foundSettlementType = _.findWhere(settlementTypes, {profileId: Number(businessTypesSettlementType.value)});
                                if (foundSettlementType && _.contains(providerSettlementTypeProfileIds, foundSettlementType.profileId)) {
                                    selectedBusinessType.selectedSettlementTypes.push(foundSettlementType);
                                }
                            });
                        }
                    });
                });
            }
        }

        // ProviderLegalDocsProfile
        var providerLegalDocsProfiles = CMPFService.getProfileAttributes(currentDetail.profiles, CMPFService.SERVICE_PROVIDER_LEGAL_DOCS_PROFILE);
        currentDetail.providerLegalDocsProfiles = [];
        if (providerLegalDocsProfiles.length > 0) {
            var providerLegalDocsProfile = angular.copy(providerLegalDocsProfiles[0]);

            _.each(SERVICE_PROVIDER_LEGAL_FILE_TYPES, function (legalFileTypeName) {
                var providerLegalDocsFileObject = {name: legalFileTypeName};

                var keyword = legalFileTypeName.split('DocReq')[0];

                var localDocContentID = providerLegalDocsProfile['CMS' + keyword + 'ID'];
                if (localDocContentID) {
                    providerLegalDocsFileObject['CMS' + keyword + 'ID'] = localDocContentID;

                    var srcUrl = ContentManagementService.generateFilePath(localDocContentID);
                    FileDownloadService.downloadFileAndGetBlob(srcUrl, function (blob, fileName) {
                        providerLegalDocsFileObject.file = blob;
                        providerLegalDocsFileObject.fileName = fileName;
                    });
                }

                var localDocValidFrom = providerLegalDocsProfile[keyword + 'ValidFrom'];
                if (localDocValidFrom) {
                    providerLegalDocsFileObject.fromDate = new Date(moment(localDocValidFrom).utcOffset(DateTimeConstants.OFFSET).format('YYYY/MM/DD HH:mm:ss'));
                }

                var localDocValidTo = providerLegalDocsProfile[keyword + 'ValidTo'];
                if (localDocValidTo) {
                    providerLegalDocsFileObject.toDate = new Date(moment(localDocValidTo).utcOffset(DateTimeConstants.OFFSET).format('YYYY/MM/DD HH:mm:ss'));
                }

                if (localDocContentID || localDocValidFrom || localDocValidTo) {
                    currentDetail.providerLegalDocsProfiles.push(providerLegalDocsFileObject);
                }
            });
        }
    });

    WorkflowsOperationsTasksModule.controller('WorkflowsOperationsTasksDetailContentMetadataCtrl', function ($scope, $log, $controller, $filter, Restangular, FileDownloadService, ContentManagementService, DateTimeConstants,
                                                                                                             allOrganizations, services, contentCategories, contentTypes, taskDetail) {
        $log.debug("WorkflowsOperationsTasksDetailContentMetadataCtrl");

        $controller('WorkflowsOperationsTasksCommonCtrl', {$scope: $scope});

        $scope.task = Restangular.stripRestangular(taskDetail);

        var currentTask = $scope.task.contentMetadataTask;
        var currentDetail = currentTask.objectDetail;

        // Find the organization of the task item.
        var foundOrganization = _.findWhere(allOrganizations.organizations, {"id": s.toNumber(currentDetail.orgId)});
        currentDetail.serviceProviderName = _.isUndefined(foundOrganization) ? 'N/A' : foundOrganization.name;

        var foundService = _.findWhere(services.services, {id: Number(currentDetail.serviceId)});
        currentDetail.serviceName = _.isUndefined(foundService) ? '' : foundService.name;

        var foundContentCategory = _.findWhere(contentCategories.detail, {id: currentDetail.categoryId});
        if (foundContentCategory) {
            var foundParentContentCategory = _.findWhere(contentCategories.detail, {id: foundContentCategory.parent});
            if (foundParentContentCategory) {
                currentDetail.categoryName = foundParentContentCategory.title + ' - ' + foundContentCategory.title;
            } else {
                currentDetail.categoryName = foundContentCategory.title;
            }
        }

        var foundContentType = _.findWhere(contentTypes.detail, {id: currentDetail.type});
        currentDetail.typeName = _.isUndefined(foundContentType) ? '' : foundContentType.name;

        var detailEn = _.findWhere(currentDetail.detail, {lang: 'en'});
        if (detailEn) {
            currentDetail.titleen = detailEn.title;
            currentDetail.descriptionen = detailEn.description;
            currentDetail.searchkeyworden = detailEn.searchKeyword;
        }
        var detailAr = _.findWhere(currentDetail.detail, {lang: 'ar'});
        if (detailAr) {
            currentDetail.titlear = detailAr.title;
            currentDetail.descriptionar = detailAr.description;
            currentDetail.searchkeywordar = detailAr.searchKeyword;
        }

        if (currentDetail.iconId) {
            var srcUrl = ContentManagementService.generateFilePath(currentDetail.iconId);
            FileDownloadService.downloadFileAndGenerateUrl(srcUrl, function (blobUrl, fileName) {
                currentDetail.WEBIconBlobUrl = blobUrl;
                currentDetail.WEBIconName = fileName;
            });
        }

        currentDetail.copyrightFileList = [];
        if (currentDetail.copyrightFiles && currentDetail.copyrightFiles.length > 0) {
            _.each(currentDetail.copyrightFiles, function (copyrightFile) {
                var copyrightFileItem = angular.copy(copyrightFile);

                if (copyrightFileItem.startDate) {
                    copyrightFileItem.startDate = new Date(moment(copyrightFileItem.startDate).utcOffset(DateTimeConstants.OFFSET).format('YYYY/MM/DD HH:mm:ss'));
                }
                if (copyrightFileItem.endDate) {
                    copyrightFileItem.endDate = new Date(moment(copyrightFileItem.endDate).utcOffset(DateTimeConstants.OFFSET).format('YYYY/MM/DD HH:mm:ss'));
                }

                copyrightFileItem.copyrightFile = {name: undefined};

                var srcUrl = ContentManagementService.generateFilePath(copyrightFileItem.id);
                FileDownloadService.downloadFileAndGetBlob(srcUrl, function (blob, fileName) {
                    copyrightFileItem.copyrightFile = blob;
                    if (blob) {
                        copyrightFileItem.copyrightFile.name = fileName;
                    }
                    currentDetail.copyrightFileList = $filter('orderBy')(currentDetail.copyrightFileList, ['copyrightFile.name']);
                });

                currentDetail.copyrightFileList.push(copyrightFileItem);
            });
        }
    });

    WorkflowsOperationsTasksModule.controller('WorkflowsOperationsTasksDetailContentFileCtrl', function ($scope, $log, $controller, $filter, Restangular, FileDownloadService, ContentManagementService,
                                                                                                         taskDetail) {
        $log.debug("WorkflowsOperationsTasksDetailContentFileCtrl");

        $controller('WorkflowsOperationsTasksCommonCtrl', {$scope: $scope});

        $scope.task = Restangular.stripRestangular(taskDetail);

        var currentTask = $scope.task.contentFileTask;
        var currentDetail = currentTask.objectDetail;

        // Get the content file by id value.
        currentDetail.FileName = currentDetail.fileName;

        if (currentDetail.fileId) {
            var srcUrl = ContentManagementService.generateContentMetadataFilePath(currentDetail.fileId);
            FileDownloadService.downloadFileAndGetBlob(srcUrl, function (blob, fileName) {
                currentDetail.File = blob;
                currentDetail.FileName = fileName;
            });
        }
    });

    WorkflowsOperationsTasksModule.controller('WorkflowsOperationsTasksDetailShortCodeCtrl', function ($scope, $log, $controller, $filter, Restangular, allOrganizations, taskDetail) {
        $log.debug("WorkflowsOperationsTasksDetailShortCodeCtrl");

        $controller('WorkflowsOperationsTasksCommonCtrl', {$scope: $scope});

        $scope.task = Restangular.stripRestangular(taskDetail);

        var currentTask = $scope.task.shortCodeTask;
        var currentDetail = currentTask.objectDetail;

        // Find the organization of the task item.
        var foundOrganization = _.findWhere(allOrganizations.organizations, {"id": s.toNumber(currentDetail.providerId)});
        currentDetail.serviceProviderName = _.isUndefined(foundOrganization) ? 'N/A' : foundOrganization.name;
    });

    WorkflowsOperationsTasksModule.controller('WorkflowsOperationsTasksDetailCampaignSmsCtrl', function ($scope, $log, $controller, $filter, Restangular, BulkMessagingOperationsService,
                                                                                                         allOrganizations, userAccounts, taskDetail) {
        $log.debug("WorkflowsOperationsTasksDetailCampaignSmsCtrl");

        $controller('WorkflowsOperationsTasksCommonCtrl', {$scope: $scope});

        $scope.task = Restangular.stripRestangular(taskDetail);

        var currentTask = $scope.task.campaignTask;
        var currentDetail = currentTask.objectDetail;

        // Find the organization of the task item.
        var foundOrganization = _.findWhere(allOrganizations.organizations, {"id": Number(currentDetail.campaignOrgId)});
        currentDetail.organizationName = _.isUndefined(foundOrganization) ? 'N/A' : foundOrganization.name;

        // Find the user of the task item.
        var foundUserAccount = _.findWhere(userAccounts.userAccounts, {"id": Number(currentDetail.campaignUserId)});
        currentDetail.userAccountName = _.isUndefined(foundUserAccount) ? 'N/A' : foundUserAccount.userName;

        // Find the black list items
        currentDetail.campaignBlackLists = [];
        if (currentDetail.campaignBlackListId) {
            currentDetail.campaignBlackLists = currentDetail.campaignBlackListId.split(',');

            BulkMessagingOperationsService.getDistributionListsPerUser(currentDetail.campaignUserId, 'USER_BLACKLIST').then(function (userResponse) {
                BulkMessagingOperationsService.getDistributionListsPerOrganization(currentDetail.campaignOrgId, 'USER_BLACKLIST').then(function (organizationResponse) {
                    _.each(currentDetail.campaignBlackLists, function (campaignBlackList) {
                        var foundUserScreeningList = _.findWhere(userResponse.lists, {id: Number(campaignBlackList)});
                        if (foundUserScreeningList) {
                            currentDetail.campaignBlackLists.push({
                                id: campaignBlackList,
                                name: foundUserScreeningList.name
                            })
                        }

                        var foundOrganizationScreeningList = _.findWhere(organizationResponse.lists, {id: Number(campaignBlackList)});
                        if (foundOrganizationScreeningList) {
                            currentDetail.campaignBlackLists.push({
                                id: campaignBlackList,
                                name: foundOrganizationScreeningList.name
                            })
                        }


                        if (!foundUserScreeningList && !foundOrganizationScreeningList) {
                            currentDetail.campaignBlackLists.push({
                                id: campaignBlackList,
                                name: 'N/A'
                            })
                        }
                    });
                });
            });
        }

        // Prepare the time constraints list.
        _.each(currentDetail.timeConstraints, function (timeConstraint) {
            timeConstraint.value = timeConstraint.startMinuteInWeek + '-' + timeConstraint.endMinuteInWeek;
        });

        // Find the distribution list item to show name of it.
        BulkMessagingOperationsService.getGlobalWhiteLists().then(function (globalWhiteListResponse) {
            BulkMessagingOperationsService.getDistributionListsPerUser(currentDetail.campaignUserId, 'USER_LIST').then(function (userResponse) {
                BulkMessagingOperationsService.getDistributionListsPerOrganization(currentDetail.campaignOrgId, 'USER_LIST').then(function (organizationResponse) {
                    var foundGlobalDistList = _.findWhere(globalWhiteListResponse.lists, {id: Number(currentDetail.campaignListId)});
                    if (foundGlobalDistList) {
                        currentDetail.campaignListType = 'GLOBAL';
                        currentDetail.campaignListName = foundGlobalDistList.name;
                    }

                    var foundUserDistList = _.findWhere(userResponse.lists, {id: Number(currentDetail.campaignListId)});
                    if (foundUserDistList) {
                        currentDetail.campaignListType = 'PER USER';
                        currentDetail.campaignListName = foundUserDistList.name;
                    }

                    var foundOrganizationDistList = _.findWhere(organizationResponse.lists, {id: Number(currentDetail.campaignListId)});
                    if (foundOrganizationDistList) {
                        currentDetail.campaignListType = 'PER ORGANIZATION';
                        currentDetail.campaignListName = foundOrganizationDistList.name;
                    }

                    if (!foundGlobalDistList && !foundUserDistList && !foundOrganizationDistList) {
                        currentDetail.campaignListName = 'N/A';
                    }
                });
            });
        });
    });

    WorkflowsOperationsTasksModule.controller('WorkflowsOperationsTasksDetailCampaignMmsCtrl', function ($scope, $log, $compile, $controller, $filter, $interval, $timeout, Restangular, BulkMessagingOperationsService, ContentManagementService,
                                                                                                         FileDownloadService, allOrganizations, userAccounts, taskDetail) {
        $log.debug("WorkflowsOperationsTasksDetailCampaignMmsCtrl");

        $controller('WorkflowsOperationsTasksCommonCtrl', {$scope: $scope});

        $scope.task = Restangular.stripRestangular(taskDetail);

        var currentTask = $scope.task.campaignTask;
        var currentDetail = currentTask.objectDetail;

        // Find the organization of the task item.
        var foundOrganization = _.findWhere(allOrganizations.organizations, {"id": Number(currentDetail.campaignOrgId)});
        currentDetail.organizationName = _.isUndefined(foundOrganization) ? 'N/A' : foundOrganization.name;

        // Find the user of the task item.
        var foundUserAccount = _.findWhere(userAccounts.userAccounts, {"id": Number(currentDetail.campaignUserId)});
        currentDetail.userAccountName = _.isUndefined(foundUserAccount) ? 'N/A' : foundUserAccount.userName;

        // Find the black list items
        currentDetail.campaignBlackLists = [];
        if (currentDetail.campaignBlackListId) {
            currentDetail.campaignBlackLists = currentDetail.campaignBlackListId.split(',');

            BulkMessagingOperationsService.getDistributionListsPerUser(currentDetail.campaignUserId, 'USER_BLACKLIST').then(function (userResponse) {
                BulkMessagingOperationsService.getDistributionListsPerOrganization(currentDetail.campaignOrgId, 'USER_BLACKLIST').then(function (organizationResponse) {
                    _.each(currentDetail.campaignBlackLists, function (campaignBlackList) {
                        var foundUserScreeningList = _.findWhere(userResponse.lists, {id: Number(campaignBlackList)});
                        if (foundUserScreeningList) {
                            currentDetail.campaignBlackLists.push({
                                id: campaignBlackList,
                                name: foundUserScreeningList.name
                            })
                        }

                        var foundOrganizationScreeningList = _.findWhere(organizationResponse.lists, {id: Number(campaignBlackList)});
                        if (foundOrganizationScreeningList) {
                            currentDetail.campaignBlackLists.push({
                                id: campaignBlackList,
                                name: foundOrganizationScreeningList.name
                            })
                        }


                        if (!foundUserScreeningList && !foundOrganizationScreeningList) {
                            currentDetail.campaignBlackLists.push({
                                id: campaignBlackList,
                                name: 'N/A'
                            })
                        }
                    });
                });
            });
        }

        // Prepare the time constraints list.
        _.each(currentDetail.timeConstraints, function (timeConstraint) {
            timeConstraint.value = timeConstraint.startMinuteInWeek + '-' + timeConstraint.endMinuteInWeek;
        });

        // Find the distribution list item to show name of it.
        BulkMessagingOperationsService.getGlobalWhiteLists().then(function (globalWhiteListResponse) {
            BulkMessagingOperationsService.getDistributionListsPerUser(currentDetail.campaignUserId, 'USER_LIST').then(function (userResponse) {
                BulkMessagingOperationsService.getDistributionListsPerOrganization(currentDetail.campaignOrgId, 'USER_LIST').then(function (organizationResponse) {
                    var foundGlobalDistList = _.findWhere(globalWhiteListResponse.lists, {id: Number(currentDetail.campaignListId)});
                    if (foundGlobalDistList) {
                        currentDetail.campaignListType = 'GLOBAL';
                        currentDetail.campaignListName = foundGlobalDistList.name;
                    }

                    var foundUserDistList = _.findWhere(userResponse.lists, {id: Number(currentDetail.campaignListId)});
                    if (foundUserDistList) {
                        currentDetail.campaignListType = 'PER USER';
                        currentDetail.campaignListName = foundUserDistList.name;
                    }

                    var foundOrganizationDistList = _.findWhere(organizationResponse.lists, {id: Number(currentDetail.campaignListId)});
                    if (foundOrganizationDistList) {
                        currentDetail.campaignListType = 'PER ORGANIZATION';
                        currentDetail.campaignListName = foundOrganizationDistList.name;
                    }

                    if (!foundGlobalDistList && !foundUserDistList && !foundOrganizationDistList) {
                        currentDetail.campaignListName = 'N/A';
                    }
                });
            });
        });

        // Begin - MMS Composer section
        $scope.slidePages = [];
        $scope.currentPage = 0;

        $scope.currentSlick1;
        $scope.currentSlick2;

        $scope.addNewSlide = function () {
            // Check this site to support video formats to play: https://tools.woolyss.com/html5-audio-video-tester/
            var viewerElement = $("" +
                "<div class=\"panel-primary\" slide-preview>" +
                " <div class=\"panel-heading\">" +
                "   <div class=\"row panel-title\">" +
                "     <div class=\"col-md-6\">" +
                "       <span class=\"header-text\"></span>" +
                "     </div>" +
                "     <div class=\"col-md-6\">" +
                "      <span class=\"counter-text pull-right\"></span>" +
                "     </div>" +
                "   </div>" +
                " </div>" +
                " <div class=\"panel-body\">" +

                "   <div class=\"slick-page-image-wrapper\" ng-if=\"imageFile.file\">" +
                "     <img ngf-thumbnail=\"imageFile.file\">" +
                "   </div>" +

                "   <div class=\"slick-page-video-wrapper\" ng-if=\"videoFile.file\">" +
                "     <video height=\"190\" controls controlsList=\"nodownload\" ngf-src=\"videoFile.file\">Video not supported.</video>" +
                "   </div>" +

                "   <div class=\"slick-page-audio-wrapper\" ng-if=\"audioFile.file\">" +
                "     <audio controls controlsList=\"nodownload\" ngf-src=\"audioFile.file\"></audio>" +
                "   </div>" +

                "   <div class=\"slick-page-text-wrapper form-group\" ng-if=\"text !== undefined\" style=\"margin: 0 0 0 10px;\">" +
                "     <textarea name=\"text\" ng-value=\"$parent.text\" ng-init=\"maxTextLength = 256;\" ng-disabled=\"true\"></textarea>" +
                "     <span class=\"text-counter\"></span>" +
                "   </div>" +

                " </div>" +
                " <div class=\"panel-footer\" style=\"height: 52px;\">" +
                "  <div class=\"row\">" +
                "   <div class=\"col-md-12\">" +
                "     <div class=\"col-md-6 pull-left\">" +
                "     </div>" +
                "     <div class=\"col-md-6 pull-right\">" +
                "        <form class=\"form-horizontal\" novalidate id=\"form\" name=\"form\" method=\"post\" enctype=\"multipart/form-data\">" +
                "          <div class=\"form-group pull-left\" style=\"margin-bottom: 0;\">\n" +
                "              <div class=\"input-group\" style=\"width: 145px;\">\n" +
                "                  <input id=\"autoplaySpeed\" name=\"autoplaySpeed\" type=\"number\" class=\"form-control input-sm\"\n" +
                "                         ng-value=\"autoplaySpeed.value\" ng-disabled=\"true\"\n" +
                "                         min=\"1\" max=\"60\" ng-required=\"true\"/>\n" +
                "                  <span class=\"input-group-addon\">sec</span>\n" +
                "              </div>\n" +
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

        // Create page for each slides.
        $scope.fillTheSliders = function () {
            _.each(currentDetail.slides, function (slide, index) {
                $scope.addNewSlide();

                var slickSlide = $scope.currentSlick1.$slides[index];
                var currentSliderScope = angular.element(slickSlide).scope();

                // Assign the duration value to the slide page.
                currentSliderScope.autoplaySpeed = {
                    value: slide.duration
                };

                if (slide.attachmentText) {
                    currentSliderScope.text = slide.attachmentText.content;
                }
            });

            if (currentTask.context && currentTask.context.fileIds) {
                var fileIdArray = currentTask.context.fileIds.split(',');
                if (fileIdArray && fileIdArray.length > 0) {
                    _.each(fileIdArray, function (fileId, index) {
                        var srcUrl = ContentManagementService.generateContentMetadataFilePath(fileId);
                        FileDownloadService.downloadFileAndGetBlob(srcUrl, function (blob, fileName) {
                            var foundSlideObject = null;
                            _.each(currentDetail.slides, function (slide, index) {
                                var attachment = slide.attachmentImage || slide.attachmentVideo || slide.attachmentAudio;

                                if (attachment && attachment.fileName === fileName) {
                                    foundSlideObject = {
                                        slide: slide,
                                        index: index
                                    };
                                }
                            });

                            if (foundSlideObject) {
                                var slickSlide = $scope.currentSlick1.$slides[foundSlideObject.index];
                                var currentSliderScope = angular.element(slickSlide).scope();

                                if (foundSlideObject.slide.attachmentImage) {
                                    currentSliderScope.imageFile = {
                                        file: blob
                                    };
                                } else if (foundSlideObject.slide.attachmentVideo) {
                                    currentSliderScope.videoFile = {
                                        file: blob
                                    };
                                } else if (foundSlideObject.slide.attachmentAudio) {
                                    currentSliderScope.audioFile = {
                                        file: blob
                                    };
                                }
                            }
                        });
                    });
                }
            }
        }

        // Fill the sliders after the initialization of it.
        $('.slick-preview').on('init', function (event, slick) {
            $timeout(function () {
                $scope.fillTheSliders();
            }, 0);
        });

    });

    WorkflowsOperationsTasksModule.controller('WorkflowsOperationsTasksDetailCampaignIvrCtrl', function ($scope, $log, $controller, $filter, Restangular, BulkMessagingOperationsService,
                                                                                                         allOrganizations, userAccounts, taskDetail) {
        $log.debug("WorkflowsOperationsTasksDetailCampaignIvrCtrl");

        $controller('WorkflowsOperationsTasksCommonCtrl', {$scope: $scope});

        $scope.task = Restangular.stripRestangular(taskDetail);

        var currentTask = $scope.task.campaignTask;
        var currentDetail = currentTask.objectDetail;

        // Find the organization of the task item.
        var foundOrganization = _.findWhere(allOrganizations.organizations, {"id": Number(currentDetail.campaignOrgId)});
        currentDetail.organizationName = _.isUndefined(foundOrganization) ? 'N/A' : foundOrganization.name;

        // Find the user of the task item.
        var foundUserAccount = _.findWhere(userAccounts.userAccounts, {"id": Number(currentDetail.campaignUserId)});
        currentDetail.userAccountName = _.isUndefined(foundUserAccount) ? 'N/A' : foundUserAccount.userName;

        // Find the black list items
        currentDetail.campaignBlackLists = [];
        if (currentDetail.campaignBlackListId) {
            currentDetail.campaignBlackLists = currentDetail.campaignBlackListId.split(',');

            BulkMessagingOperationsService.getDistributionListsPerUser(currentDetail.campaignUserId, 'USER_BLACKLIST').then(function (userResponse) {
                BulkMessagingOperationsService.getDistributionListsPerOrganization(currentDetail.campaignOrgId, 'USER_BLACKLIST').then(function (organizationResponse) {
                    _.each(currentDetail.campaignBlackLists, function (campaignBlackList) {
                        var foundUserScreeningList = _.findWhere(userResponse.lists, {id: Number(campaignBlackList)});
                        if (foundUserScreeningList) {
                            currentDetail.campaignBlackLists.push({
                                id: campaignBlackList,
                                name: foundUserScreeningList.name
                            })
                        }

                        var foundOrganizationScreeningList = _.findWhere(organizationResponse.lists, {id: Number(campaignBlackList)});
                        if (foundOrganizationScreeningList) {
                            currentDetail.campaignBlackLists.push({
                                id: campaignBlackList,
                                name: foundOrganizationScreeningList.name
                            })
                        }


                        if (!foundUserScreeningList && !foundOrganizationScreeningList) {
                            currentDetail.campaignBlackLists.push({
                                id: campaignBlackList,
                                name: 'N/A'
                            })
                        }
                    });
                });
            });
        }

        // Prepare the time constraints list.
        _.each(currentDetail.timeConstraints, function (timeConstraint) {
            timeConstraint.value = timeConstraint.startMinuteInWeek + '-' + timeConstraint.endMinuteInWeek;
        });

        // Find the distribution list item to show name of it.
        BulkMessagingOperationsService.getGlobalWhiteLists().then(function (globalWhiteListResponse) {
            BulkMessagingOperationsService.getDistributionListsPerUser(currentDetail.campaignUserId, 'USER_LIST').then(function (userResponse) {
                BulkMessagingOperationsService.getDistributionListsPerOrganization(currentDetail.campaignOrgId, 'USER_LIST').then(function (organizationResponse) {
                    var foundGlobalDistList = _.findWhere(globalWhiteListResponse.lists, {id: Number(currentDetail.campaignListId)});
                    if (foundGlobalDistList) {
                        currentDetail.campaignListType = 'GLOBAL';
                        currentDetail.campaignListName = foundGlobalDistList.name;
                    }

                    var foundUserDistList = _.findWhere(userResponse.lists, {id: Number(currentDetail.campaignListId)});
                    if (foundUserDistList) {
                        currentDetail.campaignListType = 'PER USER';
                        currentDetail.campaignListName = foundUserDistList.name;
                    }

                    var foundOrganizationDistList = _.findWhere(organizationResponse.lists, {id: Number(currentDetail.campaignListId)});
                    if (foundOrganizationDistList) {
                        currentDetail.campaignListType = 'PER ORGANIZATION';
                        currentDetail.campaignListName = foundOrganizationDistList.name;
                    }

                    if (!foundGlobalDistList && !foundUserDistList && !foundOrganizationDistList) {
                        currentDetail.campaignListName = 'N/A';
                    }
                });
            });
        });
    });

    WorkflowsOperationsTasksModule.controller('WorkflowsOperationsTasksDetailInteractiveCampaignSmsCtrl', function ($scope, $log, $controller, $filter, Restangular, BulkMessagingOperationsService,
                                                                                                                    allOrganizations, userAccounts, taskDetail) {
        $log.debug("WorkflowsOperationsTasksDetailInteractiveCampaignSmsCtrl");

        $controller('WorkflowsOperationsTasksCommonCtrl', {$scope: $scope});

        $scope.task = Restangular.stripRestangular(taskDetail);

        var currentTask = $scope.task.campaignTask;
        var currentDetail = currentTask.objectDetail;

        // Find the organization of the task item.
        var foundOrganization = _.findWhere(allOrganizations.organizations, {"id": Number(currentDetail.campaignOrgId)});
        currentDetail.organizationName = _.isUndefined(foundOrganization) ? 'N/A' : foundOrganization.name;

        // Find the user of the task item.
        var foundUserAccount = _.findWhere(userAccounts.userAccounts, {"id": Number(currentDetail.campaignUserId)});
        currentDetail.userAccountName = _.isUndefined(foundUserAccount) ? 'N/A' : foundUserAccount.userName;

        // Find the black list items
        currentDetail.campaignBlackLists = [];
        if (currentDetail.campaignBlackListId) {
            currentDetail.campaignBlackLists = currentDetail.campaignBlackListId.split(',');

            BulkMessagingOperationsService.getDistributionListsPerUser(currentDetail.campaignUserId, 'USER_BLACKLIST').then(function (userResponse) {
                BulkMessagingOperationsService.getDistributionListsPerOrganization(currentDetail.campaignOrgId, 'USER_BLACKLIST').then(function (organizationResponse) {
                    _.each(currentDetail.campaignBlackLists, function (campaignBlackList) {
                        var foundUserScreeningList = _.findWhere(userResponse.lists, {id: Number(campaignBlackList)});
                        if (foundUserScreeningList) {
                            currentDetail.campaignBlackLists.push({
                                id: campaignBlackList,
                                name: foundUserScreeningList.name
                            })
                        }

                        var foundOrganizationScreeningList = _.findWhere(organizationResponse.lists, {id: Number(campaignBlackList)});
                        if (foundOrganizationScreeningList) {
                            currentDetail.campaignBlackLists.push({
                                id: campaignBlackList,
                                name: foundOrganizationScreeningList.name
                            })
                        }


                        if (!foundUserScreeningList && !foundOrganizationScreeningList) {
                            currentDetail.campaignBlackLists.push({
                                id: campaignBlackList,
                                name: 'N/A'
                            })
                        }
                    });
                });
            });
        }

        // Prepare the time constraints list.
        _.each(currentDetail.timeConstraints, function (timeConstraint) {
            timeConstraint.value = timeConstraint.startMinuteInWeek + '-' + timeConstraint.endMinuteInWeek;
        });

        // Find the distribution list item to show name of it.
        BulkMessagingOperationsService.getGlobalWhiteLists().then(function (globalWhiteListResponse) {
            BulkMessagingOperationsService.getDistributionListsPerUser(currentDetail.campaignUserId, 'USER_LIST').then(function (userResponse) {
                BulkMessagingOperationsService.getDistributionListsPerOrganization(currentDetail.campaignOrgId, 'USER_LIST').then(function (organizationResponse) {
                    var foundGlobalDistList = _.findWhere(globalWhiteListResponse.lists, {id: Number(currentDetail.campaignListId)});
                    if (foundGlobalDistList) {
                        currentDetail.campaignListType = 'GLOBAL';
                        currentDetail.campaignListName = foundGlobalDistList.name;
                    }

                    var foundUserDistList = _.findWhere(userResponse.lists, {id: Number(currentDetail.campaignListId)});
                    if (foundUserDistList) {
                        currentDetail.campaignListType = 'PER USER';
                        currentDetail.campaignListName = foundUserDistList.name;
                    }

                    var foundOrganizationDistList = _.findWhere(organizationResponse.lists, {id: Number(currentDetail.campaignListId)});
                    if (foundOrganizationDistList) {
                        currentDetail.campaignListType = 'PER ORGANIZATION';
                        currentDetail.campaignListName = foundOrganizationDistList.name;
                    }

                    if (!foundGlobalDistList && !foundUserDistList && !foundOrganizationDistList) {
                        currentDetail.campaignListName = 'N/A';
                    }
                });
            });
        });
    });

    WorkflowsOperationsTasksModule.controller('WorkflowsOperationsTasksDetailInteractiveCampaignIvrCtrl', function ($scope, $log, $controller, $filter, Restangular, BulkMessagingOperationsService,
                                                                                                                    allOrganizations, userAccounts, taskDetail) {
        $log.debug("WorkflowsOperationsTasksDetailInteractiveCampaignIvrCtrl");

        $controller('WorkflowsOperationsTasksCommonCtrl', {$scope: $scope});

        $scope.task = Restangular.stripRestangular(taskDetail);

        var currentTask = $scope.task.campaignTask;
        var currentDetail = currentTask.objectDetail;

        // Find the organization of the task item.
        var foundOrganization = _.findWhere(allOrganizations.organizations, {"id": Number(currentDetail.campaignOrgId)});
        currentDetail.organizationName = _.isUndefined(foundOrganization) ? 'N/A' : foundOrganization.name;

        // Find the user of the task item.
        var foundUserAccount = _.findWhere(userAccounts.userAccounts, {"id": Number(currentDetail.campaignUserId)});
        currentDetail.userAccountName = _.isUndefined(foundUserAccount) ? 'N/A' : foundUserAccount.userName;

        // Find the black list items
        currentDetail.campaignBlackLists = [];
        if (currentDetail.campaignBlackListId) {
            currentDetail.campaignBlackLists = currentDetail.campaignBlackListId.split(',');

            BulkMessagingOperationsService.getDistributionListsPerUser(currentDetail.campaignUserId, 'USER_BLACKLIST').then(function (userResponse) {
                BulkMessagingOperationsService.getDistributionListsPerOrganization(currentDetail.campaignOrgId, 'USER_BLACKLIST').then(function (organizationResponse) {
                    _.each(currentDetail.campaignBlackLists, function (campaignBlackList) {
                        var foundUserScreeningList = _.findWhere(userResponse.lists, {id: Number(campaignBlackList)});
                        if (foundUserScreeningList) {
                            currentDetail.campaignBlackLists.push({
                                id: campaignBlackList,
                                name: foundUserScreeningList.name
                            })
                        }

                        var foundOrganizationScreeningList = _.findWhere(organizationResponse.lists, {id: Number(campaignBlackList)});
                        if (foundOrganizationScreeningList) {
                            currentDetail.campaignBlackLists.push({
                                id: campaignBlackList,
                                name: foundOrganizationScreeningList.name
                            })
                        }


                        if (!foundUserScreeningList && !foundOrganizationScreeningList) {
                            currentDetail.campaignBlackLists.push({
                                id: campaignBlackList,
                                name: 'N/A'
                            })
                        }
                    });
                });
            });
        }

        // Prepare the time constraints list.
        _.each(currentDetail.timeConstraints, function (timeConstraint) {
            timeConstraint.value = timeConstraint.startMinuteInWeek + '-' + timeConstraint.endMinuteInWeek;
        });

        // Find the distribution list item to show name of it.
        BulkMessagingOperationsService.getGlobalWhiteLists().then(function (globalWhiteListResponse) {
            BulkMessagingOperationsService.getDistributionListsPerUser(currentDetail.campaignUserId, 'USER_LIST').then(function (userResponse) {
                BulkMessagingOperationsService.getDistributionListsPerOrganization(currentDetail.campaignOrgId, 'USER_LIST').then(function (organizationResponse) {
                    var foundGlobalDistList = _.findWhere(globalWhiteListResponse.lists, {id: Number(currentDetail.campaignListId)});
                    if (foundGlobalDistList) {
                        currentDetail.campaignListType = 'GLOBAL';
                        currentDetail.campaignListName = foundGlobalDistList.name;
                    }

                    var foundUserDistList = _.findWhere(userResponse.lists, {id: Number(currentDetail.campaignListId)});
                    if (foundUserDistList) {
                        currentDetail.campaignListType = 'PER USER';
                        currentDetail.campaignListName = foundUserDistList.name;
                    }

                    var foundOrganizationDistList = _.findWhere(organizationResponse.lists, {id: Number(currentDetail.campaignListId)});
                    if (foundOrganizationDistList) {
                        currentDetail.campaignListType = 'PER ORGANIZATION';
                        currentDetail.campaignListName = foundOrganizationDistList.name;
                    }

                    if (!foundGlobalDistList && !foundUserDistList && !foundOrganizationDistList) {
                        currentDetail.campaignListName = 'N/A';
                    }
                });
            });
        });
    });

    // RBT Section
    var prepareRBTRelatedCommonAttributes = function (ContentManagementService, FileDownloadService, UtilService, DateTimeConstants, $filter, allOrganizations, currentDetail) {
        // Find the organization of the task item.
        var foundOrganization = _.findWhere(allOrganizations.organizations, {"id": s.toNumber(currentDetail.organizationId)});
        currentDetail.serviceProviderName = _.isUndefined(foundOrganization) ? 'N/A' : foundOrganization.name;

        if (currentDetail.names && currentDetail.names.length > 0) {
            currentDetail.nameEn = 'N/A';
            var foundContentCategoryNameEn = _.findWhere(currentDetail.names, {lang: 'en'});
            if (foundContentCategoryNameEn) {
                currentDetail.nameEn = foundContentCategoryNameEn.name;
            }

            currentDetail.nameAr = 'N/A';
            var foundContentCategoryNameAr = _.findWhere(currentDetail.names, {lang: 'ar'});
            if (foundContentCategoryNameAr) {
                currentDetail.nameAr = foundContentCategoryNameAr.name;
            }
        }

        if (currentDetail.descriptions && currentDetail.descriptions.length > 0) {
            currentDetail.descriptionEn = 'N/A';
            var foundContentCategoryDescriptionEn = _.findWhere(currentDetail.descriptions, {lang: 'en'});
            if (foundContentCategoryDescriptionEn) {
                currentDetail.descriptionEn = foundContentCategoryDescriptionEn.description;
            }

            currentDetail.descriptionAr = 'N/A';
            var foundContentCategoryDescriptionAr = _.findWhere(currentDetail.descriptions, {lang: 'ar'});
            if (foundContentCategoryDescriptionAr) {
                currentDetail.descriptionAr = foundContentCategoryDescriptionAr.description;
            }
        }

        if (!currentDetail.tags) {
            currentDetail.tags = [];
        }

        if (!currentDetail.moodIds) {
            currentDetail.moodIds = [];
        }

        if (!currentDetail.artistIds) {
            currentDetail.artistIds = [];
        }

        if (!currentDetail.albumIds) {
            currentDetail.albumIds = [];
        }

        if (!currentDetail.accessChannels) {
            currentDetail.accessChannels = [];
        }

        if (currentDetail.coverImageId) {
            var srcUrl = ContentManagementService.generateFilePath(currentDetail.coverImageId);
            FileDownloadService.downloadFileAndGenerateUrl(srcUrl, function (blobUrl, fileName) {
                currentDetail.coverImageBlobUrl = blobUrl;
                currentDetail.coverImageName = fileName;
            });
        }

        if (currentDetail.cardImageId) {
            var srcUrl = ContentManagementService.generateFilePath(currentDetail.cardImageId);
            FileDownloadService.downloadFileAndGenerateUrl(srcUrl, function (blobUrl, fileName) {
                currentDetail.cardImageBlobUrl = blobUrl;
                currentDetail.cardImageFileName = fileName;
            });
        }

        if (currentDetail.thumbnailId) {
            var srcUrl = ContentManagementService.generateFilePath(currentDetail.thumbnailId);
            FileDownloadService.downloadFileAndGenerateUrl(srcUrl, function (blobUrl, fileName) {
                currentDetail.thumbnailBlobUrl = blobUrl;
                currentDetail.thumbnailFileName = fileName;
            });
        }

        if (currentDetail.toneFileId) {
            var srcUrl = ContentManagementService.generateFilePath(currentDetail.toneFileId);
            FileDownloadService.downloadFileAndGenerateUrl(srcUrl, function (blobUrl, fileName) {
                currentDetail.toneFileBlobUrl = blobUrl;
                currentDetail.toneFileName = fileName;
            });
        }

        currentDetail.copyrightFileList = [];
        if (currentDetail.copyrightFiles && currentDetail.copyrightFiles.length > 0) {
            _.each(currentDetail.copyrightFiles, function (copyrightFile) {
                var copyrightFileItem = angular.copy(copyrightFile);

                if (copyrightFileItem.startDate) {
                    copyrightFileItem.startDate = new Date(moment(copyrightFileItem.startDate).utcOffset(DateTimeConstants.OFFSET).format('YYYY/MM/DD HH:mm:ss'));
                }
                if (copyrightFileItem.endDate) {
                    copyrightFileItem.endDate = new Date(moment(copyrightFileItem.endDate).utcOffset(DateTimeConstants.OFFSET).format('YYYY/MM/DD HH:mm:ss'));
                }

                copyrightFileItem.copyrightFile = {name: undefined};

                var srcUrl = ContentManagementService.generateFilePath(copyrightFileItem.id);
                FileDownloadService.downloadFileAndGetBlob(srcUrl, function (blob, fileName) {
                    copyrightFileItem.copyrightFile = blob;
                    if (blob) {
                        copyrightFileItem.copyrightFile.name = fileName;
                    }
                    currentDetail.copyrightFileList = $filter('orderBy')(currentDetail.copyrightFileList, ['copyrightFile.name']);
                });

                currentDetail.copyrightFileList.push(copyrightFileItem);
            });
        }

        if (currentDetail && currentDetail.offers && currentDetail.offers.length > 0) {
            var chargingDetails = currentDetail.offers[0];

            currentDetail.chargingDetails = {
                chargingPeriodString: UtilService.convertPeriodStringToHumanReadable(chargingDetails.chargingPeriodDetail),
                price: Number(chargingDetails.price),
                subscriptionCode: chargingDetails.subscriptionCode,
                settlementType: chargingDetails.settlementType,
                revSharePolicy: chargingDetails.revSharePolicy,
                revShare: chargingDetails.revShare
            };
        }
    };

    WorkflowsOperationsTasksModule.controller('WorkflowsOperationsTasksDetailRBTCategoryCtrl', function ($scope, $log, $controller, $filter, Restangular, FileDownloadService, ContentManagementService, UtilService, DateTimeConstants,
                                                                                                         allOrganizations, CMS_ACCESS_CHANNELS, taskDetail) {
        $log.debug("WorkflowsOperationsTasksDetailRBTCategoryCtrl");

        $controller('WorkflowsOperationsTasksCommonCtrl', {$scope: $scope});

        $scope.CMS_ACCESS_CHANNELS = CMS_ACCESS_CHANNELS;

        $scope.task = Restangular.stripRestangular(taskDetail);

        var currentTask = $scope.task.rbtCategoryTask;
        var currentDetail = currentTask.objectDetail;

        prepareRBTRelatedCommonAttributes(ContentManagementService, FileDownloadService, UtilService, DateTimeConstants, $filter, allOrganizations, currentDetail);
    });

    WorkflowsOperationsTasksModule.controller('WorkflowsOperationsTasksDetailRBTMoodCtrl', function ($scope, $log, $controller, $filter, Restangular, FileDownloadService, ContentManagementService, UtilService, DateTimeConstants,
                                                                                                     allOrganizations, CMS_ACCESS_CHANNELS, taskDetail) {
        $log.debug("WorkflowsOperationsTasksDetailRBTMoodCtrl");

        $controller('WorkflowsOperationsTasksCommonCtrl', {$scope: $scope});

        $scope.CMS_ACCESS_CHANNELS = CMS_ACCESS_CHANNELS;

        $scope.task = Restangular.stripRestangular(taskDetail);

        var currentTask = $scope.task.moodTask;
        var currentDetail = currentTask.objectDetail;

        prepareRBTRelatedCommonAttributes(ContentManagementService, FileDownloadService, UtilService, DateTimeConstants, $filter, allOrganizations, currentDetail);
    });

    WorkflowsOperationsTasksModule.controller('WorkflowsOperationsTasksDetailRBTToneCtrl', function ($scope, $log, $controller, $filter, Restangular, FileDownloadService, ContentManagementService, UtilService, DateTimeConstants,
                                                                                                     allOrganizations, contentCategories, moods, artists, albums, CMS_ACCESS_CHANNELS, taskDetail) {
        $log.debug("WorkflowsOperationsTasksDetailRBTToneCtrl");

        $controller('WorkflowsOperationsTasksCommonCtrl', {$scope: $scope});

        $scope.CMS_ACCESS_CHANNELS = CMS_ACCESS_CHANNELS;

        $scope.contentCategoryList = [];
        if (contentCategories) {
            $scope.contentCategoryList = contentCategories.items;
        }

        $scope.moodList = [];
        if (moods) {
            $scope.moodList = moods.items;
        }

        $scope.artistList = [];
        if (artists) {
            $scope.artistList = artists.items;
        }

        $scope.albumList = [];
        if (albums) {
            $scope.albumList = albums.items;
        }

        $scope.task = Restangular.stripRestangular(taskDetail);

        var currentTask = $scope.task.toneTask;
        var currentDetail = currentTask.objectDetail;

        prepareRBTRelatedCommonAttributes(ContentManagementService, FileDownloadService, UtilService, DateTimeConstants, $filter, allOrganizations, currentDetail);
    });

    WorkflowsOperationsTasksModule.controller('WorkflowsOperationsTasksDetailRBTArtistCtrl', function ($scope, $log, $controller, $filter, Restangular, FileDownloadService, ContentManagementService, UtilService, DateTimeConstants,
                                                                                                       allOrganizations, CMS_ACCESS_CHANNELS, taskDetail) {
        $log.debug("WorkflowsOperationsTasksDetailRBTArtistCtrl");

        $controller('WorkflowsOperationsTasksCommonCtrl', {$scope: $scope});

        $scope.CMS_ACCESS_CHANNELS = CMS_ACCESS_CHANNELS;

        $scope.task = Restangular.stripRestangular(taskDetail);

        var currentTask = $scope.task.artistTask;
        var currentDetail = currentTask.objectDetail;

        prepareRBTRelatedCommonAttributes(ContentManagementService, FileDownloadService, UtilService, DateTimeConstants, $filter, allOrganizations, currentDetail);
    });

    WorkflowsOperationsTasksModule.controller('WorkflowsOperationsTasksDetailRBTAlbumCtrl', function ($scope, $log, $controller, $filter, Restangular, FileDownloadService, ContentManagementService, UtilService, DateTimeConstants,
                                                                                                      allOrganizations, contentCategories, moods, CMS_ACCESS_CHANNELS, taskDetail) {
        $log.debug("WorkflowsOperationsTasksDetailRBTAlbumCtrl");

        $controller('WorkflowsOperationsTasksCommonCtrl', {$scope: $scope});

        $scope.CMS_ACCESS_CHANNELS = CMS_ACCESS_CHANNELS;

        $scope.contentCategoryList = [];
        if (contentCategories) {
            $scope.contentCategoryList = contentCategories.items;
        }

        $scope.moodList = [];
        if (moods) {
            $scope.moodList = moods.items;
        }

        $scope.task = Restangular.stripRestangular(taskDetail);

        var currentTask = $scope.task.albumTask;
        var currentDetail = currentTask.objectDetail;

        prepareRBTRelatedCommonAttributes(ContentManagementService, FileDownloadService, UtilService, DateTimeConstants, $filter, allOrganizations, currentDetail);
    });

})();
