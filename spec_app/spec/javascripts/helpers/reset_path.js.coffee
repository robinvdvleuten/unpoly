u = up.util

beforeEach ->
  @hrefBeforeExample = location.href
  @titleBeforeExample = document.title

afterEach (done) ->
  up.util.nextFrame =>
    normalize = (url) -> u.normalizeUrl(url, hash: true)
    # Webkit ignores replaceState() calls after 100 calls / 30 sec.
    # So let's not call use up our budget unless we need it.
    if normalize(@hrefBeforeExample) != normalize(location.href)
      history.replaceState?({ fromResetPathHelper: true }, '', @hrefBeforeExample)
      document.title = @titleBeforeExample
    done()

