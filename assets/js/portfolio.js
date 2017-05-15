var ipPort = null;
var ipPagesDropPageId;
var ipPagesDropPagePosition;
var ipPagesStartPagePosition;
var ipPagesStartPageParentId;
var ipPageDragId;

(function ($) {
    "use strict";

    var app = angular.module('Portfolio', []).directive('menulistPostRepeatDirective', function () {
        return function (scope, element, attrs) {
            if (scope.$last) {
                pageMenuList.init();
            }
        };
    });

    app.run(function ($rootScope) {
        $rootScope.$on('$locationChangeSuccess', function (e, newUrl, oldUrl) {
            $rootScope.$broadcast('PathChanged', newUrl);
        });
    });

    ipPort = function ($scope, $location){
        $scope.activeLanguage = {id: null, code: null};
        $scope.activeMenu = {alias: ''};
        $scope.selectedPageId = null;
        $scope.languageList = languageList;
        $scope.menuList = categories;
        $scope.initialized = false;
        $scope.allowActions = !getQuery('disableActions');
        $scope.ipPagesLanguagesPermission = ipPagesLanguagesPermission;

        var hashIsBeingApplied = false;

        $scope.$on('PathChanged', function (event, path){
            var menuName = getHashParams().menu;
            var languageCode = getHashParams().language;
            var pageId = getHashParams().page;

            if (!$scope.initialized) {
                if (languageCode == null) {
                    languageCode = languageList[0].code;
                }
                if (menuName == null && categories[0]) {
                    menuName = categories[0].id;
                }
            }

            if (languageCode && languageCode != $scope.activeLanguage.code) {
                $.each(languageList, function (key, value) {
                    if (value.code == languageCode) {
                        $scope.activateLanguage(value);
                    }
                });
            }

            if (!$scope.activeMenu || menuName && menuName != $scope.activeMenu.id || $scope.activeLanguage.code != $scope.activeMenu.language) {
                var newActiveMenu = null;
                $.each(categories, function (key, value) {
                    if (value.id == menuName && value.language == $scope.activeLanguage.code) {
                        newActiveMenu = value;
                    }
                });
                if (newActiveMenu == null) {
                    newActiveMenu = getFirstMenuOfLanguage($scope.activeLanguage);
                }
                $scope.activateMenu(newActiveMenu);
            }

            if (pageId && pageId != $scope.selectedPageId) {
                $scope.activatePage(pageId, $scope.activeMenu.alias);
            }
        });

        $scope.activateLanguage = function (language) {
            $scope.activeLanguage = language;
            showPages();
        };

        $scope.activateMenu = function (menu) {
            $scope.activeMenu = menu;
            if (menu) {
                $scope.selectedPageId = menu.id;
            } else {
                $scope.selectedPageId = null;
            }

            showPages();
        };

        $scope.activatePage = function (pageId){
            $scope.selectedPageId = pageId;
            var $properties = $('.ipsProperties');
            $properties.ipPageProperties({
                pageId: pageId
            });

            // updating title dynamically
            $properties.off('update.ipPages').on('update.ipPages', function () {
                var title = $properties.find('input[name=title]').val();
                getTreeDiv().find('.ipsRow.active .ipsDrag').text(title);

            });

            // making page visually active
                getTreeDiv().find('.ipsRow').removeClass('active');
                getTreeDiv().find('[data-id="' + $scope.selectedPageId + '"]').addClass('active');

        };

        $scope.setLanguageHash = function (language) {
            updateHash(language.code, null, false);
        };

        $scope.addMenuModal = function () {
            var $modal = $('.ipsAddMenuModal');
            $modal.find('input[name=name]').val('');
            $modal.modal();

            $modal.on('shown.bs.modal', function () {
                $modal.find('input[name=name]').focus();
                $modal.find("form")[0].reset()
            });

            $modal.find('.ipsAdd').off('click').on('click', function () {
                $modal.find('form').submit()
            });
            $modal.find('form').off('submit').on('submit', function (e) {
                e.preventDefault();
                var name = $modal.find('input[name=name]').val();
                var active = $modal.find('[name=isVisible]').is(':checked') ? 1 : 0;
                addMenu(name, active);
                $modal.modal('hide');
            });
        };

        $scope.updateMenuModal = function (menu) {
            var $modal = $('.ipsUpdateMenuModal');
            $modal.modal();

            var data = {
                aa: 'KbPortfolio.updateCategoryForm',
                id: menu.id
            };

            $.ajax({
                type: 'GET',
                url: ip.baseUrl,
                data: data,
                context: this,
                success: function (response) {
                    $modal.find('.ipsBody').html(response.html);

                    // initial state
                    $modal.find('.ipsDeleteConfirmation').addClass('hidden');
                    $modal.find('.ipsBody').removeClass('hidden');
                    $modal.find('.ipsModalActions').removeClass('hidden');

                    ipInitForms();

                    $modal.find("form")[0].reset();

                    $modal.find('.ipsDelete').off('click').on('click', function () {
                        $modal.find('.ipsDeleteConfirmation').removeClass('hidden');
                        $modal.find('.ipsBody').addClass('hidden');
                        $modal.find('.ipsModalActions').addClass('hidden');
                        $modal.find('.ipsDeleteProceed').off('click').on('click', function () {
                            deletePage(menu.id, function () {
                                window.location = ip.baseUrl + '?aa=KbNews.index#/hash=&language=' + $scope.activeLanguage.code + '&menu=' + $scope.activeMenu.alias;
                                location.reload();
                            });

                        });
                    });
                    $modal.find('.ipsDeleteCancel').off('click').on('click', function () {
                        $modal.find('.ipsDeleteConfirmation').addClass('hidden');
                        $modal.find('.ipsBody').removeClass('hidden');
                        $modal.find('.ipsModalActions').removeClass('hidden');
                        $modal.find('.ipsDeleteProceed').off('click');
                    });

                    $modal.find('.ipsSave').off('click').on('click', function () {
                        $modal.find('form').submit()
                    });
                    $modal.find('form').off('ipSubmitResponse').on('ipSubmitResponse', function (e, response) {
                        if (response.status == 'ok') {
                            window.location = ip.baseUrl + '?aa=KbPortfolio.index#/hash=&language=' + $scope.activeLanguage.code + '&menu=' + $scope.activeMenu.id;
                            location.reload();
                            $modal.modal('hide');
                        }
                    });

                },
                error: function (response) {
                    if (ip.developmentEnvironment || ip.debugMode) {
                        alert('Server response: ' + response.responseText);
                    }
                },
                dataType: 'json'
            });
        };

        $scope.setMenuHash = function (menu) {
            hashIsBeingApplied = true;
            updateHash(null, menu.id, false);
            hashIsBeingApplied = false;
        };

        $scope.addPortfolioModal = function () {
            var $modal = $('.ipsAddModal');
            $modal.find('input[name=title]').val('');
            $modal.modal();

            $modal.on('shown.bs.modal', function () {
                $modal.find('input[name=title]').focus();
                $modal.find("form")[0].reset();
            });

            $modal.find('.ipsAdd').off('click').on('click', function () {
                $modal.find('form').submit()
            });

            $modal.find('form').off('submit').on('submit', function (e) {

                e.preventDefault();
                var isVisible = $modal.find('input[name=isVisible]').is(':checked') ? 1 : 0;
                var data = $modal.find('form').serializeArray();
                data.push({
                    'name': 'catId',
                    'value': $scope.activeMenu.id
                });
                data.push({
                    'name': 'isVisible',
                    'value': isVisible
                });
                addPage(data);
                $modal.modal('hide');
            });
        };


        function getQuery(name) {
            name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
            var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
                results = regex.exec(location.search);
            return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
        }

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

        var showPages = function (){
            $scope.selectedPageId = null;
            if (!$scope.activeMenu) {
                $('.ipsPages').addClass('hidden');
                return;
            }

            $('.ipsPages').removeClass('hidden');

                var gridContainer = getPagesContainer();
                if (!gridContainer.data('gateway')) {
                    gridContainer.data('gateway', ip.baseUrl + '?aa=KbPortfolio.portfolioGridGateway&parentId=' + $scope.activeMenu.id);
                    gridContainer.ipGrid();
                    gridContainer.on('click', '.ipsRow', function (e) {
                        var $row = $(e.currentTarget);
                        updateHash(null, null, $row.data('id'));
                        $scope.$apply();
                    });

                    // setting active
                    gridContainer.on('htmlChanged.ipGrid', function (e) {
                        getTreeDiv().find('[data-id="' + $scope.selectedPageId + '"]').addClass('active');
                    });
                }
        };

        var getFirstMenuOfLanguage = function (language) {
            var firstMenu = null;
            $.each(categories, function (key, menu) {
                if (menu.language == language.code) {
                    if (firstMenu == null) {
                        firstMenu = menu;
                    }
                }
            });
            return firstMenu;
        };

        var updateHash = function (languageCode, menuName, pageId) {
            var curVariables = getHashParams();
            curVariables['/hash'] = '';

            if (languageCode === null && $scope.activeLanguage) {
                languageCode = $scope.activeLanguage.code;
            }
            if (menuName === null && $scope.activeMenu) {
                menuName = $scope.activeMenu.id;
            }
            if (pageId === null && $scope.selectedPageId) {
                pageId = $scope.selectedPageId;
            }

            curVariables.language = languageCode ? languageCode : null;
            curVariables.menu = menuName ? menuName : null;
            curVariables.page = pageId ? pageId : null;

            var path = '';
            $.each(curVariables, function (key, value) {
                if (value != null) {
                    if (path != '') {
                        path = path + '&';
                    }
                    path = path + key + '=' + value;
                }
            });
            $location.path(path);
        };

        var addMenu = function (name, active) {
            var data = {
                aa: 'KbPortfolio.createCategory',
                securityToken: ip.securityToken,
                language: $scope.activeLanguage.code,
                name: name,
                isVisible: active
            };

            $.ajax({
                type: 'POST',
                url: ip.baseUrl,
                data: data,
                context: this,
                success: function (response) {
                    window.location = ip.baseUrl + '?aa=KbPortfolio.index#/hash=&language=' + $scope.activeLanguage.code;
                    location.reload();
                },
                error: function (response) {
                    if (ip.developmentEnvironment || ip.debugMode) {
                        alert('Server response: ' + response.responseText);
                    }
                },
                dataType: 'json'
            });
        };

        var addPage = function (data) {
            data['securityToken'] = ip.securityToken;

            $.ajax({
                type: 'POST',
                url: ip.baseUrl,
                data: data,
                context: this,
                success: function (response) {
                    getPagesContainer().ipGrid('refresh');
                },
                error: function (response) {
                    if (ip.developmentEnvironment || ip.debugMode) {
                        alert('Server response: ' + response.responseText);
                    }
                },
                dataType: 'json'
            });
        };

        var deletePage = function (pageId, successCallback) {
            var data = {
                aa: 'KbPortfolio.deleteCategory',
                pageId: pageId,
                securityToken: ip.securityToken
            };

            $.ajax({
                type: 'POST',
                url: ip.baseUrl,
                data: data,
                context: this,
                success: function () {
                    updateHash(null, null, 0);
                    $scope.$apply();

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

        var getPagesContainer = function () {
            return $('#pages_' + $scope.activeMenu.language + '_' + $scope.activeMenu.id).find('.ipsPages');
        };

        var getTreeDiv = function () {
            return getPagesContainer().find('.ipsTreeDiv');
        };
    }

    var ipTinyMceConfig = function () {
        var originalConfig = bootstrap();
        originalConfig.toolbar1 = originalConfig.toolbar1 + ' code forecolor image';
        originalConfig.plugins = originalConfig.plugins + ', image';
        originalConfig.external_code_path = ip.baseUrl + 'Plugin/code/';
        originalConfig.external_textcolor_path = ip.baseUrl + 'Plugin/textcolor/';

        originalConfig.valid_elements = originalConfig.valid_elements + ',img[src|alt|width|height]';

        originalConfig.file_picker_callback = function(callback, value, meta) {
            // Provide file and text for the link dialog
            var $dialog = $('.mce-window');
            $('#mce-modal-block, .mce-tinymce-inline').addClass('hidden');
            $dialog.addClass('hidden');

            if (meta.filetype == 'file') {
                ipBrowseLink(function (link, title) {
                    $('#mce-modal-block, .mce-tinymce-inline').removeClass('hidden');
                    $dialog.removeClass('hidden');
                    callback(link, {text: title});
                });
            }

            // Provide image and alt text for the image dialog
            if (meta.filetype == 'image') {
                ipBrowseFile(function (media) {
                    $('#mce-modal-block, .mce-tinymce-inline').removeClass('hidden');
                    $dialog.removeClass('hidden');
                    callback(media[0].originalUrl, {alt: media[0].fileName});
                }, {fileLimit: 1, preview: 'thumbnails', filter: 'image'});
            }
        };
        originalConfig.image_advtab = true;

        if (!originalConfig.external_plugins) {
            originalConfig.external_plugins = {};
        }
        originalConfig.external_plugins.code = ip.baseUrl + 'Ip/Internal/Core/assets/js/tiny_mce/plugins/code/plugin.min.js';
        originalConfig.external_plugins.textcolor = ip.baseUrl + 'Ip/Internal/Core/assets/js/tiny_mce/plugins/textcolor/plugin.min.js';
        originalConfig.valid_elements = originalConfig.valid_elements + ',span[class|title|data-toggle|data-placement|data-content|aria-hidden|href],div[class|id|tabindex|role|aria-labelledby],button[data-dismiss|class|type],h4[tittle|class],h3[tittle|class]';

        return originalConfig;

    };
})(jQuery);