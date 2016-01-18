'use strict'

var app = angular.module('ztree', []);

app.service('ztree', function(){
    this.createTree = function(rootItem, items, def, defaultSelected) {
        def.branchExpandedIcon  = def.branchExpandedIcon  || 'fa fa-folder-open';
        def.branchIcon = def.branchIcon || 'fa fa-folder';
        def.leafIcon         = def.leafIcon         || 'fa fa-file-o';
        def.expandDepth      = def.expandDepth      || 1;
        def.onSelect         = def.onSelect         || function() {};

        var itemMap  = {};

        var itemSelected;

        function init() {
            itemMap  = {};
            for(let k in rootItem)
                delete rootItem[k];
            rootItem.isExpanded = true;
            rootItem.isRoot = true;
        }

        // itemMap: _id => item
        function addToMap(item) {
            itemMap[item._id] = item;
        }

        function getParent(item) {
            if (item === rootItem)
                return null;
            if (!item.pid)
                return rootItem;
            var p = itemMap[item.pid];
            if (!p)
                throw new Error('Design time error. itemMap[item.pid] should not be null.');
            return p;
        }

        // 清除无法寻到root的node
        function isOrphan(item) {
            if (item === rootItem)
                return false;
            if (!item.pid)
                return false;
            var parent = itemMap[item.pid];
            if (!parent)
                return true;
            return isOrphan(parent);
        }

        function deleteOrphans() {
            var newItems = [];
            items.forEach(function(item){
                if (isOrphan(item)) {
                    delete itemMap[item._id];
                } else {
                    newItems.push(item);
                }
            });
            items.length = 0;
            newItems.forEach(function(item) {items.push(item)});
        }

        function deleteChildren(item) {
            if (!item.children)
                return;
            item.children.length = 0;
        }

        // rootItem: buildTree, add children for items
        function addToParent(item) {
            if (item === rootItem)
                throw new Error('rootItem can not be addToParent()');
            var parent = getParent(item);
            parent.children = parent.children || [];
            parent.children.push(item);
        }

        // nodeIcon: set node icon for items
        function buildNodeIcon(item) {
            if (item.children && item.children.length > 0 ) {
                item.nodeIcon = item.isExpanded ? def.branchExpandedIcon : def.branchIcon;
            } else {
                item.nodeIcon = def.leafIcon;
            }
        }

        // depth: set depth of every item
        function depthOf(item) {
            if (item === rootItem)
                return 0;
            var parent = getParent(item);
            return 1 + depthOf(parent);
        }

        function setDepth(item) {
            item.depth = depthOf(item);
        }

        // sort: sort items by tree structure.
        function traversal(item, compare) {
            if (!item.children)
                return;
            item.children.sort(compare);
            item.children.forEach(function(child){
                items.push(child);
                traversal(child, compare);
            })
        }

        function sort() {
            items.length = 0;
            traversal(rootItem);
        }

        function selectDefault() {
            //没有预选，选择根目录
            if (!itemSelected)
                return select(rootItem);

            var item = itemSelected;
            // 预选了根，直接返回
            if (item === rootItem)
                return;
            // 预选项存在，直接返回
            if (itemMap[item._id])
                return;

            // 预选项不存在，选择parent
            var parent = itemMap[item.pid];
            if (parent)
                return select(parent);
            else  // parent不存在，选择根
                return select(rootItem);
        }

        function select(item) {
            if (!item)
                return;
            if (itemSelected === item)
                return;
            itemSelected = item;

            //********** expand all parents
            var parent = getParent(item);
            if (parent) 
                expand(parent);

            def.onSelect(item);
        }

        function isSelected(item) {
            return itemSelected === item;
        }

        function getSelected() {
            return itemSelected;
        }

        function expandToDepth(depth) {
            items.forEach(function(item) {
                item.isExpanded = item.depth < depth;
            });
            items.forEach(buildNodeIcon);
        }

        function expand(item, isSelect) {
            if (isSelect)
                select(item);

            item.isExpanded = true;
            buildNodeIcon(item);
            if (item === rootItem)
                return;
            var parent = getParent(item);
            expand(parent);
        }

        function toggle(item) {
            if (item === rootItem)
                return;
            item.isExpanded = !item.isExpanded;
            buildNodeIcon(item);
        }
        
        function isVisible(item) {
            if (def.isAllVisible)
                return true;
            if (item === rootItem)
                return true;
            var parent = getParent(item);
            if (!isVisible(parent))
                return false;
            return parent.isExpanded;
        }

        function getItem(_id) {
            var item = itemMap[_id];
            if (!item) {
                console.error('can not find item by _id:' + _id);
                return;
            }
            return item;
        }

        function reset() {
            init();

            items.forEach(addToMap);
            deleteOrphans();

            deleteChildren(rootItem);
            items.forEach(deleteChildren);
            items.forEach(addToParent);

            items.forEach(setDepth);
            sort();
            selectDefault();
            items.forEach(buildNodeIcon);
        }

        reset();
        expandToDepth(def.expandDepth);
        select(defaultSelected);

        return {
            toggle:     toggle,
            isVisible:  isVisible,
            isSelected: isSelected,
            select:     select,
            expand:     expand,
            expandToDepth: expandToDepth,
            reset:      reset,
            getSelected: getSelected,
        }
    }
});

app.directive('ztreeListGroup', function($anchorScroll, $location, ztree){
    var Di = {
        restrict: 'E',
        scope: {
            def: '=def',
            items: '=',
            search: '=',
            selected: '=',
        }, 
        transclude: true,
        replace: true,
        templateUrl: '/zjs/ztree/ztree-list-group.tpls.html',
    };

    Di.controller = function($scope, $element, $attrs, $transclude) {
        var def = $scope.def;
        if (!def)
            throw new Error('def is required by <ztree-list-group def="def">');
        def.rootName         = def.rootName         || 'Root';

        function scrollToItem(item) {
            var newHash = 'item-' + item._id;
            if ($location.hash() !== newHash) {
                $location.hash(newHash);
            } else {
                $anchorScroll();
            }            
        }

        var scrollToSelected = this.scrollToSelected = function () {
            scrollToItem(tree.getSelected());
        }

        // var nextOnSelect = def.onSelect || function(){};
        // def.onSelect = function(item) {
        //     //scrollToItem(item);
        //     nextOnSelect(item);
        // }

        $scope.rootItem = {};

        var tree = ztree.createTree($scope.rootItem, $scope.items, def, $scope.selected);

        // defautl select
        //tree.select($scope.selected);

        /////////////////////////////////////////
        this.expandToDepth = tree.expandToDepth;
        this.expand = tree.expand;
        this.getSelected = tree.getSelected;
        this.getItemLabel = function(item) {
            return getLabel(def.itemLabel, item);
        }
        this.getSelectedLabel = function(item) {
            return getLabel(def.itemLabel, tree.getSelected());
        }

        /////////////////////////////////////////
        $scope.toggle = tree.toggle;
        $scope.isVisible = tree.isVisible;
        $scope.isSelected = tree.isSelected;
        $scope.getItemLabel  = this.getItemLabel;

         $scope.onClick = function(item) {
            if (tree.isSelected(item)) {
                $scope.toggle(item);
            }else {
                tree.select(item);
                if (!item.isExpanded)
                    tree.expand(item, true);
            }
        }

        function getLabel(labelDef, v) {
            if (!v)
                return;

            if (labelDef) {
                // string
                if (angular.isString(labelDef)) {
                    return v[labelDef];
                } // function
                else if (angular.isFunction((labelDef)))
                    return labelDef(v);
            }
            //default
            if (angular.isString(v) || angular.isNumber(v))
                return v;

            return JSON.stringify(v);
        }

        $scope.$watchCollection('items', function(newCollection, oldCollection, scope) {
            if (!newCollection || !oldCollection)
                return;
            if (newCollection.length !== oldCollection.length) {
                console.log('reset')
                tree.reset();
            }
        });
    },

    Di.link = function($scope, iElm, iAttrs, controller) {
        var def   = $scope.def;
        def.treeCtl = controller;
    }

    return Di;
})


app.directive('ztreeSelect', function(ztree){
    var Di = {
        restrict: 'E',
        scope: {
            def: '=def',
            ngModel: '=',
        }, 
        transclude: true,
        replace: true,
        templateUrl: '/zjs/ztree/ztree-select.tpls.html',
    };

    Di.controller = function($scope, $element, $attrs, $transclude) {
        var def = $scope.def;
        if (!def)
            throw new Error('def is required by <ztree-select def="def">');
        if (def.optionLabel)
            def.itemLabel = def.optionLabel;

        var curItem;
        var nextOnSelect = def.onSelect || function(){};
        def.onSelect = function(item) {
            curItem = item;
        }

        var getSelectLabel = $scope.getSelectLabel = function() {
            if (!def.treeCtl)
                return;
            return def.treeCtl.getSelectedLabel();
        }

        var getOptionValue = $scope.getOptionValue = function(v) { 
            if (!v) return v;

            if (def.optionValue) {
                // string
                if (angular.isString(def.optionValue)) {
                    return v[def.optionValue];
                } // function
                else if (angular.isFunction((def.optionValue)))
                    return def.optionValue(v);
            }
            //default
            return v; 
        }

        function findItemByModel() {
            for (let i=0, len=def.options.length; i<len;  i++) {
                let item = def.options[i];
                if ($scope.ngModel === getOptionValue(item))
                    return item;
            }
        }

        $scope.defaultSelected = findItemByModel();

        $scope.getModelLabel = function() {
            if (!def.treeCtl)
                return;
            return def.treeCtl.getItemLabel(findItemByModel());
        }


        $scope.isDropdown = false;
        $scope.isSearch   = false;

        $scope.clickDropdown = function() {
            $scope.isDropdown = true;
            $scope.isSearch = true;
            delete $scope.$search;
            def.isAllVisible = false;
            def.treeCtl.scrollToSelected();
        }

        $scope.confirm = function() {
            $scope.isSearch   = false;
            $scope.isDropdown = false;
            $scope.ngModel = $scope.getOptionValue(curItem);
            nextOnSelect(curItem);
        }

        $scope.cancel = function() {
            $scope.isSearch   = false;
            $scope.isDropdown = false;
        }

        $scope.onSearchChange = function() {
            if ($scope.$search === '')
                def.isAllVisible = false;
            else
                def.isAllVisible = true;
        }

    },

    Di.link = function($scope, iElm, iAttrs, controller) {
        var def   = $scope.def;
    }

    return Di;
})