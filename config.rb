###
# Compass
###

# Change Compass configuration
# compass_config do |config|
#   config.output_style = :compact
# end

###
# Autoprefixer
###
activate :autoprefixer do |config|
    config.browsers = ["last 2 versions", "Explorer >= 9"]
    config.cascade  = false
end

###
# Application Cache
###
activate :app_cache do |config|
    config.cache_manifest = "/manifest.appcache"
    config.cache = %w(index.html /**/*.html favicon.png stylesheets/**/* javascripts/**/* images/**/* fonts/**/* audio/**/* video/**/*)
end

###
# Page options, layouts, aliases and proxies
###

# Per-page layout changes:
#
# With no layout
# page "/path/to/file.html", :layout => false
#
# With alternative layout
# page "/path/to/file.html", :layout => :otherlayout
#
# A path which all have the same layout
# with_layout :admin do
#   page "/admin/*"
# end
page "/api/*", :layout => false

# Proxy pages (http://middlemanapp.com/basics/dynamic-pages/)
# proxy "/this-page-has-no-template.html", "/template-file.html", :locals => {
#  :which_fake_page => "Rendering a fake page with a local variable" }

# Pretty URLs
activate :directory_indexes

# Ignore source js for build
ignore "javascripts/app/*"
ignore "javascripts/lib/*"

# Automatic image dimensions on image_tag helper
# activate :automatic_image_sizes

# Reload the browser automatically whenever files change
# configure :development do
#     activate :livereload
# end

###
# Helpers
###

# Methods defined in the helpers block are available in templates
helpers do
    def ordered_random_merge(a,b)
        a, b = a.dup().shuffle(), b.dup().shuffle()
        a.map{rand(b.size+1)}.sort.reverse.each do |index|
            b.insert(index, a.pop)
        end
        b
    end
end

set :css_dir, "stylesheets"

set :js_dir, "javascripts"

set :images_dir, "images"

# Build-specific configuration
configure :build do
    # For example, change the Compass output style for deployment
    activate :minify_css
    
    # Minify Javascript on build
    activate :minify_javascript
    
    # Enable cache buster
    # activate :asset_hash
    
    # Use relative URLs
    # activate :relative_assets
    
    # Or use a different image path
    # set :http_prefix, "/maekan/"
end
