const { ccclass, property } = cc._decorator;

@ccclass
export default class A_asterisk extends cc.Component {
    @property(cc.Node)
    ctxCanvas: cc.Node = null;
    @property(cc.Node)
    startPointBtn: cc.Node = null;
    @property(cc.Node)
    endPointBtn: cc.Node = null;
    @property(cc.Node)
    wallPointBtn: cc.Node = null;
    @property(cc.Node)
    calculatePathBtn: cc.Node = null;
    @property(cc.Node)
    clearWallBtn: cc.Node = null;
    count = 0;
    rows: number = 20;
    cols: number = 20;
    ctx: cc.Graphics = null;
    gridSize: cc.Size = null;
    gridArray = [];
    startPoint: cc.Vec2 = null;
    endPoint: cc.Vec2 = null;

    playSpeed = 0.0;

    onLoad() {
        window['canvasScript'] = this;
        console.log('this.gridArray', this.gridArray)
        // 初始化画笔
        let ctxNode = new cc.Node('ctx');
        ctxNode.parent = this.ctxCanvas;
        ctxNode.position = cc.v2(0, 0);
        let ctx = ctxNode.addComponent(cc.Graphics);
        ctx.lineWidth = 5;
        ctx.strokeColor = cc.color(0, 0, 255);
        ctx.fillColor = cc.color(0, 0, 0);
        this.ctx = ctx;
        // 初始化二维数组
        this.gridArray = [];
        for (let i = 0; i < this.rows; i++) {
            let arr = [];
            for (let j = 0; j < this.cols; j++) {
                let a = { type: 'none' };
                arr.push(a);
            }
            this.gridArray.push(arr);
        }
        this.ctxCanvas.setContentSize(cc.winSize.width * 0.7, cc.winSize.height);
        this.gridSize = cc.size(this.ctxCanvas.width / this.cols, this.ctxCanvas.height / this.rows);
        this.startPoint = cc.v2(2, 10);
        this.endPoint = cc.v2(18, 10);
        this.init();
    }

    init() {
        let self = this;
        for (let row = 0; row < this.gridArray.length; row++) {
            for (let col = 0; col < this.gridArray[row].length; col++) {
                let pos = new cc.Vec2(
                    row * this.gridSize.width,
                    col * this.gridSize.height,
                )
                let data = this.gridArray[row][col];
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
            console.log('setStartPointBtn')
            self.node.targetOff(self);
            self.node.on(cc.Node.EventType.TOUCH_START, this.setStartPoint, self);
            self.node.on(cc.Node.EventType.TOUCH_MOVE, this.setStartPoint, self);
        }, this);
        this.endPointBtn.on(cc.Node.EventType.TOUCH_START, function () {
            console.log('setEndPointBtn')
            self.node.targetOff(self);
            self.node.on(cc.Node.EventType.TOUCH_START, this.setEndPoint, self);
            self.node.on(cc.Node.EventType.TOUCH_MOVE, this.setEndPoint, self);
        }, this);

        this.wallPointBtn.on(cc.Node.EventType.TOUCH_START, function () {
            console.log('setwallPointBtn')
            self.node.targetOff(self);
            self.node.on(cc.Node.EventType.TOUCH_START, this.setWallPoint, self);
            self.node.on(cc.Node.EventType.TOUCH_MOVE, this.setWallPoint, self);
        }, this);
        this.clearWallBtn.on(cc.Node.EventType.TOUCH_START, this.clearWallPoint, this);
        this.calculatePathBtn.on(cc.Node.EventType.TOUCH_START, this.calculatePath, this);
    }

    // 画一个格子
    drawOneRect(x, y, color) {
        let ctx = this.ctx;
        let gridSize = this.gridSize;
        ctx.rect(x, y, gridSize.width, gridSize.height);
        ctx.fillColor = color || new cc.Color(0, 0, 0);
        ctx.stroke();
        ctx.fill();
    }

    // 画一个小矩形
    drawOneSmallRect(x, y, color) {
        let ctx = this.ctx;
        let gridSize = this.gridSize;
        ctx.rect(x, y, gridSize.width * 0.6, gridSize.height * 0.6);
        ctx.fillColor = color || new cc.Color(0, 0, 0);
        ctx.stroke();
        ctx.fill();
    }
    // 更新路径图
    updateGrids() {
        // console.log('updateGrids')
        let ctx = this.ctx;
        ctx.clear();
        for (let row = 0; row < this.gridArray.length; row++) {
            for (let col = 0; col < this.gridArray[row].length; col++) {
                let data = this.gridArray[row][col];
                // console.log('data', data)
                let pos = data['pos'];
                let color = data['color'];
                // console.log('pos', pos);
                switch (data.type) {
                    case 'wallPoint': color = cc.color(0, 150, 255); break;
                    case 'startPoint': color = cc.color(0, 255, 0); break;
                    case 'endPoint': color = cc.color(255, 0, 0); break;
                    default: color = cc.color(0, 0, 0); break;
                }
                this.drawOneRect(pos.x, pos.y, color);
                if (data.process) {
                    switch (data.process) {
                        case 'open': color = cc.color(255, 255, 0); break;
                        case 'close': color = cc.color(0, 255, 255); break;
                    }
                    this.drawOneSmallRect(pos.x, pos.y, color)
                }
            }
        }
    }
    // 设置起始点
    setStartPoint(touch) {
        for (let row = 0; row < this.gridArray.length; row++) {
            for (let col = 0; col < this.gridArray[row].length; col++) {
                // delete this.gridArray[row][col].process;
                if (this.gridArray[row][col].type == 'startPoint') {
                    this.gridArray[row][col].type = 'none';
                }
                let pos = this.gridArray[row][col].pos;
                let rect = new cc.Rect(pos.x, pos.y, this.gridSize.width, this.gridSize.height);
                if (rect.contains(touch.getLocation())) {
                    // console.log('setStartPoint', row, col);
                    this.gridArray[row][col].type = 'startPoint';
                    this.startPoint = cc.v2(row, col);
                }
            }
        }
        // this.calculatePath();
        this.updateGrids();
        for (let row = 0; row < this.gridArray.length; row++) {
            for (let col = 0; col < this.gridArray[row].length; col++) {
                delete this.gridArray[row][col].process;
            }
        }
    }
    // 设置目的地
    setEndPoint(touch) {
        for (let row = 0; row < this.gridArray.length; row++) {
            for (let col = 0; col < this.gridArray[row].length; col++) {
                // delete this.gridArray[row][col].process;
                if (this.gridArray[row][col].type == 'endPoint') {
                    this.gridArray[row][col].type = 'none';
                }
                let pos = this.gridArray[row][col].pos;
                let rect = new cc.Rect(pos.x, pos.y, this.gridSize.width, this.gridSize.height);
                if (rect.contains(touch.getLocation())) {
                    // console.log('setEndPoint', row, col);
                    this.gridArray[row][col].type = 'endPoint';
                    this.endPoint = cc.v2(row, col);
                }
            }
        }
        // this.calculatePath();
        this.updateGrids();
        for (let row = 0; row < this.gridArray.length; row++) {
            for (let col = 0; col < this.gridArray[row].length; col++) {
                delete this.gridArray[row][col].process;
            }
        }
    }
    // 设置墙壁
    setWallPoint(touch) {
        for (let row = 0; row < this.gridArray.length; row++) {
            for (let col = 0; col < this.gridArray[row].length; col++) {
                // if (this.gridArray[row][col].type == 'wallPoint') {
                //     this.gridArray[row][col].type = 'none';
                // }
                let pos = this.gridArray[row][col].pos;
                let rect = new cc.Rect(pos.x, pos.y, this.gridSize.width, this.gridSize.height);
                if (rect.contains(touch.getLocation())
                    && this.gridArray[row][col].type == 'none'
                ) {
                    // console.log('setwallPoint', row, col);
                    this.gridArray[row][col].type = 'wallPoint';
                    // this.endPoint = cc.v2(row, col);
                }
            }
        }
        // this.calculatePath();
        this.updateGrids();
    }

    clearWallPoint() {
        for (let row = 0; row < this.gridArray.length; row++) {
            for (let col = 0; col < this.gridArray[row].length; col++) {
                if (this.gridArray[row][col].type == 'wallPoint') {
                    this.gridArray[row][col].type = 'none';
                }
                delete this.gridArray[row][col].process;
            }
        }
        // this.calculatePath();
        this.updateGrids();
    }


    /**
     * a*算法 计算最短路径
     */
    calculatePath() {
        let self = this;
        console.log('计算路径');
        self.count = 0;
        // 初始化列表
        let startPoint = new AStarPoint(this.startPoint.x, this.startPoint.y, null);
        let endPoint = new AStarPoint(this.endPoint.x, this.endPoint.y, null);
        let openList = new Array<AStarPoint>();
        let closeList = [];
        openList.push(startPoint);
        function checkAround(val) {
            self.count = self.count || 0;
            self.count++;
            if (self.count > 1000) {
                console.error('超过次数')
                return;
            }
            if (openList.length > 0) {
                // debugger
                // a) 寻找开启列表中F值最低的格子。我们称它为当前格
                window['openList'] = openList;
                // 如果列表不为空,查找F值最小的那个点
                let minF, F, parentPoint;
                for (let i of openList) {
                    F = i.F;
                    if (!minF || minF > F) {
                        minF = F;
                        parentPoint = i;
                    }
                }
                // b) 把它切换到关闭列表
                let idx = openList.indexOf(parentPoint)
                if (idx != -1) {
                    parentPoint = openList.splice(idx, 1)[0];
                } else {
                    console.log('no idx')
                }

                if (parentPoint.x == endPoint.x && parentPoint.y == endPoint.y) {
                    // 该节点是目的地节点,就找完了，然后循环找到其父节点形成路径
                    console.log('找到了');
                    let list = [];
                    let p = parentPoint;
                    while (p.parent) {
                        list.push(p.parent)
                        p = p.parent;
                    }
                    self.updateGrids();
                } else {
                    // c) 对相邻的格中的每一个
                    // 将point从openList中删除，加入到closeList
                    delete self.gridArray[parentPoint.x][parentPoint.y]['process'];
                    self.gridArray[parentPoint.x][parentPoint.y]['process'] = 'close';
                    closeList.push(parentPoint);
                    // 获取周围的点
                    let directions = [cc.v2(0, 1), cc.v2(0, -1), cc.v2(1, 0), cc.v2(-1, 0), cc.v2(1, 1), cc.v2(1, -1), cc.v2(-1, 1), cc.v2(-1, -1)];
                    let isNextToWall = false;
                    for (let i of directions) {
                        let curPoint = cc.v2(parentPoint.x + i.x, parentPoint.y + i.y);
                        // 忽略在closeList、openList、超出边界的、不可通过的
                        let res = closeList.find((v, i) => { return v.x == curPoint.x && v.y == curPoint.y; })
                        if (res) { continue; }
                        let openRes = openList.find((v, i) => { return v.x == curPoint.x && v.y == curPoint.y; })
                        if (openRes) { continue; }
                        if (!self.gridArray[curPoint.x] || !self.gridArray[curPoint.x][curPoint.y]) { continue; }
                        let data = self.gridArray[curPoint.x][curPoint.y];
                        // 墙壁
                        if (data.type == 'wallPoint') {
                            // console.log('不可通过', curPoint.x, curPoint.y)
                            isNextToWall = true;
                            continue;
                        }

                        let aStarPoint = new AStarPoint(data.row, data.col, parentPoint);
                        let G, H;
                        let dist = cc.v2(i.x, i.y).mag() * 10;
                        G = parseInt(dist.toString());
                        if (isNextToWall && G == 14) {
                            // 如果有墙壁在周围就不能斜着走
                            continue;
                        }
                        let dir = cc.v2(curPoint.x, curPoint.y).sub(self.endPoint);
                        H = Math.abs(dir.x) + Math.abs(dir.y);
                        // 计算F值
                        aStarPoint.F = G + H * 10;
                        aStarPoint.G = G;
                        aStarPoint.H = H;
                        aStarPoint.dirX = dir.x;
                        aStarPoint.dirY = dir.y;
                        // 放在待检测列表
                        openList.push(aStarPoint)
                        // 变为待检测节点
                        delete self.gridArray[curPoint.x][curPoint.y]['process'];
                        self.gridArray[curPoint.x][curPoint.y]['process'] = 'open';
                    }
                    // 再次检测，并且绘制一次界面
                    self.scheduleOnce(() => {
                        checkAround(openList);
                        self.updateGrids();
                    }, self.playSpeed)
                }
            } else {
                console.log('openList 为空 没找到')
            }
        }
        console.log('openList', openList)
        checkAround(openList);
    }
}

class AStarPoint {
    x = null;
    y = null;
    F = null;
    G = null;
    H = null;
    dirX = null;
    dirY = null;
    parent: AStarPoint = null;
    constructor(x, y, parent) {
        this.x = x;
        this.y = y;
        this.parent = parent;
    }
}
