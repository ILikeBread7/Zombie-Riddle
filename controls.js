var controls=function(){
	var keys=[false,false,false,false,false];
	return{
		setPressed:function(code){
			switch(code){
				case 38:
				case 87:
					keys[0]=true; break;
				case 68:
				case 39:
					keys[1]=true; break;
				case 40:
				case 83:
					keys[2]=true; break;
				case 65:
				case 37:
					keys[3]=true; break;
			}
		},
		setReleased:function(code){
			switch(code){
				case 38:
				case 87:
					keys[0]=false; break;
				case 68:
				case 39:
					keys[1]=false; break;
				case 40:
				case 83:
					keys[2]=false; break;
				case 65:
				case 37:
					keys[3]=false; break;
			}
		},
		
		keyPressed:function(num){
			return keys[num];
		},
		direction:function(){
			for(var i=0;i<4;i++)
				if(keys[i] && keys[(i+1)%4])
					return i+0.5;
			
			for(var i=0;i<4;i++)
				if(keys[i])
					return i;
				
			return -1;
		}
	}
}();