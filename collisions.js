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