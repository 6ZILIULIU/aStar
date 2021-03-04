"use strict";
cc._RF.push(module, 'ef58c7bb/9MgJPP5GKBlMGQ', 'A_asterisk');
// Script/A_asterisk.ts

Object.defineProperty(exports, "__esModule", { value: true });
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var A_asterisk = /** @class */ (function (_super) {
    __extends(A_asterisk, _super);
    function A_asterisk() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.ctxCanvas = null;
        _this.startPointBtn = null;
        _this.endPointBtn = null;
        _this.wallPointBtn = null;
        _this.calculatePathBtn = null;
        _this.clearWallBtn = null;
        _this.count = 0;
        _this.rows = 20;
        _this.cols = 20;
        _this.ctx = null;
        _this.gridSize = null;
        _this.gridArray = [];
        _this.startPoint = null;
        _this.endPoint = null;
        _this.playSpeed = 0.0;
        return _this;
    }
    A_asterisk.prototype.onLoad = function () {
        window['canvasScript'] = this;
        console.log('this.gridArray', this.gridArray);
        // 初始化画笔
        var ctxNode = new cc.Node('ctx');
        ctxNode.parent = this.ctxCanvas;
        ctxNode.position = cc.v2(0, 0);
        var ctx = ctxNode.addComponent(cc.Graphics);
        ctx.lineWidth = 5;
        ctx.strokeColor = cc.color(0, 0, 255);
        ctx.fillColor = cc.color(0, 0, 0);
        this.ctx = ctx;
        // 初始化二维数组
        this.gridArray = [];
        for (var i = 0; i < this.rows; i++) {
            var arr = [];
            for (var j = 0; j < this.cols; j++) {
                var a = { type: 'none' };
                arr.push(a);
            }
            this.gridArray.push(arr);
        }
        this.ctxCanvas.setContentSize(cc.winSize.width * 0.7, cc.winSize.height);
        this.gridSize = cc.size(this.ctxCanvas.width / this.cols, this.ctxCanvas.height / this.rows);
        this.startPoint = cc.v2(2, 10);
        this.endPoint = cc.v2(18, 10);
        this.init();
    };
    A_asterisk.prototype.init = function () {
        var self = this;
        for (var row = 0; row < this.gridArray.length; row++) {
            for (var col = 0; col < this.gridArray[row].length; col++) {
                var pos = new cc.Vec2(row * this.gridSize.width, col * this.gridSize.height);
                var data = this.gridArray[row][col];
                data['pos'] = pos;
                data.row = row;
                data.col = col;
                if (this.startPoint && row == this.startPoint.x && this.startPoint.y == col) {
                    data.type = 'startPoint';
                }
                if (this.endPoint && row == this.endPoint.x && this.endPoint.y == col) {
                    data.type = 'endPoint';
                }
            }
        }
        this.updateGrids();
        // 监听事件
        this.startPointBtn.on(cc.Node.EventType.TOUCH_START, function () {
            console.log('setStartPointBtn');
            self.node.targetOff(self);
            self.node.on(cc.Node.EventType.TOUCH_START, this.setStartPoint, self);
            self.node.on(cc.Node.EventType.TOUCH_MOVE, this.setStartPoint, self);
        }, this);
        this.endPointBtn.on(cc.Node.EventType.TOUCH_START, function () {
            console.log('setEndPointBtn');
            self.node.targetOff(self);
            self.node.on(cc.Node.EventType.TOUCH_START, this.setEndPoint, self);
            self.node.on(cc.Node.EventType.TOUCH_MOVE, this.setEndPoint, self);
        }, this);
        this.wallPointBtn.on(cc.Node.EventType.TOUCH_START, function () {
            console.log('setwallPointBtn');
            self.node.targetOff(self);
            self.node.on(cc.Node.EventType.TOUCH_START, this.setWallPoint, self);
            self.node.on(cc.Node.EventType.TOUCH_MOVE, this.setWallPoint, self);
        }, this);
        this.clearWallBtn.on(cc.Node.EventType.TOUCH_START, this.clearWallPoint, this);
        this.calculatePathBtn.on(cc.Node.EventType.TOUCH_START, this.calculatePath, this);
    };
    // 画一个格子
    A_asterisk.prototype.drawOneRect = function (x, y, color) {
        var ctx = this.ctx;
        var gridSize = this.gridSize;
        ctx.rect(x, y, gridSize.width, gridSize.height);
        ctx.fillColor = color || new cc.Color(0, 0, 0);
        ctx.stroke();
        ctx.fill();
    };
    // 画一个小矩形
    A_asterisk.prototype.drawOneSmallRect = function (x, y, color) {
        var ctx = this.ctx;
        var gridSize = this.gridSize;
        ctx.rect(x, y, gridSize.width * 0.6, gridSize.height * 0.6);
        ctx.fillColor = color || new cc.Color(0, 0, 0);
        ctx.stroke();
        ctx.fill();
    };
    // 更新路径图
    A_asterisk.prototype.updateGrids = function () {
        // console.log('updateGrids')
        var ctx = this.ctx;
        ctx.clear();
        for (var row = 0; row < this.gridArray.length; row++) {
            for (var col = 0; col < this.gridArray[row].length; col++) {
                var data = this.gridArray[row][col];
                // console.log('data', data)
                var pos = data['pos'];
                var color = data['color'];
                // console.log('pos', pos);
                switch (data.type) {
                    case 'wallPoint':
                        color = cc.color(0, 150, 255);
                        break;
                    case 'startPoint':
                        color = cc.color(0, 255, 0);
                        break;
                    case 'endPoint':
                        color = cc.color(255, 0, 0);
                        break;
                    default:
                        color = cc.color(0, 0, 0);
                        break;
                }
                this.drawOneRect(pos.x, pos.y, color);
                if (data.process) {
                    switch (data.process) {
                        case 'open':
                            color = cc.color(255, 255, 0);
                            break;
                        case 'close':
                            color = cc.color(0, 255, 255);
                            break;
                    }
                    this.drawOneSmallRect(pos.x, pos.y, color);
                }
            }
        }
    };
    // 设置起始点
    A_asterisk.prototype.setStartPoint = function (touch) {
        for (var row = 0; row < this.gridArray.length; row++) {
            for (var col = 0; col < this.gridArray[row].length; col++) {
                // delete this.gridArray[row][col].process;
                if (this.gridArray[row][col].type == 'startPoint') {
                    this.gridArray[row][col].type = 'none';
                }
                var pos = this.gridArray[row][col].pos;
                var rect = new cc.Rect(pos.x, pos.y, this.gridSize.width, this.gridSize.height);
                if (rect.contains(touch.getLocation())) {
                    // console.log('setStartPoint', row, col);
                    this.gridArray[row][col].type = 'startPoint';
                    this.startPoint = cc.v2(row, col);
                }
            }
        }
        // this.calculatePath();
        this.updateGrids();
        for (var row = 0; row < this.gridArray.length; row++) {
            for (var col = 0; col < this.gridArray[row].length; col++) {
                delete this.gridArray[row][col].process;
            }
        }
    };
    // 设置目的地
    A_asterisk.prototype.setEndPoint = function (touch) {
        for (var row = 0; row < this.gridArray.length; row++) {
            for (var col = 0; col < this.gridArray[row].length; col++) {
                // delete this.gridArray[row][col].process;
                if (this.gridArray[row][col].type == 'endPoint') {
                    this.gridArray[row][col].type = 'none';
                }
                var pos = this.gridArray[row][col].pos;
                var rect = new cc.Rect(pos.x, pos.y, this.gridSize.width, this.gridSize.height);
                if (rect.contains(touch.getLocation())) {
                    // console.log('setEndPoint', row, col);
                    this.gridArray[row][col].type = 'endPoint';
                    this.endPoint = cc.v2(row, col);
                }
            }
        }
        // this.calculatePath();
        this.updateGrids();
        for (var row = 0; row < this.gridArray.length; row++) {
            for (var col = 0; col < this.gridArray[row].length; col++) {
                delete this.gridArray[row][col].process;
            }
        }
    };
    // 设置墙壁
    A_asterisk.prototype.setWallPoint = function (touch) {
        for (var row = 0; row < this.gridArray.length; row++) {
            for (var col = 0; col < this.gridArray[row].length; col++) {
                // if (this.gridArray[row][col].type == 'wallPoint') {
                //     this.gridArray[row][col].type = 'none';
                // }
                var pos = this.gridArray[row][col].pos;
                var rect = new cc.Rect(pos.x, pos.y, this.gridSize.width, this.gridSize.height);
                if (rect.contains(touch.getLocation())
                    && this.gridArray[row][col].type == 'none') {
                    // console.log('setwallPoint', row, col);
                    this.gridArray[row][col].type = 'wallPoint';
                    // this.endPoint = cc.v2(row, col);
                }
            }
        }
        // this.calculatePath();
        this.updateGrids();
    };
    A_asterisk.prototype.clearWallPoint = function () {
        for (var row = 0; row < this.gridArray.length; row++) {
            for (var col = 0; col < this.gridArray[row].length; col++) {
                if (this.gridArray[row][col].type == 'wallPoint') {
                    this.gridArray[row][col].type = 'none';
                }
                delete this.gridArray[row][col].process;
            }
        }
        // this.calculatePath();
        this.updateGrids();
    };
    /**
     * a*算法 计算最短路径
     */
    A_asterisk.prototype.calculatePath = function () {
        var self = this;
        console.log('计算路径');
        self.count = 0;
        // 初始化列表
        var startPoint = new AStarPoint(this.startPoint.x, this.startPoint.y, null);
        var endPoint = new AStarPoint(this.endPoint.x, this.endPoint.y, null);
        var openList = new Array();
        var closeList = [];
        openList.push(startPoint);
        function checkAround(val) {
            self.count = self.count || 0;
            self.count++;
            if (self.count > 1000) {
                console.error('超过次数');
                return;
            }
            if (openList.length > 0) {
                // debugger
                // a) 寻找开启列表中F值最低的格子。我们称它为当前格
                window['openList'] = openList;
                // 如果列表不为空,查找F值最小的那个点
                var minF = void 0, F = void 0, parentPoint = void 0;
                for (var _i = 0, openList_1 = openList; _i < openList_1.length; _i++) {
                    var i = openList_1[_i];
                    F = i.F;
                    if (!minF || minF > F) {
                        minF = F;
                        parentPoint = i;
                    }
                }
                // b) 把它切换到关闭列表
                var idx = openList.indexOf(parentPoint);
                if (idx != -1) {
                    parentPoint = openList.splice(idx, 1)[0];
                }
                else {
                    console.log('no idx');
                }
                if (parentPoint.x == endPoint.x && parentPoint.y == endPoint.y) {
                    // 该节点是目的地节点,就找完了，然后循环找到其父节点形成路径
                    console.log('找到了');
                    var list = [];
                    var p = parentPoint;
                    while (p.parent) {
                        list.push(p.parent);
                        p = p.parent;
                    }
                    self.updateGrids();
                }
                else {
                    // c) 对相邻的格中的每一个
                    // 将point从openList中删除，加入到closeList
                    delete self.gridArray[parentPoint.x][parentPoint.y]['process'];
                    self.gridArray[parentPoint.x][parentPoint.y]['process'] = 'close';
                    closeList.push(parentPoint);
                    // 获取周围的点
                    var directions = [cc.v2(0, 1), cc.v2(0, -1), cc.v2(1, 0), cc.v2(-1, 0), cc.v2(1, 1), cc.v2(1, -1), cc.v2(-1, 1), cc.v2(-1, -1)];
                    var isNextToWall = false;
                    var _loop_1 = function (i) {
                        var curPoint = cc.v2(parentPoint.x + i.x, parentPoint.y + i.y);
                        // 忽略在closeList、openList、超出边界的、不可通过的
                        var res = closeList.find(function (v, i) { return v.x == curPoint.x && v.y == curPoint.y; });
                        if (res) {
                            return "continue";
                        }
                        var openRes = openList.find(function (v, i) { return v.x == curPoint.x && v.y == curPoint.y; });
                        if (openRes) {
                            return "continue";
                        }
                        if (!self.gridArray[curPoint.x] || !self.gridArray[curPoint.x][curPoint.y]) {
                            return "continue";
                        }
                        var data = self.gridArray[curPoint.x][curPoint.y];
                        // 墙壁
                        if (data.type == 'wallPoint') {
                            // console.log('不可通过', curPoint.x, curPoint.y)
                            isNextToWall = true;
                            return "continue";
                        }
                        var aStarPoint = new AStarPoint(data.row, data.col, parentPoint);
                        var G = void 0, H = void 0;
                        var dist = cc.v2(i.x, i.y).mag() * 10;
                        G = parseInt(dist.toString());
                        if (isNextToWall && G == 14) {
                            return "continue";
                        }
                        var dir = cc.v2(curPoint.x, curPoint.y).sub(self.endPoint);
                        H = Math.abs(dir.x) + Math.abs(dir.y);
                        // 计算F值
                        aStarPoint.F = G + H * 10;
                        aStarPoint.G = G;
                        aStarPoint.H = H;
                        aStarPoint.dirX = dir.x;
                        aStarPoint.dirY = dir.y;
                        // 放在待检测列表
                        openList.push(aStarPoint);
                        // 变为待检测节点
                        delete self.gridArray[curPoint.x][curPoint.y]['process'];
                        self.gridArray[curPoint.x][curPoint.y]['process'] = 'open';
                    };
                    for (var _a = 0, directions_1 = directions; _a < directions_1.length; _a++) {
                        var i = directions_1[_a];
                        _loop_1(i);
                    }
                    // 再次检测，并且绘制一次界面
                    self.scheduleOnce(function () {
                        checkAround(openList);
                        self.updateGrids();
                    }, self.playSpeed);
                }
            }
            else {
                console.log('openList 为空 没找到');
            }
        }
        console.log('openList', openList);
        checkAround(openList);
    };
    __decorate([
        property(cc.Node)
    ], A_asterisk.prototype, "ctxCanvas", void 0);
    __decorate([
        property(cc.Node)
    ], A_asterisk.prototype, "startPointBtn", void 0);
    __decorate([
        property(cc.Node)
    ], A_asterisk.prototype, "endPointBtn", void 0);
    __decorate([
        property(cc.Node)
    ], A_asterisk.prototype, "wallPointBtn", void 0);
    __decorate([
        property(cc.Node)
    ], A_asterisk.prototype, "calculatePathBtn", void 0);
    __decorate([
        property(cc.Node)
    ], A_asterisk.prototype, "clearWallBtn", void 0);
    A_asterisk = __decorate([
        ccclass
    ], A_asterisk);
    return A_asterisk;
}(cc.Component));
exports.default = A_asterisk;
var AStarPoint = /** @class */ (function () {
    function AStarPoint(x, y, parent) {
        this.x = null;
        this.y = null;
        this.F = null;
        this.G = null;
        this.H = null;
        this.dirX = null;
        this.dirY = null;
        this.parent = null;
        this.x = x;
        this.y = y;
        this.parent = parent;
    }
    return AStarPoint;
}());

cc._RF.pop();