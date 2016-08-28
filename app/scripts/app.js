//Controls enter app, also provides server ports, entry point page
'use strict';

/**
 * @ngdoc overview
 * @name PowerCloud
 * @description
 * #
 *
 * Main module of the application.
 */

// Initialize Firebase
var config = {
    apiKey: "AIzaSyD7ec7C79ogJZSJTiRvJLZJEEvywfYGg1Y",
    authDomain: "powercloud-bf968.firebaseapp.com",
    databaseURL: "https://powercloud-bf968.firebaseio.com",
    storageBucket: "powercloud-bf968.appspot.com",
};
firebase.initializeApp(config);

angular
    .module('powerCloud', [
        'ui.router',
        'ngAnimate',
        'highcharts-ng',
        'ngProgress'
    ])
    .config(function($stateProvider, $urlRouterProvider) {

        $urlRouterProvider.when('/dashboard', '/dashboard/overview');
        $urlRouterProvider.otherwise('/login');

        $stateProvider
            .state('base', {
                abstract: true,
                url: '',
                templateUrl: 'views/base.html'
            })
            .state('login', {
                url: '/login',
                parent: 'base',
                templateUrl: 'views/login.html',
                controller: 'LoginCtrl'
            })
            .state('dashboard', {
                url: '/dashboard',
                parent: 'base',
                templateUrl: 'views/dashboard.html',
                controller: 'DashboardCtrl'
            })
            .state('overview', {
                url: '/overview',
                parent: 'dashboard',
                templateUrl: 'views/dashboard/overview.html',
                controller: 'OverviewCtrl'
            })
            .state('devices', {
                url: '/devices',
                parent: 'dashboard',
                templateUrl: 'views/dashboard/devices.html'
            })
            .state('reports', {
                url: '/reports',
                parent: 'dashboard',
                templateUrl: 'views/dashboard/reports.html',
                controller: 'ReportsCtrl'
            })
            .state('profile', {
                url: '/profile',
                parent: 'dashboard',
                templateUrl: 'views/dashboard/profile.html',
                controller: 'ProfileCtrl'
            });

    })
    .service('sharedProperties', function () {
        var particleAPIToken = null;

        return {
            getParticleToken: function () {
                return particleAPIToken;
            },
            setParticleToken: function(value) {
                particleAPIToken = value;
            }
        };
    });

