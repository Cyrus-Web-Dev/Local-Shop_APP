import * as ImagePicker from 'expo-image-picker'
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator'
export async function pickPhoto(camera = false): Promise<string | null> {
  if (camera && !(await ImagePicker.requestCameraPermissionsAsync()).granted) return null
  const opt: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.7 }
  const r = camera ? await ImagePicker.launchCameraAsync(opt) : await ImagePicker.launchImageLibraryAsync(opt)
  if (r.canceled) return null
  const img = await ImageManipulator.manipulate(r.assets[0].uri).resize({ width: 200 }).renderAsync()
  const o = await img.saveAsync({ format: SaveFormat.JPEG, compress: 0.6, base64: true })
  return 'data:image/jpeg;base64,' + o.base64
}
