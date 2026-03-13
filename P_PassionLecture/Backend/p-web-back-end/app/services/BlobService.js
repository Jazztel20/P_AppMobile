'use strict'

const { BlobServiceClient } = require('@azure/storage-blob')
const Config = use('Config')

class BlobService {
  
  constructor() {
    const connectionString = Config.get('azure.connection')
    this.blobServiceClient = BlobServiceClient.fromConnectionString(connectionString)
    this.containerName = Config.get('azure.containerName')
  }

  async uploadFile(filePath, fileName, mimeType) {
    const containerClient = this.blobServiceClient.getContainerClient(this.containerName)
    await containerClient.createIfNotExists({ access: 'blob' })
    
    const blockBlobClient = containerClient.getBlockBlobClient(fileName)
    await blockBlobClient.uploadFile(filePath, {
      blobHTTPHeaders: { blobContentType: mimeType }
    })

    return {
      success: true,
      url: blockBlobClient.url,
      fileName
    }
  }

  async listFiles() {
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

    return files
  }

  async deleteFile(fileName) {
    const containerClient = this.blobServiceClient.getContainerClient(this.containerName)
    const blockBlobClient = containerClient.getBlockBlobClient(fileName)
    
    await blockBlobClient.deleteIfExists()
    return { success: true }
  }

  async downloadFile(fileName) {
    const containerClient = this.blobServiceClient.getContainerClient(this.containerName)
    const blockBlobClient = containerClient.getBlockBlobClient(fileName)
    
    return await blockBlobClient.download(0)
  }
}

module.exports = new BlobService()
