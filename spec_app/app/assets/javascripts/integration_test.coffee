#= require jquery
#= require jquery_ujs
#= require zousan
#= require unpoly

up.compiler '.compiler', ($element) ->
  console.error('*** Compiler called for %o', $element.get(0))
  -> console.error('*** Destructor called for %o', $element.get(0))
