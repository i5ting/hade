'use strict';
var socket = io.connect('127.0.0.1:3025');
var htmlText = '<!DOCTYPE html>\n' +
    '<html lang="en">\n' +
    '  <head>\n' +
    '    <title>Jade</title>\n' +
    '    <script type="text/javascript">\n' +
    '      foo = true;\n' +
    '      bar = function () {};\n' +
    '      if (foo) {\n' +
    '        bar(1 + 5)\n' +
    '      }\n' +
    '    </script>\n' +
    '  </head>\n' +
    '  <body>\n' +
    '    <h1>Jade - node template engine</h1>\n' +
    '    <div id="container" class="col">\n' +
    '      <p>You are amazing</p>\n' +
    '      <p>Jade is a terse and simple\n' +
    '         templating language with a\n' +
    '         strong focus on performance\n' +
    '         and powerful features.</p>\n' +
    '    </div>\n' +
    '  </body>\n' +
    '</html>';
var html2jadeModule, jade2htmlModule;
var activate = function (id, options) {
    var editor, s;
    editor = ace.edit(id);
    s = editor.getSession();
    editor.setTheme('ace/theme/xcode');
    if (options.type === "html") {
        editor.getSession().setMode("ace/mode/html");
    } else if (options.type === "jade") {
        editor.getSession().setMode("ace/mode/jade");
    }
    editor.getSession().setTabSize(2);
    editor.setFontSize("13px")
    editor.getSession().setUseSoftTabs(true);
    editor.renderer.setShowPrintMargin(false);
    editor.renderer.setHScrollBarAlwaysVisible(true);
    editor.renderer.setShowGutter(false);
    editor.setHighlightActiveLine(true);
    if (options.readonly) {
        editor.setReadOnly(true);
    }
    if (options.noActiveLine) {
        editor.setHighlightActiveLine(false);
    }
    return editor;
};

var isHtmlActivate, isJadeActivate, isJadeSetOnchange, isHtmlSetOnchange;
var activate_html2jade = function () {
    var htmlEditor = activate("html_editor", {
        type: "html"
    });

    var jadeEditor = activate("jade_editor", {
        type: "jade",
        noActiveLine: true
    });
    var onchange = function (e) {
      var action = e.action;

      if (isJadeActivate) {
          return false
      }
      var html = htmlEditor.getValue();
      (function(html) {
        convertHtml2Jade(html, function(err, jade) {
          jadeEditor.getSession().setValue(jade);
        });
      })(html);

    };
    isJadeActivate = false;
    isHtmlActivate = true;
    if (!isHtmlSetOnchange) {
        isHtmlSetOnchange = true;
        htmlEditor.getSession().on("change", onchange);
    }

}

var activate_jade2html = function () {
    var jadeEditor = activate("jade_editor", {
        type: "jade"
    });
    var htmlOutput = activate("html_editor", {
        type: "html",
        noActiveLine: true
    });

    var onchange = function () {
        if (isHtmlActivate) {
            return false
        }
        var out,
            input = jadeEditor.getSession().getValue();

        socket.emit('edit jade', input);

    }
    isJadeActivate = true;
    isHtmlActivate = false;
    if (!isJadeSetOnchange) {
        isJadeSetOnchange = true;
        jadeEditor.getSession().on("change", onchange);
    }

}


function init() {
    var body;
    var htmlEditor = activate("html_editor", {
        type: "html"
    });

    var jadeEditor = activate("jade_editor", {
        type: "jade"
    });

    htmlEditor.getSession().setValue(htmlText);

    var html = htmlEditor.getSession().getValue();

    convertHtml2Jade(html);
    socket.on('html2jade', function (jade) {
      jadeEditor.getSession().setValue(jade);
    });
    socket.on('jade2html', function (jade) {
      if (jade.html) {
        htmlEditor.getSession().setValue(jade.html);
        $('.error').removeClass('show')
        $('.error').addClass('hide')
      }

      if (jade.error) {
        $('.error').addClass('show')
        $('.error').removeClass('hide')
        var error = jade.error.replace(/\n/g,'<br>');
        $('.error').html(error)
      }

    });
};


function convertHtml2Jade (html) {
  var bodyless = $('.bodyless').is(':checked');
  socket.emit('edit html', html, bodyless);
}

init()


$("#html_editor textarea").on('focus', activate_html2jade);
$("#jade_editor textarea").on('focus', activate_jade2html);




