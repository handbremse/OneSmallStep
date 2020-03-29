___eContainer.default = (function() {
    let pub = {};
    $(document).on('click', function (e) {
        $('.HIDDEN').hide();
    });
    $('.TOGGLE').on('click', function(e){
        let $t = $(this);
        $('#'+$t.data('source')).toggle(200);
        e.stopImmediatePropagation();
    });
    return pub;
})();

___eContainer.validator = (function() {
    let pub = {};

    let init = function() {
        !!___eContainer.validationCB && ___eContainer.validationCB();
    };

    let validFeedback = function (v) {
        console.log(v);
        let $v = $(v.id);
        // cleanup and remove
        $('input', $v).removeClass('is-invalid');
        $('.invalid-feedback', $v).remove();
        window.a = $v;
        v.v.forEach(function(v) {
            let $t = $('input[name="'+v.name+'"]', $v);
            $t.addClass('is-invalid');
            $t.after('<div class="invalid-feedback">'+v.error+'</div>');
        });
    };
    pub.validFeedback = validFeedback;

    init();

    return pub;
})();

___eContainer.session = (function() {
    let pub = {};

    let init = function() {
        !!___eContainer.destroyCustomer && $.post('/customer/destroy');
    };

    init();

    return pub;
})();
