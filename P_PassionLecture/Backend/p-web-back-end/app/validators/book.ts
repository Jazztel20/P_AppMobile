import vine from '@vinejs/vine'

const BookValidator = vine.compile(
    vine.object({
        title: vine.string().minLength(2).maxLength(255),
        numberOfPages: vine.number(),
        pdfLink: vine.string().minLength(2).maxLength(255),
        abstract: vine.string().minLength(2).maxLength(255),
        editor: vine.string().minLength(2).maxLength(255),
        editionYear: vine.number(),
        imagePath: vine.string().minLength(2).maxLength(255),
        categoryId: vine.number().exists(async (db, value) => {
      const category = await db.from('categories').where('id', value).first()
      // user est soit un objet (si trouvé), soit undefined (si non trouvé).
      // On retourne true si user existe, false sinon
      return !!category
    }),
    })
)