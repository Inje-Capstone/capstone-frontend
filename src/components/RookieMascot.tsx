import mascot from '../assets/rookie-mascot.svg'

export default function RookieMascot({ className }: { className?: string }) {
  return <img className={className} src={mascot} alt="" width="160" height="180" />
}
