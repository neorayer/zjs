'use strict'

var app = angular.module('demo', ['ztree', 'ui.select']);
;
app.controller('DemoTreeController', function(
                $scope
                )  {
    $scope.categories = [
        { _id: '1',            name: 'food'},
        { _id: '11', pid: '1', name: 'sea food'},
        { _id: '12', pid: '1', name: 'meat'},
        { _id: '121', pid: '12', name: 'pork'},
        { _id: '122', pid: '12', name: 'lamb'},
        { _id: '1221', pid: '122', name: 'goat lamb'},

        { _id: '2',            name: 'tools'},
        { _id: '21', pid: '2', name: 'kitchen tools'},
        { _id: '22', pid: '2', name: 'garage tools'},
        { _id: '23', pid: '2', name: 'garden tools'},

        { _id: '1222', pid: '122', name: 'sheep lamb'},
        { _id: '123', pid: '12', name: 'beef'},
        { _id: '124', pid: '12', name: 'chicken'},
        { _id: '13', pid: '1', name: 'vegitable'},

    ]

    $scope.data = {};

    $scope.treeDef = {
        expandDepth: 2,
        rootName: 'All Categories',
        itemLabel: 'name',
        onSelect: function(item)  {
            $scope.curItem = item;
        }
    }

    $scope.selectDef = {
        expandDepth: 999,
        rootName: 'All Categories',
        optionLabel: 'name',
        options: $scope.categories,
        onSelect: function(item)  {
            $scope.curItem = item;
        }
    }

    $scope.DeleteNode = function(item) {
        $scope.categories.DeleteByCondition({_id: item._id});
    }
    $scope.OpenNode = function(item) {
        //treeCtl.expand(item, true);
        $scope.treeDef.treeCtl.expand(item, true);
    }

    $scope.AddNode = function(item) {
        var newItem = {
            _id: Math.random() + '',
            pid: $scope.curItem._id,
            name: item.name, 
        }
        $scope.categories.push(newItem);
    }

    $scope.expandToDepth = function(depth) {
        $scope.treeDef.treeCtl.expandToDepth(depth);
    }


});

