class ActionController::Base

    # Links to the {Unpoly::Rails::Inspector#up}.
    def up
      @up_inspector ||= Inspector.new(self)
    end

    alias_method :unpoly, :up

    # :method: up?
    # Returns whether the current request is an
    # [page fragment update](https://unpoly.com/up.replace) triggered by an
    # Unpoly frontend.
    delegate :up?, :unpoly?, to: :up

    # @private
    alias :redirect_to_without_up :redirect_to

    # xxx
    # TODO: Docs
    def redirect_to(options = {}, response_options = {})
      if up?
        options = url_for(options)
        options = up.url_with_request_values(options)
      end
      redirect_to_without_up(options, response_options)
    end

end
