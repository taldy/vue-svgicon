function getName(uri) {
  return uri.split(/[\/\\]/gi).pop().replace('.svg', '')
}

function loader(source) {
  this.cacheable()
  var callback = this.async()

  const Svgo = require('svgo')

  let svgo = new Svgo({
    plugins: [
      {
        removeAttrs: {
          attrs: ['(path|rect|circle|polygon|line|polyline|g):(fill|stroke)']
        }
      },
      {
        removeTitle: true
      },
      {
        removeStyleElement: true
      },
      {
        removeComments: true
      },
      {
        removeDesc: true
      },
      {
        removeUselessDefs: true
      },
      {
        cleanupIDs: {
          remove: true,
          prefix: 'svgicon-'
        }
      },
      {
        convertShapeToPath: true
      }
    ]
  })


  svgo.optimize(source, (result) => {
    let data = result.data.replace(/<svg[^>]+>/gi, '').replace(/<\/svg>/gi, '')
    let viewBox = result.data.match(/viewBox="([\d\.]+\s[\d\.]+\s[\d\.]+\s[\d\.]+)"/)

    if (viewBox && viewBox.length > 1) {
      viewBox = `${viewBox[1]}`
    }

    // add pid attr, for css
    let reg = /<(path|rect|circle|polygon|line|polyline)\s/gi
    let id = 0
    data = data.replace(reg, function (match) {
      return match + `pid="${id++}" `
    })

    const iconName = getName(this._module.userRequest);
    const iconData = {
      width: parseFloat(result.info.width)|| 16,
      height: parseFloat(result.info.height)|| 16,
      viewBox,
      data
    }

    callback(null, `
    require('vue-svgicon').register({'${iconName}': ${JSON.stringify(iconData)}})

    module.exports = {name: '${iconName}',data: ${JSON.stringify(iconData)}}
    `)
  })
}

module.exports = loader
