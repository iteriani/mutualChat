/*********************************************************
 *                                                       *
 *                 VIDDLER.COM Scripting                 *
 *		            v 1.1, 2006-12-20                    *
 *                                                       *
 *********************************************************/


// Helper function - should not be accessed from outside of this file
// Returns swf object with given ID/name
// 	movieName 	id in OBJECT tag, name in EMBED tag
function viddlerGetMovie(movieName) {
    if (movieName) {
		if (navigator.appName.indexOf("Microsoft") != -1) {
		    	return window[movieName];
		} else {
			return document[movieName];
		}
	} else {
	  var temp=viddlerGetMovie('viddler');
	  var temp2=viddlerGetMovie('viddler1');
	  if (temp) {
	    return temp
	  } else if (temp2) {
	    return temp2;
	  }
	  return alert('Movie not found');
	}
}

//alias to viddlerSeek looks for viddler or viddler1 movie id
function pointInMovie(offset) {
  viddlerSeek(offset);
}

//Seeks movie to given second
//Could have to two invocations:
// with one arg : arg1 ; it will look for viddler or viddler1 movie id and skips to its arg1 second
// with two args : arg1, arg2 ; it will look for arg1 movie id and skips to its arg2 second
function viddlerSeek(arg1,arg2) {
    if (arguments.length>1) {
	  var mv = viddlerGetMovie(arg1);
  	  mv.viddlerSeek(arg2);
	} else {
	  var mv = viddlerGetMovie();
   	  mv.viddlerSeek(arg1);
	}
}

//Pause movie to given second
function viddlerPause() {
 var mv = viddlerGetMovie();
 mv.viddlerPause();
}

//Tells the movie to move playehad to n seconds,
//and to play the movie whose key is specified
//Could have to two invocations:
// with two arg : arg1, arg2 ; it will look for viddler or viddler1 movie id and open video with key arg1 go to arg2 second
// with three args : arg1, arg2, arg3 ; it will look for viddler or viddler1 movie id and open video with key arg2 and go to arg3 second
function viddlerOpen(arg1,arg2,arg3) {
    if (arguments.length>2) {
	  var mv = viddlerGetMovie(arg1);
	  mv.viddlerOpen(arg2, arg3);
	} else {
	  var mv = viddlerGetMovie();
	  mv.viddlerOpen(arg1, arg2);
	}
}

function viddlerOpenSecret(playerid,key,offset,secretCode) {
	var mv = viddlerGetMovie(playerid);
  mv.viddlerOpen(key,offset,secretCode);
}

//Tells the "movieName" movie to move playehad to "offset" seconds,
//and to play the movie whose username and videoNr are specified
//Could have to two invocations:
// with three arg : arg1, arg2, arg3 ; it will look for viddler or viddler1 movie id and switch its content to video number arg2 from user arg1 and go to arg3 second
// with four args : arg1, arg2, arg3, arg4 ; it will look for viddler or viddler1 movie id and switch its content to video number arg3 from user arg2 and go to arg4 second
function viddlerSwitch(arg1,arg2,arg3,arg4) {
    if (arguments.length>3) {
	  var mv = viddlerGetMovie(arg1);
	  mv.viddlerSwitch(arg2, arg3, arg4);
	} else {
	  var mv = viddlerGetMovie();
	  mv.viddlerSwitch(arg1, arg2, arg3);
	}
}

function viddlerSwitchSecret(playerid,username,videoNr,offset,secretCode) {
	var mv = viddlerGetMovie(playerid);
  mv.viddlerSwitch(username,videoNr,offset,secretCode);
}