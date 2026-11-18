import Link from "next/link";
import { BASE } from "@/lib/base";
import { TEAM } from "@/lib/club";

export function Header() {
  return (
    <header className="head">
      <div className="wrap">
        <Link href="/" className="brand" aria-label={`${TEAM.name}, naar Overzicht`}>
          <span className="logo">
            {TEAM.club} <span className="no">{TEAM.tag}</span>
          </span>
        </Link>
        {/* Hier zet HeaderMatchup de volgende wedstrijd neer; zonder data blijft het clublogo staan */}
        <div id="matchup-slot" className="matchup-slot">
          {/* eslint-disable-next-line @next/next/no-img-element -- statische export, geen beeldoptimalisatie */}
          <img className="club" src={`${BASE}/club-logo.png`} alt={TEAM.clubFull} width={158} height={240} />
        </div>
      </div>
    </header>
  );
}
