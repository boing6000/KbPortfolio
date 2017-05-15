/**
 * Widget initialization and management script
 * If you rename the widget, replace WidgetSkeleton instance to the new name
 *
 */

var IpWidget_KbPortfolio = function () {

    this.widgetObject = null;
    this.widgetOverlay = null;

    /**
     * Initialize widget management
     * @param widgetObject jquery object of an widget div
     * @param data widget's data
     */
    this.init = function (widgetObject, data) {
        //store widgetObject variable to be accessible from other functions
        this.widgetObject = widgetObject;
        this.widgetObject.css('min-height', '30px'); //if widget is empty it could be impossible to click on.

        var context = this; // set this so $.proxy would work below. http://api.jquery.com/jquery.proxy/

        //put an overlay over the widget and open popup on mouse click event
        this.$widgetOverlay = $('<div></div>');
        this.widgetObject.prepend(this.$widgetOverlay);
        this.$widgetOverlay.on('click', $.proxy(openPopup, this));
        $.proxy(fixOverlay, context)();

        //fix overlay size when widget is resized / moved
        $(document).on('ipWidgetResized', function () {
            $.proxy(fixOverlay, context)();
        });
        $(window).on('resize', function () {
            $.proxy(fixOverlay, context)();
        });

    };

    /**
     * Make the overlay div to cover the whole widget.
     */
    var fixOverlay = function () {
        this.$widgetOverlay
            .css('position', 'absolute')
            .css('z-index', 1000) // should be higher enough but lower than widget controls
            .width(this.widgetObject.width())
            .height(this.widgetObject.height());
    };


    /**
     * Automatically open settings popup when new widget added
     */
    this.onAdd = function () {
        $.proxy(openPopup, this)();
    };

    /**
     * Open widget management popup
     */
    var openPopup = function () {
        var context = this; // store current context for $.proxy bellow. http://api.jquery.com/jquery.proxy/
        $('#ipWidgetKbPortfolioPopup').remove(); //remove any existing popup. This could happen if other widget is in management state right now.

        //get popup HTML using AJAX. See AdminController.php widgetPopupHtml function
        var data = {
            aa: 'KbPortfolio.widgetPopupHtml',
            securityToken: ip.securityToken,
            widgetId: this.widgetObject.data('widgetid')
        };

        $.ajax({
            url: ip.baseUrl,
            data: data,
            dataType: 'json',
            type: 'GET',
            success: function (response) {
                //create new popup
                var $popupHtml = $(response.popup);
                $('body').append($popupHtml);
                var $popup = $('#ipWidgetKbPortfolioPopup .ipsModal');
                $popup.modal();

                $popup.find('fieldset').each(function (index, fieldset) {
                    var $fieldset = $(fieldset);
                    var $legend = $fieldset.find('legend');

                    // if legend exist it means its option group
                    if ($legend.length) {
                        // adding required attributes to make collapse() to work
                        $legend
                            .attr('data-toggle', 'collapse')
                            .attr('data-target', '#propertiesCollapse' + index)
                            .addClass('collapsed');
                        $fieldset.find('.form-group').wrapAll('<div class="collapse" id="propertiesCollapse' + index + '" />');
                    }
                });

                ipInitForms(); //This is standard ImpressPages function to initialize JS specific form fields
                $popup.find('.ipsConfirm').on('click', function(e){e.preventDefault(); $popup.find('form').submit();}); //submit form on "Confirm" button click
                $popup.find('form').on('ipSubmitResponse', $.proxy(save, context)); //save form data if form has been successfully validated by PHP (AdminController.php -> checkForm)
            },
            error: function (response) {
                alert('Error: ' + response.responseText);
            }

        });



    };

    /**
     * Permanently store widget's data and destroy the popup
     * @param e
     * @param response
     */
    var save = function (e, response) {
        this.widgetObject.save(response.data, 1); // save and reload widget
        var $popup = $('#ipWidgetKbPortfolioPopup .ipsModal');
        $popup.modal('hide');
    };

};

