export async function prepareProfilePhoto(file: File): Promise<string> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error('JPG, PNG 또는 WebP 사진을 선택해주세요.')
  }
  if (file.size > 10 * 1024 * 1024) throw new Error('10MB 이하의 사진을 선택해주세요.')
  const image = await createImageBitmap(file).catch(() => {
    throw new Error('선택한 사진을 읽을 수 없어요. 다른 파일을 선택해주세요.')
  })
  try {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 256
    const context = canvas.getContext('2d')
    if (!context) throw new Error('이 브라우저에서 사진을 처리할 수 없어요.')
    const size = Math.min(image.width, image.height)
    context.drawImage(image, (image.width - size) / 2, (image.height - size) / 2, size, size, 0, 0, 256, 256)
    return canvas.toDataURL('image/webp', .85)
  } finally {
    image.close()
  }
}
