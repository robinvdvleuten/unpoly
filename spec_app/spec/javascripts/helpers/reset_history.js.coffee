u = up.util

replaceStateHelperCount = 0

beforeEach ->
  # Webkit ignores replaceState() calls after 100 calls / 30 sec.
  # So specs need to explicitely activate history handling.
  up.history.config.enabled = false

  # Store original URL and title so we can restore it in afterEach.
  @hrefBeforeExample = location.href
  @titleBeforeExample = document.title

afterEach (done) ->
  up.util.nextFrame =>

    document.title = @titleBeforeExample

    normalize = (url) -> u.normalizeUrl(url, hash: true)
    # Webkit ignores replaceState() calls after 100 calls / 30 sec.
    # So let's not call use up our budget unless we need it.
    if normalize(@hrefBeforeExample) != normalize(location.href)
      replaceStateHelperCount++
      console.error("replaceState form helper %o (%o vs %o)", replaceStateHelperCount, normalize(@hrefBeforeExample), normalize(location.href))
      history.replaceState?({ fromResetPathHelper: true }, '', @hrefBeforeExample)

    done()

