/**
 * @package ImpressPages
 *
 *
 */

(function ($) {
    "use strict";

    var methods = {
        init: function (options) {
            return this.each(function () {
                var $this = $(this);

                $this.html('');

                var data = Object();
                data.pageId = options.pageId;
                data.aa = 'KbPortfolio.portfolioPropertiesForm';
                data.securityToken = ip.securityToken;


                $.ajax({
                    type: 'GET',
                    url: ip.baseUrl,
                    data: data,
                    encoding: "UTF-8",
                    context: $this,
                    success: formResponse,
                    dataType: 'json'
                });

            });
        },
        destroy: function () {
            // TODO
        }
    };

    var formResponse = function (response) {
        var $this = this;
        $this.html(response.html);

        $this.show();

        // wrap fields in a div so accordion would work
        $this.find('fieldset').each(function (index, fieldset) {
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
        ipInitForms();

        $this.find("form")[0].reset();

        var deletePage = function (pageId, successCallback) {
            var data = {
                aa: 'KbPortfolio.deletePortfolio',
                pageId: pageId,
                securityToken: ip.securityToken
            };

            $.ajax({
                type: 'POST',
                url: ip.baseUrl,
                data: data,
                context: this,
                success: function () {
                    if (successCallback) {
                        successCallback();
                    }
                },
                error: function (response) {
                    if (ip.developmentEnvironment || ip.debugMode) {
                        alert('Server response: ' + response.responseText);
                    }
                },
                dataType: 'json'
            });
        };

        $this.find('.ipsDelete').off('click').on('click', function () {
            $this.find('.ipsDeleteConfirmation').removeClass('hidden');
            $this.find('form, .ipsSave').addClass('hidden');
            $this.find('._actions').addClass('hidden');
            $this.find('.ipsDeleteProceed').off('click').on('click', function () {
                deletePage($this.find('[name=id]').val(), function () {
                    var data = getHashParams();
                    window.location = ip.baseUrl + '?aa=KbPortfolio.index#/hash=&language' + data.language + '=&menu=' + data.menu;
                    $this.hide();
                });

            });
        });
        $this.find('.ipsDeleteCancel').off('click').on('click', function () {
            $this.find('.ipsDeleteConfirmation').addClass('hidden');
            $this.find('form, .ipsSave').removeClass('hidden');
            $this.find('._actions').removeClass('hidden');
            $this.find('.ipsDeleteProceed').off('click');
        });

        $this.find('form').on('ipSubmitResponse', function (e, response) {
            if (response.status && response.status == 'success') {
                //page has been successfully updated
                location.reload();
                $this.find('.ipsSave').addClass('btn-default').removeClass('btn-primary');
            }
        });

        $('html').off('keyup.pageProperties').on('keyup.pageProperties', function(e) {
            if (e.keyCode === 46 && e.ctrlKey && $this.find('.ipsDelete').is(":visible")) {
                $this.find('.ipsDelete').click();
            }
        });

        $this.find('.ipsEdit').on('click', function (e) {
            $this.trigger('edit.ipPages');
        });


        $this.find('.ipsSave').off().on('click', function () {
            $this.find("form").submit();
        });

        $this.find('input,select,textarea').off().on('change keydown input', function () {
            $this.find('.ipsSave').removeClass('btn-default').addClass('btn-primary');
        });
    };

    var getHashParams = function () {
        var hashParams = {};
        var e,
            a = /\+/g,  // Regex for replacing addition symbol with a space
            r = /([^&;=]+)=?([^&;]*)/g,
            d = function (s) {
                return decodeURIComponent(s.replace(a, " "));
            },
            q = window.location.hash.substring(1);

        while (e = r.exec(q))
            hashParams[d(e[1])] = d(e[2]);

        return hashParams;
    };

    $.fn.ipPageProperties = function (method) {

        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.ipPageProperties');
        }

    };

})(jQuery);


