(function () {

    'use strict';

    angular.module('adminportal.products.bulkmessaging.operations', [
        'adminportal.products.bulkmessaging.operations.campaigns',
        'adminportal.products.bulkmessaging.operations.interactivecampaigns',
        'adminportal.products.bulkmessaging.operations.distributionlists',
        'adminportal.products.bulkmessaging.operations.screeninglists',
        'adminportal.products.bulkmessaging.operations.screenings'
    ]);

    var BulkMessagingOperationsModule = angular.module('adminportal.products.bulkmessaging.operations');

    BulkMessagingOperationsModule.config(function ($stateProvider) {

        $stateProvider.state('products.bulkmessaging.operations', {
            abstract: true,
            url: "/operations",
            templateUrl: "products/bulkmessaging/operations/operations.html",
            controller: function ($scope) {
                $scope.isPlaying = function (audioElementId) {
                    var audioElm = document.getElementById(audioElementId);
                    return (audioElm && audioElm.duration > 0 && !audioElm.paused);
                };

                $scope.playStopAudio = function (audioElementId) {
                    var allAudios = document.getElementsByTagName('audio');
                    _.each(allAudios, function (audio) {
                        if (String(audio.id) !== String(audioElementId)) {
                            audio.pause();
                            audio.src = audio.src;
                        }
                    });

                    var audioElm = document.getElementById(audioElementId);
                    if ($scope.isPlaying(audioElementId)) {
                        audioElm.pause();
                        audioElm.src = audioElm.src;
                    } else {
                        audioElm.play();
                    }
                };
            }
        });

    });

})();
