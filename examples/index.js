function headReady() {

    var editors = prepEditors();

    loadExamples("alert", false);

    function loadExamples(name, run) {
        Step(

        function () {
            getExamples(name, this);
        },

        function (examples) {

            for (var name in editors) {
                editors[name].getSession().setValue(examples[name]);
            }

            if(run !== false)
            this();
        },
        runCode);

    }


    function runCode() {
        $("#css-example").remove();
        $("<style type='text/css' id='css-example'>" + editors.css.getSession().getValue() + "</style>").appendTo("head");

        var templateHtml = editors.html.getSession().getValue();

        //eval the javascript
        eval(editors.javascript.getSession().getValue());
    }


    //let's stick our fingers in the HTML now.
    $("#run-code").click(runCode);

    var examples = {
    	alert: "Alert Example",
    	growl: "Growl Example"
    };

    for(var key in examples) {
    	$("#examples-container").append('<a href="#" class="examples-button" data-name="'+key+'">'+examples[key]+'</a>')
    }

    $("#examples-container").find("a").click(function() {
    	loadExamples($(this).attr("data-name"));
    })
}


function prepEditors() {
    var editors = {};
    ["javascript", "css", "html"].forEach(function (name) {
        var $el = $("#" + name + "-editor");
        $el.css({
            width: 650,
            height: 400,
            clear: "both"
        });
        var editor = ace.edit(name + "-editor");
        editor.setTheme("ace/theme/textmate");
        editor.getSession().setMode("ace/mode/" + name);
        editors[name] = editor;
    });

    return editors;
}

function loadExamples(name, editors) {
    Step(

    function () {
        getExamples(name, this);
    },

    function (examples) {

        for (var name in editors) {
            editors[name].getSession().setValue(examples[name]);
        }

    })
}


function getExamples(name, callback) {
    Step(

    function () {
        $.get("examples/" + name + "/script.bjs", this);
    },

    function (data) {
        this.script = data;
        $.get("examples/" + name + "/style.css", this);
    },

    function (data) {
        this.styles = data;
        $.get("examples/" + name + "/template.ejs", this);
    },

    function (data) {
        this.template = data;
        this();
    },

    function () {
        callback({
            javascript: this.script,
            css: this.styles,
            html: this.template
        })
    });
}