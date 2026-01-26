(function () {

    'use strict';

    angular.module('adminportal.products.mmsc.operations', [
        'adminportal.products.mmsc.operations.applications.mm7',
        'adminportal.products.mmsc.operations.contenttypefilters',
        'adminportal.products.mmsc.operations.interconnections.mm4',
        'adminportal.products.mmsc.operations.retrypolicies',
        'adminportal.products.mmsc.operations.trafficcontrols.applications',
        'adminportal.products.mmsc.operations.trafficcontrols.externalservers',
        'adminportal.products.mmsc.operations.trafficcontrols.operators',
        'adminportal.products.mmsc.operations.trafficcontrols.useragents',
        'adminportal.products.mmsc.operations.translationtables.addresses'
    ]);

    var MMSCOperationsModule = angular.module('adminportal.products.mmsc.operations');

    MMSCOperationsModule.config(function ($stateProvider) {

        $stateProvider.state('products.mmsc.operations', {
            abstract: true,
            url: "/operations",
            templateUrl: "products/mmsc/operations/operations.html"
        }).state('products.mmsc.operations.applications', {
            abstract: true,
            url: "/applications",
            templateUrl: "products/mmsc/operations/operations.abstract.html"
        }).state('products.mmsc.operations.interconnections', {
            abstract: true,
            url: "/interconnections",
            templateUrl: "products/mmsc/operations/operations.abstract.html"
        }).state('products.mmsc.operations.trafficcontrols', {
            abstract: true,
            url: "/trafficcontrols",
            templateUrl: "products/mmsc/operations/operations.abstract.html"
        }).state('products.mmsc.operations.translationtables', {
            abstract: true,
            url: "/translationtables",
            templateUrl: "products/mmsc/operations/operations.abstract.html"
        });

    });

})();
