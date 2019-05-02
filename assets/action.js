$(document).ready(function () {

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
        $.post("/run/", {"code" : code, "input": $('#inp').val()}, function (data) {
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