/*!
 *
 * App Controller: api
 *
 * Using some lesser thought of APIs for this shim:
 * https://developers.google.com/news-search/v1/jsondevguide
 * http://shreyaschand.com/blog/2013/01/03/google-autocomplete-api/
 *
 *
 */
var _searchApi = "https://ajax.googleapis.com/ajax/services/search/news",
    _suggestApi = "http://suggestqueries.google.com/complete/search",
    _feedApi = "/api/feed/",


/**
 *
 * @public
 *
 */
api = {
    search: function ( query ) {
        return $.ajax({
            url: _searchApi,
            data: {
                q: query,
                v: "1.0",
                rsz: 8,
                hl: "en"
            },
            dataType: "jsonp",
            type: "GET"
        });
    },


    suggest: function ( query ) {
        return $.ajax({
            url: _suggestApi,
            data: {
                q: query,
                client: "chrome",
                hl: "en"
            },
            dataType: "jsonp",
            type: "GET"
        });
    },


    feed: function ( query ) {
        return $.ajax({
            url: _feedApi,
            data: {
                q: query
            },
            dataType: "html",
            type: "GET"
        });
    }
};


/******************************************************************************
 * Export
*******************************************************************************/
export default api;