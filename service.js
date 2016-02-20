'use strict'

/**
 * ControllerHelper is the most important tool in zjs lib.
 * It injects the most useful methods and variables into $scope. likes:
 * - $scope.isNew
 * - $scope.formProduct
 * - $scope.product
 * - $scope.LoadList()
 * - $scope.Delete()
 * - $scope.DeleteChecked()
 * - $scope.Save()
 * - $scope.Edit()
 * - $scope.Cancel()
 * and so on.
 * 
 *
 *   example:
 *   ControllerHelper.Init({
 *       scope:     $scope,
 *       controller: 'ProductCategoryController',
 *       modelLabel: '产品分类',
 *       modelName:  'category',
 *       rs:         CategoryRS,
 *       restricts:  null,
 *       stateHead:  null,
 *       newTpl:     {},
 *   }).then(function(){
 *   });
 */
app.provider('ControllerHelper', function(){
    this.$get = function($rootScope, $state, $timeout, $q, Cache, Dialogs) {
        return {

            Init: function(_params) {
                var $scope      = _params.scope,
                    modelLabel  = _params.modelLabel,
                    mn          = _params.modelName,
                    rs          = _params.rs,
                    restricts   = _params.restricts,
                    stateHead   = _params.stateHead ? _params.stateHead + '.' : '',
                    newTpl      = _params.newTpl || {_id: 'new'},  // the new model template
                    listName    = mn + 's',                        // suppliers
                    formModelName = 'form' + CapitalFirst(mn),  //formSupplier
                ____;

                $scope.$state = $state;

                // for ....edit?init=XXXXXX
                var initData;
                var initParam = $state.params['init'];
                if (initParam)
                    initData = angular.fromJson(initParam);

                newTpl._id = 'new';
                // 初始化创建 formXXXX对象
                $scope[formModelName] = $scope[formModelName] || angular.copy(newTpl);

                //约束条件。比如是某个company下的user。则需要限定company(_id)。
                var rstCondition = {};
                restricts = restricts || [];
                restricts.forEach(function(restrict){
                    stateHead += restrict + '.one.';
                    rstCondition[restrict] = $state.params[restrict];
                });
 
                stateHead += mn + '.';
                var editState   = stateHead + 'one.edit';
                var listState   = stateHead + 'list';
                var detailState = stateHead + 'one.detail';

                //var condKey = rs.CondKey(rstCondition);
                var InitLoad = function() {
                    return rs.Load(rstCondition, null, true).then(function(datas){
                        InitSetCurItem();
                    });
                }

                var InitSetCurItem = function() {
                    if ($state.params[mn]) {
                        let _id = $state.params[mn];
                        if (_id === 'new') {
                            //注意：这里增加了一个$scope变量，isNew
                            $scope.isNew = true;
                            $scope[mn] = null;
                            // reset the formModel
                            for (var k in $scope[formModelName]) {
                                delete $scope[formModelName][k];
                            }
                            angular.copy(newTpl, $scope[formModelName]);
                            if (initData)
                                angular.copy(initData, $scope[formModelName]);
                        }else {
                            var doc = Cache.get(_id);
                            if (!doc) {
                                return;
                            }
                                $scope[mn] = doc;
                            // if (!$scope[mn])        //不存在则从cache里取一个
                            //     $scope[mn] = doc;
                            // if ($scope[mn] !== doc){ //存在但不是当前所需的，则复制过来
                            //     angular.copy(doc, $scope[mn]);
                            // }

                            if ($scope[formModelName]) {
                                angular.copy(doc, $scope[formModelName]);
                            }else {
                                $scope[formModelName] = angular.copy(doc);
                            }
                        }
                    }
                }


                $scope.LoadList = function(){
                    return rs.Load(rstCondition, null, true).then(function(datas){
                        InitSetCurItem();
                    });
                }


                /**
                 * nextState:
                 *      undefined     : $state.go(listState);
                 *      XXXX:'string' : $state.go(XXXX)
                 *      true, (isStay): nothing 
                 */
                $scope.Delete = function(data, nextState) {
                    return Dialogs.Confirm("是否确认删除此" + modelLabel + "?", "删除确认")
                    .then(function(isYes){
                        if (isYes) {
                            return rs.DeleteById(data._id).then(function(){
                                if (!nextState)  {
                                } else if (angular.isString(nextState)) {
                                    $state.go(nextState);
                                }
                            }, function(err) {console.error(err)});
                        }
                    })
                }

                $scope.DeleteChecked = function() {
                    return Dialogs.Confirm("是否确认删除所选的" + modelLabel + "?", "删除确认")
                    .then(function(isYes){
                        if (isYes) {
                            return $q.all($scope[listName].map(function(doc){
                                if (!doc.isChecked)
                                    return;
                                return rs.DeleteById(doc._id);
                            })).then(function(){
                                $state.go(listState);
                            }, Errhandler);
                        }
                    })
                }

                $scope.Save = function(data) {

                    return  $scope.SimpleSave(data).catch(Errhandler);
                }


                //简单保存，用于内部调用如Dialogs.Form().Confirm()，不做错误处理，直接抛出。
                $scope.SimpleSave = function(data) {
                    if (!data._id)
                        data._id = 'new';
                    // 增加约束参数
                    angular.extend(data, rstCondition);
                    //restricts.forEach(function(restrict){
                    //    rstCondition[restrict] = $state.params[restrict];
                    //});
                    return rs.Save(data).then(function(su){
                        // 更新当前数据
                         InitSetCurItem();

                        //显示提示信息
                        if (!$rootScope.alerts)
                            $rootScope.alerts = [];
                        var alert = {msg:'数据保存完毕。', type:'success'};
                        $rootScope.alerts.push(alert);
                        // 几秒钟后，自动消失。
                        $timeout(function(){
                            $rootScope.alerts.Delete(alert);
                        }, 3000);
                    });
                }

                $scope.CreateOrUpdateLabel = function(data) {
                    return data._id === 'new' ? '新增' : '修改';
                }

                $scope.Edit = function(data) {
                    var params = {};
                    params[mn] = data._id;
                    $state.go(editState, params);
                }

                $scope.Cancel = function() {
                    window.history.back();
                }

                $scope.GotoDetail = function(data) {
                    var pa = angular.copy(rstCondition);
                     pa[mn] = data._id;
                    $state.go(detailState, pa);
                }

                $scope.CheckAll = function(isChecked) {
                    var docs = $scope[listName];
                    docs.forEach(function(doc){
                        doc.isChecked = isChecked;
                    })
                }


                //这里有一个严重的BUG。由于此处使用promise模式，
                // 使得 InitLoadList和InitSetCurItem在页面的ng-init指定的函数执行以后才执行。造成数据延后，无法找到。
                // 为了暂时避免这个问题，预先判断是否需要InitLoad。
                // 但注意：这依然没有解决在InitLoad模式下的问题。
                return InitLoad();

            }
        }
    }
})


/**
 * service.js define a set of Angular services. 
 * For simpleness, the services are not be packaged as a Angular module.
 * As the default convention, just place '<script src="service.js">' after
 * var app = angular.module('xxxxx', [.....]).
 *
 * TODO: change the services to different modules.
 * 
 */

app.provider('Dialogs', function() {
    this.$get = function($uibModal) {
        return {
            Confirm: function(content, title) {
                var win = $uibModal.open({
                    templateUrl: '/zjs/tpls/dialog-confirm.html',
                    controller: function($scope, $uibModalInstance, params) {
                        $scope.title = params.title || '确认';
                        $scope.content = params.content;

                        $scope.Close = function(isYes) {
                            $uibModalInstance.close(isYes);
                        }
                    },
                    resolve: {
                        params: function() {
                            return {
                                content: content,
                                title: title,
                            }
                        }
                    }
                });
                return win.result;
            },

            /**
             * @Deprecated
             */
            Form: function(scope, params) {
                var win = $uibModal.open({
                    templateUrl: '/zjs/tpls/dialog-form.html',
                    controller: function($scope, $uibModalInstance, params) {
                        angular.extend($scope, params);

                        $scope.Close = function(isYes) {
                            if (isYes) {
                                $scope.Confirm().then(function(){
                                    $uibModalInstance.close(isYes);
                                }, Errhandler);
                            }else {
                                $uibModalInstance.close(isYes);
                            }
                        }
                    },
                    scope: scope,
                    size: 'lg',
                    resolve: {
                        params: function() {
                            return params;
                        }
                    }
                });
                return win.result;
            },

        }
    }
})

app.factory('DateServ', function() {
    return {
        yearsRange: function(beginYear, endYear) {
            var years = [];
            endYear = endYear || new Date().getFullYear();
            for (var i=beginYear;i<=endYear; i++) {
                years.push(i);
            }
            return  years;
        }
    }
});

app.factory('Dict', function($rootScope) {
    var CreateDict = function(dictName, items) {
        if (!$rootScope.dictionaries)
            $rootScope.dictionaries = {};
        //数据有items和itemMap两份副本。items保留了顺序，而itemMap便于查询。
        var dict = $rootScope.dictionaries[dictName] = {};
        dict.items = items;
        var itemMap = dict.itemMap = {};
        items.forEach(function(item){
            itemMap[item.k] = item.v;
        });
    };

    return {
        CreateDict: CreateDict,
        Lookup: function(dictName, indexName) {
            var dict = $rootScope.dictionaries[dictName];
            if (!dict) return indexName;
            return dict.itemMap[indexName] || indexName;
        },

        GetFormOptions: function(dictName) {
            var dict = $rootScope.dictionaries[dictName];
            if (!dict) return [];
            return dict.items.map(function(item){
                return {label: item.v, value: item.k };
            })
        }
    }
})

app.run(function($rootScope, Dict){
    $rootScope.Dict = Dict;
})


app.filter('Dict', function(Dict) {
    return function(indexName, dictName) {
        return Dict.Lookup(dictName, indexName);
    }
})


app.factory('FileTypeServ', function($rootScope) {
    var fileTypes = {
        'application/pdf': {
            icon:'fa fa-file-pdf-o', 
            name:'PDF',
            ext: '.pdf',
        },
        'application/msword': {
            icon:'fa fa-file-word-o', 
            name: 'Microsoft Word',
            ext: '.doc',
        },
        'application/vnd.ms-excel': {
            icon: 'fa fa-file-excel-o',
            name: 'Microsoft Excel',
            ext: '.xls',
        },
        'application/vnd.ms-powerpoint':{
            icon: 'fa fa-file-powerpoint-o',
            name: 'Microsoft Powerpoint',
            ext: '.ppt',
        },
        'text/plain': {
            icon: 'fa fa-file-text-o',
            name: 'Text',
            ext: '.txt',
        }
    }

    var fileTypeHeads = {
        'image/': {
            icon: 'fa fa-file-image-o',
            name: 'Picture',
        },
        'audio/': {
            icon: 'fa fa-file-audio-o',
            name: 'Audio',
        },
        'video/': {
            icon: 'fa fa-file-video-o',
            name: 'Video',
        }
    }

    return {
        // return {icon: String of css class name, name: String}
        GetInfo: function(type) {
            var icon = fileTypes[type];
            if (icon)
                return icon;

            for (var key in fileTypeHeads) {
                if (type.indexOf(key) === 0)
                    return fileTypeHeads[key];
            }

            return  {
                icon:'fa fa-file-o',
                name: '',
            }
        },
        GetExt: function(fname, type) {
            var idx = fname.lastIndexOf('.');
            if (idx < 0)
                return GetInfo(type).ext || '';
            return fname.substr(idx);
        }
    }
})

app.run(function($rootScope, FileTypeServ){
    $rootScope.FileTypeServ = FileTypeServ;
})


//转换成友好的尺寸格式
app.filter('bytes', function() {
    return function(bytes, precision) {
        if (bytes === 0) { return '0 bytes' }
        if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '-';
        if (typeof precision === 'undefined') precision = 1;

        var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
            number = Math.floor(Math.log(bytes) / Math.log(1024)),
            val = (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision);

        return  (val.match(/\.0*$/) ? val.substr(0, val.indexOf('.')) : val) +  ' ' + units[number];
    }
});

//用于Array(比如ng-repeat)时候的filter
// 参数existsArray，数组。
// 去除items中已在existsArray中存在的项。按_id属性比对。
app.filter('removeExistsArrayBy_id', function() {
    return function(items, existsArray) {
        var filtered = [];
        items.forEach(function(item){
            if(!existsArray.FindOne({_id: item._id})) 
                filtered.push(item);
        })
        return filtered;
    }
});


//TODO 关于CartServ这种动态加载的Serv如何去实现，还没有解决！！
//app.run(function($rootScope, CartServ){
    //$rootScope.CartServ = CartServ;
app.run(function($rootScope){
});