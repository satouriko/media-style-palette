<template>
  <div id="app">
    <input type="file"
           id="artwork" name="artwork"
           accept="image/png, image/jpeg"
           @change="onImageSelected"
    />
    <div id="container">
      <div :class="`label ${colors.left.active}`" :style="`
        width: 512px;
        height: 256px;
        transform: translate(-75%, -50%);
        background: linear-gradient(to right, ${colors.left.backgroundColor} 50%, ${a0(colors.left.backgroundColor)})
      `" @click="setActive('left')">
        <div :style="`
          margin-right: 256px
        `">
          <span :style="`color: ${colors.left.primaryColor}`">
            Primary {{ colors.left.primaryColor }}
          </span>
          <p :style="`color: ${colors.left.secondaryColor}`">
            Secondary {{ colors.left.secondaryColor }}<br/>
            Background {{ colors.left.backgroundColor }}
          </p>
        </div>
      </div>
      <div :class="`label ${colors.right.active}`" :style="`
        width: 512px;
        height: 256px;
        transform: translate(-25%, -50%);
        background: linear-gradient(to left, ${colors.right.backgroundColor} 50%, ${a0(colors.right.backgroundColor)})
      `" @click="setActive('right')">
        <div :style="`
          margin-left: 256px
        `">
          <span :style="`color: ${colors.right.primaryColor}`">
            Primary {{ colors.right.primaryColor }}
          </span>
          <p :style="`color: ${colors.right.secondaryColor}`">
            Secondary {{ colors.right.secondaryColor }}<br/>
            Background {{ colors.right.backgroundColor }}
          </p>
        </div>
      </div>
      <div :class="`label ${colors.top.active}`" :style="`
        width: 256px;
        height: 512px;
        transform: translate(-50%, -75%);
        background: linear-gradient(to bottom, ${colors.top.backgroundColor} 50%, ${a0(colors.top.backgroundColor)})
      `" @click="setActive('top')">
        <div :style="`
          margin-bottom: 256px
        `">
          <span :style="`color: ${colors.top.primaryColor}`">
            Primary {{ colors.top.primaryColor }}
          </span>
          <p :style="`color: ${colors.top.secondaryColor}`">
            Secondary {{ colors.top.secondaryColor }}<br/>
            Background {{ colors.top.backgroundColor }}
          </p>
        </div>
      </div>
      <div :class="`label ${colors.bottom.active}`" :style="`
        width: 256px;
        height: 512px;
        transform: translate(-50%, -25%);
        background: linear-gradient(to top, ${colors.bottom.backgroundColor} 50%, ${a0(colors.bottom.backgroundColor)})
      `" @click="setActive('bottom')">
        <div :style="`
          margin-top: 256px
        `">
          <span :style="`color: ${colors.bottom.primaryColor}`">
            Primary {{ colors.bottom.primaryColor }}
          </span>
          <p :style="`color: ${colors.bottom.secondaryColor}`">
            Secondary {{ colors.bottom.secondaryColor }}<br/>
            Background {{ colors.bottom.backgroundColor }}
          </p>
        </div>
      </div>
      <img alt="" :src="imgSrc" ref="img" />
    </div>
  </div>
</template>

<script>
import MediaStylePalette from '../../'

export default {
  name: 'app',
  data() {
    return {
      colors: {
        left: {
          primaryColor: '',
          secondaryColor: '',
          backgroundColor: '',
        },
        right: {
          primaryColor: '',
          secondaryColor: '',
          backgroundColor: '',
        },
        top: {
          primaryColor: '',
          secondaryColor: '',
          backgroundColor: '',
        },
        bottom: {
          primaryColor: '',
          secondaryColor: '',
          backgroundColor: '',
        }
      },
      imgSrc: '',
      mediaStylePalette: new MediaStylePalette(),
    }
  },
  methods: {
    setActive(position) {
      for (const k in this.colors) {
        if (this.colors.hasOwnProperty(k)) {
          if (k === position) {
            this.$set(this.colors[k], 'active', 'active')
          } else {
            this.$set(this.colors[k], 'active', '')
          }
        }
      }
    },
    a0(color) {
      if (!color) return ''
      return `rgba(${color.rgb[0]}, ${color.rgb[1]}, ${color.rgb[2]}, 0)`
    },
    onImageSelected(e) {
      const files = e.target.files
      if (files && files[0]) {
        const reader = new FileReader()
        reader.onload = (e) => {
          this.imgSrc = e.target.result
        }
        this.$refs.img.onload = () => {
          this.mediaStylePalette
            .from(this.$refs.img)
          const v = [
            { n: 'left', d: -90 },
            { n: 'right', d: 90 },
            { n: 'top', d: 0 },
            { n: 'bottom', d: 180 },
          ]
          for (const p of v) {
            this.mediaStylePalette
              .use({
                direction: p.d
              })
              .getPalette()
              .then(palette => {
                this.$set(this.colors, p.n, palette)
              })
          }
        }
        reader.readAsDataURL(files[0])
      }
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 30px;
}

input {
  margin: 10px 0;
}

#container {
  position: relative;
}

.label {
  position: absolute;
  top: 50%;
  left: 50%;
  cursor: pointer;
}

.label div {
  height: 64px;
  padding: 96px 0;
}

.label span {
  font-size: 1.25rem;
}

table {
  margin: 20px auto;
}

table tr th, td {
  border: 1px solid #000;
  padding: 1rem;
  width: 20px;
}

img {
  display: block;
  margin: 256px auto;
  width: 256px;
  height: 256px;
  z-index: 2;
  position: relative;
}

.active {
  z-index: 3;
}

</style>
