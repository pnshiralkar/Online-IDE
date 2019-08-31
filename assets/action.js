var lang = "cpp";


var tempjava = "/* \nMultiLanguage IDE in Node.js by Prathamesh Shiralkar.\nHappy coding!!! \n*/\n\n// Please use class name as 'code' - do NOT change this\n\nclass code{\n    public static void main(String args[]){\n    	//Your code goes here\n	    System.out.println(\"Hello Java\");\n    }\n}";

var temppy = "'''\nMultiLanguage IDE in Node.js by Prathamesh Shiralkar.\nHappy coding!!!\n'''\n\nprint(\"Hello Coders!\")";

var tempcpp = "/* \nMultiLanguage IDE in Node.js by Prathamesh Shiralkar.\nHappy coding!!!\n*/\n\n#include <bits/stdc++.h>\n\nusing namespace std;\n\nint main()\n{\n    cout << \"Hello Coders!!!\";\n    return 0;\n}";



function langch(l)
{
    var editorobj = ace.edit("editor_1");
    
	if(lang==="java")
		tempjava = editorobj.getValue();
	if(lang==="py")
		temppy = editorobj.getValue();
	if(lang==="cpp")
		tempcpp = editorobj.getValue();

    var editor = $("#multi_editor_container").editor();
    if(l=="python")
    	lang="py";
    else
	    lang = l;
    editor.setModeForLang(l);
    if(lang==="java")
		editorobj.setValue(tempjava, -1);
	if(lang==="py")
		editorobj.setValue(temppy, -1);
	if(lang==="cpp")
		editorobj.setValue(tempcpp, -1);
    editor.addEventListener('breakpoint_set', function (e) { 
        var bp = e.breakpoint;
        ide.setBreakpoint(bp);
    });
    editor.addEventListener('breakpoint_unset', function (e) { 
        var bp = e.breakpoint;
        ide.clearBreakpoint(bp);
    });
}


$(document).ready(function () {
ace.edit("editor_1").setValue(tempcpp, -1);

	$("#selLang").change(function(){
		langch($(this).val());
	});

    $('#btn_inp').click(function(){
        $('#popup').attr("class", "popup_show");
    });

    $('#popup_close').click(function(){
        $('#popup').attr("class", "popup");
    });

    $('#save').click(function(){
        var editor = ace.edit("editor_1");
        var code = editor.getValue();
        $('#inp_save').val(code);
        $('#frm_save').submit();
    });

    $('#btn_run').click(function () {
        var editor = ace.edit("editor_1");
        var code = editor.getValue();
        //console.log(code);
        //editor.setValue("//Template//");
        $.post("/run/", {"code" : code, "input": $('#inp').val(), "lang": lang}, function (data) {
            console.log(data);
            var op;
            try{op = JSON.parse(data);
            if(op.errors !== "_no_"){$('#errors').html(op.errors);}else{$('#pre_err').attr("style", "display: none");$('#pre_op').attr("style", "display: block");}
            if(op.results !== "_no_"){$('#outputs').html(op.results);}else{$('#pre_op').attr("style", "display: none");$('#pre_err').attr("style", "display: block");}
            $('#btn_inp').attr("disabled", false).html("Run");
            }catch(e){console.log("err");}
            
        });
        $('#popup').attr("class","popup");
        $('#btn_inp').attr("disabled", true).html("Running...");

    });


    Mousetrap.bind("f9", function () {
        trace_event('Key-F9');
        console.log("F9 pressed");
        $('#btn_run').click();
        return false;
    });

    Mousetrap.bind(['command+b', 'ctrl+b'], function () {
        trace_event('Key-Ctrl+B');
        beautifyCode();
        return false;
    });


    var editor = $("#multi_editor_container").editor();
    editor.setModeForLang($("#lang-select").val());

    editor.addEventListener('breakpoint_set', function (e) {
        var bp = e.breakpoint;
        ide.setBreakpoint(bp);
    });
    editor.addEventListener('breakpoint_unset', function (e) {
        var bp = e.breakpoint;
        ide.clearBreakpoint(bp);
    });


    $("#control-btn-save").on('click', function () {
        saveCode();
    });

    ide.editor = editor;
    //these guys can work after editor is initialized
    enable_btn('control-btn-', ['save', 'share', 'beautify', 'download']);
});

var project_uid = null;
