var InitModelFactory = function(app) {


    app.factory('Cache', ['$rootScope', function($rootScope) {
        if (!$rootScope.___rsCacheItems)
            $rootScope.___rsCacheItems = [];
        var items = $rootScope.___rsCacheItems;
        var cache = {};
        cache.put = function(v) {
            if (v.constructor === Array) {
                v.forEach(function(model){
                    cache[model._id] = model;
                })
            }else {
                cache[v._id] = v;
            }
        }

        cache.get = function(id) {
            return cache[id];
        }

        cache.delete = function(id) {
            delete cache[id];
        }

        return cache;

    }])

    app.run(function($rootScope, Cache){
        $rootScope.Cache = Cache;
    })

    app.factory('RS', ['$resource', '$rootScope', '$q', 'Cache', function($resource, $rootScope, $q, Cache){
        // pops: 需要实例化的属性列表。Array类型。
        var RS = function (prefix, name, arrayName, pops) {
            this.prefix = prefix;
            this.name = name;
            this.arrayName = arrayName;
            this.pops = pops;

            var snakeName = SnakeCase(name, '-');
            var pathName = prefix + '/' + snakeName + '/:_id';
            this.rs = $resource(pathName, {}, {});
        }

        // 根据 pops的设置来将所有的ObjectId对象化
        //  如pops = ['store', 'parcels']
        //  例如: pop 是 pops的一项:
        //  当model[pop] 是 string时，被认为是id
        //  当model[pop] 是 array时，被认为是 [id, id, id..] 数组
        RS.prototype._populate = function(model) {
            var _this = this;
            if (_this.pops) {
                _this.pops.forEach(function(pop) {
                    if (!model[pop]) { 
                        // 为undefined时
                        return;
                    } else if (typeof model[pop] === 'string') {
                        // 为string时
                        var v = Cache.get(model[pop]);
                        if (v)
                            model[pop] = v;
                    }else if (model[pop].constructor === Array) {
                        // 为array时
                        var values = [];
                        model[pop].forEach(function(id){
                            if (typeof id === 'string') {
                                var v = Cache.get(id);
                                if (v) {
                                    values.push(v);
                                } else {
                                    console.warn('Can not populate ' + _this.name + '[' + model._id + '].' + pop + '=' + id);
                                }
                            }
                        })
                        model[pop] = values;
                    }
                });
            }
        };

        RS.prototype._updateLocal = function(model) {
            //更新本地array
            if ($rootScope[this.arrayName])
                $rootScope[this.arrayName].SaveOneByKey('_id', model);

            //存入Cache
            Cache.put(model);
            
            // Populate
            this._populate(model);
        };

        /* filter :function;
            用以在客户端添加过滤条件
         */
        RS.prototype.Load = function(cond, filter) {
            var _this = this;
            return _this.Search({
                cond: cond,
                filter: filter,
                isDefaultList: true,
            });
        };

        // cond:Object 远程查询条件
        // filter:Object 本地过滤条件
        // isDefaultList:Boolean 是否代替本地缺省列表
        RS.prototype.Search = function(params) {
            var cond = params.cond;
            var filter = params.filter;
            var isDefaultList = params.isDefaultList;

            var _this = this;
            //先清空。因为Load是异步调用，用户可能先看到上次残留的数据。
            if (isDefaultList && _this.arrayName) {
                if ($rootScope[_this.arrayName])
                    $rootScope[_this.arrayName].length = 0; //这种清除的办法可以保留原数组的引用。
                else
                    $rootScope[_this.arrayName] = []; 

            }  
            return _this.rs.query(cond).$promise.then(function(items){
                if (filter)
                    items = items.filter(filter);
                if (isDefaultList && _this.arrayName)
                    $rootScope[_this.arrayName] = items;
                Cache.put(items);

                // 从Cache里，自动_populate预设的属性。
                // 因此，初始化Load()的顺序非常重要。否则可能无法_populate。
                items.forEach(function(item){
                    _this._populate(item);
                });

                return items;
            });
        };


        RS.prototype.Save = function(model) {
            var _this = this;

            var isNew = !(model._id) || (model._id === 'new');
            if (isNew) {
                delete model._id;
            } else {
                delete model.created;
            }

            for( key in model){
                if (key.charAt(0) === '$')
                    delete model[key];
            }

            // save之前需要将populated的属性值回归成String类型（ObjectId）。
            // TODO 还没仔细检查
            if (_this.pops) {
                _this.pops.forEach(function(pop) {
                    if (!model[pop]) { 
                        // 为undefined时
                        return;
                    } else if (typeof model[pop] === 'string') {
                        // 为string时
                        model[pop] = model[pop]['ObjectId'];
                    }else if (model[pop].constructor === Array) {
                        // 为array时
                        var values = [];
                        model[pop].forEach(function(obj){
                            values.push(obj['ObjectId']);
                        });
                        model[pop] = values;
                    }
                });
            } 

            return new this.rs(model).$save()
            .then(function(model) {
                delete model.$promise;
                delete model.$resolved;

                //返回的结果是null或不能存在_id,说明返回的不是某个model对象
                if (model._id)
                    _this._updateLocal(model);

                return $q.when(model);
            })
        }

        RS.prototype.DeleteById = function(id) {
            var _this = this;

            var deferred = $q.defer();

            var cond = {_id: id};
            new _this.rs().$delete(cond)
            .then(function(nRemoved) {
                if (nRemoved == 0)
                    deferred.reject(new Error("未找到该数据"));
                else {
                    Cache.delete(id);
                    if ($rootScope[_this.arrayName])
                        $rootScope[_this.arrayName].DeleteByCondition({_id: id});
                    deferred.resolve(nRemoved);
                }
            }, function(err) {
                deferred.reject(err);
            });

            return deferred.promise;
        }

        RS.prototype.Read = function(id, isReload) {
            var _this = this;

            if (!id)
                return $q.reject(new Error("null id is ilegal"));

            ////如果不强制reload，则先从cache里找
            if (!isReload) {
                var model = Cache.get(id);
                if (model)
                    return $q.when(model);
            }

            return this.rs.get({_id: id}).$promise
            .then(function(model){
                if (!model)
                    throw new Error("Design error, shouldn't get null from server while RS.Read().");
                _this._updateLocal(model);

                return $q.when(model);
            });
        };

        return RS;
    }]);
}

// 返回首字母大写的字符串
var upperFirst = function(s) {
    if (s.length == 0)
        return s;

    return s.substr(0,1).toUpperCase() + s.substr(1);
}


var DefineCommonRS = function(app, prefix, name, arrayName, pops) {
    var rsName = upperFirst(name) + 'RS';
    app.factory(rsName, ['RS', function(RS){
        return new RS(prefix, name, arrayName, pops);
    }]);
}
