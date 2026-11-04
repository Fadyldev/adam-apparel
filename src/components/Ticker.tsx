import { motion } from 'framer-motion';

const ITEMS = [
  'JAHITAN RANTAI STANDAR DISTRO',
  'SABLON PLASTISOL & DTF HIGH-DENSITY',
  'BORDIR KOMPUTER OTOMATIS',
  'MINIMAL ORDER HANYA 12 PCS',
  'DP 50% AMAN',
  'GARANSI RETUR 7 HARI',
];

export default function Ticker() {
  const track = [...ITEMS, ...ITEMS];
  return (
    <div className="overflow-hidden bg-amber-400 py-4 shadow-lg shadow-amber-500/20" aria-label="Keunggulan bengkel">
      <motion.div
        className="flex w-max gap-10 whitespace-nowrap text-sm font-extrabold tracking-wider text-slate-900"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ repeat: Infinity, duration: 32, ease: 'linear' }}
      >
        {track.map((item, index) => (
          <span key={`${item}-${index}`} className="flex items-center gap-10">
            {item}
            <span aria-hidden>&#10022;</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}
