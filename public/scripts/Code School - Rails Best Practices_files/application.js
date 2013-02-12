((function(){var a,b=function(a,b){return function(){return a.apply(b,arguments)}};a=function(){function a(){this.submit_form=b(this.submit_form,this),this.click_link=b(this.click_link,this)}return a.prototype.linker="a.",a.prototype.track_links=function(a){return a==null&&(a="internal"),this.linker!=null&&this.bind($('a[rel~="'+a+'"]'),"click",this.click_link),this},a.prototype.track_forms=function(a){return a==null&&(a="internal"),this.linker!=null&&this.bind($('form[data-rel~="'+a+'"]'),"submit",this.submit_form),this},a.prototype.bind=function(a,b,c){return a.on!=null?a.on(b,c):a.live(b,c)},a.prototype.click_link=function(a){if(this.link(""+this.linker+"_link",$(a.target).attr("href")))return a.preventDefault()},a.prototype.submit_form=function(a){return this.link(""+this.linker+"_linkByPost",a.target)},a.prototype.link=function(a,b){if(!$.isArray(_gaq))return _gaq.push([a,b]),!0},a}(),$(document).ready(function(){return(new a).track_links().track_forms()})})).call(this);

(function($){

  var methods = {
    
    // ----- Initialize editor, form submission handling
    
    init : function(options) {
      options = $.extend({
        editors: '.editor',
        form: '#editor-form',
        mode: 'ruby',
        theme: 'twilight'
      }, options);
      
      var $this = this;
      
      // Main editor settings
      
      var codeSchoolCourseEditor = function(opts){
        var that = this;
        this.editor = ace.edit(opts.editor);
        this.opts = opts;
        
        var HashHandler = require("ace/keyboard/hash_handler").HashHandler;
        var canon = require('pilot/canon');
        var Mode = require("ace/mode/" + this.opts.mode).Mode;
        var k = new HashHandler({
          "submitform": "Command-Return"
          , 'switchtabright': 'Command-Option-right'
          , 'switchtableft': 'Command-Option-left'
        });
        
        // Firefox: Command-Option-<arrow> or Command-Shift-([])
        // Safari: Command-Shift-([])
        // IE: 
        // Chrome: Command-Option-<arrow> or Command-Shift-([])
        // TextMate: Command-Option-<arrow> or Command-Shift-([])

        this.editor.renderer.setShowGutter(true);
        this.editor.getSession().setTabSize(2);
        this.editor.setKeyboardHandler(k);  
        this.editor.setTheme("ace/theme/" + this.opts.theme);
        this.editor.getSession().setMode(new Mode());
        if(opts.initial_value) {
          this.editor.getSession().setValue(opts.initial_value);
        }

        canon.addCommand({
          name: "submitform",
          exec: function(env, args, request) {
            codeSchoolEditor.submit_form();
          }
        });
        canon.addCommand({
          name: "switchtabright",
          exec: function(env, args, request) {
            codeSchoolEditor.tab_right();
          }
        });
        canon.addCommand({
          name: "switchtableft",
          exec: function(env, args, request) {
            codeSchoolEditor.tab_left();
          }
        });
        canon.addCommand({
          name: "golineup",
          exec: function(env, args, request) { 
            var row = env.editor.getSession().selection.selectionLead.row;
            if(row === 0){
              codeSchoolEditor.trigger_previous_command();
            } else {
              env.editor.navigateUp(args.times); 
            }
          }
        });
        this.code = function(){
          return this.editor.getSession().getValue();
        }
        this.clear = function(){
          this.setCode('');
        }
        this.setCode = function(code){
          this.editor.getSession().setValue(code);
        }
        this.resize_editor = function(){
          this.editor.resize();
        }
        this.focus = function(){
          this.editor.focus();
        }
      }
      
      // Extends main editor settings, handles single or multiple editors

      var multiCodeSchoolCourse = {
        editors: [],
        code_splitter: "\n",
        previous_commands: [],
        currentPosition: -1,
        form: undefined,
        submit_form: function(){
          this.form.submit();
        },
        push_editor: function(editor){
          this.editors.push(editor);
        },
        get_all_code: function(editor){
          return $.map(this.editors, function(editor){
            return editor.code();
          }).join(this.code_splitter);
        },
        trigger_previous_command: function(){
          if(this.previous_commands.length > 0){
            if(this.currentPosition < 0){
              this.currentPosition = this.previous_commands.length - 1;
            }
            this.set_editor_value(this.previous_commands[this.current_position]);
            this.currentPosition = this.currentPosition - 1;
          }
        },
        reset_current_position: function(){
          this.currentPosition = -1;
        },
        push_previous_command: function(code){
          this.previous_commands.push(code);
        },
        clear_editor: function(){
          $.each(this.editors, function(index, editor){
            editor.clear();
          });
        },
        set_editor_value: function(code){
          this.editor.getSession().setValue(code);
        },
        resize_editors: function(){
          $.each(this.editors, function(index, editor){
            editor.resize_editor();
          });
        },
        tab_right: function(){
          var editor_tabs = $('#editor-tabs li a');
          this.tab_over(editor_tabs.length, 0, 1)
        },
        tab_left: function(){
          var editor_tabs = $('#editor-tabs li a');
          
          this.tab_over(-1, editor_tabs.length - 1, -1)
        },
        tab_over: function(tab_stop, wrap_around_index, tab_direction){
          var editor_tabs = $('#editor-tabs li a');
          var active_tab = $('#editor-tabs li a.active');
          var active_index = editor_tabs.index(active_tab)
          var next_index = active_index + tab_direction;
          
          if (next_index === tab_stop) {
            next_index = wrap_around_index;
          }
          
          var next_tab = editor_tabs.eq(next_index);
          var panels = $('.editor-wrap');

          editor_tabs.removeClass('active');
          next_tab.removeClass('unvisited').addClass('active');
          panels.hide().eq(next_index).show();
          this.resize_editors();
        }
        
      };
      window.codeSchoolEditor = multiCodeSchoolCourse;
    
      // For each editor, set up the editor object(s)
    
      $(options.editors).each(function(index, elem){
        var elem = $(elem);
        var editor = new codeSchoolCourseEditor({
          editor: 'editor' + index,
          initial_value: elem.data('initial-value'),
          theme: options.theme,
          mode: options.mode
        });
        codeSchoolEditor.push_editor(editor);
      });
      codeSchoolEditor.form = $(options.form); 
      
      // Bind button handling and loading effect
      
      $this.bind('click.codeSchoolCourse', function() {
        $(options.form).submit();
        return false;
      });
  
      var waiting = false;
  
      $(options.form).submit(function() {
        $('#cmd').val(codeSchoolEditor.get_all_code());
        if (waiting == true) {
          return false;
        } else {
          waiting = true;
          $this.addClass('loading');
        }
      }).bind("ajax:complete", function() {
        waiting = false;
        $this.removeClass('loading');
      });
    },
    
    // ----- Set up resources tabs
    
    tabs : function(options) {
      options = $.extend({
        panels: '.resource-panel'
      }, options);
      
      var $tabs = this;
      var $panels = $(options.panels);
      var active_tab_element = undefined;
      
      if(options.active_tab) {
        active_tab_element = $(options.active_tab);
      }else{
        active_tab_element = $tabs.first();
      }
      
      active_tab_element.addClass('active');
      $panels.not($panels[0]).hide();
    
      $tabs.bind('click.codeSchoolCourse', function() {
        var $tab = $(this);
        $tabs.removeClass('active');
        $tab.addClass('active');
        $panels.hide().eq($tabs.index($tab)).show();
        codeSchoolEditor.resize_editors();
        return false;
      });
    },
    
    // ----- Set up editor tabs, single/double editor functionality, and editor height
    
    editors : function(options) {
      options = $.extend({
        content: '#content',
        editor: '#editor',
        panels: '.editor-wrap',
        split: true,
        splitSingle: '#editor-split-single',
        splitDouble: '#editor-split-double'
      }, options);
      
      var $tabs = this;
      var $panels = $(options.panels);
      var $single = $(options.splitSingle);
      var $double = $(options.splitDouble);
      
      function editorSingle() {
        $tabs.removeClass('active').first().addClass('active').parent().css({width: 'auto'});
        $panels.css({width: '100%', left: 0}).not($panels[0]).hide();
        codeSchoolEditor.resize_editors();

        $tabs.bind('click.codeSchoolCourse', function() {
          var $tab = $(this);
          $tabs.removeClass('active');
          $tab.addClass('active');
          $panels.hide().eq($tabs.index($tab)).show();
          codeSchoolEditor.resize_editors();
          return false;
        });
      }
      
      function editorDouble() {
        $tabs.unbind().addClass('active').first().parent().css({width: '50%'});
        $panels.show().css({width: '50%'}).last().css({left: '50%'});
        codeSchoolEditor.resize_editors();
      }
      
      if(options.split && $tabs.size() > 1) {
        $double.addClass('active');
        editorDouble();
      } else {
        $single.addClass('active');
        editorSingle();
      }
      
      $single.bind('click.codeSchoolCourse', function() {
        $(this).addClass('active').siblings().removeClass('active');
        editorSingle();
        return false;
      });
      
      if ($tabs.size() > 1) {
        $double.bind('click.codeSchoolCourse', function() {
          $(this).addClass('active').siblings().removeClass('active');
          editorDouble();
          return false;
        });
      } else {
        $(options.splitDouble).addClass('disabled');
      }
      
      function editorHeight() {
        var editorHeight = $('body').height() - $(options.content).height() - 40;
        $(options.editor).css('height', editorHeight + 'px');
        codeSchoolEditor.resize_editors();
      }
      editorHeight();
      window.onresize = function(){ editorHeight(); }
    },
    
    // ----- Increases points
    
    points : function(points){
      var total_points = $(this);
      total_points.html(points).addClass('increase');
      setTimeout(function() {total_points.removeClass('increase');},1000);
    },
    
    // ----- Handles hints
    
    hints : function(options){
      var next_link       = $(this);
      var hint_list       = $(options.hint_list);
      var hints_remaining = $(options.hints_remaining);
      var points          = $(options.points);
      
      next_link.bind('click.codeSchoolCourse', function(e) {
        var link = $(this);
        e.preventDefault();
        next_link.addClass('loading');

        $.getJSON(link.attr('href'), function(data){
          next_link.removeClass('loading');
          var li = $('<li/>', {html: data.hint.body});

          if(data.hint.code){
            var pre = $('<pre/>');
            var code = $('<code/>', {
              'class': data.hint.syntax,
              'html': data.hint.code
            }).appendTo(pre);

            pre.appendTo(li);
          }
          li.appendTo(hint_list);
          CodeHighlighter.init();
          
          if(data.hints_remaining == 1){
            hints_remaining.html(data.hints_remaining + ' hint remaining')
          }else{
            hints_remaining.html(data.hints_remaining + ' hints remaining')
          }
          
          // remove the next hint link if there are no more hints
          if(!data.has_more_hints){
            next_link.parent().remove();
          }
          
          // update the amount of possible points for finishing this challenge
          var challenge_points = points;
          challenge_points.html(data.possible_points).addClass('decrease');
          setTimeout(function() {challenge_points.removeClass();},1000);
        });
      });
    },
    
    // ----- Handle error flash messages
    
    errors : function(options) {
      options = $.extend({
        close: '#results-close',
        html: ''
      }, options);
      
      var $this = this;
      $this.html(options.html).slideDown();
      
      $(options.close).live('click', function() {
        $this.fadeOut();
        return false;
      });
      
      $(document).bind('keydown', 'esc', function(e){
        $this.fadeOut();
        $(document).unbind('keydown', 'esc');
        return false;
      });
    },
    
    // ----- Handle success messages / display
    
    success : function(options) {
      options = $.extend({
        html: '',
        next_link: '#next',
        panels: '.resource-panel',
        results_tab: '#resource-results',
        tabs: '#resource-tabs li a'
      }, options);
      
      $('#results').fadeOut();
      $(options.tabs).removeClass('active');
      $(options.results_tab).show().children().addClass('active');
      $(options.panels).hide().last().show();

      $(this).html('').append(options.html);

      $(document).bind('keydown', 'right', function(e){
        document.location.href = $(options.next_link).attr('href');
        $(document).unbind('keydown', 'right');
        return false;
      });
    }
  };
  
  // ----- Set up the namespace, method routing

  $.fn.codeSchoolCourse = function(method) {
    if (methods[method]) {
      return methods[method].apply( this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || ! method) {
      return methods.init.apply(this, arguments);
    } else {
      $.error('Method ' +  method + ' does not exist on jQuery.codeSchoolCourse');
    }
  };
  
})(jQuery);

var FakeAppSupport = {
  set_editor: function(code){
    codeSchoolEditor.set_editor_value(code);
  }
}

// ----- Random functionality

jQuery(function ($){
  
  // notices
  var flash = $('#flash');

  if(flash) {
    flash.slideDown('medium');
    var flashTimer = setTimeout(function() { flash.fadeOut() }, 3000);
    flash.hover(
      function() {
        clearInterval(flashTimer);
      }, 
      function() { 
        flashTimer = setTimeout(function() { flash.fadeOut() }, 3000);
      }
    );
    $('.flash-close').bind('click', function() {
      flash.fadeOut();
      return false;
    });
  }

  if(jQuery().qtip) {
    $('.footer-nav').each(function() {
      $(this).qtip({
        position: {
          corner: {target: 'topMiddle', tooltip: 'bottomMiddle'}
        },
        style: {
          border: {width: 8, radius: 5, color: '#1a1c1e'},
          tip: {color: '#1a1c1e', corner: 'bottomMiddle', size: {x: 20, y: 9}}
        },
        show: 'mouseover',
        content: $(this).parent().children('div').html(),
        hide: {fixed: true}
      });
    });
  }
  
});

// Temporary - update history
  
var insertNewResult = function(cmd, output){
  if($('#code-latest').length === 0){
    var current_div = $('<div></div>').attr('id', 'code-latest');
    $('#output').append(current_div);
  } else {
    var current_div = $('#code-latest');
    if($('#code-history').length === 0){
      var history_div = $('<div></div>').attr('id', 'code-history');
      $('#output').prepend(history_div);
    } else {
      var history_div = $('#code-history');
    }
    history_div.append(current_div.html());
  }
  current_div.empty();
  var strong = $('<strong></strong>').append('=> ').append(output);
  current_div.append($('<p></p>').append('&gt; ').append(cmd).append('<br/>').append(strong));
}
