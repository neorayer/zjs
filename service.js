'use strict'

var Errhandler = function(err){
    console.error(err);
    if (err.data) {
        if (err.data.msg) {
            alert(err.data.msg);
        }else {
            alert(err.data);
        }
    }else {
        alert(err);
    }
}


app.factory('ImageServ', function() {
    var instance = {

        // size: 'lg', 'nm', 'sm', 'xs', {default: 'nm'}
        productCoverCssImage : function(product, size) { 
            size = size || 'nm';

            var url = '/imgresource/sys/default-product-cover.png';

            if (product && product.pictures && product.pictures.length > 0)
                url = product.pictures[0].url;

            var style = {
                backgroundImage: "url('" + url + "')", 
                backgroundSize: "100% 100%",
                backgroundRepeat: "no-repeat",
                border: "1px solid #ccc",
            }

            switch(size) {
                case 'xs':
                    style.width = "32px";
                    style.height = "32px";
                    break;
                default:
                    style.width = "80px";
                    style.height = "80px";
                    break;
            }

            return style;
        },

        productUrl: function(product, size) {
            size = size || 'nm';
            var url = '/imgresource/sys/default-product-cover.png';
            if (product && product.pictures && product.pictures.length > 0)
                url = product.pictures[0].url;
            return url;
        },

        pictureUrl: function(picture, size) {
            size = size || 'nm';
            return picture.url;
            // TODO size 暂时没用
        },

        productUrls: function(product, size) {
            // TODO size暂时没用
            size = size || 'nm';
            var urls = [];
            if (product && product.pictures && product.pictures.length > 0) {
                return product.pictures.map(function(pic){
                    return pic.url;
                })
            }
            return urls;
        },

        warehouseUrl: function(warehouse) {
            var url = '/public/kanga/devices/ph/img/city-logo.jpg';
            if (warehouse.type === 'transit')
                url = '/public/kanga/devices/ph/img/transit.png';
            return url;
        },

        storeTypeLogoUrl: function(store) {
            switch(store.storeType) {
                case 'vdian':
                    return '/public/kanga/devices/ph/img/vdian-logo.jpg';
                case 'taobao':
                    return '/public/kanga/devices/ph/img/taobao-logo.png';
                default:
                    return 'none';
            }
        }
    }

    return instance;
})


app.run(function($rootScope, ImageServ){
    $rootScope.ImageServ = ImageServ;
})

//////////////////////////////////////////

app.provider('Dialogs', function() {
    this.$get = function($modal) {
        return {
            Confirm: function(content, title) {
                var win = $modal.open({
                    templateUrl: '/zjs/tpls/dialog-confirm.html',
                    controller: function($scope, $modalInstance, params) {
                        $scope.title = params.title || '确认';
                        $scope.content = params.content;

                        $scope.Close = function(isYes) {
                            $modalInstance.close(isYes);
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

            Form: function(scope, params) {
                var win = $modal.open({
                    templateUrl: '/zjs/tpls/dialog-form.html',
                    controller: function($scope, $modalInstance, params) {
                        angular.extend($scope, params);

                        $scope.Close = function(isYes) {
                            if (isYes) {
                                $scope.Confirm().then(function(){
                                    $modalInstance.close(isYes);
                                }, Errhandler);
                            }else {
                                $modalInstance.close(isYes);
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


app.provider('ControllerHelper', function(){
    this.$get = function($rootScope, $state, $timeout, $q, Cache, Dialogs) {
        return {

            // if (!$scope.suppliers) {
            //     $scope.suppliers = [];
            //     SupplierRS.Load().then(function(suppliers){
            //         $scope.suppliers = suppliers;
            //     });
            // }

            // $scope.formSupplier = {};

            // if ($state.params.supplier && $state.params.supplier !== 'new') {
            //     $scope.supplier = Cache.get($state.params.supplier);
            //     $scope.formSupplier = angular.copy($scope.supplier);
            // }

            // Usage:
            //  ControllerHelper.Init($scope, 'supplier', SupplierRS)
            //  ControllerHelper.Init($scope, 'user', SupplierRS, 'company')
            //  以下变量将生成：
            //      $scope.suppliers : [];
            //      $scope.formSupplier : Object;
            //      $scope.supplier : Object;
            Init: function($scope, controller, modelLabel/* model label */, mn /* model name */, rs, restricts, stateHead) {

//                var serv = StdServProvider.GetServ($scope, controller, modelLabel, mn, rs, restricts, stateHead);
                //用于zform，服务端验证的model
                $scope.serverErrors = {};

                var listName = mn + 's';                        // suppliers
                var formModelName = 'form' + CapitalFirst(mn);  //formSupplier
                var idName = mn;                                // supplier
                if (stateHead)
                    stateHead = stateHead + '.';
                else
                    stateHead = '';

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

                var condKey = rs.CondKey(rstCondition);

                var InitLoad = function() {
                    return rs.Load(rstCondition, null, true).then(function(datas){
                        InitSetCurItem();
                    });
                }

                var InitSetCurItem = function() {
                    if (!$scope[formModelName])
                        throw new Error('$scope.' + formModelName + ' should be defined before ControllerHelper.Init()');
                    if ($state.params[idName]) {
                        if ($state.params[idName] === 'new') {
                            $scope[mn] = null;
                            $scope[formModelName]._id = 'new';
                        }else {
                            var doc = Cache.get($state.params[idName]);
                            if (!doc) {
                                return;
                            }
                            if (!$scope[mn])        //不存在则从cache里取一个
                                $scope[mn] = doc;
                            if ($scope[mn] !== doc) //存在但不是当前所需的，则复制过来
                                angular.copy(doc, $scope[mn]);

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


                $scope.Delete = function(data) {
                    return Dialogs.Confirm("是否确认删除此" + modelLabel + "?", "删除确认")
                    .then(function(isYes){
                        if (isYes) {
                            return rs.DeleteById(data._id).then(function(){
                                $state.go(listState);
                            }, Errhandler);
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
                    params[idName] = data._id;
                    $state.go(editState, params);
                }

                $scope.DialogEdit = function(data, templateUrl) {
                    if (!templateUrl)  {
                        var state = $state.get(editState);
                        if (!state)
                            throw new Error('Can not get state: '  + editState);
                        templateUrl = $state.get(editState).views[""].templateUrl;
                    }

                    $scope[formModelName] = angular.copy(data);
                    Dialogs.Form($scope, {
                        title: $scope.CreateOrUpdateLabel(data) + modelLabel,
                        templateUrl: templateUrl,
                        controller: controller,
                        Confirm: function() {
                            return $scope.SimpleSave($scope[formModelName]);
                        }
                    });
                }

                $scope.Cancel = function() {
                    window.history.back();
                }

                $scope.GotoDetail = function(data) {
                    var pa = angular.copy(rstCondition);
                     pa[idName] = data._id;
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

app.factory('DictServ', function($rootScope) {


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

    // Init
    var Init = function() {
        CreateDict('UserRole', [
            {k: 'admin', v: '系统管理员'},
            {k: 'boss', v: '老板'},
            {k: 'boss-assistant', v: '老板助理'},
            {k: 'sales', v: '销售代表'},
            {k: 'sales-assistant', v: '销售助理'},
            {k: 'sales-manager', v: '销售经理'},
        ]);
        CreateDict('ClientType', [
            {k: 'Supplier', v: '供应商'},
            {k: 'Client', v: '客户'},
            {k: 'Other', v: '其他'},
        ]);
        CreateDict('LogiType', [
            {k: 'agent', v: '货运代理'},
            {k: 'logistics', v: '跨国货运公司'},
            {k: 'local', v: '同城快递'},
            {k: 'national', v: '国内快递'},
        ]);
    };

    Init();

    return {
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

app.run(function($rootScope, DictServ){
    $rootScope.DictServ = DictServ;
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




app.factory('BreadcrumbServ', function($state, $rootScope) {
    return {
        Set: function(level, title) {

            $rootScope.breadcrumbs[level] = {
                level: level,
                title: title,
                srefTo: $state.current.name,
                srefParams: $state.params,
            };
            var crumbs = $rootScope.breadcrumbs;
            // 清除下面级别，已经无效的crumbs
            for(var i=0,len=crumbs.length; i<len; i++) {
                 if (i > level) {
                    crumbs[i] = null;
                }
            } 

        }
    }
});

app.run(function($rootScope, BreadcrumbServ){
    $rootScope.breadcrumbs = [];
    $rootScope.BreadcrumbServ = BreadcrumbServ;
});



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