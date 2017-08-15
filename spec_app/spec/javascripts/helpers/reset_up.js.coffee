afterEach (done) ->
  # Wait one more frame so pending callbacks have a chance to run.
  # Pending callbacks might change the URL or cause errors that bleed into
  # the next example.
  up.util.nextFrame =>
    up.reset()
    $('.up-toast').remove()
    done()



