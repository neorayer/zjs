'use strict'

var app = angular.module('zjsdemo', [
        'ngResource', 'ui.router', 'ui.bootstrap',
        'ui.select', 'ngSanitize', 'ngCookies', 
        'pascalprecht.translate', 'textAngular',
        'zform']);

app.controller('ProductController', function(
                $scope
                , $rootScope
                , $state
                , $interval
                , $timeout
                , VLDT
                )  {
    $scope.btnDef = {
                uptoken_url: '/public-qiniu/uptoken',
                domain: 'http://7sbqgr.com1.z0.glb.clouddn.com/',
                onUploaded: function(url, file){
                    console.log(url, file);
                },


    }
});