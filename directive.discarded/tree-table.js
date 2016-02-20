angular.module('zjs.tree', []);

angular.module('zjs.tree').directive('treeTable', function(){
    return {
        restrict: 'A',
        scope: {
            items: '=',
            itemRs: '=',
            conf: '=',  // {isShowOp:true, isShowSort:true, onClickName:func}
        },
        controller: 'TreeTableController',
        templateUrl: '/zjs/directive/tree-table.html',
        link: function(scope, element, attrs, ctrl) {

        }
    }
})
angular.module('zjs.tree').controller('TreeTableController', function(
                $scope
                , $rootScope
                , $state
                )  {
    if(!$scope.conf) {
        $scope.conf = {
            isShowSort: true,
            isShowOp: true,
        }
    }

    var treeNodes = $scope.treeNodes = [];

    function addToParent(node, parentNode) {
        node.parentNode = parentNode;
        node.depth      = parentNode.depth + 1;
        node.isFolded   = true;
        if (typeof parentNode.maxChildSortNo === 'undefined') {
            parentNode.maxChildSortNo = 0;
        }
        if (parentNode.maxChildSortNo < node.sortNo) {
            parentNode.maxChildSortNo = node.sortNo;
        }
        if (!parentNode.children)
            parentNode.children = [];
        parentNode.children.push(node);
    }

    //遍历node的所有祖先节点，并对每个祖先执行func(nodeParent)
    var ScanNodeAncestors = function(node, func) {
        if (!node.parentNode)
            return;
        func(node.parentNode);
        ScanNodeAncestors(node.parentNode, func);
    }

    function DepthOf(node) {
        var d = 0;
        ScanNodeAncestors(node, function(nodeParent){
            d++;
        });
        return d;
    }

    function UpdateDepth() {
        treeNodes.forEach(function(node){
            node.depth = DepthOf(node);
        });
    }


    function init(){
        console.log('item changed, init()');

        //清空数组。wow，这个方法好酷。
        treeNodes.length = 0;

        // build treeNodes
        // node会被加入多个参数:
        // node:{
        //    depth: Number,
        //    isFolded: Boolean,
        //    isShowAdd: Boolean,
        //    children: [Nodegory],
        //    parentNode: Nodegory,
        //}

        //由于node会被大量修改，因此这里做一个副本
        var nodes = angular.copy($scope.items);

        var rootNode = $scope.rootNode = {
            name: '_ROOT_',
            depth: 0,
            maxChildSortNo: 0,
        };
        nodes.push(rootNode);

        //以rootNode为根，构造了一个二叉树。children为子节点集合。
        nodes.forEach(function(node){
            if (node === rootNode)
                return;
            var parentNode = nodes.FindOne({_id: node.parent});
            if (!parentNode)
                return;
            addToParent(node, parentNode);
        });

        // 构造了一个平行的数组，treeNodes，而不是二叉树。
        // 但treeNodes是按照二叉树的遍历方式顺序排列的。
        var ScanNode = function(node) {
            if (!node.children)
                return;
            node.children.forEach(function(child){
                treeNodes.push(child);
                ScanNode(child);
            });
        }
        ScanNode(rootNode);

        UpdateDepth();
    }

    // 非常重要的部分：观察items是否变化。更新数据。
    $scope.$watch('items', function(){
        init();
    });

    $scope.IsVisiable = function(node) {
        if (!node.parent)
            return true;

        var isVisiable = true;

        //遍历所有祖先节点，只要有一个折叠了（isFolded===true)就不可见。
        ScanNodeAncestors(node, function(parentNode){
            if (parentNode.isFolded)
                isVisiable = false;
        });
        return isVisiable;
    }

    $scope.IsAddVisiable = function(node) {
        if (!$scope.IsVisiable(node))
            return false;
        return node.isShowAdd;
    }

    $scope.Edit = function(node) {
        node.isEditing = !node.isEditing;
        //如果是开始edit，则关闭其它所有的edit
        if (node.isEditing) {
            treeNodes.forEach(function(c){
                if (c === node)
                    return;
                c.isEditing = false;
            });
        }
    }

    $scope.ShowAddChild = function(node) {
        node.isFolded = false;
        node.isShowAdd = !node.isShowAdd;
        //如果是打开node的“新增子类”，则关闭其它所有的“新增子类”.
        if (node.isShowAdd) {
            treeNodes.forEach(function(c){
                if (c === node)
                    return;
                c.isShowAdd = false;
            });
        }
    }

    $scope.SwitchFold = function(node) {
        node.isFolded = !node.isFolded;
    }

    $scope.CaretIcon = function(node) {
        if (node.children){
            if (node.isFolded)
                return "fa fa-caret-right";
            else
                return "fa fa-caret-down";
        }else {
            return "fa ";
        }
    }

    $scope.NodeNameTdStyle = function(node) {
        return {
             paddingLeft: (8 + (node.depth - 1) * 40) + 'px',
        }
    }

    $scope.NodeAddTdStyle = function(node) {
        return {
             paddingLeft: (8 + (node.depth) * 40) + 'px',
        }
    }
    
    $scope.IsIncSortable = function(node, direct) {
        //同级别的Nodes
        var siblings = treeNodes.Find({parent: node.parent});
        var idxInSiblings = siblings.indexOf(node);
        if (direct < 0 && idxInSiblings === 0)
            return false;
        if (direct > 0 && idxInSiblings === siblings.length - 1) 
            return false;
        return true;
    }

    function GetPrevSibling(siblings, node) {
        for(var i=0,len=siblings.length; i<len; i++) {
            if (siblings[i] === node) {
                if (i === 0)
                    return null;
                return siblings[i-1]; 
            }
        }
    }

   function GetNextSibling(siblings, node) {
        for(var i=0,len=siblings.length; i<len; i++) {
            if (siblings[i] === node) {
                if (i === len - 1)
                    return null;
                return siblings[i+1]; 
            }
        }
    }

    function GetNodeAndOffsprings(node) {
        var nodes = [];
        function putInNodes(node) {
            nodes.push(node);
            if (!node.children)
                return;
            node.children.forEach(putInNodes);
        }
        putInNodes(node);
        return nodes;
    }

    var theLastOpNode = {};
    $scope.IsLastOpNode = function(node) {
        return theLastOpNode === node;
    }


    $scope.onClickNode = function(cate) {
        theLastOpNode = cate;
        if ($scope.conf.onClickNode)
            $scope.conf.onClickNode(cate);
    }

    $scope.BtnStyle_MoveTo = function(node, direct) {
        return {
            visibility: $scope.IsIncSortable(node, direct)? 'visibility':'hidden',
        }
    }

    $scope.MoveToPrev = function(node) {
        //同级nodes
        var siblings = treeNodes.Find({parent: node.parent});
        //同级前一节点
        var prev = GetPrevSibling(siblings, node);
        if (!prev) {
            console.log("顺序号已经处于同级别头部，不可向这个方向更改。");
            return;
        }
        // node和所有的子孙
        var nodeAndOffsprings = GetNodeAndOffsprings(node);
        // 删除：node和所有的子孙
        treeNodes.splice(treeNodes.indexOf(node), nodeAndOffsprings.length);
        // 在prev之前添加: node和所有的子孙
        var idxPrev = treeNodes.indexOf(prev); 
        var params =[idxPrev, 0].concat(nodeAndOffsprings); 
        treeNodes.splice.apply(treeNodes, params);

        //重新编顺序号。顺序改变了，siblings要重生成
        siblings = treeNodes.Find({parent: node.parent});
        for(var i=0,len=siblings.length; i<len; i++) {
            siblings[i].sortNo = i;
        }
            //新顺序号保存到服务器
            //TODO 建议以后改成批量提交，否则会出现大量并发提交。
        for(var i=0,len=siblings.length; i<len; i++) {
            var ca = siblings[i];
            $scope.itemRs.Save({
                _id: ca._id,
                sortNo: ca.sortNo,
            }).then(function(){}, Errhandler);
        }
    }

    $scope.MoveToNext = function(node) {
        //同级nodes
        var siblings = treeNodes.Find({parent: node.parent});
        var next = GetNextSibling(siblings, node);
        if (!next) {
            console.log("顺序号已经处于同级别尾部 ，不可向这个方向更改。");
        }
        //把next向前移1位，就是把node向后移1位。
        $scope.MoveToPrev(next);
    }

    $scope.Create = function(node, parentNode) {
        node.parent = parentNode._id;
        //提升排序号
        node.sortNo = parentNode.maxChildSortNo + 1;

        return $scope.itemRs.Save(node).then(function(ca) {
            parentNode.newChild = {_id: 'new'};
            addToParent(ca, parentNode);
            ca.depth = DepthOf(ca);

            var siblings = ca.parentNode.children;
            if (siblings.length === 1)
                treeNodes.InsertAfter(ca, ca.parentNode);
            else {
                var lastSib = siblings[siblings.length - 2];
                treeNodes.InsertAfter(ca, lastSib);
            }

        }, Errhandler);
    }

    $scope.Save = function(node) {
        return $scope.itemRs.Save(node).then(function(ca) {
            var node = treeNodes.FindOne({_id: ca._id});
            node.name = ca.name;
            node.isEditing = false;
        }, Errhandler);
    }

    // 从$scope.treeNodes中，删除node，包括所有子节点。递归。
    var RemoveNode = function(node) {
        if (node.children) {
            node.children.forEach(function(c){
                RemoveNode(c);
            })
        }
        treeNodes.Delete(node);
    }

    $scope.Delete = function(node) {
        return $scope.itemRs.DeleteById(node._id).then(function(ca) {
            RemoveNode(node);
        }, Errhandler);
    }


    $scope.ImportSysNodes = function() {
        return ImportSysNodeRS.Save({}).then(function(){}, Errhandler);
    }
});


