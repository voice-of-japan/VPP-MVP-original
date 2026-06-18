import type { AvatarId } from '../types'
// Static poster frames (first GIF frame) — used in the dense crowd so hundreds
// of avatars stay smooth.
import bearImg from '../assets/avatar/bear.webp'
import manImg from '../assets/avatar/man.webp'
import womanImg from '../assets/avatar/woman.webp'
import boyImg from '../assets/avatar/boy.webp'
import girlImg from '../assets/avatar/girl.webp'
import groggyImg from '../assets/avatar/groggy.webp'
import phoneImg from '../assets/avatar/phone.webp'
import invisibleImg from '../assets/avatar/invisible.webp'
import boxImg from '../assets/avatar/box.webp'
import maskImg from '../assets/avatar/mask.webp'
import shadowImg from '../assets/avatar/shadow.webp'
import flowerImg from '../assets/avatar/flower.webp'
import statueImg from '../assets/avatar/statue.webp'
import militaryImg from '../assets/avatar/military.webp'
import weepImg from '../assets/avatar/weep.webp'
import robotImg from '../assets/avatar/robot.webp'
// Animated GIFs — played when an avatar is selected and in the spotlight.
import bearGif from '../assets/gifs/16_bear.gif'
import manGif from '../assets/gifs/01_man.gif'
import womanGif from '../assets/gifs/02_woman.gif'
import boyGif from '../assets/gifs/03_blackBoy.gif'
import girlGif from '../assets/gifs/04_whiteGirl.gif'
import groggyGif from '../assets/gifs/05_groggy.gif'
import phoneGif from '../assets/gifs/06_phoneMan.gif'
import invisibleGif from '../assets/gifs/07_invisible.gif'
import boxGif from '../assets/gifs/08_boxMan.gif'
import maskGif from '../assets/gifs/09_maskMan.gif'
import shadowGif from '../assets/gifs/10_shadowMan.gif'
import flowerGif from '../assets/gifs/11_flowerGirl.gif'
import statueGif from '../assets/gifs/12_statue.gif'
import militaryGif from '../assets/gifs/13_military.gif'
import weepGif from '../assets/gifs/14_weepMan.gif'
import robotGif from '../assets/gifs/15_robot.gif'

export type AvatarDef = {
  id: AvatarId
  label: string
  accent: string
  /** Static poster frame for the crowd. */
  image: string
  /** Animated GIF for selection + spotlight. */
  gif: string
}

const ACCENT = '#cdd6e4'

export const avatars: AvatarDef[] = [
  { id: 'bear', label: 'Polar bear', accent: ACCENT, image: bearImg, gif: bearGif },
  { id: 'man', label: 'Man', accent: ACCENT, image: manImg, gif: manGif },
  { id: 'woman', label: 'Woman', accent: ACCENT, image: womanImg, gif: womanGif },
  { id: 'boy', label: 'Boy', accent: ACCENT, image: boyImg, gif: boyGif },
  { id: 'girl', label: 'Girl', accent: ACCENT, image: girlImg, gif: girlGif },
  { id: 'groggy', label: 'Groggy', accent: ACCENT, image: groggyImg, gif: groggyGif },
  { id: 'phone', label: 'On the phone', accent: ACCENT, image: phoneImg, gif: phoneGif },
  { id: 'invisible', label: 'Invisible', accent: ACCENT, image: invisibleImg, gif: invisibleGif },
  { id: 'box', label: 'Boxed in', accent: ACCENT, image: boxImg, gif: boxGif },
  { id: 'mask', label: 'Masked', accent: ACCENT, image: maskImg, gif: maskGif },
  { id: 'shadow', label: 'Shadow', accent: ACCENT, image: shadowImg, gif: shadowGif },
  { id: 'flower', label: 'Flower', accent: ACCENT, image: flowerImg, gif: flowerGif },
  { id: 'statue', label: 'Liberty', accent: ACCENT, image: statueImg, gif: statueGif },
  { id: 'military', label: 'Military', accent: ACCENT, image: militaryImg, gif: militaryGif },
  { id: 'weep', label: 'Weeping', accent: ACCENT, image: weepImg, gif: weepGif },
  { id: 'robot', label: 'Robot', accent: ACCENT, image: robotImg, gif: robotGif },
]

export const avatarById = (id: AvatarId): AvatarDef =>
  avatars.find((a) => a.id === id) ?? avatars[0]
