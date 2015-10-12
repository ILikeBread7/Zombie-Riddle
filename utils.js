function drawRotatedImage(ctx,img,x,y,degree){
		ctx.save();
		ctx.translate(x+img.width/2,y+img.height/2);
		ctx.rotate(degree);
		ctx.drawImage(img,-img.width/2,-img.height/2);
		ctx.restore();
	}

function fill(ctx,color){
	ctx.fillStyle=color;
	ctx.fillRect(0,0,800,600);
}

function exportedMapCode(){
	var s=editor_map_width+";"+editor_map_height+";"+findStart()+";";
	s+=$("#bridges_input").val()+";";
	s+=$("#switches_input").val()+";";
	s+=$("#walls_input").val()+";";
	//s+=$("#thrower_input").val()+";";
	s+="0;";
	s+=$("#fighter_input").val()+";";
	s+=$("#nothing_input").val()+";";
	s+=encodeTiles();
	return s;
}

function readMap(mapNumber){
	var map="";
	$.ajax({
		url:("levels/"+mapNumber),
		dataType:"text",
		async:false,
		success:function(data){
			map=data;
		}
	});
	return map;
}
function getTileName(tile){
	if(tile==0)
		return "floor";
	if(tile==1)
		return "start_point";
	if(tile==2)
		return "finish_point";
	if(tile==3)
		return "open_door";
	if(tile==4)
		return "bridge";
	if(tile==10)
		return "wall";
	if(tile==11)
		return "steel_wall";
	if(tile==12)
		return "switch";
	if(tile==13)
		return "door";
	if(tile==14)
		return "hole";
}
function dist(x1,y1,x2,y2){
	var dx=x1-x2;
	var dy=y1-y2;
	return Math.sqrt(dx*dx+dy*dy);
}
function segmentCircleIntersect(ax,ay,bx,by,cx,cy,r){
	if(dist(ax,ay,cx,cy)<=r || dist(bx,by,cx,cy)<=r)
		return true;
	
	var d=dist(ax,ay,bx,by);
	var alpha=((bx-ax)*(cx-ax)+(by-ay)*(cy-ay))/(d*d);
	var mx=ax+(bx-ax)*alpha;
	var my=ay+(by-ay)*alpha;
	
	if(dist(mx,my,cx,cy)>r)
		return false;
	if(dist(mx,my,ax,ay)<=d && dist(mx,my,bx,by)<=d)
		return true;

	return false;
}