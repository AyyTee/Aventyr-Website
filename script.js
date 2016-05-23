"use strict";
var divMargin = 750;
var portalDivs = ['div1', 'div2'];
window.onscroll = function() {update()};
window.onresize = function() {update()};
window.onload = function() {update()};

function update() {

	for (var i = 0; i < 2; i++)
	{
		var center = screenCenter();
		var screenCoords = screenCoordinates(100);
		var div = portalDivs[i];
		var portal = getPortalPosition(i);
		
		var v0 = portal.left.subtract(center).scale(100);
		v0 = v0.add(portal.left);
		var v1 = portal.right.subtract(center).scale(100);
		v1 = v1.add(portal.right);
		
		var vecArray = [portal.left, portal.right, v1, screenCoords.bottomRight, screenCoords.bottomLeft, v0];
		
		var offset = cumulativeOffset(document.getElementById(div));
		for (var j = 0; j < vecArray.length; j++) {
			vecArray[j].y -= offset.y;
		}

		var paddingText = 'padding-top: ' + divMargin/2 + 'px; ';
		var backgroundColorText = 'background-color: rgba(0, 0, ' + (100 * (i + 1)) + ', 1); ';
		var styleText = paddingText + '\
		color: white; \
		height: 100%; \
		width: 100%;' + backgroundColorText;

		var clipPathText = '-webkit-clip-path: polygon(';
		//clipPathText += vectorArrayToStyle(vecArray) + '); clip-path: inset(0px 0px 0px 0px);';
		clipPathText += vectorArrayToStyle(vecArray) + ');';
		styleText += clipPathText;

		document.getElementById(div).style.cssText = styleText;
	}
}

function screenCenter() {
	var v = getScreenSize();
	return new Vector2(
		v.x/2,
		scrollPos() + v.y/2
		);
}

function scrollPos() {
	return document.body.scrollTop;
}

function screenCoordinates(margin) {
	var v = getScreenSize();
	var tl = new Vector2(-margin, scrollPos() - margin);
	var tr = new Vector2(v.x + margin, scrollPos() - margin);
	var bl = new Vector2(-margin, scrollPos() + v.y + margin);
	var br = new Vector2(v.x + margin, scrollPos() + v.y + margin);
	return { topLeft: tl, topRight: tr, bottomLeft: bl, bottomRight: br };
}

function getPortalPosition(portalIndex) {
	var div = portalDivs[portalIndex];
	var y = cumulativeOffset(document.getElementById(div)).y + divMargin/2;
	var portalWidth = getScreenSize().x * 0.18;
	var center = screenCenter();
	var vLeft = new Vector2(center.x - portalWidth/2, y);
	var vRight = new Vector2(center.x + portalWidth/2, y);
	return {left:vLeft, right:vRight}; 
}

function vectorArrayToStyle(vectorArray) {
	var string = '';
	for (var i = 0; i < vectorArray.length; i++)
	{
		string += vectorArray[i].x + 'px ' + vectorArray[i].y + 'px';
		if (i < vectorArray.length - 1)
		{
			string += ', ';
		}
	}
	return string;
}

function Vector2(x, y) {
	this.x = x;
	this.y = y;
	
	this.add = function(vector) {
		return new Vector2(this.x + vector.x, this.y + vector.y);
	}
	this.subtract = function(vector) {
		return new Vector2(this.x - vector.x, this.y - vector.y);
	}
	this.length = function() {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}
	this.multiply = function(vector) {
		return new Vector2(this.x * vector.x, this.y * vector.y);
	}
	this.scale = function(scalar) {
		return new Vector2(this.x * scalar, this.y * scalar);
	}
}

var cumulativeOffset = function(element) {
    var v = new Vector2(0, 0);
    do {
        v.y += element.offsetTop  || 0;
        v.x += element.offsetLeft || 0;
        element = element.offsetParent;
    } while(element);

    return v;
};

function getScreenSize() {
	var w = window;
	var d = document;
	var e = d.documentElement;
	var g = d.getElementsByTagName('body')[0];
	var x = w.innerWidth || e.clientWidth || g.clientWidth;
	var y = w.innerHeight || e.clientHeight || g.clientHeight;
	return new Vector2(x - 20, y);
}

