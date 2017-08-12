beforeEach ->
  console.debug('--- jasmine.ajax installed ---')
  jasmine.Ajax.install()

afterEach ->
  console.debug('--- jasmine.ajax uninstalled ---')
  jasmine.Ajax.uninstall()
