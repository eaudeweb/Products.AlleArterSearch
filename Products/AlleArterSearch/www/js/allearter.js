(function ($, app) {
    var SearchForm = $.extend({}, app.BaseView, {

        optionsTemplate: "\
            <option value='*'>-all-</option>\
            {{#data}}\
                <option value='{{.}}'>{{.}}</option>\
            {{/data}}\
        ",

        events: {
            "change select#ctlArtsgruppe": "changeGruppe",
            "change select#ctlRige": "changeRige",
            "change select#ctlRaekke": "changeRaekke",
            "change select#ctlKlasse": "changeKlasse",
            "change select#ctlOrden": "changeOrden",

            "click .record-details": "toggleRecordDetails"
        },

        _resetSelect: function (selector) {
           // reset a specified select or all selects
           var default_selector = "select#ctlRige, select#ctlFamilie, \
                select#ctlRaekke, select#ctlKlasse, select#ctlOrden, \
                select#ctlFamilie";
           var selector = selector || default_selector;
            $(selector).val("*");
        },

        _getJSON: function (params, selector) {
            var self = this;
            var json_request = $.getJSON("jsonFieldValues", params, function(data) {
                var html = Mustache.to_html(self.optionsTemplate, {"data": data});
                $(selector).html(html);
                html = null;
            });
            return json_request
        },

        changeGruppe: function (e) {
            // reset all selects when gruppe is change
            this._resetSelect();
        },

        changeRige: function (e) {
            this._resetSelect("select#ctlArtsgruppe");
            var params = {
                "query": $(e.currentTarget).val(),
                "query_field": "Rige"
            };

            params["entity_type"] = "Raekke";
            this._getJSON(params, "select#ctlRaekke");

            params["entity_type"] = "Klasse"
            this._getJSON(params, "select#ctlKlasse");

            params["entity_type"] = "Orden"
            this._getJSON(params, "select#ctlOrden");

            params["entity_type"] = "Familie"
            this._getJSON(params, "select#ctlFamilie");
            params = null; // nullify, no leaks
        },

        changeRaekke: function (e) {
            this._resetSelect("select#ctlArtsgruppe");
            var params = {
                "query": $(e.currentTarget).val(),
                "query_field": "Raekke"
            };

            params["entity_type"] = "Klasse";
            this._getJSON(params, "select#ctlKlasse");

            params["entity_type"] = "Orden";
            this._getJSON(params, "select#ctlOrden");

            params["entity_type"] = "Familie";
            this._getJSON(params, "select#ctlFamilie");
            params = null; // nullify, no leaks
        },

        changeKlasse: function (e) {
            this._resetSelect("select#ctlArtsgruppe");
            var params = {
                "query": $(e.currentTarget).val(),
                "query_field": "Klasse"
            };

            params["entity_type"] = "Orden";
            this._getJSON(params, "select#ctlOrden");

            params["entity_type"] = "Familie";
            this._getJSON(params, "select#ctlFamilie");

            params = null; // nullify, no leaks
        },

        changeOrden: function (e) {
            this._resetSelect("select#ctlArtsgruppe");
            var params = {
                "query": $(e.currentTarget).val(),
                "query_field": "Orden"
            };

            params["entity_type"] = "Familie";
            this._getJSON(params, "select#ctlFamilie");
            params = null; // nullify, no leaks
        },

        /* flow
        - when clicked on a record, check if the record has alreary details.
        - if the record hasn't details, make an ajax call and fetch them.
        - if the record has details, show the container.
        - it the container is visible, hide it.
        */
        toggleRecordDetails: function (e) {
            var record_id = $(e.currentTarget).data("record-index"),
                record = $(sprintf("#rec_%s", record_id));

            if(record.hasClass("toggle_off")) {
                if(record.hasClass("has_details")) {
                    this._showRecord(record_id, record);
                } else {
                    this._getDataAndShow(record_id, record);
                }
            } else {
                this._hideRecord(record);
            }
             record = record_id = null; // nullify, no leaks
        },

        _showRecord: function(record_id, record) {
            // reset all
            $("tr[id^=rec]").removeClass("toggle_on").addClass("toggle_off").hide();
            $("img[id^=img_]'").removeClass("arrow-down").addClass("arrow-normal");

            // show record
            record.removeClass("toggle_off").addClass("toggle_on").show();
            $(sprintf("#img_%s", record_id)).addClass("arrow-down");
        },

        _hideRecord: function(record) {
            // hide record
            record.hide();

            // reset all
            $("tr[id^=rec]").removeClass("toggle_on").addClass("toggle_off").hide();
            $("img[id^=img_]").removeClass("arrow-down").addClass("arrow-normal");
        },

        _getDataAndShow: function(record_id, record) {
            var self = this,
                div = record.find("div"),
                item_id = parseInt(div.attr("id"));

            $.get("record_details", { "id": item_id }, function(data) {
                div.html(data);
                record.addClass('has_details');
                self._showRecord(record_id, record);
                record = div = null;
            });
            item_id = null; // nullify, no leaks
        }
    });
    // bind the events after document.ready
    $(function () { SearchForm.init(); });
})(jQuery_171, AllearterApp);
