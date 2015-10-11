function dist(point,x,y){
	var x_dist=point[0]-x;
	var y_dist=point[1]-y;
	return Math.sqrt(x_dist*x_dist+y_dist*y_dist);
}

function createSquare(x,y){
	var pUL=[x*40,y*40],pUR=[x*40+40,y*40],pBL=[x*40,y*40+40],pBR=[x*40+40,y*40+40];
	
	function checkVertices(movable,x,y,r){
		if(dist(pUL,x,y)<r){
			movable[1]=false;	//RIGHT
			movable[2]=false;	//DOWN
		}
		if(dist(pUR,x,y)<r){
			movable[3]=false;	//LEFT
			movable[2]=false;	//DOWN
		}
		if(dist(pBL,x,y)<r){
			movable[0]=false;	//UP
			movable[1]=false;	//RIGHT
		}
		if(dist(pBR,x,y)<r){
			movable[3]=false;	//LEFT
			movable[0]=false;	//UP
		}
	}
	
	function checkSides(movable,x,y,r){
		var mX=(pUL[0]+pUR[0])/2;	//middle x
		var mY=(pUL[1]+pBL[1])/2;	//middle y
		var h=(pUR[0]-pUL[0])/2;	//half of side length
		if(Math.abs(mY-y)<=r+h && Math.abs(mX-x)<=r+h){
			if(pBL[0]<=x && x<=pBR[0]){
				if(y>mY)
					movable[0]=false;	//UP
				else
					movable[2]=false;	//DOWN
			}
			else if(pUL[1]<=y && y<=pBL[1]){
				if(x>mX)
					movable[3]=false;	//LEFT
				else
					movable[1]=false;	//RIGHT
			}
		}
	}
	
	return{
		setColliding:function(movable,x,y,r,squaresQuantity){
			if(squaresQuantity==1)
				checkVertices(movable,x,y,r);
			checkSides(movable,x,y,r);
		}
	}
}

function squareCollisions(squares,x,y,r){
	var movable=[true,true,true,true];	//UP, RIGHT, DOWN, LEFT
	
	for(var i=0;i<squares.length;i++)
		squares[i].setColliding(movable,x,y,r,squares.length);
	
	return movable;
}

function circlesCollide(x1,y1,r1,x2,y2,r2){
	var xDist=x1-x2;
	var yDist=y1-y2;
	return (Math.sqrt(xDist*xDist+yDist*yDist)<r1+r2);
}

function playerZombieCollision(ch,zombieArr){
	for(var i=0;i<zombieArr.length;i++){
		var zombieCh=zombieArr[i].getMovingChar();
		if(circlesCollide(ch.getCenterX(),ch.getCenterY(),ch.getRadius(),zombieCh.getCenterX(),zombieCh.getCenterY(),zombieCh.getRadius()))
			return true;
	}
	return false;
}

function zombieCollision(ch1,ch2){
	var x1=ch1.getTmpCenterX();
	var y1=ch1.getTmpCenterY();
	var x2=ch2.getCenterX();
	var y2=ch2.getCenterY();
	if(circlesCollide(x1,y1,ch1.getRadius(),x2,y2,ch2.getRadius())){
		if(y1<y2)
			ch1.disableMovable(2); //DOWN
		else
			ch1.disableMovable(0); //UP
		if(x1<x2)
			ch1.disableMovable(1);	//RIGHT
		else
			ch1.disableMovable(3);	//LEFT
	}
}