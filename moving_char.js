function movingChar(){
	var player_x;
	var player_y;
	var player_angle=0;
	var speed=0;
	
	var player_tmp_x;
	var player_tmp_y;
	
	var movable=[true,true,true,true];
	
	return{
		putAtXY:function(x,y){
			player_tmp_x=player_x=x;
			player_tmp_y=player_y=y;
		},
		setSpeed:function(val){
			speed=val;
		},
		getX:function(){
			return Math.floor(player_x/40);
		},
		getY:function(){
			return Math.floor(player_y/40);
		},
		getRealX:function(){
			return player_x/40;
		},
		getRealY:function(){
			return player_y/40;
		},
		getAbsoluteX:function(){
			return player_x;
		},
		getAbsoluteY:function(){
			return player_y;
		},
		getAngle:function(){
			return player_angle;
		},
		decideMovement:function(dir){
			if(dir==-1){
				player_tmp_y=player_y;
				player_tmp_x=player_x;
			}
			else{
				//dir: 0=UP 1=RIGHT 2=DOWN 3=LEFT
				player_tmp_y=player_y-speed*Math.cos(player_angle+dir/2*Math.PI);
				player_tmp_x=player_x+speed*Math.sin(player_angle+dir/2*Math.PI);
			}
		},
		setMovable:function(arr){
			movable=arr;
		},
		disableMovable:function(index){
			movable[index]=false;
		},
		move:function(){
			var changeX=player_tmp_x-player_x;
			var changeY=player_tmp_y-player_y;
			if((changeX>0 && movable[1]) || (changeX<0 && movable[3]))
				player_x=player_tmp_x;
			if((changeY>0 && movable[2]) || (changeY<0 && movable[0]))
				player_y=player_tmp_y;
		},
		setAngle:function(angle){
			player_angle=angle;
		},
		
		getTmpCenterX:function(){
			return player_tmp_x+20;
		},
		getTmpCenterY:function(){
			return player_tmp_y+20;
		},
		getCenterX:function(){
			return player_x+20;
		},
		getCenterY:function(){
			return player_y+20;
		},
		getRadius:function(){
			return 15;
		},
		
		getTargetX:function(){
			return this.getRealX()+0.5+0.85*Math.sin(player_angle);
		},
		getTargetY:function(){
			return this.getRealY()+0.5-0.85*Math.cos(player_angle);
		},
		moveTowards:function(x,y,scroll_speed){
			if(player_x/40<x)
				player_x+=scroll_speed;
			else
				player_x-=scroll_speed;
			if(Math.abs(player_x-x*40)<=scroll_speed)
				player_x=x*40;
			
			if(player_y/40<y)
				player_y+=scroll_speed;
			else
				player_y-=scroll_speed;
			if(Math.abs(player_y-y*40)<=scroll_speed)
				player_y=y*40;
		},
		moveHorizontallyTo:function(x,scroll_speed){
			if(player_x/40<x)
				player_x+=scroll_speed;
			else
				player_x-=scroll_speed;
			if(Math.abs(player_x-x*40)<=scroll_speed)
				player_x=x*40;
		},
		moveVerticallyTo:function(y,scroll_speed){
			if(player_y/40<y)
				player_y+=scroll_speed;
			else
				player_y-=scroll_speed;
			if(Math.abs(player_y-y*40)<=scroll_speed)
				player_y=y*40;
		},
		getDistance:function(ch){
			var xDist=this.getCenterX()-ch.getCenterX();
			var yDist=this.getCenterY()-ch.getCenterY();
			return Math.sqrt(xDist*xDist+yDist*yDist);
		},
		getAngleToDist:function(x,y){
			var c=(Math.sqrt(x*x+y*y));
			if(c==0)
				return 0;
			var sinAlpha=x/c;
			if(y<=0)
				return Math.asin(sinAlpha);
			else
				return Math.PI-Math.asin(sinAlpha);
		},
		getAngleTo:function(ch){
			var x=ch.getCenterX()-this.getCenterX();
			var y=ch.getCenterY()-this.getCenterY();
			return this.getAngleToDist(x,y);
		},
		setAngleTo:function(x,y){
			this.setAngle(this.getAngleTo(x,y));
		},
		setAngleToDist:function(x,y){
			this.setAngle(this.getAngleToDist(x,y));
		}
	}
}