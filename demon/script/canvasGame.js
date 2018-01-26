var canvas = document.getElementById('game');
/*requestAnimFrame api在兼容的情况下保证动画流畅不丢帧*/
window.requestAnimFrame = (function(){
   return  window.requestAnimationFrame       ||
           window.webkitRequestAnimationFrame ||
           window.mozRequestAnimationFrame    ||
           function(callback){
             window.setTimeout(callback, 1000 / 60);
           };
})(); 

/*球类*/
function Game(options){//人物构造函数
    this.canvas = options;//获取画布
    this.overDiv = document.getElementById("gameover");//结束界面的div
    this.startDiv = document.getElementById("gamestart");//结束界面的div
    this.cxt = this.canvas.getContext('2d'); //获取画布上下文环境
    this.width =  this.cxt.canvas.width;//画布宽度
    this.height = this.cxt.canvas.height;//画布高度 
    this.ball = {x:parseInt(this.cxt.canvas.width/2),y:710,r:20,g:1,vx:0,vy:-10,color:"#5daccb"}//人物参数
    this.obstacle ={y:150,length:8,width:50,height:8,color:"#9dcce4"}//障碍参数
    this.obstacleYX = [] //存储障碍的x值和y值
    this.levelheight = this.cxt.canvas.height;//记录小球到达的y值
    this.jumpLength = 0;//记录小球到达的层数
    this.windowmove = 0;//0不移动 1移动
    this.over = 0;//0为开始,1为结束
    this.min = document.getElementById("minute");
    this.second = document.getElementById("second");
}
Game.prototype = {
    constructor: Game,
    /*初始化函数*/
    init:function(){
      var _this = this;
      this.jumpLength=0;
      this.over =0;
      this.obstacleRender(0);//障碍随机生成
      cancelAnimationFrame(this.animate)
      this.GameTime();
      this.min.innerHTML = "00";
      this.second.innerHTML = "00"
      this.overDiv.style.left = this.width +"px";     
      requestAnimationFrame(function fn(){
        _this.BallRender()//小球动画
        _this.update()//小球碰撞判断
        _this.text()//层数文本
        _this.obstacleMove();
        _this.obstacleRender(1);//障碍刷新
        _this.animate = requestAnimationFrame(fn);
      })
      this.control();//控制小球函数
    },
    /*控制小球的弹跳和物理加速度*/
    update:function(){
        var regionY = [this.ball.y,this.ball.y+this.ball.vy]
        this.ball.x+=this.ball.vx;
        if(this.ball.vy>0){
            var i;
            for(i=0;i<this.obstacleYX.length;i++){
                   if(regionY[0]-this.ball.r<this.obstacleYX[i].y&&this.obstacleYX[i].y<regionY[1]+this.ball.r+this.obstacle.height&&this.ball.x-50-this.ball.r/2<this.obstacleYX[i].x&&this.obstacleYX[i].x<this.ball.x+50+this.ball.r/2){
                       this.ball.y = this.obstacleYX[i].y-this.ball.r-8;
                       this.ball.vy = -20;//碰到阶梯时将加速度变为-15让小球向上弹起
                       this.jumpLength = this.obstacleYX[i].num;//记录层数
                       return;
               }
            }
            if(this.ball.y<this.height*0.4){
                this.windowmove=1;                      
             }
             if(this.ball.y>this.height*0.4){
                this.windowmove=0
             }
        }
        this.ball.y+=this.ball.vy;
        this.ball.vy += this.ball.g;
        if(this.ball.y>=this.cxt.canvas.height - this.ball.r){
            this.ball.y=this.cxt.canvas.height - this.ball.r
            this.ball.vy = - 20;
            if(this.jumpLength!=0&&this.over==0){
                this.overDiv.style.left = "0px";
                document.getElementById("MarkDiv").innerHTML = this.jumpLength;
                document.getElementById("TimeDiv").innerHTML = document.getElementById("minute").innerHTML + ":" + document.getElementById("second").innerHTML;
                this.over=1;
                return;
            }
        }
    },
    /*绘制小球*/
    BallRender:function(){
        this.cxt.clearRect(0, 0, this.width,this.height);
        
        this.cxt.fillStyle=this.ball.color;
        this.cxt.beginPath();
        this.cxt.arc(this.ball.x,this.ball.y,this.ball.r,0,2*Math.PI)
        this.cxt.closePath();

        this.cxt.fill();
    },
    /*控制小球的方向*/
    control:function(){
        var _this = this;
        document.addEventListener("keydown",function(event){
            var e = event || window.event || arguments.callee.caller.arguments[0];
            if(e.keyCode==37){
                _this.ball.vx = -12;
            }
            if(e.keyCode==39){
                _this.ball.vx = 12;
            }
          });
          document.addEventListener("keyup",function(event){
            var e = event || window.event || arguments.callee.caller.arguments[0];
            if(e.keyCode==37||39){
                _this.ball.vx = 0;
            }
          });
    },
    /*障碍移动以及障碍再生成*/
    obstacleMove:function(){
        if(this.windowmove==1){
            var ii;
            for(ii=0;ii<this.obstacleYX.length;ii++){
                this.obstacleYX[ii].y += 10;
                if(this.obstacleYX[ii].y>this.height){
                      var dele_value=this.obstacleYX.shift();
                      dele_value.x = parseInt(Math.random()*(this.width - 50));
                      dele_value.y = this.cxt.canvas.height-this.obstacle.length*(this.obstacle.y+this.obstacle.height)+this.obstacle.height;
                      dele_value.num = this.obstacleYX[5].num+2;
                      this.obstacleYX.push(dele_value); 
                }
            }
            this.ball.y +=10;
        }
    },
    /*障碍生成*/
    obstacleRender:function(num){
        this.cxt.fillStyle=this.obstacle.color;
        var i;
        for(i=0;i<this.obstacle.length;i++){
            var Oarray = {};
            if(num==0){
                Oarray.x = parseInt(Math.random()*(this.width - 50));
                Oarray.y = this.cxt.canvas.height-i*(this.obstacle.y+this.obstacle.height)+this.obstacle.height;
                Oarray.num = i;
                this.obstacleYX[i]=Oarray;
            }           
            this.cxt.beginPath();
            this.cxt.moveTo(this.obstacleYX[i].x,this.obstacleYX[i].y);
            this.cxt.lineTo(this.obstacleYX[i].x+this.obstacle.width, this.obstacleYX[i].y);
            this.cxt.lineTo(this.obstacleYX[i].x+this.obstacle.width, this.obstacleYX[i].y-this.obstacle.height);
            this.cxt.lineTo(this.obstacleYX[i].x-this.obstacle.width, this.obstacleYX[i].y-this.obstacle.height);
            this.cxt.lineTo(this.obstacleYX[i].x-this.obstacle.width, this.obstacleYX[i].y);
            this.cxt.fillStyle=this.obstacle.color;
            this.cxt.closePath();

            this.cxt.fill();
        }
    },
    /*层数文本*/
    text:function(){
        this.cxt.font = "30px Courier New";
        this.cxt.fillStyle  = "#fff";
        this.cxt.fillText(this.jumpLength, this.width-60, 50);
    },
    /*游戏时间计算*/
    GameTime:function(){
        if(this.timer){clearTimeout(this.timer)}
        this.timer = setInterval((function(){
            if(this.second.innerHTML=="59"){
                if(parseInt(this.min.innerHTML)==9){this.min.innerHTML = parseInt(this.min.innerHTML+1)}
                else{this.min.innerHTML = "0"+(parseInt(this.min.innerHTML)+1)}
                this.second.innerHTML="00";
                return;
            }
            if(parseInt(this.second.innerHTML)>8){this.second.innerHTML=parseInt(this.second.innerHTML)+1;}
            else{this.second.innerHTML="0"+(parseInt(this.second.innerHTML)+1)}
        }).bind(this),1000)
    }
}

window.onload = function(){
    canvas.width = screen.availWidth;
    canvas.height = screen.availHeight-50;
    var game1 = new Game(canvas);
    game1.init();
    document.getElementById("startButton").addEventListener("click",function(){
        game1.init();
    })
    document.getElementById("playButton").addEventListener("click",function(){
        game1.init();
        document.getElementById("gamestart").style.left=-document.body.clientWidth +"px";
    }) 
}