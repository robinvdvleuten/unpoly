class ReplaceTestController < ApplicationController

  layout 'integration_test'

  def delete_action
    redirect_to action: 'page2'
  end

end
