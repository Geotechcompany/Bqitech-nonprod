import Image from 'next/image';

function Logo() {
  return (
    <div className="relative">
      <Image
        src="/bqilogo.png"
        alt="Company Logo"
        width={120}
        height={40}
        priority
        className="object-contain"
      />
    </div>
  )
}

export default Logo; 