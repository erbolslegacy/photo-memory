import { remote } from 'electron'
import fs from 'fs'
import Swal from 'sweetalert2'
import sharp from 'sharp'

export default {
  chooseDirectory ({dispatch}) {
    return new Promise((resolve) => {
      remote.dialog.showOpenDialog({ properties: ['openDirectory'] }, (filePaths) => {
        if (!filePaths) {
          return resolve()
        }
        dispatch('setSourcePath', filePaths[0])
        resolve(filePaths[0])
      })
    })
  },

  scanDirectory ({commit}, directory) {
    return new Promise((resolve, reject) => {
      fs.readdir(directory, function (err, files) {
        if (err) {
          return reject(err)
        }
        const withExtension = files.filter(file => !file.startsWith('.') && file.split('.').length > 1)
        commit('setScannedImages', withExtension)
        resolve(withExtension)
      })
    })
  },

  saveMemory ({getters, dispatch, commit}, { selectedImagesNames, description }) {
    // copy images
    const fs = require('fs').promises
    const fsSync = require('fs')
    const path = require('path')
    const ops = []
    const imagesFolder = 'images'
    const imagesThumbFolder = 'thumb'
    const notes = getters.imageNotes
    let { sourcePath, destinationPath } = getters

    let subFolder = new Date().toISOString()
      .replace(/\.+.+/, '')
      .replace(/:/g, '-')
    destinationPath = path.join(destinationPath, subFolder)

    try {
      fsSync.mkdirSync(destinationPath)
    } catch (e) {
      console.log('sub folder already exists')
    }

    try {
      fsSync.mkdirSync(path.join(destinationPath, imagesFolder))
    } catch (e) {
      console.log('images folder already exists')
    }

    // copy images
    for (let image in selectedImagesNames) {
      const imagePath = path.join(sourcePath, image)
      const imgDestinationPath = path.join(destinationPath, imagesFolder, image)
      const imagePromise = fs.copyFile(imagePath, imgDestinationPath)
      ops.push(imagePromise)
    }

    try {
      fsSync.mkdirSync(path.join(destinationPath, imagesThumbFolder))
    } catch (e) {
      console.log('thumbnails folder already exists')
    }

    // copy thumbnails
    for (let image in selectedImagesNames) {
      const imagePath = path.join(sourcePath, image)
      const imgDestinationPath = path.join(destinationPath, imagesThumbFolder, image)
      const thumbWidth = 350

      const thumbPromise = sharp(imagePath)
        .resize(thumbWidth)
        .jpeg({ quality: 100 })
        .toFile(imgDestinationPath)
        .catch(() => {
          console.log('unable to create a thumbnail')
        })
      ops.push(thumbPromise)
    }

    // generate HTML
    let templatePromise = fs.readFile(path.join(__static, '/template.html'), 'utf8')
      .then(template => {
        const oParser = new DOMParser()
        const templateDom = oParser.parseFromString(template, 'text/html')
        const gridEl = templateDom.querySelector('#grid')
        const descriptionEl = templateDom.querySelector('#description')

        for (let image in selectedImagesNames) {
          const imageItemTemplate = `<a href="#"><img src="./${imagesThumbFolder}/${image}"></a>`
          const li = document.createElement('li')
          li.setAttribute('data-src', `./${imagesFolder}/${image}`)
          if (notes[image]) {
            li.setAttribute('data-sub-html', notes[image])
          }
          li.innerHTML = imageItemTemplate
          gridEl.appendChild(li)
        }
        descriptionEl.innerHTML = description

        return fs.writeFile(path.join(destinationPath, 'index.html'), `<!DOCTYPE html>` + templateDom.documentElement.outerHTML)
          .catch(() => {
            console.log('unable to save generated HTML')
          })
      })
      .catch(() => {
        console.log('unable to read an HTML html')
      })
    ops.push(templatePromise)

    // remember handled images
    dispatch('rememberHandledImages', selectedImagesNames)

    // remember generated memory
    let previewThumbsCounter = 0
    let previewThumbs = []
    for (let image in selectedImagesNames) {
      previewThumbs.push(path.join(destinationPath, imagesThumbFolder, image))
      previewThumbsCounter++
      if (previewThumbsCounter === 3) {
        break
      }
    }
    const memory = {
      description: description.replace(/<[^>]*>?/gm, ''),
      path: destinationPath,
      thumbs: previewThumbs
    }
    dispatch('rememberMemory', memory)

    return Promise.all(ops)
      .then(() => {
        Swal.fire({
          title: 'Good job!',
          html: `You have just created a new photo memory! <br> Reference name: <b>${subFolder}</b>`,
          type: 'success'
        })
      })
  },

  rememberHandledImages ({getters, commit}, images) {
    commit('rememberHandledImages', images)
    localStorage.setItem('handledImages', JSON.stringify(getters.handledImages))
  },

  rememberMemory ({getters, commit}, memory) {
    commit('setMemories', [...getters.memories, memory])
    localStorage.setItem('memories', JSON.stringify(getters.memories))
  },

  initSettings ({ commit }) {
    let sourcePath = localStorage.getItem('sourcePath')
    let destinationPath = localStorage.getItem('destinationPath')
    let handledImages = localStorage.getItem('handledImages')
    let memories = localStorage.getItem('memories')

    commit('setSourcePath', sourcePath)
    commit('setDestinationPath', destinationPath)

    if (handledImages) {
      try {
        commit('rememberHandledImages', JSON.parse(handledImages))
      } catch (e) {
        console.log('unable to parse handled images')
      }
    }

    if (memories) {
      try {
        commit('setMemories', JSON.parse(memories))
      } catch (e) {
        console.log('unable to parse memories')
      }
    }
  },

  setSourcePath ({getters, commit}, directory) {
    localStorage.setItem('sourcePath', directory)
    commit('setSourcePath', directory)
  },

  setDestinationPath ({getters, commit}, directory) {
    localStorage.setItem('destinationPath', directory)
    commit('setDestinationPath', directory)
  },

  setImageNote ({getters, commit}, { image, note }) {
    commit('setImageNote', { image, note })
  },

  setActiveImage ({getters, commit}, name) {
    commit('setActiveImage', name)
  },

  toggleEditor ({getters, commit}, show) {
    commit('toggleEditor', show)
  }
}
