"use strict";
var divMargin = 750;
var portalDivs = ['div1', 'div2'];
window.onscroll = function() {update()};
window.onresize = function() {update()};
window.onload = function() {update()};

function about() {
	EPPZScrollTo.scrollVerticalToElementById('div2', 0);
}

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

/**
 *
 * Created by Borbás Geri on 12/17/13
 * Copyright (c) 2013 eppz! development, LLC.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */

var EPPZScrollTo =
{
    /**
     * Helpers.
     */
    documentVerticalScrollPosition: function()
    {
        if (self.pageYOffset) return self.pageYOffset; // Firefox, Chrome, Opera, Safari.
        if (document.documentElement && document.documentElement.scrollTop) return document.documentElement.scrollTop; // Internet Explorer 6 (standards mode).
        if (document.body.scrollTop) return document.body.scrollTop; // Internet Explorer 6, 7 and 8.
        return 0; // None of the above.
    },

    viewportHeight: function()
    { return (document.compatMode === "CSS1Compat") ? document.documentElement.clientHeight : document.body.clientHeight; },

    documentHeight: function()
    { return (document.height !== undefined) ? document.height : document.body.offsetHeight; },

    documentMaximumScrollPosition: function()
    { return this.documentHeight() - this.viewportHeight(); },

    elementVerticalClientPositionById: function(id)
    {
        var element = document.getElementById(id);
        var rectangle = element.getBoundingClientRect();
        return rectangle.top;
    },

    /**
     * Animation tick.
     */
    scrollVerticalTickToPosition: function(currentPosition, targetPosition)
    {
        var filter = 0.1;
        var fps = 60;
        var difference = parseFloat(targetPosition) - parseFloat(currentPosition);

        // Snap, then stop if arrived.
        var arrived = (Math.abs(difference) <= 0.5);
        if (arrived)
        {
            // Apply target.
            scrollTo(0.0, targetPosition);
            return;
        }

        // Filtered position.
        currentPosition = (parseFloat(currentPosition) * (1.0 - filter)) + (parseFloat(targetPosition) * filter);

        // Apply target.
        scrollTo(0.0, Math.round(currentPosition));

        // Schedule next tick.
        setTimeout("EPPZScrollTo.scrollVerticalTickToPosition("+currentPosition+", "+targetPosition+")", (1000 / fps));
    },

    /**
     * For public use.
     *
     * @param id The id of the element to scroll to.
     * @param padding Top padding to apply above element.
     */
    scrollVerticalToElementById: function(id, padding)
    {
        var element = document.getElementById(id);
        if (element == null)
        {
            console.warn('Cannot find element with id \''+id+'\'.');
            return;
        }

        var targetPosition = this.documentVerticalScrollPosition() + this.elementVerticalClientPositionById(id) - padding;
        var currentPosition = this.documentVerticalScrollPosition();

        // Clamp.
        var maximumScrollPosition = this.documentMaximumScrollPosition();
        if (targetPosition > maximumScrollPosition) targetPosition = maximumScrollPosition;

        // Start animation.
        this.scrollVerticalTickToPosition(currentPosition, targetPosition);
    }
};


