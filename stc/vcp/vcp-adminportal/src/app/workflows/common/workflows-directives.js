(function () {
    'use strict';

    /* Directives */
    angular.module('adminportal.workflows.directives', []);

    var WorkflowsDirectives = angular.module('adminportal.workflows.directives');

    /* infinite scroll implementation */
    WorkflowsDirectives.directive('iScroll', ['$log', '$window', '$document', function ($log, $window, $document) {
            return {

                restrict: 'A',
                link: function (scope, element, attrs) {

                    // get jQuery object
                    var win = angular.element($window);
                    var doc = angular.element($document);
                    // $log.debug(attrs);
                    win.bind('scroll', function () {
                        /* log doc.height() -- win.height() -- win.scrollTop() to get an idea */
                        /* TODO: ' >= ' operator might cause too many requests if service call is made without using the tracker, which is blocking.
                            Couldn't find a plausible way to unbind from event, the usage of iScrollBlock attribute is only a workaround.*/
                        if (win.scrollTop() + win.height() + 5 >= doc.height()) {
                            if (attrs.iScrollBlock == 'false') {
                                scope.$apply(attrs.iScroll);
                            }
                        }
                    });
                },

            }
        }]
    );

})();
