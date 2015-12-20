
var express     = require('express')
    , Q         = require('q')
    , mongoose  = require('mongoose')
    , bodyParser= require('body-parser')
    , morgan    = require('morgan')
    , log4js    = require('log4js')
    , fs        = require('fs')
    , path      = require('path')
    , busboy    = require('busboy')
    , session   = require('cookie-session') //开发时，使用cookie-session，可以避免reload node时所有session都丢失了
    //, session     = require('express-session') 
    , cookie    = require('cookie-session')
    , cookieParser = require('cookie-parser')

    , ak        = require('./army-knife.js')
    , config        = require('../ws/app/config')
    ;

exports = module.exports.Start = function() {

    // ------ Log4j
    log4js.configure('log4js.json', {});
    var logger = log4js.getLogger();
    logger.debug('Hello, log4js is working');

    // ------ config.init
    config.init();

    // ------ mongoose
    mongoose.set('debug', true);
    var db = mongoose.connect('mongodb://localhost/' + config.dbname, function(err) {
        if(err) throw err;
    });


    // ------ auto require models 
    fs.readdirSync(path.join(__dirname , '../ws/app/models')).forEach(function (file) {
      if (~file.indexOf('.js')) require(path.join(__dirname, '../ws/app/models/' , file));
    });

    // ------ app
    var app = express(db);

    // ------ middlewares
    app.use(cookieParser());

    app.use(function(req, res, next) {
        // 允许跨域访问Ajax
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });

    app.use(morgan('tiny'));                            // web logging
    app.use(session({secret: 'yes it is secret'}));     // web session
    app.use(cookie({secret: 'yes it is cookie secret'}));       // web cookie session 

    // gzip/deflate outgoing responses
    var compression = require('compression');
    app.use(compression());

    function defWebStaticDir(dirName) {
        app.use('/' + dirName + '/', express.static(path.join(__dirname, '/../' + dirName + '/'))); 
    }

    app.use('/favicon.ico', express.static(path.join(__dirname, '/../theme/favicon.ico')));

    config.staticPaths.forEach(defWebStaticDir);

    app.use(bodyParser.json());                         // post parser (json)
    app.use(bodyParser.urlencoded({extended: true }));  // post parser (url.query) ????

    app.use(function (req, res, next) {
        ak.PurifyData(req.body);
        next();
    });


    app.use('/u', function(req, res, next) {            // user session checking
        // TODO 
        //这里检查 content-type来判断返回类型还没有实现
        if (!req.session.user) 
            res.status(400).jsonp({msg: 'session error'});
        else 
            next();
    });

    app.use('/a', function(req, res, next) {            // admin session checking
        // TODO 
        //这里检查 content-type来判断返回类型还没有实现
        if (!req.session.admin) 
            res.status(400).jsonp({msg: 'session error'});
        else 
            next();
    });

    // ------ Template engine setting
    app.engine('.html', require('ejs').__express);
    app.set('views', path.join(__dirname, '/../'));
    app.set('view engine', 'html');


    // ------ a function to wrap a route controller to Jsonp response
    function jsonpWrap(func) {
        return function(req, res) {
            return Q().then(function(){
                return func(req, res);
            }).then(function(json){
                res.jsonp(json);
            }, function(err) {
                // 如果有 err.field, 说明是 {field: xxx, error: new Error()}结构。
                // 否则是简单new Error()结构
                console.error(err.field? err.error.stack: err.stack);

                if (err.field) {
                    res.status(400).jsonp({field: err.field, msg: err.error.message, error: err });
                }else {
                    res.status(400).jsonp({msg: err.message, error: err });
                }
                throw err;
            });
        };
    }

    function ejsWrap(func) {
        return function(req, res) {
            return Q().then(function(){
                return func(req, res);
            })
            .catch(function(err) {
                console.error(err.stack);
                res.render('js/tpls/sys-error.html', {msg: err.stack});
                throw err;
            });
        };
    }


    // ---- a function to create a set of RESTful route for a model
    function commonRouter(prefix, name, ctlPath) {
        prefix  = prefix || '';
        var ctl = require(ctlPath);
        console.log('Make common router for: ' + ctlPath );

        // [get]    /name  -->  ctl.Search()
        // [post]   /name  -->  ctl.Save()
        // [get]    /name/:id --> ctl.Read()
        // [delete] /name/:id --> ctl.Delete()
        if (ctl.Search) {
            var route = prefix + '/' + name; 
            app.get   (route, jsonpWrap(ctl.Search));
            console.log('   :get    ' + route);
        }
        if (ctl.Save) {
            var route = prefix + '/' + name; 
            app.post  (route, jsonpWrap(ctl.Save));
            console.log('   :post   ' + route);
        }
        if (ctl.Read) {
            var route = prefix + '/' + name + '/:id'; 
            app.get   (route, jsonpWrap(ctl.Read));
            console.log('   :get    ' + route);
        }
        if (ctl.Delete) {
            var route = prefix + '/' + name + '/:id'; 
            app.delete(route, jsonpWrap(ctl.Delete));
            console.log('   :delete ' + route);
        }
        if (ctl.GetRender) {
            var route = prefix + '/' + name;
            app.get(route, ejsWrap(ctl.GetRender));
            console.log('   :get(render) ' + route);
        }
        if (ctl.GetRender_1) {
            var route = prefix + '/' + name + '/:arg1';
            app.get(route, ejsWrap(ctl.GetRender_1));
            console.log('   :get(render_1) ' + route);
        }
        if (ctl.PostRender) {
            var route = prefix + '/' + name;
            app.get(route, ejsWrap(ctl.PostRender));
            console.log('   :post(render) ' + route);
        }
    }


    //遍历 dir目录，定义路由
    var DefineRouters = function(prefix, dir) {
        var files = fs.readdirSync(dir);
        files.forEach(function (filename) {
            var filePath = path.join(dir, filename);
            var fstats = fs.statSync(filePath);
            if (fstats.isDirectory()) {
                //目录，递归到内部去
                DefineRouters(prefix + '/' + filename, path.join(dir, filename));
            } else if (fstats.isFile()) {
                //文件，载入
                var idx = filename.indexOf('.c.js');
                if(idx < 0)
                    idx = filename.indexOf('.server.controller.js');
                if(idx < 0)
                    return;
                var name = filename.substr(0, idx);
                commonRouter(prefix, name, filePath);
            }
        });
    }

    DefineRouters('', path.join(__dirname, '../ws/app/controllers'));

    // ------ start server !!

    var port = config.httpPort || 80;
    app.listen(port);
    console.log('listeng on port ' + port);

}