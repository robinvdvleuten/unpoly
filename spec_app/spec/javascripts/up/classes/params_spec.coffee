describe 'up.Params', ->

  u = up.util

  describe '#asQuery()', ->

    encodedOpeningBracket = '%5B'
    encodedClosingBracket = '%5D'
    encodedSpace = '%20'

    it 'returns the query section for the given object', ->
      string = up.util.paramsAsQuery('foo-key': 'foo value', 'bar-key': 'bar value')
      expect(string).toEqual("foo-key=foo#{encodedSpace}value&bar-key=bar#{encodedSpace}value")

    it 'returns the query section for the given nested object', ->
      string = up.util.paramsAsQuery('foo-key': { 'bar-key': 'bar-value' }, 'bam-key': 'bam-value')
      expect(string).toEqual("foo-key#{encodedOpeningBracket}bar-key#{encodedClosingBracket}=bar-value&bam-key=bam-value")

    it 'returns the query section for the given array with { name } and { value } keys', ->
      string = up.util.paramsAsQuery([
        { name: 'foo-key', value: 'foo value' },
        { name: 'bar-key', value: 'bar value' }
      ])
      expect(string).toEqual("foo-key=foo#{encodedSpace}value&bar-key=bar#{encodedSpace}value")

    it 'returns a given query string', ->
      string = up.util.paramsAsQuery('foo=bar')
      expect(string).toEqual('foo=bar')

    it 'strips a leading question mark from the given query string', ->
      string = up.util.paramsAsQuery('?foo=bar')
      expect(string).toEqual('foo=bar')

    it 'returns an empty string for an empty object', ->
      string = up.util.paramsAsQuery({})
      expect(string).toEqual('')

    it 'returns an empty string for an empty string', ->
      string = up.util.paramsAsQuery('')
      expect(string).toEqual('')

    it 'returns an empty string for undefined', ->
      string = up.util.paramsAsQuery(undefined)
      expect(string).toEqual('')

    it 'URL-encodes characters in the key and value', ->
      string = up.util.paramsAsQuery({ 'äpfel': 'bäume' })
      expect(string).toEqual('%C3%A4pfel=b%C3%A4ume')

    it 'URL-encodes plus characters', ->
      string = up.util.paramsAsQuery({ 'my+key': 'my+value' })
      expect(string).toEqual('my%2Bkey=my%2Bvalue')

  describe '#asArray()', ->

    it 'normalized null to an empty array', ->
      array = up.util.paramsAsArray(null)
      expect(array).toEqual([])

    it 'normalized undefined to an empty array', ->
      array = up.util.paramsAsArray(undefined)
      expect(array).toEqual([])

    it 'normalizes an object hash to an array of objects with { name } and { value } keys', ->
      array = up.util.paramsAsArray(
        'foo-key': 'foo-value'
        'bar-key': 'bar-value'
      )
      expect(array).toEqual([
        { name: 'foo-key', value: 'foo-value' },
        { name: 'bar-key', value: 'bar-value' },
      ])

    it 'normalizes a nested object hash to a flat array using param naming conventions', ->
      array = up.util.paramsAsArray(
        'foo-key': 'foo-value'
        'bar-key': {
          'bam-key': 'bam-value'
          'baz-key': {
            'qux-key': 'qux-value'
          }
        }
      )
      expect(array).toEqual([
        { name: 'foo-key', value: 'foo-value' },
        { name: 'bar-key[bam-key]', value: 'bam-value' },
        { name: 'bar-key[baz-key][qux-key]', value: 'qux-value' },
      ])

    it 'returns a given array without modification', ->
      array = up.util.paramsAsArray([
        { name: 'foo-key', value: 'foo-value' },
        { name: 'bar-key', value: 'bar-value' },
      ])
      expect(array).toEqual([
        { name: 'foo-key', value: 'foo-value' },
        { name: 'bar-key', value: 'bar-value' },
      ])

    it 'does not URL-encode special characters keys or values', ->
      array = up.util.paramsAsArray(
        'äpfel': { 'bäume': 'börse' }
      )
      expect(array).toEqual([
        { name: 'äpfel[bäume]', value: 'börse' },
      ])

    it 'does not URL-encode spaces in keys or values', ->
      array = up.util.paramsAsArray(
        'my key': 'my value'
      )
      expect(array).toEqual([
        { name: 'my key', value: 'my value' },
      ])

    it 'does not URL-encode ampersands in keys or values', ->
      array = up.util.paramsAsArray(
        'my&key': 'my&value'
      )
      expect(array).toEqual([
        { name: 'my&key', value: 'my&value' },
      ])

    it 'does not URL-encode equal signs in keys or values', ->
      array = up.util.paramsAsArray(
        'my=key': 'my=value'
      )
      expect(array).toEqual([
        { name: 'my=key', value: 'my=value' },
      ])

