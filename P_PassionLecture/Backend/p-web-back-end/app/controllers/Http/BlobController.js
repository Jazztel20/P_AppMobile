'use strict'

const { BlobServiceClient } = require('@azure/storage-blob')
const Config = use('Config')
const Helpers = use('Helpers')

class BlobController {
  
  constructor() {
    const connectionString = Config.get('azure.connection')
    this.blobServiceClient = BlobServiceClient.fromConnectionString(connectionString)
    this.containerName = Config.get('azure.containerName')
  }

  async upload({ request, response }) {
    try {
      const file = request.file('file', {
        types: ['image', 'pdf', 'video'],
        size: '10mb'
      })

      if (!file) {
        return response.status(400).json({ error: 'No file provided' })
      }

      await file.moveAll(Helpers.tmpPath('uploads'))

      if (!file.movedAll()) {
        return response.status(400).json({ error: file.errors() })
      }

      // Get the moved file
      const movedFile = file.movedList()[0]
      const fileName = `${new Date().getTime()}-${movedFile.clientName}`
      
      // Upload to Azure
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName)
      await containerClient.createIfNotExists({ access: 'blob' })
      
      const blockBlobClient = containerClient.getBlockBlobClient(fileName)
      await blockBlobClient.uploadFile(movedFile.tmpPath)

      // Clean up temp file
      const fs = require('fs')
      fs.unlinkSync(movedFile.tmpPath)

      return response.json({
        message: 'File uploaded successfully',
        file: {
          name: fileName,
          url: blockBlobClient.url
        }
      })

    } catch (error) {
      console.error('Upload error:', error)
      return response.status(500).json({ error: error.message })
    }
  }

  async list({ response }) {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName)
      const files = []

      for await (const blob of containerClient.listBlobsFlat()) {
        files.push({
          name: blob.name,
          url: `${containerClient.url}/${blob.name}`,
          size: blob.properties.contentLength,
          lastModified: blob.properties.lastModified
        })
      }

      return response.json({ files })

    } catch (error) {
      console.error('List error:', error)
      return response.status(500).json({ error: error.message })
    }
  }

  async delete({ params, response }) {
    try {
      const { fileName } = params
      
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName)
      const blockBlobClient = containerClient.getBlockBlobClient(fileName)
      
      await blockBlobClient.deleteIfExists()

      return response.json({ 
        success: true, 
        message: 'File deleted successfully' 
      })

    } catch (error) {
      console.error('Delete error:', error)
      return response.status(500).json({ error: error.message })
    }
  }

  async download({ params, response }) {
    try {
      const { fileName } = params
      
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName)
      const blockBlobClient = containerClient.getBlockBlobClient(fileName)
      
      const downloadResponse = await blockBlobClient.download(0)
      
      response.header('Content-Type', downloadResponse.contentType)
      response.header('Content-Disposition', `attachment; filename="${fileName}"`)
      
      downloadResponse.readableStreamBody.pipe(response.response)

    } catch (error) {
      console.error('Download error:', error)
      return response.status(500).json({ error: error.message })
    }
  }
}

module.exports = BlobController
