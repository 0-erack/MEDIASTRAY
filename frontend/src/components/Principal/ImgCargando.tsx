import { memo } from 'react';
import gifCagrando from '../../assets/images/cargando.gif';

const ImgCargando = memo(function ImgCargando() {
  
  return (
    <div className="flex h-full w-full items-center justify-center">
      {/* 
        We use a div instead of an <img>. 
        The background-color becomes the "tint".
      */}
      <div 
        className="w-64 h-64 bg-resaltado animate-spin" // Change 'bg-resaltado' to your desired color
        style={{
          maskImage: `url(${gifCagrando})`,
          WebkitMaskImage: `url(${gifCagrando})`,
          maskRepeat: 'no-repeat',
          maskSize: 'contain',
          maskPosition: 'center',
          imageRendering: 'pixelated' // Keep it crisp if it's pixel art
        }}
      />
    </div>
  )
})

export default ImgCargando;