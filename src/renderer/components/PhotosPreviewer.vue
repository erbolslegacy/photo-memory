<template>
  <div class="container-fluid">
    <div class="col-md-12" ref="container">
      <div class="row">
        <div class="preview gallery" @onAfterAppendSubHtml="injectEditor" @onBeforeSlide="afterSlide">
          <div data-sub-html="<div id='editor'></div>"
               class="image-container"
               :href="image.original"
               @click="showImage(index, image.name)"
               v-for="(image, index) in images" :key="image.path">
            <img v-lazy="image.path" :style="{width: image.width + 'px', height: image.height + 'px'}"/>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import Vue from 'vue'
  import TextEditor from '../components/TextEditor'
  import Masonry from 'masonry-layout'
  import 'lightgallery.js/dist/css/lightgallery.min.css'
  import 'lightgallery.js'
  import 'lg-zoom.js'
  import 'lg-autoplay.js'

  export default {
    name: 'photos-previewer',
    props: {
      images: Array
    },
    data () {
      return {
        notes: {},
        photoTextEditor: null,
        selectedImageName: null,
        galleryInitialed: false
      }
    },
    methods: {
      injectEditor () {
        setTimeout(() => {
          document.querySelector('#editor').appendChild(this.photoTextEditor.$el)
        })
      },

      afterSlide (event) {
        let newSlide = window.lgData.lg0.items[event.detail.index]
        if (newSlide) {
          let name = newSlide.attributes.href.value.split('/').pop()
          this.selectedImageName = name
          this.photoTextEditor.setValue(this.notes[this.selectedImageName])

          setTimeout(() => {
            document.querySelector('.ck-content').focus()
          }, 1000)
        }
      },

      showImage (index, name) {
        this.selectedImageName = name
        this.photoTextEditor.setValue(this.notes[this.selectedImageName])
        const gallery = document.querySelector('.preview')
        const plugin = window.lgData[gallery.getAttribute('lg-uid')]
        plugin.build(index, true)
        setTimeout(() => {
          document.querySelector('.ck-content').focus()
        }, 100)
      },

      initGallery () {
        /* eslint-disable no-new */
        let msnry = new Masonry('.preview', {
          gutter: 10,
          itemSelector: '.image-container',
          resize: false
        })

        msnry.layout()

        if (this.galleryInitialed) {
          return
        }

        const gallery = document.querySelector('.preview')
        window.lightGallery(gallery)
        this.galleryInitialed = true

        // hack the light gallery a bit
        const plugin = window.lgData[gallery.getAttribute('lg-uid')]
        let originalBuild = plugin.build.bind(plugin)
        plugin.build = (index, manual) => {
          if (manual) {
            originalBuild(index)
          }
        }
      }
    },

    mounted () {
      this.photoTextEditor = new (Vue.extend(TextEditor))()
      this.photoTextEditor.$mount()
      this.photoTextEditor.$on('input', (note) => {
        this.$set(this.notes, this.selectedImageName, note)
        this.$set(this.selectedImagesNames, this.selectedImageName, true)
      })

      setTimeout(() => {
        this.initGallery()
      })
    },

    destroyed () {
      window.removeEventListener('resize', this.onResize)
      this.photoTextEditor.$destroy()
    }
  }
</script>

<style lang="scss">
  .gallery {
    width: 100%;

    .image-container {
      position: relative;
      margin-bottom: 10px;

      img {
        width: 100%;
        background: #ccc;
      }

      .icon-selected {
        position: absolute;
        left: 24px;
        top: 26px;
        color: #fff;
        z-index: 2;
      }

      .cover {
        position: absolute;
        opacity: 0;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        background-image: linear-gradient(180deg,rgba(0,0,0,.2) 0,rgba(0,0,0,.199) 3.5%,rgba(0,0,0,.195) 7%,rgba(0,0,0,.19) 10.35%,rgba(0,0,0,.182) 13.85%,rgba(0,0,0,.174) 17.35%,rgba(0,0,0,.165) 20.85%,rgba(0,0,0,.155) 24.35%,rgba(0,0,0,.145) 27.85%,rgba(0,0,0,.135) 31.35%,rgba(0,0,0,.126) 34.85%,rgba(0,0,0,.118) 38.35%,rgba(0,0,0,.11) 41.85%,rgba(0,0,0,.105) 45.35%,rgba(0,0,0,.1) 48.85%,rgba(0,0,0,.103) 52.35%,rgba(0,0,0,.112) 55.85%,rgba(0,0,0,.126) 59.35%,rgba(0,0,0,.144) 62.85%,rgba(0,0,0,.165) 66.35%,rgba(0,0,0,.188) 69.85%,rgba(0,0,0,.213) 73.35%,rgba(0,0,0,.237) 76.85%,rgba(0,0,0,.262) 80.35%,rgba(0,0,0,.285) 83.85%,rgba(0,0,0,.306) 87.35%,rgba(0,0,0,.324) 90.85%,rgba(0,0,0,.338) 94.35%,rgba(0,0,0,.347) 97.85%,rgba(0,0,0,.35));
        transition: opacity 300ms;
        cursor: pointer;

        .actions {
          position: relative;
          display: flex;
          font-size: 12px;

          // aligned to left
          justify-content: flex-end;
          top: 20px;
          right: 20px;

          // aligned to center
          /*justify-content: center;*/
          /*height: 100%;*/
          /*align-items: center;*/

          .btn {
            background-color: hsla(0,0%,100%,.85);
            font-size: 14px;

            &:hover {
              background-color: #fff;
            }
          }
        }
      }

      &.selected {
        .select-cover {
          position: absolute;
          opacity: 0.5;
          top: 0;
          bottom: 0;
          left: 0;
          right: 0;
          background: #4e73df;
          pointer-events: none;
        }
      }

      &:hover {
        .cover {
          opacity: 1;
        }
      }
    }
  }
</style>