/* global Blob */
module.exports = class DownloadLink {
  constructor (element) {
    this.element = element
  }

  setBlob (blob) {
    if (this.url) {
      window.URL.revokeObjectURL(this.url)
    }
    this.url = window.URL.createObjectURL(blob)
    this.element.setAttribute('href', this.url)
    this.element.setAttribute('target', "_blank")
  }

  setString (string, type) {
    this.setBlob(new Blob([string], { type: type }))
  }
}