+function ($) {
    'use strict';

    // CONSTANTS
    // ======================

    var GRAPHQL_SLUG = 'lairdubois-opencutlist-sketchup-extension';
    var GRAPHQL_ENDPOINT = 'https://api.opencollective.com/graphql/v2/';
    var GRAPHQL_PAGE_SIZE = 5;

    // CLASS DEFINITION
    // ======================

    var LadbTabNews = function (element, options, opencutlist) {
        LadbAbstractTab.call(this, element, options, opencutlist);

        this.$btnSubmit = $('#ladb_btn_submit', this.$element);

        this.$page = $('.ladb-page', this.$element);

        this.news = null;

    };
    LadbTabNews.prototype = new LadbAbstractTab;

    LadbTabNews.DEFAULTS = {};

    LadbTabNews.prototype.loadUpdates = function (page) {
        var that = this;

        // Fetch UI elements
        var $loading = $('.ladb-loading', this.$element);

        // Show loading
        $loading.show();

        // Init page
        page = page ? page : 0;

        $.ajax({
            url: GRAPHQL_ENDPOINT,
            contentType: 'application/json',
            type: 'POST',
            dataType: 'json',
            data: JSON.stringify({
                query: "query updates($slug: String) { " +
                        "collective(slug: $slug) { " +
                            "updates(offset: " + page * GRAPHQL_PAGE_SIZE + ", limit: " + GRAPHQL_PAGE_SIZE + ", onlyPublishedUpdates: true) { " +
                                "totalCount " +
                                "nodes { " +
                                    "slug " +
                                    "title " +
                                    "publishedAt " +
                                    "html " +
                                    "fromAccount { " +
                                        "slug " +
                                        "name " +
                                        "imageUrl " +
                                    "}" +
                                "}" +
                            "}" +
                        "}" +
                    "}",
                variables: {
                    slug: GRAPHQL_SLUG
                }
            }),
            success: function (response) {
                if (response.data) {

                    var nextPage = ((page + 1) * GRAPHQL_PAGE_SIZE < response.data.collective.updates.totalCount) ? page + 1 : null;

                    // Render updates list
                    var $list = $(Twig.twig({ref: 'tabs/news/_updates-' + (page === 0 ? '0' : 'n') + '.twig'}).render({
                        updates: response.data.collective.updates,
                        nextPage: nextPage,
                    }));
                    if (page === 0) {
                        $list.insertBefore($loading);
                    } else {
                        $('#ladb_news_updates').append($list);
                    }

                    // Bind button
                    $('.ladb-news-next-page-btn', $list).on('click', function () {
                        that.loadUpdates(nextPage);
                        $(this).remove();
                    });

                    // Bind
                    $('.ladb-news-update-box', $list).on('click', function(e) {
                        var $closestAnchor = $(e.target.closest('a'));
                        if ($closestAnchor.length > 0) {
                            rubyCallCommand('core_open_url', { url: $closestAnchor.attr('href') });
                            return false;
                        }
                        var slug = $(this).data('update-slug');
                        rubyCallCommand('core_open_url', { url: 'https://opencollective.com/' + GRAPHQL_SLUG + '/updates/' + slug });
                    });

                }

                // Hide loading
                $loading.hide();

            },
            error: function(jqXHR, textStatus, errorThrown) {

                that.$page.empty();
                that.$page.append(Twig.twig({ ref: "core/_alert-errors.twig" }).render({
                    errors: [ 'tab.news.error.fail_to_load_list' ]
                }));

            }
        });

    }

    LadbTabNews.prototype.defaultInitializedCallback = function () {
        LadbAbstractTab.prototype.defaultInitializedCallback.call(this);

        this.loadUpdates();

    };

    // PLUGIN DEFINITION
    // =======================

    function Plugin(option, params) {
        return this.each(function () {
            var $this = $(this);
            var data = $this.data('ladb.tab.plugin');
            var options = $.extend({}, LadbTabNews.DEFAULTS, $this.data(), typeof option == 'object' && option);

            if (!data) {
                if (undefined === options.dialog) {
                    throw 'dialog option is mandatory.';
                }
                $this.data('ladb.tab.plugin', (data = new LadbTabNews(this, options, options.dialog)));
            }
            if (typeof option == 'string') {
                data[option].apply(data, Array.isArray(params) ? params : [ params ])
            } else {
                data.init(option.initializedCallback);
            }
        })
    }

    var old = $.fn.ladbTabNews;

    $.fn.ladbTabNews = Plugin;
    $.fn.ladbTabNews.Constructor = LadbTabNews;


    // NO CONFLICT
    // =================

    $.fn.ladbTabNews.noConflict = function () {
        $.fn.ladbTabNews = old;
        return this;
    }

}(jQuery);