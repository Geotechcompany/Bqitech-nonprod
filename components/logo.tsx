import Image from 'next/image';

function Logo() {
  return (
    <div className="relative h-10 w-30">
      <Image
        src="/bqilogo.png"
        alt="Company Logo"
        fill
        sizes="(max-width: 768px) 100vw, 120px"
        className="object-contain"
      />
    </div>
  )
}

export default Logo; 