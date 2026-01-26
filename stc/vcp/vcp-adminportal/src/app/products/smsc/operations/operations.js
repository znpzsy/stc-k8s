(function () {

    'use strict';

    angular.module('adminportal.products.smsc.operations', [
        // Applications
        'adminportal.products.smsc.operations.applications.smppapps',
        // Content Modifiers
        'adminportal.products.smsc.operations.contentmodifiers.smscontent',
        // Interconnect Agents
        'adminportal.products.smsc.operations.interconnect-agents.smpp',
        // Retry Policies
        'adminportal.products.smsc.operations.retrypolicies.alert',
        'adminportal.products.smsc.operations.retrypolicies.dest-applications',
        'adminportal.products.smsc.operations.retrypolicies.errorbased',
        'adminportal.products.smsc.operations.retrypolicies.prioritybased',
        'adminportal.products.smsc.operations.retrypolicies.ss7',
        // Routing Tables
        'adminportal.products.smsc.operations.routingtables.applicationrouting',
        'adminportal.products.smsc.operations.routingtables.interconnectagentrouting',
        'adminportal.products.smsc.operations.routingtables.ss7subsystemrouting',
        // Traffic Controls
        'adminportal.products.smsc.operations.trafficcontrols.applications',
        'adminportal.products.smsc.operations.trafficcontrols.subscribers',
        // Translation Tables
        'adminportal.products.smsc.operations.translationtables.addresses',
        // Keyword Screening
        'adminportal.products.smsc.operations.keywordscreening'
    ]);

    var SmscOperationsModule = angular.module('adminportal.products.smsc.operations');

    SmscOperationsModule.config(function ($stateProvider) {

        $stateProvider.state('products.smsc.operations', {
            abstract: true,
            url: "/operations",
            templateUrl: "products/smsc/operations/operations.html"
        });

        $stateProvider.state('products.smsc.operations.applications', {
            // Applications
            abstract: true,
            url: "/applications",
            template: "<div ui-view></div>"
        }).state('products.smsc.operations.contentmodifiers', {
            // Content Modifiers
            abstract: true,
            url: "/content-modifiers",
            template: "<div ui-view></div>"
        }).state('products.smsc.operations.interconnect-agents', {
            // Interconnect Agents
            abstract: true,
            url: "/interconnect-agents",
            template: "<div ui-view></div>"
        }).state('products.smsc.operations.keywordscreening', {
            // Keyword Screening
            abstract: true,
            url: "/keyword-screening",
            template: "<div ui-view></div>"
        }).state('products.smsc.operations.retrypolicies', {
            // Retry Policies
            abstract: true,
            url: "/retrypolicies",
            template: "<div ui-view></div>"
        }).state('products.smsc.operations.routingtables', {
            // Routing Tables
            abstract: true,
            url: "/routingtables",
            template: "<div ui-view></div>"
        }).state('products.smsc.operations.trafficcontrols', {
            // Traffic Controls
            abstract: true,
            url: "/trafficcontrols",
            template: "<div ui-view></div>"
        }).state('products.smsc.operations.translationtables', {
            // Translation Tables
            abstract: true,
            url: "/translationtables",
            template: "<div ui-view></div>"
        });

    });

})();
