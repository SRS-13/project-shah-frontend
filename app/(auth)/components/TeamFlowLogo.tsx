import { Layers3 } from 'lucide-react'

import Link from "next/link";

export default function TeamFlowLogo() {
  return (
   <Link href="/" className="inline-flex items-center gap-3">
      <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#AD80FA] to-[#7C4BEF] text-white shadow-lg shadow-purple-200">
        <Layers3 size={23} strokeWidth={2.3} />
      </div>
      <span className="text-[26px] font-bold tracking-[-0.05em] text-[#17152B]">
        TeamFlow
      </span>
    </Link>
  )
}
