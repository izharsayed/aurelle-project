/**
 * Central image registry.
 *
 * Every image reference in the mock data layer points at a key here, so the
 * whole catalogue can later be re-pointed at Firebase Storage URLs by editing
 * this single file.
 */
import hero from "@/assets/hero.jpg";
import editorial from "@/assets/editorial.jpg";
import catEarrings from "@/assets/cat-earrings.jpg";
import catNecklaces from "@/assets/cat-necklaces.jpg";
import catBracelets from "@/assets/cat-bracelets.jpg";
import catBangles from "@/assets/cat-bangles.jpg";
import catRings from "@/assets/cat-rings.jpg";
import catSets from "@/assets/cat-sets.jpg";
import pPearlStuds from "@/assets/p-pearl-studs.jpg";
import pHoops from "@/assets/p-hoops.jpg";
import pChoker from "@/assets/p-choker.jpg";
import pLayered from "@/assets/p-layered.jpg";
import pCuff from "@/assets/p-cuff.jpg";
import pKundanBangles from "@/assets/p-kundan-bangles.jpg";
import pStatementRing from "@/assets/p-statement-ring.jpg";
import pBridalSet from "@/assets/p-bridal-set.jpg";
import ocWedding from "@/assets/oc-wedding.jpg";
import ocFestive from "@/assets/oc-festive.jpg";
import ocParty from "@/assets/oc-party.jpg";
import ocEveryday from "@/assets/oc-everyday.jpg";
import ocGifting from "@/assets/oc-gifting.jpg";

export const img = {
  hero,
  editorial,
  earrings: catEarrings,
  necklaces: catNecklaces,
  bracelets: catBracelets,
  bangles: catBangles,
  rings: catRings,
  sets: catSets,
  pearlStuds: pPearlStuds,
  hoops: pHoops,
  choker: pChoker,
  layered: pLayered,
  cuff: pCuff,
  kundanBangles: pKundanBangles,
  statementRing: pStatementRing,
  bridalSet: pBridalSet,
  wedding: ocWedding,
  festive: ocFestive,
  party: ocParty,
  everyday: ocEveryday,
  gifting: ocGifting,
} as const;

export type ImageKey = keyof typeof img;
