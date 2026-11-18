"use client";

import { useData } from "@/components/DataProvider";
import { MatchHero, PredictionBlocks } from "@/components/Prediction";
import { AdviceBox } from "@/components/AdviceBox";
import { InjuryChance } from "@/components/InjuryChance";
import { LineupAdvice } from "@/components/LineupAdvice";
import { LineupChance } from "@/components/LineupChance";
import { Spotlights } from "@/components/Spotlights";
import { TopperBlock } from "@/components/TopperBlock";
import { nextMatch } from "@/lib/store/view";

/** Alleen over de eerstvolgende competitiewedstrijd (docs/PLAN-peursum.md §3.4) */
export default function MatchCenterPage() {
  const { view } = useData();
  const next = nextMatch(view);
  // Zonder poulestand (pupillen) is er niets om een winkans op te baseren
  const hasStanding = view.standings.length > 0;

  if (!next) {
    return (
      <section className="box">
        <div className="box-b muted">Geen komende competitiewedstrijd bekend.</div>
      </section>
    );
  }

  return (
    <>
      <MatchHero match={next} />
      {hasStanding && <TopperBlock match={next} />}
      <LineupChance match={next} />
      <LineupAdvice match={next} />
      <InjuryChance match={next} />
      {hasStanding && <AdviceBox match={next} />}
      {hasStanding && <Spotlights match={next} />}
      {hasStanding && <PredictionBlocks view={view} match={next} />}
    </>
  );
}
