$(function(){
    $("select#ctlRige").change(function(){
        $("select#ctlArtsgruppe").val('*');
        $("select#ctlRaekke").empty();
        $("select#ctlOrden").empty();
        $("select#ctlFamilie").empty();
        $("select#ctlVidenskabeligt_navn").empty();
        var lang = $("input#ctlLang").val();
        var params = $.param({'query': $(this).val(), 'entity_type':'Raekke', 'query_field': 'Rige', 'lang':lang}, true);
        $.getJSON("get_json", params, function(j){
            var options = '<option value="*">-all-' + '<'+'/option>';
            for (var i = 0; i < j.length; i++) {
                options += '<option value="' + j[i] + '">' + j[i] + '<'+'/option>';
            }
            $("select#ctlRaekke").html(options);
        })
    })
})

$(function(){
    $("select#ctlRaekke").change(function(){
        $("select#ctlArtsgruppe").val('*');
        $("select#ctlOrden").empty();
        $("select#ctlFamilie").empty();
        $("select#ctlVidenskabeligt_navn").empty();
        var lang = $("input#ctlLang").val();
        var params = $.param({'query': $(this).val(), 'entity_type':'Orden', 'query_field': 'Raekke', 'lang':lang}, true);
        $.getJSON("get_json", params, function(j){
            var options = '<option value="*">-all-' + '<'+'/option>';
            for (var i = 0; i < j.length; i++) {
                options += '<option value="' + j[i] + '">' + j[i] + '<'+'/option>';
            }
            $("select#ctlOrden").html(options);
        })
    })
})

$(function(){
    $("select#ctlOrden").change(function(){
        $("select#ctlArtsgruppe").val('*');
        $("select#ctlFamilie").empty();
        $("select#ctlVidenskabeligt_navn").empty();
        var lang = $("input#ctlLang").val();
        var params = $.param({'query': $(this).val(), 'entity_type':'Familie', 'query_field': 'Orden', 'lang':lang}, true);
        $.getJSON("get_json", params, function(j){
            var options = '<option value="*">-all-' + '<'+'/option>';
            for (var i = 0; i < j.length; i++) {
                options += '<option value="' + j[i] + '">' + j[i] + '<'+'/option>';
            }
            $("select#ctlFamilie").html(options);
        })
    })
})

function toggle(record_id) {
    var collection = $('#rec_'+record_id);
    if (collection.hasClass('toggle_off')) {
        if (collection.hasClass('has_details')) {
            show_record(record_id);
        } else {
            get_data_and_show(record_id);
        }
    } else {
        hide_record(record_id);
    }
}

function get_data_and_show(record_id) {
    var div = $('#rec_'+record_id + ' div');
    var item_id = div.attr('id');
    $.get("record_details", {id: parseInt(item_id)},
    function(data) {
        div.html(data);
        $('#rec_'+record_id).addClass('has_details');
        show_record(record_id);
    });
}

function show_record(record_id) {
    // reset all
    $('tr[id^="rec"]').removeClass('toggle_on');
    $('tr[id^="rec"]').addClass('toggle_off');
    $('img[id^="img_"]').removeClass('arrow-down');
    $('img[id^="img_"]').addClass('arrow-normal');
    $('tr[id^="rec"]').hide();

    // show record
    $('#rec_'+record_id).show();
    var div = $('#rec_'+record_id + ' div');
    var item_id = div.attr('id');

    $('tr[id^="row"] td').removeClass('PyDigirThisRecord');
    $('tr[id^="rec"] td').removeClass('PyDigirThisIndex');
    $('#rec_'+record_id+' td').addClass('PyDigirThisIndex');
    $('#img_' + record_id).addClass('arrow-down');
    $('#rec_'+record_id).removeClass('toggle_off');
    $('#rec_'+record_id).addClass('toggle_on');
}

function hide_record(record_id) {
    // hide record
    $('#rec_'+record_id).hide();

    // reset all
    $('tr[id^="rec"]').removeClass('toggle_on');
    $('tr[id^="rec"]').addClass('toggle_off');
    $('img[id^="img_"]').removeClass('arrow-down');
    $('img[id^="img_"]').addClass('arrow-normal');
    $('tr[id^="rec"]').hide();
}
