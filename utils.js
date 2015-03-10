function fill(ctx,color){
	ctx.fillStyle=color;
	ctx.fillRect(0,0,800,600);
}
function exportedMapCode(){
	var s=editor_map_width+";"+editor_map_height+";"+findStart()+";";
	s+=$("#bridges_input").val()+";";
	s+=$("#switches_input").val()+";";
	s+=$("#walls_input").val()+";";
	s+=$("#thrower_input").val()+";";
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