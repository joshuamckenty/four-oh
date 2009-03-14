/*
	HUMANIZED MESSAGES 1.0
	idea - http://www.humanized.com/weblog/2006/09/11/monolog_boxes_and_transparent_messages
	home - http://humanmsg.googlecode.com
	Massacred by JMcKenty to make it work across browser context (from chrome to content)
*/

var gzon_humanMsg = {
	setup: function(appendTo, logName, msgOpacity, doc) {
		gzon_humanMsg.msgID = 'gzon_humanMsg';
		gzon_humanMsg.logID = 'gzon_humanMsgLog';
    gzon_humanMsg.doc = doc;
		// appendTo is the element the msg is appended to
		if (appendTo == undefined)
			appendTo = 'body';

		// The text on the Log tab
		if (logName == undefined)
			logName = 'Message Log';

		// Opacity of the message
		gzon_humanMsg.msgOpacity = .8;

		if (msgOpacity != undefined) 
			gzon_humanMsg.msgOpacity = parseFloat(msgOpacity);

		// Inject the message structure
		fouroh_controller.jQuery(appendTo, doc).append(fouroh_controller.jQuery('<div id="'+gzon_humanMsg.msgID+'" style="display: none; opacity: 0;" class="gzon_humanMsg"><div class="round"></div><p></p><div class="round"></div></div> <div id="'+gzon_humanMsg.logID+'"><p>'+logName+'</p><ul></ul></div>', doc))
		
		fouroh_controller.jQuery('#'+gzon_humanMsg.logID+' p', doc).click(
			function() { fouroh_controller.jQuery(this).siblings('ul').slideToggle() }
		)
	},

	displayMsg: function(msg) {
		if (msg == '')
			return;

		clearTimeout(gzon_humanMsg.t2);

		// Inject message
		fouroh_controller.jQuery('#'+gzon_humanMsg.msgID+' p', gzon_humanMsg.doc).empty();
		fouroh_controller.jQuery('#'+gzon_humanMsg.msgID+' p', gzon_humanMsg.doc).append(fouroh_controller.jQuery(msg, gzon_humanMsg.doc))
	
		// Show message
		// alert("about to show msg");
		fouroh_controller.jQuery('#'+gzon_humanMsg.msgID+'', gzon_humanMsg.doc).show().animate({ opacity: gzon_humanMsg.msgOpacity}, 200, null);
		// alert("showed msg");
		/*
		.animate({ opacity: gzon_humanMsg.msgOpacity}, 200, function() {
			fouroh_controller.jQuery('#'+gzon_humanMsg.logID, gzon_humanMsg.doc)
				.show().children('ul').prepend('<li>'+msg+'</li>')	// Prepend message to log
				.children('li:first').slideDown(200)				// Slide it down
		
			if ( fouroh_controller.jQuery('#'+gzon_humanMsg.logID+' ul', gzon_humanMsg.doc).css('display') == 'none') {
				fouroh_controller.jQuery('#'+gzon_humanMsg.logID+' p', gzon_humanMsg.doc).animate({ bottom: 40 }, 200, 'linear', function() {
					fouroh_controller.jQuery(this).animate({ bottom: 0 }, 300, 'easeOutBounce', function() { fouroh_controller.jQuery(this).css({ bottom: 0 }) })
				})
			}
			
		})
		*/

		// Watch for mouse & keyboard in .5s
		gzon_humanMsg.t1 = setTimeout("gzon_humanMsg.bindEvents()", 700)
		// Remove message after 5s
		gzon_humanMsg.t2 = setTimeout("gzon_humanMsg.removeMsg()", 10000)
	},

	bindEvents: function() {
	// Remove message if mouse is moved or key is pressed
		fouroh_controller.jQuery(gzon_humanMsg.doc.defaultView)
			.mousemove(gzon_humanMsg.removeMsg)
			.click(gzon_humanMsg.removeMsg)
			.keypress(gzon_humanMsg.removeMsg)
	},

	removeMsg: function() {
		// Unbind mouse & keyboard
		fouroh_controller.jQuery(gzon_humanMsg.doc.defaultView)
			.unbind('mousemove', gzon_humanMsg.removeMsg)
			.unbind('click', gzon_humanMsg.removeMsg)
			.unbind('keypress', gzon_humanMsg.removeMsg)

		// If message is fully transparent, fade it out
		if (fouroh_controller.jQuery('#'+gzon_humanMsg.msgID, gzon_humanMsg.doc).css('opacity') == gzon_humanMsg.msgOpacity)
			fouroh_controller.jQuery('#'+gzon_humanMsg.msgID, gzon_humanMsg.doc).animate({ opacity: 0 }, 500, function() { fouroh_controller.jQuery(this).hide() })
	}
};