afterEach (done) ->
  # Wait one more frame so pending callbacks have a chance to run.
  # Pending callbacks might change the URL or cause errors that bleed into
  # the next example.

  console.debug('[reset_up helper] resetting framework in next frame')

  up.util.nextFrame =>
    console.debug('[reset_up helper] resetting framework now')
    up.reset()
    $('.up-toast').remove()
    done()
