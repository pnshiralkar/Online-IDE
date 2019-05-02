/*
 * Copyright (c) 2018, OnlineGDB
 * 
 * Distribution and reproduction of this source code/software without written 
 * permission of OnlineGDB is prohibited.
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */
/* Editor : will handle file tabs and panes. 
1. Add new file editor
2. Get files
3. Add breakpoints 
4. Goto File:Line 

Filenames: 
1. Should be unique. (for now, when directory structer is introduced, this reposibility will be given to directory handler)
2. As per linux standard
*/

function createNewEvent(eventName) {
    var event = null;
    if(typeof(Event) === 'function') {
        event = new Event(eventName);
    }else{
        event = document.createEvent('Event');
        event.initEvent(eventName, true, true);
    }
    return event;
}

function getModeForFileName(filename, default_lang_mode){
    var ext = filename.substr(filename.lastIndexOf('.') + 1);
    
    var mode = null;
    switch(ext.toLowerCase()){
        case 'c':
        case 'cc':
        case 'h':
        case 'hpp':
        case 'cpp': mode = "ace/mode/c_cpp";break;
        case 'py':
        mode = 'ace/mode/python'; break;
        case 'java':
        mode = 'ace/mode/java'; break;
        case 'cs':
        mode = 'ace/mode/csharp'; break;
        case 'vb':
        mode = 'ace/mode/vbscript'; break;
        case 'php':
        mode = 'ace/mode/php'; break;
        case 'rb':
        mode = 'ace/mode/ruby'; break;
        case 'swift':
        mode = 'ace/mode/swift'; break;
        case 'pl':
        mode = 'ace/mode/perl'; 
        if(default_lang_mode.indexOf("prolog")>-1)
            mode = 'ace/mode/prolog';
        break;
        case 'js':
        mode = 'ace/mode/javascript'; break;
        case 'sql':
        mode = 'ace/mode/sql'; break;
        case 'pas':
        mode = 'ace/mode/pascal'; break;
        case 'f95':
        mode = 'ace/mode/fortran'; break;
        case 'hs':
        mode = 'ace/mode/haskell'; break;
        case 'm':
        mode = 'ace/mode/objectivec'; break;
        case 'S':
        mode = 'ace/mode/assembly_x86'; break;
        case 'html':
        mode = 'ace/mode/html'; break;
        case 'js':
        mode = 'ace/mode/javascript'; break;
        case 'css':
        mode = 'ace/mode/css'; break;
        case 'xml':
        mode = 'ace/mode/xml'; break;
    }
    if(mode==null) mode = default_lang_mode;

    return mode;
}

function get_os(){
    var OSName="Unknown OS";
    if (navigator.appVersion.indexOf("Win")!=-1) OSName="Windows";
    else if (navigator.appVersion.indexOf("Mac")!=-1) OSName="MacOS";
    else if (navigator.appVersion.indexOf("X11")!=-1) OSName="UNIX";
    else if (navigator.appVersion.indexOf("Linux")!=-1) OSName="Linux";
    return OSName;
}
function is_mac_os(){
    return get_os()=="MacOS"?true:false;
}

(function ($) {
    'use strict';

    var Range = ace.require('ace/range').Range; 
    function Editor(options){
        //var selector_id = options.id;
        var target = options.target;

        var editors = [];
        var markers = [];
        var new_editor_callback = null;
        var ed_theme = options.theme ? options.theme : "ace/theme/idle_fingers";
        var ed_fontsize = options.fontsize ? options.fontsize : 'medium';
        var ed_langmode = options.langmode ? options.langmode : "ace/mode/c_cpp";
        var ed_tabsize = options.tabsize ? options.tabsize : 4;
        var socket = options.socket ? options.socket : null;
    
        //var cb_add_breakpoint = options.null;
        //var cb_remove_breakpoint = null;

        var init = function(){
            target.find(".editor").each(
                function(){
                    init_single_editor(this.id);
                }
            );

            get_tabs_target().find('a[data-toggle="tab"]').on('shown.bs.tab', function(e){
                file_tab_shown_handler(e);
            });
        };

        var file_tab_shown_handler = function(e){
            var target = $(e.target).attr("href");
            console.log(target);
            if(target.indexOf("editor")>-1){
                console.log("editor focused:",target);
                ide.editor.resizeAndFocus(target.split("#")[1], 1);
            }
        }

        function init_single_editor(id_selector){
            var editor = ace.edit(id_selector);

            //default config parameters 
            editor.getSession().setTabSize(ed_tabsize);
            editor.setFontSize(ed_fontsize);
            editor.setTheme(ed_theme);
            editor.getSession().setMode(getModeForFileName(get_file_name(id_selector), ed_langmode));
            if(is_mac_os()){
                editor.commands.bindKey("Ctrl-P", "golineup");
            }
            // enable autocompletion and snippets
            editor.setOptions({
                enableBasicAutocompletion: true,
                enableSnippets: true,
                enableLiveAutocompletion: true
            });
            
            //bind menu item handler
            bind_tab_menu_item_hanlder(id_selector);

            //enable adding breakpoints via mouseclick
            editor.on("guttermousedown", function(e){guttermousedown_handler(e);}); 
            editors[id_selector] = editor;
            if(new_editor_callback){
                new_editor_callback(editor);
            }
            /*
            editor.addBreakpoint = function(line, breaknumber) {
                if(!editor.breakpointList){
                    editor.breakpointList = [];
                }
                editor.breakpointList[breaknumber] = line;
        }*/
        }

        /* Private methods */
        var get_tabs_target = function(){
            return target.find(".editor_file_tabs");
        }

        var get_panes_target = function(){
            return target.find(".editor_text_panes");
        }

        var add_file_tab = function(id,filename){
            filename = filename || "untitled";
            filename = filename.trim();
            var html = "<li><a href=\"#"+id+"\" data-toggle=\"tab\"><span class=\"filename\">"
            +filename+"</a>"+
            "<div class=\"dropdown\">"+
                        "<span class=\"dropbtn glyphicon glyphicon-option-vertical\"></span>"+
                        "<div class=\"dropdown-content\" style=\"left:-50px;\">"+
                            "<a href=\"#\" class=\"menu_item menu_item_rename\">Rename</a>"+
                            "<a href=\"#\" class=\"menu_item menu_item_delete\">Delete</a>"+
                        "</div>"+
                        "</div>"+
            "</li>";
            get_tabs_target().append(html);
        }

        var bind_tab_menu_item_hanlder = function(eid){
            get_tabs_target().find('a[href="#'+eid+'"]').parent()
            .find('.menu_item_rename').on('click', function(){
                file_rename_popup(eid);
            });
            get_tabs_target().find('a[href="#'+eid+'"]').parent()
            .find('.menu_item_delete').on('click', function(){
                file_delete_popup(eid);
            });
        }

        var handle_edit_file_input = function(event, eid){
            console.log("handle_edit_file_input:",eid);
            var filename = g_renamefilemodal_get_edit_filename();
            var invalid_filename = is_invalid_filename(filename);
            if(invalid_filename){
                g_renamefilemodal_error_message(invalid_filename);
                return;
            }
            set_file_name(eid, filename);
            g_renamefilemodal_hide();
        }

        var file_rename_popup = function(eid){
            g_renamefilemodal_popup(
                {default_name:get_file_name(eid), title:"Rename File"},
                handle_edit_file_input,eid);
            /*
            console.log("file_rename_popup:",eid);
            $("#edit_file_name").val(get_file_name(eid));
            
            $("#edit_file_name").off('keypress').keypress(function(event){
                var key = event.which;
                if(key == 13){
                    event.preventDefault();
                    handle_edit_file_input(event, eid);
                    return false;
                }
            });

            $("#renameFileModal .modal-body .btn-ok").off("click").on('click', function(e){                
                handle_edit_file_input(e, eid);
            });
            
            $("#renameFileModal .error_message").text("");
            $("#renameFileModal").modal("show");
            $('#renameFileModal').off('shown.bs.modal').on('shown.bs.modal', function() {
                $("#edit_file_name").focus();
            });
            */
        }

        var file_delete_popup = function(eid){
            $("#delete_file_name").text(get_file_name(eid));
            $("#deleteFileModal .modal-body .btn-ok").off("click").on('click', function(e){                
                handle_delete_file(e, eid);
            });
            $("#deleteFileModal").modal("show");
        }

        var handle_delete_file = function(event, eid){
            delete_file(eid);
            $("#deleteFileModal").modal("hide");
        }

        function delete_file(eid){
            delete editors[eid];
            var focus_tab = null;
            var prev_tab = get_tabs_target().find('a[href="#'+eid+'"]').parent().prev();
            var next_tab = get_tabs_target().find('a[href="#'+eid+'"]').parent().next();

            focus_tab = next_tab.length ? next_tab : prev_tab;

            get_tabs_target().find('a[href="#'+eid+'"]').parent().remove();
            get_panes_target().find('#'+eid).remove();
            if(focus_tab){
                focus_tab.find('a').tab('show');
            }
        }
        var add_text_pane = function(id){
            var html = "<div class=\"tab-pane active editor\" \
            style=\"position: absolute;\   width:100%;    top: 52px;    bottom: 0px;\"\
            id=\""+id+"\"></div>";
            get_panes_target().append(html);
        }

        var get_file_name = function(eid){
            return get_tabs_target().find('a[href="#'+eid+'"] .filename').text();
        }

        var set_file_name = function(eid, filename){
            get_tabs_target().find('a[href="#'+eid+'"] .filename').text(filename);
        }

        var get_file_content = function(eid){
            return editors[eid].getValue();
        }

        var find_editor_by_filename = function(filename){
            for(var eid in editors){
                if(get_file_name(eid)==filename)
                    return editors[eid];
            }
            return null;
        }

        var find_editor_by_fileLine = function(fileline){
            if(fileline instanceof FileLine){
                return find_editor_by_filename(fileline.filename);
            }else{
                throw "Not an instance of FileLine";
            }
        }
        
        var is_valid_filename = function(filename){
            if(filename.indexOf('/')>-1) return false;
            return true;
        }

        var new_editor_helper = function(filename){
            if(typeof filename !== 'string') throw "Invalid filename";

            var new_id = '_editor_' + Math.ceil(Math.random() * 999999999) + 1;
            add_file_tab(new_id, filename);
            add_text_pane(new_id);
            init_single_editor(new_id);
            get_tabs_target().find('a[href="#'+new_id+'"]').tab('show');
            get_tabs_target().find('a[data-toggle="tab"]').on('shown.bs.tab', function(e){
                file_tab_shown_handler(e);
            });
            return new_id;
        }

        function is_invalid_filename(filename) {
            if(filename==""){
                return "Please enter a filename.";
            }else if(filename.trim()==""){
                return "Filename shouldn't contain only whitespace.";
            }else if(!is_valid_filename(filename)){
                return "'/' isn't allowed in filename.";
            }else if(if_file_exists(filename)){
                return "File already exists. Please choose different name";
            }
            return false;
        }

        function handle_new_file_input(e){
            var filename = $("#new_file_name").val();
            var invalid_filename = is_invalid_filename(filename);
            if(invalid_filename){
                $("#newFileModal .error_message").text(invalid_filename);
                return;
            }
            $("#newFileModal").modal("hide");
            new_editor_helper(filename);
        }

        var pop_up_new_file_modal = function(){
            $("#new_file_name").off('keypress').keypress(function(event){
                var key = event.which;
                if(key == 13){
                    event.preventDefault();
                    handle_new_file_input(event);
                    return false;
                }
            });

            $("#newFileModal .modal-body .btn-ok").off('click').on('click', function(e){                
                handle_new_file_input(e);
            });
            
            $("#newFileModal .error_message").text("");
            $("#new_file_name").val("untitled");
            $("#newFileModal").modal("show");
            $("#newFileModal").off('shown.bs.modal').on('shown.bs.modal', function() {
                $("#new_file_name").focus();
                $("#new_file_name").select();
            })
        }

        var new_editor = function(filename){
            var new_file_name=null;
            if(typeof filename === 'string')
                new_file_name = filename;

            if(new_file_name)
                return new_editor_helper(new_file_name);
            else {
                pop_up_new_file_modal();
            }
            return null;
        }

        var get_file = function(eid){
            var file = {};

            file.name = get_file_name(eid);
            file.content = get_file_content(eid);

            return file;
        }

        var set_file = function(file){
            var editor = find_editor_by_filename(file.name);
            if(!editor){
                //create new editor
                var eid = new_editor(file.name);
                editor = editors[eid];
            }
            editor.setValue(file.content);
            editor.gotoLine(1,0,false);
        }
        var get_eid = function(filename){
            for(var eid in editors){
                if(get_file_name(eid)==filename)
                    return eid;
            }
        }

        var if_file_exists = function(filename) {
            for(var eid in editors){
                if(get_file_name(eid)==filename)
                    return true;
            }
            return false;
        }

        var get_marker_key = function(fileline, classname, type){
            return ""+fileline.filename+":"+fileline.line+"_"+classname+"_"+type;
        }

        //Gutter handler for inserting/removig breakpoint
        function guttermousedown_handler(e){
            //var Range = ace.require('ace/range').Range;

            var target = e.domEvent.target; 
            if (target.className.indexOf("ace_gutter-cell") == -1) 
                return; 

            if (e.clientX > 25 + target.getBoundingClientRect().left) 
                return; 

            var row = e.getDocumentPosition().row 
            var editor = target;
            var eid = null;
            console.log(target);
            while($(editor) && $(editor).attr('class').indexOf("editor") == -1)
                editor = $(editor).parent();

            if($(editor) && $(editor).attr('class').indexOf("editor")){
                eid = $(editor).attr("id");
            }

            if(eid){
                if (target.className.indexOf("ace_breakpoint") == -1){
                    //Set brekpoint in editor gui
                    editors[eid].getSession().setBreakpoint(row);

                    //Trigger event to notify breakpoint is set
                    var filename = get_file_name(eid);
                    var event = createNewEvent('breakpoint_set');

                    event.breakpoint = new Breakpoint(filename, row+1);
                    dispatchEvent(event);
                }
                else{
                    //Unset breakpoint in editor gui
                    editors[eid].getSession().clearBreakpoint(row);

                    //Trigger event to notify breakpoint is set
                    var filename = get_file_name(eid);
                    var event = createNewEvent('breakpoint_unset');

                    event.breakpoint = new Breakpoint(filename, row+1);
                    dispatchEvent(event);
                }
            }else{
                throw "Couldn't find editor DOM through ace_gutter";
            }

            e.stop();
        }
        
        this.addEventListener = function(event, callback, useCapture){
            useCapture = useCapture || false;
            addEventListener(event, callback, useCapture);
        }

        /* Public methods */
        this.new_editor = function(){
            return new_editor();
        }

        /* Returns true if files are same with editor */
        this.compare_file = function(file){
            var editor_file = this.get_file_by_name(file.name);
            if(!editor_file) return false;
            return editor_file.content==file.content;
        }

        this.get_file_by_name = function(filename){
            var eid = get_eid(filename);
            if(eid){
                return get_file(eid);
            }
            return null;
        }

        this.get_files = function(){
            var files = [];
            for(var eid in editors){
                files.push(get_file(eid));
            }
            //console.log(JSON.stringify(files));
            return files;
        }

        this.clear_all_editors = function(){
            get_tabs_target().html("");
            get_panes_target().html("");
        }


        this.set_files = function(files){            
            for(var i=0; i<files.length; i++){
                set_file(files[i]);
            }
        }

        this.delete_file = function(filename){
            var eid = get_eid(filename);
            if(eid){
                delete_file(eid);
            }
        }

        this.setReadOnly = function(isReadOnly){
            for(var eid in editors){
                editors[eid].setReadOnly(isReadOnly);;
            }
        }

        this.getBreakpoints = function(){
            var breakpoints = [];
            for(var eid in editors){
                var bp_obj = {}
                bp_obj.eid = eid;
                bp_obj.filename = get_file_name(eid);
                bp_obj.breakpoints = editors[eid].getSession().getBreakpoints();
                breakpoints[bp_obj.filename]=bp_obj;
            }
            return breakpoints;
        }

        this.if_file_exists = function(filename){
            return if_file_exists(filename);
        }

        //Added to let IDE to keep editor brekpoints in sync with GDB 
        this.setBreakpoint = function(breakpoint){
            if(breakpoint instanceof Breakpoint){
                var editor = find_editor_by_filename(breakpoint.filename);
                editor.getSession().setBreakpoint(breakpoint.line-1);
            }else{
                throw "Not a Breakpoint instance";
            }
        }

        //Added to let IDE to keep editor brekpoints in sync with GDB 
        this.clearBreakpoint = function(breakpoint){
            if(breakpoint instanceof Breakpoint){
                var editor = find_editor_by_filename(breakpoint.filename);
                editor.getSession().clearBreakpoint(breakpoint.line-1);
            }else{
                throw "Not a Breakpoint instance";
            }
        }

        this.forEachBreakpoint = function(callback){
            if(!callback || !(typeof callback==="function")) return;

            var bps = this.getBreakpoints();
            
            for(var filename in bps){
                var bp_list = bps[filename].breakpoints;
                for(var lineno in bp_list){
                    var bp = new Breakpoint(filename,parseInt(lineno)+1);
                    callback(bp);
                }
            }
        }

        this.forEachEditor = function(callback, _apply_to_new_editor){
            var apply_to_new_editor = false;
            if(typeof _apply_to_new_editor !== 'undefined')
                apply_to_new_editor = _apply_to_new_editor;

            if(typeof callback !== 'function') return;
            for(var eid in editors){
                callback(editors[eid], eid);
            }
            if(apply_to_new_editor)
                new_editor_callback = callback;

        }
        this.setModeForLang = function(lang){
            if(!lang) lang = "";
            var mode = "ace/mode/c_cpp";
            switch(lang.toLowerCase()){
                case 'python':
                mode = 'ace/mode/python'; break;
                case 'java':
                mode = 'ace/mode/java'; break;
                case 'c#':
                mode = 'ace/mode/csharp'; break;
                case 'vb':
                mode = 'ace/mode/vbscript'; break;
                case 'php':
                mode = 'ace/mode/php'; break;
                case 'ruby':
                mode = 'ace/mode/ruby'; break;
                case 'perl':
                mode = 'ace/mode/perl'; break;
                case 'swift':
                mode = 'ace/mode/swift'; break;
                case 'prolog':
                mode = 'ace/mode/prolog'; break;
                case 'js_rhino':
                mode = 'ace/mode/javascript'; break;
                case 'sqlite3':
                mode = 'ace/mode/sql'; break;
                case 'pascal':
                mode = 'ace/mode/pascal'; break;
                case 'fortran':
                mode = 'ace/mode/fotran'; break;
                case 'haskell':
                mode = 'ace/mode/haskell'; break;
                case 'objc':
                mode = 'ace/mode/objectivec'; break;
                case 'asm_gcc':
                mode = 'ace/mode/assembly_x86'; break;
                case 'html':
                mode = 'ace/mode/html'; break;
            }
            ed_langmode = mode;
            this.forEachEditor(function(editor, eid){
                var filename = get_file_name(eid);
                editor.getSession().setMode(getModeForFileName(filename, ed_langmode));
            }, false);
        }
        this.setTheme = function(themeName){
            ed_theme = themeName;
            this.forEachEditor(function(editor){
                editor.setTheme(themeName);
            }, false);
        }
        this.setKeyboardHandler = function(val){
            this.forEachEditor(function(editor){
                editor.setKeyboardHandler(val);
            }, false);
        }
        this.setFontSize = function(val){
            ed_fontsize = val;
            this.forEachEditor(function(editor){
                editor.setFontSize(val);
            }, false);
        }
        this.setTabSize = function(val){
            ed_tabsize = val;
            this.forEachEditor(function(editor){
                editor.getSession().setTabSize(val);
            }, false);
        }
        this.resize = function(){
            this.forEachEditor(function(editor){
                editor.resize();
            }, false);
        }
        /* Returns array of Breakpoint. Making sure that line number is valid. */
        this.getBreakpointsList = function(){
            var bp_list = [];
            var max_lines = [];

            for(var eid in editors){
                max_lines[get_file_name(eid)] = editors[eid].getSession().getLength();
            }

            this.forEachBreakpoint(function(bp){
                if(bp.line <= max_lines[bp.filename])
                    bp_list.push(bp);
            });
            return bp_list;
        }

        function get_active_file(){
            var href = get_tabs_target().find("li.active a").attr("href");
            var eid = href.split("#")[1];
            console.log("Active editor:",eid);
            return get_file_name(eid);
        }

        function get_active_editor(){
            var href = get_tabs_target().find("li.active a").attr("href");
            var eid = href.split("#")[1];
            return editors[eid];
        }

        function focus_file(filename){
            console.log("focus_file:",filename);
            if(filename != get_active_file()){
                console.log("focus_file:prev:",get_active_file());
                var eid = get_eid(filename);
                get_tabs_target().find('a[href="#'+eid+'"]').tab('show');
            }
        }

        this.gotoFileLine = function(fileline){
            var editor = find_editor_by_fileLine(fileline);
            console.log("gotoFileLine:",JSON.stringify(fileline));
            if(editor){
                focus_file(fileline.filename);
                editor.gotoLine(fileline.line, 0, false);
                //editor.focus();
            }
        }

        this.addMarker = function(fileline,ag_className,ag_type){
            var editor = find_editor_by_fileLine(fileline);
            console.log("Addmarker:",JSON.stringify(fileline), ag_className, ag_type);
            if(editor){
                var line = fileline.line;
                var classname = ag_className ? ag_className : "";
                var type = ag_type ? ag_type : "fullLine";
                var marker_key = get_marker_key(fileline, classname, type);

                var marker_id = editor.session.addMarker(new Range(line-1, 0, line-1, 1), classname, type);
                markers[marker_key] = { eid:get_eid(fileline.filename), id:marker_id };
                console.log("Addmarker:",marker_key);
                return marker_key;
            }
        }

        this.removeMarkerById = function(marker_key){
            
            if(typeof marker_key === 'undefined') return;
            if(!(marker_key in markers)) return;
            var eid = markers[marker_key].eid;
            var editor = editors[eid];
            
            if(editor){
                var marker_id = markers[marker_key].id;
                
                editor.getSession().removeMarker(marker_id);
            }
            delete markers[marker_key];
        }

        this.focus = function(eid){
            var editor = editors[eid];
            editor.focus();
        }

        this.resizeAndFocus = function(eid){
            this.resize(eid);
            this.focus(eid);
        }

        this.gotoLineInEditor = function(eid,lineno){
            var editor = editors[eid];
            editor.gotoLine(lineno,0,false);
        }

        this.getValue = function(){
            return get_active_editor().getValue();
        }
        this.setValue = function(content){
            get_active_editor().setValue(content);
        }
        this.gotoLine = function(line){
            get_active_editor().gotoLine(line,0,false);
        }
        this.focus = function(){
            get_active_editor().focus();
        }
        this.getCursorPosition = function(){
            return get_active_editor().getCursorPosition();
        }
        this.getFile = function(){
            var file = {};
            file.filename = get_active_file();
            file.content = get_active_editor().getValue();
            return file;
        }
        this.setOptions = function(options){
            for(var eid in editors){
                editors[eid].setOptions(options);
            }
        }
        this.hideCursor = function(){
            for(var eid in editors){
                editors[eid].renderer.$cursorLayer.element.style.display = "none";
            }
        }

        var get_default_editor_id = function(){
            return "editor_1";
        }

        this.setFileName = function(eid, filename){
            filename = filename.trim();
            get_tabs_target().find('a[href="#'+eid+'"] .filename').text(filename);
        }

        this.set_default_editor_filename = function(filename){
            if(typeof filename !== 'string') throw "Invalid filename";

            this.setFileName(get_default_editor_id(), filename);
        }
        this.set_default_editor_content = function(content){
            if(typeof content !== 'string') throw "Invalid content";
            var editor = editors[get_default_editor_id()];
            editor.setValue(content);
            editor.gotoLine(1,0,false);
        }
        init();

    }
    

    jQuery.fn.editor = function(){
        var target = $(this[0]);
        return new Editor({target:target});
    };

    
})(jQuery);

function FileLine(){
    this.filename = "";
    this.line = -1;
}

function FileLine(filename, linenumber){
    this.filename = filename;
    this.line = linenumber;
    return this;
}

function Breakpoint(){
    FileLine.call(this);
    return this;
}

function Breakpoint(filename, linenumber){
    FileLine.call(this, filename, linenumber);
    return this;
}
