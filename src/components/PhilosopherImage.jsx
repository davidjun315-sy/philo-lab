import { useState } from 'react'
import PhilosopherBust from './PhilosopherBust'
import { asset } from '../utils/asset'
import { IMAGE_TYPE_LABEL } from '../data/imageTypes'


/** 대표 이미지가 있으면 표시하고, 없거나 불러오지 못하면 조각상 일러스트로 대체 */
export default function PhilosopherImage({ philosopher: p, className = '' }) {
  const [failed, setFailed] = useState(false)
  if (p.image && !failed) {
    return (
      <img
        className={`philo-img ${className}`}
        src={asset(p.image)}
        alt={`${p.name} ${IMAGE_TYPE_LABEL[p.imageType] || '대표 이미지'}`}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
      />
    )
  }
  return <PhilosopherBust region={p.region} title={`${p.name} 조각상 일러스트`} className={className} />
}
