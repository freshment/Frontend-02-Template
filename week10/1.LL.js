var regexp = /([0-9\.]+)|([ \t]+)|([\r\n]+)|(\*)|(\/)|(\+)|(\-)/g

var dictionary = ['Number', 'Whitespace', 'LineTerminator', '*', '/', '+', '-']

function* tokensize(source) {
  var result = null
  var lastIndex = 0
  while(true) {
    lastIndex = regexp.lastIndex
    result = regexp.exec(source)

    if (!result) break

    if (regexp.lastIndex - lastIndex > result[0].length) break

    let token = {
      type: null,
      value: null
    }



    for(let i = 1; i <= result.length; i++) {
      if (result[i]) token.type = dictionary[i - 1]
    }
    token.value = result[0]
    yield token
  }
}

for(let token of tokensize('1024 + 10 + 25')) {
  console.log(token)
}