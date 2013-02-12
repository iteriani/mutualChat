TumblrCodeHighlight = function() {
  function requestContent( src ) {
    var script = document.createElement('script');
    script.src = src;
    if (arguments[1]) {
        script.onload = arguments[1];
    }
    document.getElementsByTagName('head')[0].appendChild(script);
  }

  function requestCss( src ) {
    var link = document.createElement('link');
    link.href = src;
    link.type="text/css";
    link.rel="stylesheet";
    if (arguments[1]) {
        link.onload = arguments[1];
    }
    document.getElementsByTagName('head')[0].appendChild(link);
  }

    function cleanAndColor() {
        if (navigator.appName != 'Microsoft Internet Explorer') {
            var codes = document.getElementsByTagName('code');
            for (var i=0; i < codes.length; i++) {
                var p = codes[i];
                p.innerHTML = p.innerHTML.split('\n\n').join('\n');
            }
        }
    };
    
    window.onload = cleanAndColor;

    requestContent('/code_path_course_engine/syntax/code_highlighter.js', function(){
      requestContent('/code_path_course_engine/syntax/html.js');
      requestContent('/code_path_course_engine/syntax/ruby.js', try_to_init_code_highlighter);
    });

};

TumblrCodeHighlight();
