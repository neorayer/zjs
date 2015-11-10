
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

                var InitLoadList = function() {
                    if ($scope[listName]) 
                        return;
                    $scope[listName] = [];
                    return rs.Load(rstCondition).then(function(datas){
                        $scope[listName]= datas;
                    });
                }

                var InitSetCurItem = function() {
                    if ($state.params[idName]) {
                        if ($state.params[idName] === 'new') {
                            $scope[mn] = null;
                            $scope[formModelName] =  {_id: 'new'};
                        }else {
                            $scope[mn] = Cache.get($state.params[idName]);
                            $scope[formModelName] = angular.copy($scope[mn]);
                        }
                    }
                }
                
                $scope.LoadList = function() {
                    return rs.Load(rstCondition).then(function(datas){
                        $scope[listName]= datas;
                    });
                }


                $scope.Delete = function(data) {
                    return Dialogs.Confirm("是否确认删除此数据?", "删除确认")
                    .then(function(isYes){
                        if (isYes) {
                            return rs.DeleteById(data._id).then(function(){
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

                return $q.when()
                    .then(InitLoadList)
                    .then(InitSetCurItem)
                    .catch(Errhandler);
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

if (typeof CartRS !== 'undefined') {
    app.provider('CartServ', function(){
        this.$get = function($rootScope, $state, $cookieStore , CartRS, $timeout, $q, Cache, Dialogs) {
            var CreateCart = function() {
                return CartRS.Save({_id: 'new'}).then(function(cart) {
                    $rootScope._cart = cart;
                    $cookieStore.put('CartId', cart._id);
                });
            }

            var TryLoadCart = function() {
                cartId = $cookieStore.get('CartId');
                if (!cartId)
                    return false;
                return CartRS.Read(cartId, true).then(function(cart) {
                    if (!cart)
                        return false;
                    $rootScope._cart = cart;
                    return true;
                });
            }

            var SaveCart = function() {
                return CartRS.Save($rootScope._cart).catch(function(err){
                    console.error(err.stack);
                })
            }

            var cartItems = [];

            return {
                Init: function() {
                    
                    $q.when().then(TryLoadCart)
                    .then(function(isLoaded){
                        if (!isLoaded)
                            return CreateCart();
                    }).then(function(){
                        if (!$rootScope._cart.items)
                            $rootScope._cart.items = [];
                        cartItems = $rootScope._cart.items;
                    }, function(err) {
                        console.error('CartServ Error', err.stack);
                    });                
                },
                /** item {
                        data: object,
                        id: String,
                        quantity: Number,
                        unitPrice: Number,
                    }
                */
                AddItem: function(newItem) {
                    for (var i = 0; i< cartItems.length; i++) {
                        var item = cartItems[i];
                        if (item.id === newItem.id) {
                            item.quantity += newItem.quantity;
                            return;
                        }
                    }
                    cartItems.push(newItem);
                    SaveCart();
                },

                DeleteItem: function(item) {
                    cartItems.Delete(item);
                    SaveCart();
                },

                ItemsCount: function() {
                    var count = 0;
                    cartItems.forEach(function(item){
                        count += item.quantity;
                    })
                    return count;
                },

                Items: function() {
                    return cartItems;

                },

                TotalPrice: function() {
                    var total = 0;
                    cartItems.forEach(function(item){
                        total += item.quantity * item.unitPrice;
                    })
                    return total;
                },

                IncQuantity: function(item, n) {
                    var res = item.quantity + n;
                    if (res <= 1)
                        item.quantity = 1;
                    else
                        item.quantity = res;
                    SaveCart();
                },
            }
        };
    });
}

//TODO 关于CartServ这种动态加载的Serv如何去实现，还没有解决！！
//app.run(function($rootScope, CartServ){
    //$rootScope.CartServ = CartServ;
app.run(function($rootScope){
});