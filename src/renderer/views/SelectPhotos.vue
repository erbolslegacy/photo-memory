<template>
  <div class="page">
    <!-- Main Content -->
    <div id="content" class="mt-4">
      <!-- Begin Page Content -->
      <div class="container-fluid">

        <!-- Page Heading -->
        <div class="d-sm-flex align-items-center justify-content-between mb-4">
          <h1 class="h3 mb-0 text-gray-800">Select Photos</h1>
        </div>

        <div class="col-md-12" ref="container">
          <div class="row">
            <div class="gallery" :class="{invisible: !gridReady}">
              <div class="image-container" :class="{selected: selectedImages.names[image.name]}" @click.prevent.stop="toggle(image.name)" v-for="(image, index) in thumbnails" :key="image.path">
                <img v-lazy="image.path" :style="{width: image.width + 'px', height: image.height + 'px'}"/>
                <span class="icon-selected" v-if="selectedImages.names[image.name]">
                  <i class="fas fa-check-circle"></i>
                </span>
                <div class="cover">
                  <div class="actions">
                    <a v-if="!selectedImages.names[image.name]" href="#" title="Select Photo" @click.prevent.stop="select(image.name)" class="btn btn-light btn-circle btn-select">
                      <i class="fas fa-plus"></i>
                    </a>
                    <a v-else href="#" title="Unselect Photo" @click.prevent.stop="unselect(image.name)" class="btn btn-light btn-circle btn-select">
                      <i class="fas fa-minus"></i>
                    </a>
                  </div>
                </div>
                <div class="select-cover"></div>
              </div>
              <div v-if="!thumbnails.length" class="no-image">
                <i class="fas fa-folder-open"></i>
                <span class="no-image-text">no images here</span>
              </div>
            </div>
          </div>
        </div>

        <b-spinner v-if="showLoading" class="loading-spinner" type="grow" variant="primary" label="Loading..."></b-spinner>
      </div>
      <!-- /.container-fluid -->
    </div>
    <!-- End of Main Content -->

    <!-- Footer -->
    <footer class="footer" v-if="thumbnails.length">
      <div class="container-fluid">
        <a href="#" @click.prevent="showModal" :class="{disabled: !hasSelectedItems}" title="Create a Memory" class="btn btn-primary btn-circle">
          <i class="fas fa-plus"></i>
        </a>
      </div>
    </footer>
    <!-- End of Footer -->

    <b-modal lazy id="createMemory" okTitle="Save" scrollable size="xl" title="Create a Memory" @ok="onSave()">
      <photos-previewer :images="selectedImages.thumbnails"></photos-previewer>

      <b-form>
        <b-form-group class="memory-desc">
          <ckeditor :editor="editor" v-model="description" :config="editorConfig"></ckeditor>
        </b-form-group>
      </b-form>

      <template slot="modal-footer" slot-scope="{ ok, cancel }">
        <b-button :disabled="showLoading" variant="primary" @click="ok()">
          Save
        </b-button>
        <b-button @click="cancel()">
          Cancel
        </b-button>
      </template>
    </b-modal>

  </div>
</template>

<script>
  import { mapActions, mapGetters } from 'vuex'
  import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
  import sharp from 'sharp'
  import PhotosPreviewer from '../components/PhotosPreviewer'
  import Masonry from 'masonry-layout'

  export default {
    name: 'select-photos',
    components: { PhotosPreviewer },
    computed: {
      ...mapGetters([
        'sourcePath',
        'destinationPath',
        'scannedImages',
        'imageNotes',
        'handledImages'
      ]),

      hasSelectedItems () {
        if (this.selectedImages.names) {
          return Object.keys(this.selectedImages.names).length
        }
      }
    },
    watch: {
      handledImages () {
        this.thumbnails = this.thumbnails.filter(thumb => !(thumb.name in this.handledImages))

        this.updateMasonry()
      }
    },
    data () {
      return {
        thumbnails: [],
        selectedImages: {
          names: {},
          thumbnails: []
        },

        description: '',

        resizeTimeout: null,
        resizeDelay: 200,

        editor: ClassicEditor,
        editorConfig: {
          placeholder: 'Description',
          toolbar: [
            'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote', 'undo', 'redo'
          ]
        },
        showLoading: false,
        gridReady: false
      }
    },
    methods: {
      ...mapActions([
        'scanDirectory',
        'saveMemory'
      ]),

      onResize () {
        clearTimeout(this.resizeTimeout)
        this.resizeTimeout = setTimeout(() => {
          this.updateImages()
        }, this.resizeDelay)
      },

      updateImages () {
        const sizesPromises = []
        const containerWidth = this.$refs.container.offsetWidth
        const nonHandlesImages = this.scannedImages.filter(name => !(name in this.handledImages))

        nonHandlesImages.forEach(image => {
          let size = sharp(`${this.sourcePath}/${image}`)
            .metadata()
            .then(({ width, height }) => {
              let columnWidth = (containerWidth / 3) - 7
              let ratio = width / columnWidth
              height = height / ratio
              width = columnWidth

              return {
                width,
                height,
                path: `thumb://${this.sourcePath}/${image}?w=${parseInt(width)}`,
                original: `orig://${this.sourcePath}/${image}`,
                name: image
              }
            })
            .catch(() => {
              console.log(`${image} is not a valid image`)
            })
          sizesPromises.push(size)
        })

        Promise.all(sizesPromises)
          .then(sizes => {
            this.thumbnails = sizes.filter(size => size)

            this.updateMasonry()
          })
      },

      updateMasonry () {
        if (!this.thumbnails.length) {
          this.gridReady = true
          this.showLoading = false
          return
        }
        setTimeout(() => {
          /* eslint-disable no-new */
          let msnry = new Masonry('.gallery', {
            gutter: 10,
            itemSelector: '.image-container',
            resize: false
          })

          msnry.layout()
          this.gridReady = true
          this.showLoading = false
        }, 100)
      },

      select (name) {
        this.$set(this.selectedImages.names, name, true)
      },

      unselect (name) {
        this.$delete(this.selectedImages.names, name)
      },

      toggle (name) {
        if (!this.selectedImages.names[name]) {
          this.select(name)
        } else {
          this.unselect(name)
        }
      },

      showModal () {
        this.selectedImages.thumbnails = this.thumbnails.filter(item => {
          return item.name in this.selectedImages.names
        })
        this.$bvModal.show('createMemory')

        setTimeout(() => {
          document.querySelector('#createMemory .ck-content').focus()
        }, 300)
      },

      onSave () {
        // this.showLoading = true
        this.saveMemory({
          selectedImagesNames: this.selectedImages.names,
          imageNotes: this.imageNotes,
          description: this.description
        })
          .then(() => {
            this.showLoading = false
            this.description = ''
            this.selectedImages = {
              names: {},
              thumbnails: []
            }
          })
          .catch(() => {
            this.showLoading = false
          })
      }
    },

    mounted () {
      this.showLoading = true
      if (this.sourcePath) {
        this.scanDirectory(this.sourcePath)
          .then(() => this.updateImages())

        window.addEventListener('resize', this.onResize)
      } else {
        this.$router.push('/')
      }
    },

    destroyed () {
      window.removeEventListener('resize', this.onResize)
    }
  }
</script>

<style scoped lang="scss">
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
  .footer {
    height: 64px;
    display: flex;
    align-items: center;
    box-shadow: 0 -0.30rem 1.75rem 0 rgba(58, 59, 69, 0.15);
    text-align: center;
  }
  /deep/ .ck-editor__editable_inline {
    min-height: 140px;

    p {
      margin-top: 8px;
      margin-bottom: 8px;
    }
  }
  .loading-spinner {
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    margin: auto;
    z-index: 9999;
    bottom: 50%;
    width: 5rem;
    height: 5rem;
  }
  .page {
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  /deep/ .memory-desc {
    margin-bottom: 0;
    margin-top: 10px;
  }

  .invisible {
    visibility: hidden;
  }
  .no-image {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    color: #ced4da;

    i {
      font-size: 100px
    }
    .no-image-text {
      color: darkgray;
      font-size: 20px;
      font-style: italic;
    }
  }
</style>
