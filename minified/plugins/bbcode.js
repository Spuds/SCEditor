/* SCEditor v1.5.4 | (C) 2017, Sam Clarke | sceditor.com/license */

!function(t,e,n){"use strict";var r=t.sceditor,i=r.plugins,l=r.escapeEntities,o=r.escapeUriScheme,s=r.ie,a=s&&s<11,u=r.command.get,c={bold:{txtExec:["[b]","[/b]"]},italic:{txtExec:["[i]","[/i]"]},underline:{txtExec:["[u]","[/u]"]},strike:{txtExec:["[s]","[/s]"]},subscript:{txtExec:["[sub]","[/sub]"]},superscript:{txtExec:["[sup]","[/sup]"]},left:{txtExec:["[left]","[/left]"]},center:{txtExec:["[center]","[/center]"]},right:{txtExec:["[right]","[/right]"]},justify:{txtExec:["[justify]","[/justify]"]},font:{txtExec:function(t){var e=this;u("font")._dropDown(e,t,function(t){e.insertText("[font="+t+"]","[/font]")})}},size:{txtExec:function(t){var e=this;u("size")._dropDown(e,t,function(t){e.insertText("[size="+t+"]","[/size]")})}},color:{txtExec:function(t){var e=this;u("color")._dropDown(e,t,function(t){e.insertText("[color="+t+"]","[/color]")})}},bulletlist:{txtExec:function(e,n){var r="";t.each(n.split(/\r?\n/),function(){r+=(r?"\n":"")+"[li]"+this+"[/li]"}),this.insertText("[ul]\n"+r+"\n[/ul]")}},orderedlist:{txtExec:function(e,n){var r="";t.each(n.split(/\r?\n/),function(){r+=(r?"\n":"")+"[li]"+this+"[/li]"}),i.bbcode.bbcode.get(""),this.insertText("[ol]\n"+r+"\n[/ol]")}},table:{txtExec:["[table][tr][td]","[/td][/tr][/table]"]},horizontalrule:{txtExec:["[hr]"]},code:{txtExec:["[code]","[/code]"]},image:{txtExec:function(t){var e=this;u("image")._dropDown(e,t,function(t,n,r){var i="";n&&(i+=" width="+n),r&&(i+=" height="+r),e.insertText("[img"+i+"]"+t+"[/img]")})}},email:{txtExec:function(t,e){var n=this;u("email")._dropDown(n,t,function(t,r){n.insertText("[email="+t+"]"+(r||e||t)+"[/email]")})}},link:{txtExec:function(t,e){var n=this;u("link")._dropDown(n,t,function(t,r){n.insertText("[url="+t+"]"+(r||e||t)+"[/url]")})}},quote:{txtExec:["[quote]","[/quote]"]},youtube:{txtExec:function(t){var e=this;u("youtube")._dropDown(e,t,function(t){e.insertText("[youtube]"+t+"[/youtube]")})}},rtl:{txtExec:["[rtl]","[/rtl]"]},ltr:{txtExec:["[ltr]","[/ltr]"]}},f=function(t){return t?t.replace(/\\(.)/g,"$1").replace(/^(["'])(.*?)\1$/,"$2"):t},d=function(){var t=arguments;return t[0].replace(/\{(\d+)\}/g,function(e,n){return void 0!==t[n-0+1]?t[n-0+1]:"{"+n+"}"})},h={OPEN:"open",CONTENT:"content",NEWLINE:"newline",CLOSE:"close"},m=function(e,n,r,i,l,o){var s=this;s.type=e,s.name=n,s.val=r,s.attrs=t.extend({},i),s.children=l||[],s.closing=o||null};m.prototype={clone:function(){var t=this;return new m(t.type,t.name,t.val,t.attrs,[],t.closing?t.closing.clone():null)},splitAt:function(t){var e,n=this,r=n.clone(),i=n.children.indexOf(t);return i>-1&&(e=n.children.length-i,r.children=n.children.splice(i,e)),r}};var p=function(e){if(!(this instanceof p))return new p(e);var n,r,o,s,u,c,d,b,g,y,v,E,x,k,T=this;n=function(){T.bbcodes=i.bbcode.bbcodes,T.opts=t.extend({},p.defaults,e)},T.tokenize=function(t){var e,n,i,l=[],o=[{type:h.CLOSE,regex:/^\[\/[^\[\]]+\]/},{type:h.OPEN,regex:/^\[[^\[\]]+\]/},{type:h.NEWLINE,regex:/^(\r\n|\r|\n)/},{type:h.CONTENT,regex:/^([^\[\r\n]+|\[)/}];o.reverse();t:for(;t.length;){for(i=o.length;i--;)if(n=o[i].type,(e=t.match(o[i].regex))&&e[0]){l.push(r(n,e[0])),t=t.substr(e[0].length);continue t}t.length&&l.push(r(h.CONTENT,t)),t=""}return l},r=function(e,n){var r,l,s,a=/\[([^\]\s=]+)(?:([^\]]+))?\]/,u=/\[\/([^\[\]]+)\]/;return e===h.OPEN&&(r=n.match(a))&&(s=x(r[1]),r[2]&&(r[2]=t.trim(r[2]))&&(l=o(r[2]))),e===h.CLOSE&&(r=n.match(u))&&(s=x(r[1])),e===h.NEWLINE&&(s="#newline"),s&&(e!==h.OPEN&&e!==h.CLOSE||i.bbcode.bbcodes[s])||(e=h.CONTENT,s="#"),new m(e,s,n,l)},o=function(t){var e,n=/([^\s=]+)=(?:(?:(["'])((?:\\\2|[^\2])*?)\2)|((?:.(?!\s\S+=))*.))/g,r={};if("="===t.charAt(0)&&t.indexOf("=",1)<0)r.defaultattr=f(t.substr(1));else for("="===t.charAt(0)&&(t="defaultattr"+t);e=n.exec(t);)r[x(e[1])]=f(e[3])||e[4];return r},T.parse=function(t,e){var n=s(T.tokenize(t)),r=T.opts;return r.fixInvalidNesting&&c(n),u(n,null,e),r.removeEmptyTags&&b(n),n},v=function(t,e,n){for(var r=n.length;r--;)if(n[r].type===e&&n[r].name===t)return!0;return!1},d=function(e,n){var r=(e?T.bbcodes[e.name]:{}).allowedChildren;return!T.opts.fixInvalidChildren||!r||t.inArray(n.name||"#",r)>-1},s=function(e){for(var n,r,i,l,o,s,a=[],u=[],c=[],f=function(){return k(c)},m=function(t){f()?f().children.push(t):u.push(t)},p=function(e){return f()&&(r=T.bbcodes[f().name])&&r.closedBy&&t.inArray(e,r.closedBy)>-1};n=e.shift();)switch(s=e[0],d(f(),n)||n.type===h.CLOSE&&f()&&n.name===f().name||(n.name="#",n.type=h.CONTENT),n.type){case h.OPEN:p(n.name)&&c.pop(),m(n),(r=T.bbcodes[n.name])&&!r.isSelfClosing&&(r.closedBy||v(n.name,h.CLOSE,e))?c.push(n):r&&r.isSelfClosing||(n.type=h.CONTENT);break;case h.CLOSE:if(f()&&n.name!==f().name&&p("/"+n.name)&&c.pop(),f()&&n.name===f().name)f().closing=n,c.pop();else if(v(n.name,h.OPEN,c)){for(;i=c.pop();){if(i.name===n.name){i.closing=n;break}l=i.clone(),a.length>1&&l.children.push(k(a)),a.push(l)}for(s&&s.type===h.NEWLINE&&(r=T.bbcodes[n.name])&&!1===r.isInline&&(m(s),e.shift()),m(k(a)),o=a.length;o--;)c.push(a[o]);a.length=0}else n.type=h.CONTENT,m(n);break;case h.NEWLINE:f()&&s&&p((s.type===h.CLOSE?"/":"")+s.name)&&(s.type===h.CLOSE&&s.name===f().name||((r=T.bbcodes[f().name])&&r.breakAfter?c.pop():r&&!1===r.isInline&&T.opts.breakAfterBlock&&!1!==r.breakAfter&&c.pop())),m(n);break;default:m(n)}return u},u=function(t,e,n){var r,i,l,o,s,a,c,f,d=t.length;e&&(o=T.bbcodes[e.name]);for(var m=d;m--;)if(r=t[m])if(r.type===h.NEWLINE){if(i=m>0?t[m-1]:null,l=m<d-1?t[m+1]:null,f=!1,!n&&o&&!0!==o.isSelfClosing&&(i?a||l||(!1===o.isInline&&T.opts.breakEndBlock&&!1!==o.breakEnd&&(f=!0),o.breakEnd&&(f=!0),a=f):(!1===o.isInline&&T.opts.breakStartBlock&&!1!==o.breakStart&&(f=!0),o.breakStart&&(f=!0))),i&&i.type===h.OPEN&&(s=T.bbcodes[i.name])&&(n?!1===s.isInline&&(f=!0):(!1===s.isInline&&T.opts.breakAfterBlock&&!1!==s.breakAfter&&(f=!0),s.breakAfter&&(f=!0))),!n&&!c&&l&&l.type===h.OPEN&&(s=T.bbcodes[l.name])&&(!1===s.isInline&&T.opts.breakBeforeBlock&&!1!==s.breakBefore&&(f=!0),s.breakBefore&&(f=!0),c=f,f)){t.splice(m,1);continue}f&&t.splice(m,1),c=!1}else r.type===h.OPEN&&u(r.children,r,n)},c=function(e,n,r,i){var l,o,s,a,u,f,m=function(t){var e=T.bbcodes[t.name];return!e||!1!==e.isInline};for(n=n||[],i=i||e,o=0;o<e.length;o++)if((l=e[o])&&l.type===h.OPEN){if(r&&!m(l)){if(s=k(n),f=s.splitAt(l),u=n.length>1?n[n.length-2].children:i,d(l,s)){var p=s.clone();p.children=l.children,l.children=[p]}if((a=t.inArray(s,u))>-1){f.children.splice(0,1),u.splice(a+1,0,l,f);var b=f.children[0];return void(b&&b.type===h.NEWLINE&&(m(l)||(f.children.splice(0,1),u.splice(a+2,0,b))))}}n.push(l),c(l.children,n,r||m(l),i),n.pop(l)}},b=function(e){for(var n,r,i=e.length;i--;)(n=e[i])&&n.type===h.OPEN&&(r=T.bbcodes[n.name],b(n.children),function(t){for(var e=t.length;e--;){var n=t[e].type;if(n===h.OPEN||n===h.CLOSE)return!1;if(n===h.CONTENT&&/\S|\u00A0/.test(t[e].val))return!1}return!0}(n.children)&&r&&!r.isSelfClosing&&!r.allowsEmpty&&e.splice.apply(e,t.merge([i,1],n.children)))},T.toHTML=function(t,e){return g(T.parse(t,e),!0)},g=function(e,n){var r,o,s,u,c,f,d,m,p=[];for(d=function(t){return!1!==(!t||(void 0!==t.isHtmlInline?t.isHtmlInline:t.isInline))};e.length>0;)if(r=e.shift()){if(r.type===h.OPEN)m=r.children[r.children.length-1]||{},o=T.bbcodes[r.name],c=n&&d(o),s=g(r.children,!1),o&&o.html?(d(o)||!d(T.bbcodes[m.name])||o.isPreFormatted||o.skipLastLineBreak||a||(s+="<br />"),t.isFunction(o.html)?u=o.html.call(T,r,r.attrs,s):(r.attrs[0]=s,u=i.bbcode.formatBBCodeString(o.html,r.attrs))):u=r.val+s+(r.closing?r.closing.val:"");else{if(r.type===h.NEWLINE){if(!n){p.push("<br />");continue}f||p.push("<div>"),a||p.push("<br />"),e.length||p.push("<br />"),p.push("</div>\n"),f=!1;continue}c=n,u=l(r.val,!0)}c&&!f?(p.push("<div>"),f=!0):!c&&f&&(p.push("</div>\n"),f=!1),p.push(u)}return f&&p.push("</div>\n"),p.join("")},T.toBBCode=function(t,e){return y(T.parse(t,e))},y=function(t){for(var e,n,r,i,l,o,s,a,u,c,f=[];t.length>0;)if(e=t.shift())if(r=T.bbcodes[e.name],i=!(!r||!1!==r.isInline),l=r&&r.isSelfClosing,s=i&&T.opts.breakBeforeBlock&&!1!==r.breakBefore||r&&r.breakBefore,a=i&&!l&&T.opts.breakStartBlock&&!1!==r.breakStart||r&&r.breakStart,u=i&&T.opts.breakEndBlock&&!1!==r.breakEnd||r&&r.breakEnd,c=i&&T.opts.breakAfterBlock&&!1!==r.breakAfter||r&&r.breakAfter,o=(r?r.quoteType:null)||T.opts.quoteType||p.QuoteType.auto,r||e.type!==h.OPEN)if(e.type===h.OPEN){if(s&&f.push("\n"),f.push("["+e.name),e.attrs){e.attrs.defaultattr&&(f.push("=",E(e.attrs.defaultattr,o,"defaultattr")),delete e.attrs.defaultattr);for(n in e.attrs)e.attrs.hasOwnProperty(n)&&f.push(" ",n,"=",E(e.attrs[n],o,n))}f.push("]"),a&&f.push("\n"),e.children&&f.push(y(e.children)),l||r.excludeClosing||(u&&f.push("\n"),f.push("[/"+e.name+"]")),c&&f.push("\n"),e.closing&&l&&f.push(e.closing.val)}else f.push(e.val);else f.push(e.val),e.children&&f.push(y(e.children)),e.closing&&f.push(e.closing.val);return f.join("")},E=function(e,n,r){var i=p.QuoteType,l=/\s|=/.test(e);return t.isFunction(n)?n(e,r):n===i.never||n===i.auto&&!l?e:'"'+e.replace("\\","\\\\").replace('"','\\"')+'"'},k=function(t){return t.length?t[t.length-1]:null},x=function(t){return t.toLowerCase()},n()};p.QuoteType={always:1,never:2,auto:3},p.defaults={breakBeforeBlock:!1,breakStartBlock:!1,breakEndBlock:!1,breakAfterBlock:!0,removeEmptyTags:!0,fixInvalidNesting:!0,fixInvalidChildren:!0,quoteType:p.QuoteType.auto},t.sceditorBBCodePlugin=i.bbcode=function(){var e,l,o,s,u=this;u.bbcodes=i.bbcode.bbcodes,u.stripQuotes=f;var h={},m={},b={ul:["li","ol","ul"],ol:["li","ol","ul"],table:["tr"],tr:["td","th"],code:["br","p","div"]};u.init=function(){u.opts=this.opts,e(),this.commands=t.extend(!0,{},c,this.commands),this.toBBCode=u.signalToSource,this.fromBBCode=u.signalToWysiwyg},e=function(){t.each(u.bbcodes,function(e){var n,r=u.bbcodes[e].tags,i=u.bbcodes[e].styles;r&&t.each(r,function(t,r){n=!1===u.bbcodes[e].isInline,h[t]=h[t]||{},h[t][n]=h[t][n]||{},h[t][n][e]=r}),i&&t.each(i,function(t,r){n=!1===u.bbcodes[e].isInline,m[n]=m[n]||{},m[n][t]=m[n][t]||{},m[n][t][e]=r})})},l=function(e,n,i){var l,o,s=r.dom.getStyle;return i=!!i,m[i]?(t.each(m[i],function(r,i){(l=s(e[0],r))&&s(e.parent()[0],r)!==l&&t.each(i,function(r,i){(!i||t.inArray(l.toString(),i)>-1)&&(o=u.bbcodes[r].format,n=t.isFunction(o)?o.call(u,e,n):d(o,n))})}),n):n},o=function(e,n,i){var l,o,s=e[0],c=s.nodeName.toLowerCase();i=!!i,h[c]&&h[c][i]&&t.each(h[c][i],function(r,i){i&&(l=!1,t.each(i,function(n,r){if(e.attr(n)&&!(r&&t.inArray(e.attr(n),r)<0))return l=!0,!1}),!l)||(o=u.bbcodes[r].format,n=t.isFunction(o)?o.call(u,e,n):d(o,n))});var f=r.dom.isInline;if(i&&(!f(s,!0)||"br"===c)){for(var m,p,b=s.previousSibling;b&&1===b.nodeType&&!t(b).is("br")&&f(b,!0)&&!b.firstChild;)b=b.previousSibling;do{m=(p=s.parentNode).lastChild===s,s=p}while(p&&m&&f(p,!0));(!m||"li"===c||"br"===c&&a)&&(n+="\n"),"br"!==c&&b&&!t(b).is("br")&&f(b,!0)&&(n="\n"+n)}return n},u.signalToSource=function(e,i){var l,o,s=new p(u.opts.parserOptions);return i||(i="string"==typeof e?l=t("<div />").css("visibility","hidden").appendTo(n.body).html(e):t(e)),i&&i.jquery?(r.dom.removeWhiteSpace(i[0]),t(".sceditor-ignore",i).remove(),o=u.elementToBbcode(i),l&&l.remove(),o=s.toBBCode(o,!0),u.opts.bbcodeTrim&&(o=t.trim(o)),o):""},u.elementToBbcode=function(e){var n=function(e,i){var s="";return r.dom.traverse(e,function(e){var r=t(e),u="",c=e.nodeType,f=e.nodeName.toLowerCase(),d=b[f],h=e.firstChild,m=!0;if("object"==typeof i&&(m=t.inArray(f,i)>-1,r.is("img")&&r.data("sceditor-emoticon")&&(m=!0),m||(d=i)),3===c||1===c)if(1===c){if(r.hasClass("sceditor-nlf")&&(!h||!a&&1===e.childNodes.length&&/br/i.test(h.nodeName)))return;"iframe"!==f&&(u=n(e,d)),m?("code"!==f&&(u=l(r,u),u=o(r,u),u=l(r,u,!0)),s+=o(r,u,!0)):s+=u}else s+=e.nodeValue},!1,!0),s};return n(e[0])},u.signalToWysiwyg=function(e,n){var r=new p(u.opts.parserOptions).toHTML(u.opts.bbcodeTrim?t.trim(e):e);return n?s(r):r},s=function(e){var i,l,o,s=t("<div />").hide().appendTo(n.body),u=s[0];return o=function(e,i){if(!r.dom.hasStyling(e)){if(a||1!==e.childNodes.length||!t(e.firstChild).is("br"))for(;l=e.firstChild;)u.insertBefore(l,e);if(i){var o=u.lastChild;e!==o&&t(o).is("div")&&e.nextSibling===o&&u.insertBefore(n.createElement("br"),e)}u.removeChild(e)}},u.innerHTML=e.replace(/<\/div>\n/g,"</div>"),(i=u.firstChild)&&t(i).is("div")&&o(i,!0),(i=u.lastChild)&&t(i).is("div")&&o(i),u=u.innerHTML,s.remove(),u}},i.bbcode.formatBBCodeString=function(t,e){return t.replace(/\{([^}]+)\}/g,function(t,n){var r=!0;return"!"===n.charAt(0)&&(r=!1,n=n.substring(1)),"0"===n&&(r=!1),void 0===e[n]?t:r?l(e[n],!0):e[n]})};var b=function(t){return t=parseInt(t,10),isNaN(t)?"00":(t=Math.max(0,Math.min(t,255)).toString(16),t.length<2?"0"+t:t)},g=function(t){var e;return t=t||"#000",(e=t.match(/rgb\((\d{1,3}),\s*?(\d{1,3}),\s*?(\d{1,3})\)/i))?"#"+b(e[1])+b(e[2]-0)+b(e[3]-0):(e=t.match(/#([0-f])([0-f])([0-f])\s*?$/i))?"#"+e[1]+e[1]+e[2]+e[2]+e[3]+e[3]:t},y={b:{tags:{b:null,strong:null},styles:{"font-weight":["bold","bolder","401","700","800","900"]},format:"[b]{0}[/b]",html:"<strong>{0}</strong>"},i:{tags:{i:null,em:null},styles:{"font-style":["italic","oblique"]},format:"[i]{0}[/i]",html:"<em>{0}</em>"},u:{tags:{u:null},styles:{"text-decoration":["underline"]},format:"[u]{0}[/u]",html:"<u>{0}</u>"},s:{tags:{s:null,strike:null},styles:{"text-decoration":["line-through"]},format:"[s]{0}[/s]",html:"<s>{0}</s>"},sub:{tags:{sub:null},format:"[sub]{0}[/sub]",html:"<sub>{0}</sub>"},sup:{tags:{sup:null},format:"[sup]{0}[/sup]",html:"<sup>{0}</sup>"},font:{tags:{font:{face:null}},styles:{"font-family":null},quoteType:p.QuoteType.never,format:function(t,e){var n;return t.is("font")&&(n=t.attr("face"))||(n=t.css("font-family")),"[font="+f(n)+"]"+e+"[/font]"},html:'<font face="{defaultattr}">{0}</font>'},size:{tags:{font:{size:null}},styles:{"font-size":null},format:function(t,e){var n=t.attr("size"),r=2;return n||(n=t.css("fontSize")),n.indexOf("px")>-1?((n=n.replace("px","")-0)<12&&(r=1),n>15&&(r=3),n>17&&(r=4),n>23&&(r=5),n>31&&(r=6),n>47&&(r=7)):r=n,"[size="+r+"]"+e+"[/size]"},html:'<font size="{defaultattr}">{!0}</font>'},color:{tags:{font:{color:null}},styles:{color:null},quoteType:p.QuoteType.never,format:function(t,e){var n;return t.is("font")&&(n=t.attr("color"))||(n=t[0].style.color||t.css("color")),"[color="+g(n)+"]"+e+"[/color]"},html:function(t,e,n){return'<font color="'+l(g(e.defaultattr),!0)+'">'+n+"</font>"}},ul:{tags:{ul:null},breakStart:!0,isInline:!1,skipLastLineBreak:!0,format:"[ul]{0}[/ul]",html:"<ul>{0}</ul>"},list:{breakStart:!0,isInline:!1,skipLastLineBreak:!0,html:"<ul>{0}</ul>"},ol:{tags:{ol:null},breakStart:!0,isInline:!1,skipLastLineBreak:!0,format:"[ol]{0}[/ol]",html:"<ol>{0}</ol>"},li:{tags:{li:null},isInline:!1,closedBy:["/ul","/ol","/list","*","li"],format:"[li]{0}[/li]",html:"<li>{0}</li>"},"*":{isInline:!1,closedBy:["/ul","/ol","/list","*","li"],html:"<li>{0}</li>"},table:{tags:{table:null},isInline:!1,isHtmlInline:!0,skipLastLineBreak:!0,format:"[table]{0}[/table]",html:"<table>{0}</table>"},tr:{tags:{tr:null},isInline:!1,skipLastLineBreak:!0,format:"[tr]{0}[/tr]",html:"<tr>{0}</tr>"},th:{tags:{th:null},allowsEmpty:!0,isInline:!1,format:"[th]{0}[/th]",html:"<th>{0}</th>"},td:{tags:{td:null},allowsEmpty:!0,isInline:!1,format:"[td]{0}[/td]",html:"<td>{0}</td>"},emoticon:{allowsEmpty:!0,tags:{img:{src:null,"data-sceditor-emoticon":null}},format:function(t,e){return t.data("sceditor-emoticon")+e},html:"{0}"},hr:{tags:{hr:null},allowsEmpty:!0,isSelfClosing:!0,isInline:!1,format:"[hr]{0}",html:"<hr />"},img:{allowsEmpty:!0,tags:{img:{src:null}},allowedChildren:["#"],quoteType:p.QuoteType.never,format:function(t,e){var n,r,i="",l=t[0],o=function(t){return l.style?l.style[t]:null};return t.attr("data-sceditor-emoticon")?e:(n=t.attr("width")||o("width"),r=t.attr("height")||o("height"),(l.complete&&(n||r)||n&&r)&&(i="="+t.width()+"x"+t.height()),"[img"+i+"]"+t.attr("src")+"[/img]")},html:function(t,e,n){var r,i,s,a="";return r=e.width,i=e.height,e.defaultattr&&(r=(s=e.defaultattr.split(/x/i))[0],i=2===s.length?s[1]:s[0]),void 0!==r&&(a+=' width="'+l(r,!0)+'"'),void 0!==i&&(a+=' height="'+l(i,!0)+'"'),"<img"+a+' src="'+o(n)+'" />'}},url:{allowsEmpty:!0,tags:{a:{href:null}},quoteType:p.QuoteType.never,format:function(t,e){var n=t.attr("href");return"mailto:"===n.substr(0,7)?'[email="'+n.substr(7)+'"]'+e+"[/email]":"[url="+n+"]"+e+"[/url]"},html:function(t,e,n){return e.defaultattr=l(e.defaultattr,!0)||n,'<a href="'+o(e.defaultattr)+'">'+n+"</a>"}},email:{quoteType:p.QuoteType.never,html:function(t,e,n){return'<a href="mailto:'+(l(e.defaultattr,!0)||n)+'">'+n+"</a>"}},quote:{tags:{blockquote:null},isInline:!1,quoteType:p.QuoteType.never,format:function(e,n){var r="",i=t(e),l=i.children("cite").first();return(1===l.length||i.data("author"))&&(r=l.text()||i.data("author"),i.data("author",r),l.remove(),n=this.elementToBbcode(t(e)),r="="+r.replace(/(^\s+|\s+$)/g,""),i.prepend(l)),"[quote"+r+"]"+n+"[/quote]"},html:function(t,e,n){return e.defaultattr&&(n="<cite>"+l(e.defaultattr)+"</cite>"+n),"<blockquote>"+n+"</blockquote>"}},code:{tags:{code:null},isInline:!1,allowedChildren:["#","#newline"],format:"[code]{0}[/code]",html:"<code>{0}</code>"},left:{styles:{"text-align":["left","-webkit-left","-moz-left","-khtml-left"]},allowsEmpty:!0,isInline:!1,format:"[left]{0}[/left]",html:'<div align="left">{0}</div>'},center:{styles:{"text-align":["center","-webkit-center","-moz-center","-khtml-center"]},allowsEmpty:!0,isInline:!1,format:"[center]{0}[/center]",html:'<div align="center">{0}</div>'},right:{styles:{"text-align":["right","-webkit-right","-moz-right","-khtml-right"]},allowsEmpty:!0,isInline:!1,format:"[right]{0}[/right]",html:'<div align="right">{0}</div>'},justify:{styles:{"text-align":["justify","-webkit-justify","-moz-justify","-khtml-justify"]},allowsEmpty:!0,isInline:!1,format:"[justify]{0}[/justify]",html:'<div align="justify">{0}</div>'},youtube:{allowsEmpty:!0,tags:{iframe:{"data-youtube-id":null}},format:function(t,e){return t=t.attr("data-youtube-id"),t?"[youtube]"+t+"[/youtube]":e},html:'<iframe width="560" height="315" frameborder="0" src="https://www.youtube.com/embed/{0}?wmode=opaque" data-youtube-id="{0}" allowfullscreen></iframe>'},rtl:{styles:{direction:["rtl"]},isInline:!1,format:"[rtl]{0}[/rtl]",html:'<div style="direction: rtl">{0}</div>'},ltr:{styles:{direction:["ltr"]},isInline:!1,format:"[ltr]{0}[/ltr]",html:'<div style="direction: ltr">{0}</div>'},ignore:{}};i.bbcode.bbcode={get:function(t){return y[t]||null},set:function(e,n){return!(!e||!n)&&(n=t.extend(y[e]||{},n),n.remove=function(){delete y[e]},y[e]=n,this)},rename:function(t,e){return t in y&&(y[e]=y[t],delete y[t],this)},remove:function(t){return t in y&&delete y[t],this}},t.fn.sceditorBBCodePlugin=function(e){return e=e||{},t.isPlainObject(e)&&(e.plugins=(e.plugins||"")+"bbcode"),this.sceditor(e)},i.bbcode.normaliseColour=g,i.bbcode.formatString=d,i.bbcode.stripQuotes=f,i.bbcode.bbcodes=y,r.BBCodeParser=p}(jQuery,window,document);